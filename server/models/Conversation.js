const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Message Schema for each individual message
const messageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true }, // Role in conversation
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define the Conversation Schema
const conversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User collection
  conversationTitle: { type: String, default: "Untitled Conversation" },
  messages: [messageSchema], // Array of messages in this conversation
  tags: { type: [String], default: [] }, // Optional tags for categorizing conversations
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Automatically update the `updatedAt` field on save
conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model and export it
module.exports = mongoose.model('Conversation', conversationSchema);
