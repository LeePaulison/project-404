const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const axios = require("axios");
const passport = require("passport");

// GitHub Login
exports.githubLogin = (req, res, next) => {
  const state = require("crypto").randomBytes(8).toString("hex");
  res.cookie("oauthState", state, { httpOnly: true, sameSite: "Lax", maxAge: 300000 });
  passport.authenticate("github", { session: false, state })(req, res, next);
};

// GitHub Callback
exports.githubCallback = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      console.error("No JWT token found in cookies.");
      return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    let firebaseUserId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      firebaseUserId = decoded.userId;
    } catch (error) {
      console.error("Invalid or expired JWT token during GitHub callback:", error);
      return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
    }

    const githubUserId = req.user.id;

    console.log("Firebase User ID:", firebaseUserId);
    console.log("GitHub User ID:", githubUserId);

    const apiUrl = process.env.API_URL || "http://localhost:5000";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Post request to link account
    const response = await axios.post(
      `${apiUrl}/api/link_account`,
      { firebaseUserId, githubUserId },
      { withCredentials: true }
    );

    console.log("Linking response:", response.data);

    // If linking succeeds, redirect to frontend
    res.redirect(frontendUrl);
  } catch (error) {
    console.error("Error in GitHub callback:", error);
    res.status(500).json({ error: "Internal Server Error during GitHub callback" });
  }
};

// Link Account
exports.linkAccount = async (req, res) => {
  const { firebaseUserId, githubUserId } = req.body;
  const user = await User.findOneAndUpdate({ firebaseUserId }, { githubUserId }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found or could not be linked" });
  res.status(200).json(user);
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
