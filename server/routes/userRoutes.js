const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, deleteUser } = require('../controllers/userController');

// Route Definitions
router.post('/', createUser); // Create a new user
router.get('/:userId', getUser); // Get user by ID
router.put('/:userId', updateUser); // Update user by ID
router.delete('/:userId', deleteUser); // Delete user by ID

module.exports = router;
