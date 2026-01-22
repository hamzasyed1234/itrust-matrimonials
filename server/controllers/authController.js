const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');

// Generate random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random avatar path (1-10)
const getRandomAvatar = () => {
  const randomNumber = Math.floor(Math.random() * 10) + 1; // 1 to 10
  return `/avatars/avatar${randomNumber}.jpg`;
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
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

    console.log('=== NEW USER REGISTRATION ===');
    console.log('Email:', email);
    console.log('Generated code:', verificationCode);
    console.log('Code expires:', new Date(verificationCodeExpires));
    console.log('Assigned avatar:', randomAvatar);

    // Create new user with random avatar
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
      profilePicture: randomAvatar, // Assign random landscape avatar
      verificationCode: verificationCode,
      verificationCodeExpires: verificationCodeExpires
    });

    await user.save();
    console.log('User saved to database with avatar:', randomAvatar);

    // Send verification email with code
    try {
      await sendVerificationEmail(email, verificationCode, firstName);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue even if email fails - user can resend
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification code.',
      email: email,
      userId: user._id 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    console.log('=== EMAIL VERIFICATION REQUEST ===');
    console.log('Email:', email);
    console.log('Code received:', code);

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user with matching email and code
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired code');
      
      // Check if user exists but code is wrong/expired
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists && userExists.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      if (userExists && userExists.verificationCodeExpires < Date.now()) {
        return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
      }
      
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log('Verifying email for user:', user.email);

    // Mark email as verified and clear verification fields
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    console.log('Email verified successfully for:', user.email);

    // Generate JWT token for auto-login after verification
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
        profilePicture: user.profilePicture, // Include avatar
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

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    console.log('New verification code generated for:', email);
    console.log('Code:', verificationCode);

    // Send new verification email
    await sendVerificationEmail(email, verificationCode, user.firstName);

    res.status(200).json({ 
      message: 'Verification code has been resent to your email' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending code' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
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
        profilePicture: user.profilePicture, // Include avatar
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};