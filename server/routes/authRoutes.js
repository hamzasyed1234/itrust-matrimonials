const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

if (process.env.NODE_ENV !== 'production') {
  console.log('🛣️ Auth routes loaded');
}

// Register new user
router.post('/register', (req, res, next) => {
  console.log('🔥 /register route hit!'); // Always log this (important)
  next();
}, authController.register);

// Verify email with code
router.post('/verify-email', authController.verifyEmail);

// Resend verification code
router.post('/resend-code', authController.resendVerificationCode);

// Login
router.post('/login', authController.login);

module.exports = router;