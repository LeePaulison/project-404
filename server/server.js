const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const admin = require("firebase-admin");
const passport = require("passport");
const OpenAI = require("openai");

const Conversation = require("./schemas/conversation");
const User = require("./schemas/user");
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
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 360000 }, // 1 hour
  })
);
app.use(passport.initialize());
app.use(passport.session());

// OpenAI API Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Create or link a user account
app.post("/api/create_account", async (req, res) => {
  const { firebaseUserId, githubUserId } = req.body;

  try {
    // Check if a user already exists with either Firebase or GitHub ID
    let user = await User.findOne({
      $or: [{ firebaseUserId }, { githubUserId }],
    });

    if (user) {
      // If the user exists, update it with the new login method
      if (firebaseUserId && !user.firebaseUserId) {
        user.firebaseUserId = firebaseUserId;
      }
      if (githubUserId && !user.githubUserId) {
        user.githubUserId = githubUserId;
      }
      await user.save();
      return res.status(200).json({ message: "User account updated", user });
    }

    // If no user exists, create a new one
    user = new User({
      firebaseUserId,
      githubUserId,
    });

    const savedUser = await user.save();
    res.status(201).json({ message: "User account created", user: savedUser });
  } catch (error) {
    console.error("Error creating or linking account:", error);
    res.status(500).json({ message: "Failed to create or link user account", error });
  }
});

// Route to link GitHub ID to a Firebase Anonymous ID
app.post("/api/link_account", async (req, res) => {
  const { firebaseUserId, githubUserId } = req.body;

  if (!firebaseUserId || !githubUserId) {
    return res.status(400).json({ message: "Both Firebase UID and GitHub ID are required to link accounts." });
  }

  try {
    // Check if a user with either Firebase or GitHub ID already exists
    let user = await User.findOne({
      $or: [{ firebaseUserId }, { githubUserId }],
    });

    if (!user) {
      return res.status(404).json({ message: "No user found for either ID. Please create an account first." });
    }

    // If user is found, add missing IDs
    if (user.firebaseUserId !== firebaseUserId) {
      user.firebaseUserId = firebaseUserId;
    }
    if (user.githubUserId !== githubUserId) {
      user.githubUserId = githubUserId;
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "Account successfully linked", user });
  } catch (error) {
    console.error("Error linking accounts:", error);
    return res.status(500).json({ message: "Failed to link accounts", error });
  }
});

// Route to return authenticated user data
app.get("/api/current_user", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("API /current_user called. Authenticated:", req.isAuthenticated());
    console.log("User data in request:", req.user);
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// OAuth Login Routes
app.get("/auth/github", passport.authenticate("github"));

// OAuth Callback Routes
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
  res.redirect("http://localhost:5173");
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

// Create or fetch an active conversation for a user
app.post("/api/conversations", async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: "Title and User ID are required" });
    }

    // Check if a conversation already exists for this user
    let conversation = await Conversation.findOne({ userId: { $in: [userId] } });

    if (!conversation) {
      // Create a new conversation if none exists
      conversation = new Conversation({
        title: title || "Untitled Conversation",
        userId: [userId],
        messages: [],
      });

      const savedConversation = await conversation.save();
      return res.status(201).json(savedConversation);
    }

    // If a conversation exists, return it
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching or creating conversation:", error);
    res.status(500).json({ message: "Failed to fetch or create a new conversation", error });
  }
});

app.put("/api/conversations/:conversationId/addUser", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newUserId } = req.body;

    if (!conversationId || !newUserId) {
      return res.status(400).json({ message: "Conversation ID and New User ID are required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Add the new user ID if it doesn't already exist in the array
    if (!conversation.userId.includes(newUserId)) {
      conversation.userId.push(newUserId);
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error adding new user ID to conversation:", error);
    res.status(500).json({ message: "Failed to add user to conversation", error });
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

app.post("/api/conversations/:id/ask", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query text is required" });
  }

  try {
    // Find the conversation to add the response
    const conversation = await Conversation.findOne({ _id: id, userId: req.userId });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    // Call the OpenAI API with the user query
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or use "gpt-4o" for completions endpoint
      messages: [{ role: "user", content: query }],
    });

    const aiResponse = response.choices[0].message.content;

    // Add both the user query and OpenAI response to the conversation
    conversation.messages.push({ text: `User: ${query}` });
    conversation.messages.push({ text: `AI: ${aiResponse}` });

    await conversation.save();

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    res.status(500).json({ message: "Error processing OpenAI request", error });
  }
});

// Add this route to `server.js` for handling logout
app.get("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error during logout", err });
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.json({ message: "Logged out successfully" });
  });
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
