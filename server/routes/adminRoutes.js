const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware'); // Changed this line
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all users with filters (auth + admin required)
router.get('/users', protect, adminMiddleware, adminController.getAllUsers);

// Get statistics (auth + admin required)
router.get('/statistics', protect, adminMiddleware, adminController.getStatistics);

module.exports = router;