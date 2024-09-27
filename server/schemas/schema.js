const mongoose = require("mongoose");

// Define a schema for a single message in the conversation
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

// Define a schema for the Conversation collection
const conversationSchema = new mongoose.Schema(
  {
    userId: [{ type: String, required: true }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Create a Mongoose model for the Conversation collection
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
