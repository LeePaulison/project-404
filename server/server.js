const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const Conversation = require("./schemas/schema");
const { text } = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./project-404-dbd61-firebase-adminsdk-h4qwe-dad62b7d92.json");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-404-dbd61.firebaseio.com",
});

// Verify Firebase token middleware
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1]; // Extract the token from Authorization header
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid; // Store the Firebase user ID in the request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Passport setup for GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID, // Add to .env file
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Add to .env file
      callbackURL: "http://localhost:5000/auth/github/callback", // Adjust for your environment
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile); // Profile contains the authenticated GitHub user
    }
  )
);

// Serialize and deserialize user to support session persistence
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from Vite frontend
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());
// Middleware for sessions
app.use(
  session({
    secret: "your-secret-key", // You should use a strong secret for production
    resave: false, // Avoid saving session if unmodified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Add session middleware for login persistence

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Define the /api/current_user route to check authentication
app.get("/api/current_user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user }); // Send the authenticated user's data
  } else {
    res.json({ user: null }); // No user is authenticated
  }
});

// Route to start GitHub OAuth login
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback route for GitHub to redirect to after authentication
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), async (req, res) => {
  const anonymousId = req.userId; // Assume this was stored during Firebase anonymous session
  const oauthId = req.user.id; // GitHub ID from Passport

  // Find conversation by anonymous ID
  const conversation = await Conversation.findOne({ userIds: anonymousId });
  if (conversation) {
    if (!conversation.userIds.includes(oauthId)) {
      conversation.userIds.push(oauthId); // Add GitHub ID to the userIds array
      await conversation.save();
    }
  }

  // Successful login
  res.redirect("http://localhost:5173/dashboard"); // Redirect user to your app
});

app.post("/api/protected-route", verifyFirebaseToken, (req, res) => {
  const userId = req.userId; // This is the Firebase Anonymous ID
  res.json({ message: "Authenticated anonymously!", userId });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for message from client
  socket.on("message", async ({ userId, message }) => {
    console.log(`Message received from ${userId}: ${message}`);

    //Find or create conversation by userId
    let conversation = await Conversation.findOne({ userId: userId });
    if (!conversation) {
      conversation = new Conversation({ userIds: [userId], messages: [{ text: message }] });
    } else {
      conversation.messages.push({ text: message });
    }

    // Save conversation to database
    await conversation.save();
    console.log("Conversation updated or created successfully");

    socket.emit("message", {
      text: message,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
