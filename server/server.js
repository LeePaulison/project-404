const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const admin = require("firebase-admin");
const passport = require("passport");

const Conversation = require("./schemas/schema");
const githubStrategy = require("./passport-config/githubStrategy");

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const serviceAccount = require("./project-404-dbd61-firebase-adminsdk-h4qwe-dad62b7d92.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-404-dbd61.firebaseio.com",
});

// Passport Strategies Configuration
githubStrategy(passport);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware for CORS and session handling
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "your-secret-key", // replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Route to return authenticated user data
app.get("/api/current_user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// OAuth Login Routes
app.get("/auth/github", passport.authenticate("github"));

// OAuth Callback Routes
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
  res.redirect("http://localhost:5173/dashboard");
});

// Middleware to verify either Firebase or GitHub user
async function verifyUser(req, res, next) {
  // Check for Firebase Authorization token
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (token) {
    try {
      // Verify Firebase Token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      return next();
    } catch (err) {
      console.error("Invalid Firebase token:", err);
    }
  }

  // If no Firebase token, check GitHub OAuth session
  if (req.isAuthenticated() && req.user) {
    req.userId = req.user.id; // Use GitHub User ID
    return next();
  }

  return res.status(401).json({ error: "Unauthorized. No valid authentication found." });
}

app.post("/api/protected-route", verifyUser, (req, res) => {
  res.json({ message: "Authenticated anonymously!", userId: req.userId });
});

// Create a New Conversation
app.post("/api/conversations", verifyUser, async (req, res) => {
  const { title } = req.body;
  const newConversation = new Conversation({
    userId: req.userId,
    title: title || "Untitled Conversation",
    messages: [],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (error) {
    res.status(500).json({ message: "Error creating conversation", error });
  }
});

// Get All Conversations for a User
app.get("/api/conversations", verifyUser, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.userId });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error });
  }
});

// Get a Single Conversation by ID
app.get("/api/conversations/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  try {
    const conversation = await Conversation.findOne({ _id: id, userId: req.userId });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversation", error });
  }
});

// Add a Message to a Conversation
app.post("/api/conversations/:id/messages", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Message text is required" });

  try {
    const conversation = await Conversation.findOne({ _id: id, userId: req.userId });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    conversation.messages.push({ text });
    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error adding message to conversation", error });
  }
});

// Delete/Archive a Conversation
app.delete("/api/conversations/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedConversation = await Conversation.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deletedConversation) return res.status(404).json({ message: "Conversation not found" });

    res.status(200).json({ message: "Conversation deleted successfully", deletedConversation });
  } catch (error) {
    res.status(500).json({ message: "Error deleting conversation", error });
  }
});

// WebSocket setup
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", async ({ userId, message }) => {
    let conversation = await Conversation.findOne({ userIds: userId });
    if (!conversation) {
      conversation = new Conversation({ userIds: [userId], messages: [{ text: message }] });
    } else {
      conversation.messages.push({ text: message });
    }

    await conversation.save();
    socket.emit("message", { text: message, timestamp: new Date() });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
