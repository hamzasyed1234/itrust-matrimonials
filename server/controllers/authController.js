const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');

// Store verification codes temporarily (in-memory, or use Redis for production)
// Format: { email: { code, expires, userData } }
const pendingVerifications = new Map();

// Generate random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random avatar path (1-10)
const getRandomAvatar = () => {
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  return `/avatars/avatar${randomNumber}.jpg`;
};

// Helper function to check profile completion
const checkProfileCompletion = (user) => {
  const requiredFields = [
    'ethnicity',
    'height',
    'birthPlace',
    'currentLocation',
    'residencyStatus',
    'profession',
    'education',
    'maritalStatus',
    'phoneNumber'
  ];

  const allFieldsCompleted = requiredFields.every(field => {
    const value = user[field];
    // Check for null, undefined, empty string, or whitespace-only string
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  });

  // Also check that languages array has at least one language
  const hasLanguages = Array.isArray(user.languages) && 
                       user.languages.length > 0 && 
                       user.languages.some(lang => lang && lang.trim() !== '');

  return allFieldsCompleted && hasLanguages;
};

// Register - just send code, DON'T create user yet
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate age (must be 18+)
    const age = Math.floor((new Date() - new Date(dateOfBirth)) / 31557600000);
    if (age < 18) {
      return res.status(400).json({ message: 'You must be at least 18 years old to register' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Assign random avatar
    const randomAvatar = getRandomAvatar();

    console.log('=== VERIFICATION CODE GENERATED ===');
    console.log('Email:', email);
    console.log('Code:', verificationCode);
    console.log('Expires:', new Date(verificationCodeExpires));

    // Store user data temporarily (NOT in database yet!)
    pendingVerifications.set(email.toLowerCase(), {
      code: verificationCode,
      expires: verificationCodeExpires,
      userData: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        dateOfBirth,
        gender,
        profilePicture: randomAvatar
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, firstName);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(201).json({ 
      message: 'Verification code sent! Please check your email.',
      email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify email - NOW create the user
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    console.log('=== EMAIL VERIFICATION ===');
    console.log('Email:', email);
    console.log('Code:', code);

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Get pending verification data
    const pending = pendingVerifications.get(email.toLowerCase());

    if (!pending) {
      return res.status(400).json({ 
        message: 'No pending verification found. Please sign up again.' 
      });
    }

    // Check if code expired
    if (pending.expires < Date.now()) {
      pendingVerifications.delete(email.toLowerCase());
      return res.status(400).json({ 
        message: 'Verification code has expired. Please sign up again.' 
      });
    }

    // Check if code matches
    if (pending.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log('✅ Code verified! Creating user now...');

    // NOW create the actual user in database
    const user = new User({
      ...pending.userData,
      isEmailVerified: true
    });

    await user.save();
    console.log('✅ User created:', user.email);

    // Remove from pending verifications
    pendingVerifications.delete(email.toLowerCase());

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        profilePicture: user.profilePicture,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const pending = pendingVerifications.get(email.toLowerCase());

    if (!pending) {
      return res.status(404).json({ 
        message: 'No pending verification found. Please sign up again.' 
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    // Update the pending verification
    pending.code = verificationCode;
    pending.expires = verificationCodeExpires;
    pendingVerifications.set(email.toLowerCase(), pending);

    console.log('New code generated:', verificationCode);

    // Send new verification email
    await sendVerificationEmail(email, verificationCode, pending.userData.firstName);

    res.status(200).json({ 
      message: 'Verification code has been resent to your email' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending code' });
  }
};

// Login with Profile Completion Check
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Check if there's pending verification
      if (pendingVerifications.has(email.toLowerCase())) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in',
          requiresVerification: true,
          email: email
        });
      }
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✨ CHECK AND UPDATE PROFILE COMPLETION STATUS ON EVERY LOGIN ✨
    const isProfileComplete = checkProfileCompletion(user);
    
    // Only update if status has changed
    if (user.profileCompleted !== isProfileComplete) {
      user.profileCompleted = isProfileComplete;
      await user.save();
      console.log(`📋 Profile completion status updated for ${user.email}: ${isProfileComplete}`);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        profilePicture: user.profilePicture,
        profileCompleted: user.profileCompleted,
        isAdmin: user.isAdmin || false  // ADD THIS LINE
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};