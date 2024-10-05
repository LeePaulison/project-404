const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, deleteUser, mergeUserUIDs } = require('../controllers/userController');

// Route Definitions
router.post('/', createUser); // Create a new user
router.get('/:userId', getUser); // Get user by ID
router.put('/:userId', updateUser); // Update user by ID
router.delete('/:userId', deleteUser); // Delete user by ID

// Merge Firebase UIDs and Transfer Conversations
router.post('/merge', mergeUserUIDs); // Merge user UIDs and transfer conversations

module.exports = router;
