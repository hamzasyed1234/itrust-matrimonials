const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const browseController = require('../controllers/browseController');

// Get all profiles (opposite gender) - hides phone numbers
router.get('/profiles', protect, browseController.getProfiles);

// Get single profile by ID (for browse page) - hides phone numbers
router.get('/profile/:profileId', protect, browseController.getProfileById);

// Get profile WITH connection status (for matches page) - shows phone if matched
router.get('/profile-with-status/:userId', protect, browseController.getProfileWithConnectionStatus);

// Get filtered profiles
router.post('/profiles/filter', protect, browseController.getFilteredProfiles);

module.exports = router;