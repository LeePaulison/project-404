const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences } = require('../controllers/preferencesController');

router.get('/:userId', getPreferences); // Route to get preferences by user ID
router.put('/:userId', updatePreferences); // Route to update preferences by user ID
module.exports = router;