const mongoose = require('mongoose');

const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firebaseUIDs, email } = req.body;

    // Check if any of the provided UIDs already exist in a different user document
    const existingUser = await User.findOne({ firebaseUIDs: { $in: firebaseUIDs } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with one of the provided firebaseUIDs already exists' });
    }

    // Create a new user
    const newUser = new User({
      firebaseUIDs,
      email
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
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

  const session = process.env.USE_TRANSACTIONS === 'false' ? null : await mongoose.startSession();
  if (session) session.startTransaction();

  try {
    console.log(`Starting merge for Firebase UID: ${currentFirebaseUID} and Google Email: ${googleEmail}`);

    // Step 1: Find the current anonymous user by UID
    const anonymousUser = await User.findOne({ firebaseUIDs: currentFirebaseUID }).session(session);
    console.log('Anonymous User Found:', anonymousUser);
    if (!anonymousUser) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ error: 'Anonymous user not found' });
    }

    // Step 2: Check if a user with the given Google email already exists
    const existingUser = await User.findOne({ email: googleEmail }).session(session);
    console.log('Existing Google User Found:', existingUser);
    if (!existingUser) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ error: 'Google user not found' });
    }

    // Step 3: Check if the Anonymous user is already linked to the Google user
    if (existingUser.firebaseUIDs.includes(currentFirebaseUID)) {
      console.log(`The Anonymous UID ${currentFirebaseUID} is already linked to the Google account.`);
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ error: 'The provided UID is already linked to this Google account.' });
    }

    // Step 4: Add the new anonymous UID to the existing user’s `firebaseUIDs` array
    console.log(`Adding UID ${currentFirebaseUID} to Google User`);
    existingUser.firebaseUIDs.push(currentFirebaseUID);

    const saveOptions = session ? { session } : undefined; // Use saveOptions only if session is valid
    await existingUser.save(saveOptions);
    console.log('Updated Google User UIDs:', existingUser.firebaseUIDs);

    // Step 5: Transfer conversations to the existing user
    console.log('Transferring conversations...');
    const transferResult = await Conversation.updateMany(
      { userId: anonymousUser._id },
      { $set: { userId: existingUser._id } },
      session ? { session } : {}
    );
    console.log(`Transferred Conversations:`, transferResult);

    // Step 6: Delete the old anonymous user
    await User.deleteOne({ _id: anonymousUser._id }, session ? { session } : {});
    console.log('Deleted Anonymous User:', anonymousUser);

    // Commit the transaction
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Respond with a success message
    console.log('Merge Successful!');
    return res.json({ message: 'User UIDs merged and conversations transferred successfully' });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('Error merging users:', error);
    return res.status(500).json({ error: 'Failed to merge users' });
  }
};



