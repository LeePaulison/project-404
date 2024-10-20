const NotionPreference = require('../models/NotionPreference');

const notionController = {
  // Get all Notion preferences
  getAllPreferences: async (req, res) => {
    try {
      const preferences = await NotionPreference.find();
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching preferences', error: error.message });
    }
  },

  // Get a single Notion preference by ID
  getPreferenceById: async (req, res) => {
    try {
      const preference = await NotionPreference.findById(req.params.id);
      if (!preference) {
        return res.status(404).json({ message: 'Preference not found' });
      }
      res.json(preference);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching preference', error: error.message });
    }
  },

  // Create a new Notion preference
  createPreference: async (req, res) => {
    try {
      const newPreference = new NotionPreference(req.body);
      const savedPreference = await newPreference.save();
      res.status(201).json(savedPreference);
    } catch (error) {
      res.status(400).json({ message: 'Error creating preference', error: error.message });
    }
  },

  // Update a Notion preference
  updatePreference: async (req, res) => {
    try {
      const updatedPreference = await NotionPreference.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedPreference) {
        return res.status(404).json({ message: 'Preference not found' });
      }
      res.json(updatedPreference);
    } catch (error) {
      res.status(400).json({ message: 'Error updating preference', error: error.message });
    }
  },

  // Delete a Notion preference
  deletePreference: async (req, res) => {
    try {
      const deletedPreference = await NotionPreference.findByIdAndDelete(req.params.id);
      if (!deletedPreference) {
        return res.status(404).json({ message: 'Preference not found' });
      }
      res.json({ message: 'Preference deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting preference', error: error.message });
    }
  }
};

module.exports = notionController;

