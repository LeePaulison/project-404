const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firebaseUID, email = null } = req.body;

    const existingUser = await User.findOne({ 'firebaseUIDs.uid': firebaseUID });

    if (existingUser) {
      return res.status(200).json(existingUser); // Return the existing user
    }

    const firebaseUIDsArray = [
      {
        uid: firebaseUID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ]

    const newUser = new User({
      firebaseUIDs : firebaseUIDsArray,
      email: email ? email.toLowerCase() : null,
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
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
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

    // Check if any of the secondary UIDs (Google) or email already exist in a user document
    const existingUser = await User.findOne({
      $or: [
        { 'firebaseUIDs.uid': secondaryUID },  // Check for secondaryUID conflict in the firebaseUIDs array
        { googleUID: googleUID },              // Check for Google UID conflict
        { email: email ? email.toLowerCase() : '' }, // Check for email conflict
      ],
    });

    if (existingUser) {
      const anonExists = existingUser.firebaseUIDs.some(uidObj => uidObj.uid === primaryUID);
      if (anonExists) {
        console.log(`The UID/email already exists in the same user. Returning existing user.`);
        return res.status(200).json(existingUser); // Return the existing user
      }

      console.log(`The UID/email already exists in another user. Adding new firebaseUID to existing user and returning updated user.`);
      const updatedUser = await User.findOneAndUpdate(
        { 'firebaseUIDs.uid': secondaryUID },
        {
          $addToSet: { 
            firebaseUIDs: { 
              uid: primaryUID, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            } 
          } // Add the primary UID as an object to firebaseUIDs array
        },
        { new: true }
      );
      return res.status(200).json(updatedUser); // Return the updated user with new anonymous ID
    } else {
      // No existing user conflicts, update the user with new OAuth UIDs and email
      const updatedUser = await User.findOneAndUpdate(
        { 'firebaseUIDs.uid': primaryUID },
        {
          $addToSet: { 
            firebaseUIDs: { 
              uid: secondaryUID, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            } 
          },  // Add secondary UID as an object to firebaseUIDs array
          $set: {
            googleUID: googleUID || null,
            email: email ? email.toLowerCase() : null,
          },
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





