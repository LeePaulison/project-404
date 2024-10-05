const Conversation = require('../models/Conversation');

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const conversation = new Conversation(req.body);
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.params.userId });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
};

// Get a specific conversation by ID
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
};

// Update conversation by ID
exports.updateConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(req.params.conversationId, req.body, { new: true });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};

// Delete conversation by ID
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
