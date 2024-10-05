const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation
} = require('../controllers/conversationController');

// Route Definitions
router.post('/', createConversation); // Create a new conversation
router.get('/user/:userId', getConversations); // Get all conversations for a user
router.get('/:conversationId', getConversation); // Get a specific conversation by ID
router.put('/:conversationId', updateConversation); // Update conversation by ID
router.delete('/:conversationId', deleteConversation); // Delete conversation by ID

module.exports = router;
