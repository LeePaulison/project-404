const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUserId: { type: String, unique: true, sparse: true },
  githubUserId: { type: String, unique: true, sparse: true, default: null }, // Add default value
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
