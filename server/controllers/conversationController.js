const Conversation = require("../schemas/conversation");

// Get Conversations
exports.getConversations = async (req, res) => {
  const conversations = await Conversation.find({ userId: req.userId });
  res.status(200).json(conversations);
};

// Create Conversation
exports.createConversation = async (req, res) => {
  const { title, messages } = req.body;
  const newConversation = new Conversation({ userId: req.userId, title, messages });
  await newConversation.save();
  res.status(201).json(newConversation);
};

// Update Conversation
exports.updateConversation = async (req, res) => {
  const { title, messages } = req.body;
  const updatedConversation = await Conversation.findByIdAndUpdate(req.params.id, { title, messages }, { new: true });
  if (!updatedConversation) return res.status(404).json({ error: "Conversation not found" });
  res.status(200).json(updatedConversation);
};
