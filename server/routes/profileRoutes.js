const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Get user profile
router.get('/', protect, profileController.getProfile);

// Update profile (with image upload)
router.put('/update', protect, upload.single('profilePicture'), profileController.updateProfile);

module.exports = router;