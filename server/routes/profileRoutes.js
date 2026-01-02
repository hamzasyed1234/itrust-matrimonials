const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Get user profile
router.get('/', protect, profileController.getProfile);

// Update profile
router.put('/update', protect, profileController.updateProfile);

module.exports = router;