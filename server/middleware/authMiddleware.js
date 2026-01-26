const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('❌ No token provided in request'); // DEBUG LOG
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    console.log('🔍 Token received, verifying...'); // DEBUG LOG

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully for user:', decoded.userId); // DEBUG LOG

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ User not found in database:', decoded.userId); // DEBUG LOG
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User authenticated:', user.email); // DEBUG LOG

    // Set both the user object and userId for convenience
    req.user = user;
    req.user.userId = user._id;

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // More specific error messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }
};