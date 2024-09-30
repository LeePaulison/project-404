const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
const passport = require("passport");
const OpenAI = require("openai");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Conversation = require("./schemas/conversation");
const User = require("./schemas/user");
const githubStrategy = require("./passport-config/githubStrategy");

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Secret key for signing JWTs

// Initialize Firebase Admin
const serviceAccount = require("./project-404-dbd61-firebase-adminsdk-h4qwe-dad62b7d92.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-404-dbd61.firebaseio.com",
});

// Passport Strategies Configuration
githubStrategy(passport);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware for CORS, Helmet, and Cookies
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// cookie debugging middleware
app.use((req, res, next) => {
  const originalSend = res.send.bind(res);

  res.send = function (...args) {
    console.log("Response Cookies Being Set:", res.getHeaders()["set-cookie"]);
    originalSend(...args);
  };

  next();
});
app.use((req, res, next) => {
  console.log("CORS Headers in Response:", res.getHeaders());
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// JWT Middleware
const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized. No token provided." });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Unauthorized. Invalid token." });
    req.userId = decoded.userId;
    next();
  });
};

// JWT Generation
const generateJWT = (userId, provider, type = "access") => {
  const payload = { userId, provider, type };
  const expiresIn = type === "access" ? "1h" : "7d";
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

// Create Tokens
app.post("/api/create_token", async (req, res) => {
  const { firebaseUserId, githubUserId } = req.body;

  // Log the incoming values for debugging
  console.log("Incoming firebaseUserId:", firebaseUserId);
  console.log("Incoming githubUserId:", githubUserId);

  if (!firebaseUserId && !githubUserId) {
    return res.status(400).json({ error: "User ID required" });
  }

  const provider = firebaseUserId ? "firebase" : "github";

  try {
    let user = await User.findOne({ $or: [{ firebaseUserId }, { githubUserId }] });

    if (!user) {
      // Create a new user document if none exists
      user = new User({
        firebaseUserId: firebaseUserId || null,
        githubUserId: githubUserId || null,
        createdAt: new Date(),
      });
      console.log("Creating new user in MongoDB:", user);
    } else {
      console.log("Found existing user in MongoDB:", user);
    }

    await user.save();

    // Generate JWT access and refresh tokens
    const accessToken = generateJWT(user._id, provider, "access");
    const refreshToken = generateJWT(user._id, provider, "refresh");

    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);

    // Store the tokens in HTTP-only cookies
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV !== "development",
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour expiration
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV !== "development",
      sameSite: "Lax",
      maxAge: 7 * 24 * 3600000, // 7 days expiration
    });

    console.log("Cookies set successfully.");
    return res.status(200).json({ message: "Tokens generated and user stored/updated in MongoDB" });
  } catch (error) {
    console.error("Error creating or updating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Refresh Token
app.post("/api/refresh_token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "Unauthorized. No refresh token provided." });

  jwt.verify(refreshToken, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden. Invalid refresh token." });

    if (decoded.type !== "refresh") return res.status(400).json({ error: "Invalid token type" });

    const newAccessToken = generateJWT(decoded.userId, decoded.provider, "access");

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Access token refreshed" });
  });
});

// GitHub OAuth Routes
const crypto = require("crypto");

const generateRandomState = () => crypto.randomBytes(8).toString("hex");

app.get("/auth/github", (req, res, next) => {
  // Generate a random state string
  const state = generateRandomState();
  console.log("Generated OAuth state:", state); // Log for debugging

  // Store the state in a temporary cookie for later verification
  res.cookie("oauthState", state, { httpOnly: true, sameSite: "Lax", maxAge: 300000 });

  // Pass the custom state directly to GitHub OAuth without using sessions
  passport.authenticate("github", { session: false, state })(req, res, next);
});

app.get(
  "/auth/github/callback",
  (req, res, next) => {
    console.log("Cookies before GitHub Callback:", req.cookies);
    next();
  },
  passport.authenticate("github", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    console.log("Cookies after GitHub Callback:", req.cookies);
    try {
      const githubUserId = req.user.id; // Extract GitHub user ID from the OAuth profile
      console.log("GitHub User ID Retrieved in Callback:", githubUserId); // Log to confirm

      // Retrieve Firebase UID from the JWT token stored in cookies
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
      }

      // Verify JWT to extract the Firebase UID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      const firebaseUserId = decoded.userId; // Extract Firebase UID
      console.log("Firebase User ID from JWT in Callback:", firebaseUserId);

      // Call the `/api/link_account` route to link the two IDs
      const response = await axios.post(
        "http://localhost:5000/api/link_account",
        { firebaseUserId, githubUserId }, // Pass both IDs to the linking route
        { withCredentials: true }
      );
      console.log("Linking response:", response.data);

      res.redirect("http://localhost:5173"); // Redirect back to frontend after linking
    } catch (error) {
      console.error("Error linking GitHub account:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// User Routes
app.get("/api/users/:id", verifyJWT, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json(user);
});

app.post("/api/link_account", verifyJWT, async (req, res) => {
  const { firebaseUserId, githubUserId } = req.body;
  const user = await User.findOneAndUpdate({ firebaseUserId }, { githubUserId }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found or could not be linked" });
  res.status(200).json(user);
});

// Conversations Routes
app.get("/api/conversations", verifyJWT, async (req, res) => {
  const conversations = await Conversation.find({ userId: req.userId });
  res.status(200).json(conversations);
});

app.post("/api/conversations", verifyJWT, async (req, res) => {
  const { title, messages } = req.body;
  const newConversation = new Conversation({ userId: req.userId, title, messages });
  await newConversation.save();
  res.status(201).json(newConversation);
});

app.put("/api/conversations/:id", verifyJWT, async (req, res) => {
  const { title, messages } = req.body;
  const updatedConversation = await Conversation.findByIdAndUpdate(req.params.id, { title, messages }, { new: true });
  if (!updatedConversation) return res.status(404).json({ error: "Conversation not found" });
  res.status(200).json(updatedConversation);
});

// Logout Route
app.get("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
