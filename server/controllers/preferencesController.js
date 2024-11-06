const Preferences = require('../models/Preferences');

exports.getPreferences = async (req, res) => {
  try {
    const { userId } = req.params; // Get the user ID from the URL

    // 1. Find the preferences for the user
    const preferences = await Preferences.findOne({ userId });

    // handle case where preferences do not exist
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    return res.status(200).json(preferences);
  } catch (error) {
    console.error('Error retrieving preferences:', error);
    res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    console.log('Updating preferences');
    console.log(req.params);
    console.log(req.body);
    
    const { userId } = req.params; // Get the user ID from the URL
    const updates = req.body; // Get the preferences from the request body

    // 1. Update the preferences
    const updatedPreferences = await Preferences.findOneAndUpdate({ userId }, { $set: updates }, { new: true, runValidators: true });

    // handle case where preferences do not exist
    if (!updatedPreferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    return res.status(200).json(updatedPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
