const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/register', authController.register);

// Verify email with code
router.post('/verify-email', authController.verifyEmail);

// Resend verification code
router.post('/resend-code', authController.resendVerificationCode);

// Login
router.post('/login', authController.login);

module.exports = router;