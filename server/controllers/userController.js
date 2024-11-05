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
    const currentTime = Date.now();
    const normalizedEmail = email ? email.toLowerCase() : '';

    console.log("Merging UIDs:", { primaryUID, googleUID, email: normalizedEmail });

    // Step 1: Find users by googleUID and primaryUID
    const [googleUser, anonymousUser] = await Promise.all([
      User.findOne({ googleUID }),
      User.findOne({ 'firebaseUIDs.uid': primaryUID }),
    ]);

    if (googleUser) {
      console.log("Google user found");

      // If there's an anonymous user, delete it after merging
      if (anonymousUser) {
        console.log("Anonymous user found. Deleting after merging.");
        await anonymousUser.deleteOne();
      }

      // Check if primaryUID already exists in googleUser's firebaseUIDs
      const existingUID = googleUser.firebaseUIDs.find(uid => uid.uid === primaryUID);

      if (!existingUID) {
        // Add new primaryUID entry if not already present
        googleUser.firebaseUIDs.push({
          uid: primaryUID,
          createdAt: currentTime,
          archived: true,
          archivedAt: currentTime,
          mergedAt: currentTime,
        });
        console.log("primaryUID added to googleUser's firebaseUIDs.");
      } else if (!existingUID.archived) {
        // Archive existing primaryUID if not already archived
        existingUID.archived = true;
        existingUID.archivedAt = currentTime;
        console.log("Existing primaryUID archived.");
      }

      // Update timestamps
      googleUser.updatedAt = currentTime;
      googleUser.mergedAt = currentTime;

      await googleUser.save();
      console.log("Merged Google user:", googleUser);
      return res.status(200).json(googleUser);
    }

    // Case 2: No googleUID found, handle anonymous user with primaryUID
    if (anonymousUser) {
      console.log("Anonymous user found. Adding googleUID and updating details.");

      // Archive all existing firebaseUIDs
      anonymousUser.firebaseUIDs = anonymousUser.firebaseUIDs.map(uid => ({
        ...uid,
        archived: true,
        archivedAt: currentTime,
      }));

      // Add Google-specific details to the anonymous user
      Object.assign(anonymousUser, {
        googleUID,
        email: normalizedEmail,
        updatedAt: currentTime,
        mergedAt: currentTime,
      });

      await anonymousUser.save();
      console.log("Anonymous user merged with Google account data:", anonymousUser);
      return res.status(200).json(anonymousUser);
    }

    // If neither user was found
    console.log("User not found for merging.");
    return res.status(404).json({ error: "User not found for merging." });

  } catch (error) {
    console.error('Error merging UIDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};










