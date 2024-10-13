const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firebaseUIDs, email } = req.body;

    // Debug: Log the incoming request to ensure all required fields are present
    console.log('createUser called with:', { firebaseUIDs, email });

    // Check if any of the provided UIDs already exist in a different user document
    const existingUser = await User.findOne({ firebaseUIDs: { $in: firebaseUIDs } });
    if (existingUser) {
      console.log(`Existing user found for UID: ${firebaseUIDs}. Returning existing user.`);
      return res.status(200).json(existingUser); // Return the existing user
    }

    // Create a new user
    const newUser = new User({
      firebaseUIDs,
      email
    });

    await newUser.save();
    console.log(`New user created successfully for UID: ${firebaseUIDs}`);
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
  try {
    const { primaryUID, secondaryUID, googleUID, email } = req.body;

    // Check if the secondaryUID, googleUID, or email are already in a user document
    const existingUser = await User.findOne({
      $or: [
        { firebaseUIDs: { $in: [secondaryUID] } },  // Check for secondaryUID conflict
        { googleUID: googleUID },                   // Check for Google UID conflict
        { email: email ? email.toLowerCase() : '' }, // Check for email conflict
      ],
    });

    if (existingUser) {
      console.log(`The UID/email already exists in another user. Adding new firebaseUID to existing user and returning updated user.`);
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUIDs: secondaryUID },
        { $addToSet: { firebaseUIDs: primaryUID } },
        { new: true }
      );
      return res.status(200).json(updatedUser); // Return the user updated with new anonymous id
    } else {
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUIDs: primaryUID },
        {
          $addToSet: { firebaseUIDs: secondaryUID },  // Add secondary UID to firebaseUIDs array
          $set: { googleUID: googleUID, email: email ? email.toLowerCase() : '' }, // Set Google UID and email
        },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    }

  } catch (error) {
    console.error('Error merging UIDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




