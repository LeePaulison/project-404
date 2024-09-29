const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const messageSchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const conversationSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    userId: [{ type: String, required: true }], // Store both Firebase and GitHub user IDs as strings
    messages: [messageSchema],
    title: { type: String, default: "Untitled Conversation" },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
