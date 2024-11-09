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
router.get('/user/:userId/:conversationId', getConversation); // Get a specific conversation by ID
router.put('/user/:userId/:conversationId', updateConversation); // Update conversation by ID
router.delete('/user/:userId/:conversationId', deleteConversation); // Delete conversation by ID

module.exports = router;
