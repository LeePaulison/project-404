const User = require('../models/User');
const Preferences = require('../models/Preferences');
const Conversation = require('../models/Conversation');
// Create a new user
exports.createUser = async (req, res) => {

  try {
    const { firebaseUID, googleUID, email } = req.body;
    const userIP = req.ip;
    const normalizedEmail = email ? email.toLowerCase() : '';
    const currentTime = Date.now();

    // 1. Check if a user already exists with this googleUID, email, or primaryUID
    let existingUser = await User.findOne({
      $or: [
        { 'firebaseUIDs.uid': firebaseUID },          // Check for existing anonymous UID
        { googleUID },                    // Check for existing Google UID
        { email: normalizedEmail },                 // Check for existing email
        { lastKnownIP: userIP },                    // Check for existing IP
      ],
    });

    if (existingUser) {

      if (googleUID && !existingUser.googleUID) {
        existingUser.googleUID = googleUID;
        existingUser.email = normalizedEmail;
        existingUser.lastKnownIP = userIP;
        existingUser.updatedAt = currentTime;
      }

      const anonymousUID = existingUser.firebaseUIDs.find(uid => uid.uid === firebaseUID);
      if (anonymousUID && !anonymousUID.archived) {
        anonymousUID.archived = true;
        anonymousUID.archivedAt = currentTime;
      }

      // check for and merge preferences
      const existingUserPreferences = await Preferences.findOne({ userId: existingUser._id });
      if (!existingUserPreferences) {
        existingUserPreferences = new Preferences({ userId: existingUser._id });
        await existingUserPreferences.save();
      }

      // return existing user on IP match
      existingUser.save();
      console.log('Existing user found updated and returned:', existingUser);
      return res.status(200).json(existingUser); // Return the existing user if found
    }

    // 2. Set up the user data structure
    let newUserData = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastKnownIP: userIP,
    };

    // 3. Add Google data if available
    if (googleUID && email) {
      newUserData.googleUID = googleUID;
      newUserData.email = email.toLowerCase();
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

    // 6. Create the preferences
    const defaultPreferences = new Preferences({ userId: newUser._id });
    await defaultPreferences.save();
    console.log('New user created and preferences added:', newUser);
    return res.status(201).json(newUser); // Return the new user data
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get a user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    .populate('preferences')
    .populate({
      path: 'conversations',
      model: Conversation,
    });
    
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
    const userIP = req.ip;
    const currentTime = Date.now();
    const normalizedEmail = email ? email.toLowerCase() : '';

    // Step 1: Find users by googleUID and primaryUID
    const [googleUser, anonymousUser] = await Promise.all([
      User.findOne({ googleUID }),
      User.findOne({ $or: [{ 'firebaseUIDs.uid': primaryUID }, { lastKnownIP: userIP }] }),
    ]);

    console.log('Merging UIDs - googleUser:', googleUser, 'anonymousUser:', anonymousUser);

    if (googleUser) {
      // If there's an anonymous user, delete it after merging
      if (anonymousUser) {
        // merge anonymous preferences into googleUser if googleUser has no preferences
        const googleUserPreferences = await Preferences.findOne({ userId: googleUser._id });
        const anonymousUserPreferences = await Preferences.findOne({ userId: anonymousUser._id });

        if(!googleUserPreferences && anonymousUserPreferences) {
          anonymousUserPreferences.userId = googleUser._id;
          await anonymousUserPreferences.save();
        } else if (anonymousUserPreferences) {
          await anonymousUserPreferences.deleteOne();
        }

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
      } else if (!existingUID.archived) {
        // Archive existing primaryUID if not already archived
        existingUID.archived = true;
        existingUID.archivedAt = currentTime;
      }

      // Update timestamps
      googleUser.updatedAt = currentTime;
      googleUser.mergedAt = currentTime;

      await googleUser.save();
      return res.status(200).json(googleUser);
    }

    // Case 2: No googleUID found, handle anonymous user with primaryUID
    if (anonymousUser) {

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
      return res.status(200).json(anonymousUser);
    }

    // If neither user was found
    return res.status(404).json({ error: "User not found for merging." });

  } catch (error) {
    console.error('Error merging UIDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};










