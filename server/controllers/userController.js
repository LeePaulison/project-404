const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {

  console.log("Creating user with the following data:");
  console.log(req.body);

  try {
    const { firebaseUID, googleUID, email } = req.body;

    console.log("Creating user with the following data:");
    console.log("primaryUID (Anonymous):", firebaseUID);
    console.log("googleUID:", googleUID);
    console.log("email:", email ? email.toLowerCase() : '');

    // 1. Check if a user already exists with this googleUID, email, or primaryUID
    let existingUser = await User.findOne({
      $or: [
        { 'firebaseUIDs.uid': firebaseUID },          // Check for existing anonymous UID
        { googleUID: googleUID },                    // Check for existing Google UID
        { email: email ? email.toLowerCase() : '' }, // Check for existing email
      ],
    });

    if (existingUser) {
      console.log("User already exists. Returning existing user.");
      return res.status(200).json(existingUser); // Return the existing user if found
    }

    // 2. Set up the user data structure
    let newUserData = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 3. Add Google data if available
    if (googleUID && email) {
      newUserData.googleUID = googleUID;
      newUserData.email = email.toLowerCase();
      console.log("Creating user with Google account linked.");
      console.log(newUserData);
    }
    
    if (firebaseUID) {
      // 4. If only an anonymous UID is provided, create an anonymous user
      newUserData.firebaseUIDs = [
        {
          uid: firebaseUID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          archived: false,  // Set as active for anonymous users
          archivedAt: null,
        }
      ];
      console.log(newUserData);
    }

    // 5. Create the new user
    const newUser = await User.create(newUserData);

    console.log("User created successfully:", newUser);
    return res.status(201).json(newUser); // Return the new user data

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
    const { primaryUID, googleUID, email } = req.body;

    console.log("Attempting to merge UIDs with the following data:");
    console.log("primaryUID (Anonymous):", primaryUID);
    console.log("googleUID:", googleUID);
    console.log("email:", email ? email.toLowerCase() : '');

    // 1. Search for an existing user by primaryUID, Google UID, or email
    let user = await User.findOne({
      $or: [
        { 'firebaseUIDs.uid': primaryUID },          // Check for existing anonymous UID in firebaseUIDs
        { googleUID: googleUID },                    // Check for existing Google UID
        { email: email ? email.toLowerCase() : '' }, // Check for existing email
      ],
    });

    if (user === null) {
      console.log("No existing user found. Creating new user document.");

      // Create a new user document with primaryUID and Google UID, archiving the anonymous UID
      user = await User.findOneAndUpdate(
        { 'firebaseUIDs.uid': primaryUID }, // Locate by the anonymous UID
        {
          $set: {
            googleUID: googleUID || null,
            email: email ? email.toLowerCase() : null,
          },
          $addToSet: {
            firebaseUIDs: { 
              uid: primaryUID,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              archived: true,     // Archive the anonymous UID on link
              archivedAt: Date.now(),
            }
          }
        },
        { new: true, upsert: true } // Upsert ensures creation if no document exists
      );

      console.log(`New user created with archived primaryUID ${primaryUID} and linked Google UID ${googleUID}.`);
      return res.status(200).json(user); // Return the new user

    } else {
      console.log("Existing user found. Archiving all previous anonymous UIDs and linking to Google account.");

      // Archive all existing firebaseUIDs
      user.firebaseUIDs.forEach(uidObj => {
        uidObj.archived = true;
        uidObj.archivedAt = Date.now();
      });

      // Add the current primaryUID if it's not already in firebaseUIDs
      let existingUID = user.firebaseUIDs.find(uidObj => uidObj.uid === primaryUID);

      if (!existingUID) {
        // Add the new primaryUID as archived since it's linked to Google
        user.firebaseUIDs.push({
          uid: primaryUID,
          createdAt: Date.now(),
          archived: true,
          archivedAt: Date.now(),
          linkedTo: googleUID, // Link to the Google UID for reference
        });
      }

      // Set googleUID and email if they are not already set
      user.googleUID = googleUID;
      user.email = email ? email.toLowerCase() : user.email;

      // Save the changes
      await user.save();

      console.log(`Archived all anonymous UIDs and linked primaryUID ${primaryUID} to Google UID ${googleUID}.`);
      return res.status(200).json(user); // Return the existing user
    }

  } catch (error) {
    console.error('Error merging UIDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};








