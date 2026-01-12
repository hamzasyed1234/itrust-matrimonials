// server/routes/browse.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const browseController = require('../controllers/browseController');

// Get all profiles (opposite gender)
router.get('/profiles', protect, browseController.getProfiles);

// Get single profile by ID
router.get('/profile/:profileId', protect, browseController.getProfileById);

// Get filtered profiles
router.post('/profiles/filter', protect, browseController.getFilteredProfiles);

module.exports = router;