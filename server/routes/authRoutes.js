const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/register', authController.register);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Login
router.post('/login', authController.login);

module.exports = router;