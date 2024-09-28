const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique IDs

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const conversationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 }, // Use UUID as the primary ID
    userId: [{ type: String, required: true }],
    messages: [messageSchema],
    title: { type: String, default: "Untitled Conversation" },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
