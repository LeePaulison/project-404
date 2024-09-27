const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define a schema for a single message in the conversation
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

// Define a schema for the Conversation collection
const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, default: uuidv4, unique: true },
    userId: { type: String, required: true }, // Main user ID
    associatedIds: [{ type: String }], // Additional IDs for OAuth/Anonymous users
    messages: [messageSchema],
    title: { type: String, default: "Untitled Conversation" }, // Metadata for easy identification
    status: { type: String, enum: ["active", "archived", "completed"], default: "active" },
  },
  { timestamps: true }
);

// Create a Mongoose model for the Conversation collection
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
