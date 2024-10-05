const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get a user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Merge Firebase UIDs and transfer conversations
exports.mergeUserUIDs = async (req, res) => {
  const { currentFirebaseUID, googleEmail } = req.body;

  try {
    console.log(`Starting merge for Firebase UID: ${currentFirebaseUID} and Google Email: ${googleEmail}`);

    // Step 1: Find the current anonymous user by UID
    const anonymousUser = await User.findOne({ firebaseUIDs: currentFirebaseUID });
    console.log('Anonymous User Found:', anonymousUser);
    if (!anonymousUser) return res.status(404).json({ error: 'Anonymous user not found' });

    // Step 2: Check if a user with the given Google email already exists
    const existingUser = await User.findOne({ email: googleEmail });
    console.log('Existing Google User Found:', existingUser);
    if (!existingUser) return res.status(404).json({ error: 'Google user not found' });

    // Step 3: Add the new anonymous UID to the existing user’s `firebaseUIDs` array
    if (!existingUser.firebaseUIDs.includes(currentFirebaseUID)) {
      console.log(`Adding UID ${currentFirebaseUID} to Google User`);
      existingUser.firebaseUIDs.push(currentFirebaseUID);
      await existingUser.save();
      console.log('Updated Google User UIDs:', existingUser.firebaseUIDs);
    }

    // Step 4: Transfer conversations to the existing user
    const transferResult = await Conversation.updateMany(
      { userId: anonymousUser._id },
      { $set: { userId: existingUser._id } }
    );
    console.log(`Transferred Conversations:`, transferResult);

    // Step 5: Archive or delete the old anonymous user
    anonymousUser.archived = true;
    await anonymousUser.save();
    console.log('Archived Anonymous User:', anonymousUser);

    // Respond with a success message
    console.log('Merge Successful!');
    return res.json({ message: 'User UIDs merged and conversations transferred successfully' });

  } catch (error) {
    console.error('Error merging users:', error);
    return res.status(500).json({ error: 'Failed to merge users' });
  }
};
