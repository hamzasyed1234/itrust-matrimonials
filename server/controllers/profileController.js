const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update profile (Phase 2)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if it exists
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log('Old profile picture deleted');
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      
      // Save new profile picture path (relative to server root)
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update profile fields (only if provided and not empty string 'undefined')
    if (req.body.ethnicity !== undefined && req.body.ethnicity !== '' && req.body.ethnicity !== 'undefined') {
      user.ethnicity = req.body.ethnicity;
    }
    if (req.body.height !== undefined && req.body.height !== '' && req.body.height !== 'undefined') {
      user.height = req.body.height;
    }
    if (req.body.birthPlace !== undefined && req.body.birthPlace !== '' && req.body.birthPlace !== 'undefined') {
      user.birthPlace = req.body.birthPlace;
    }
    if (req.body.currentLocation !== undefined && req.body.currentLocation !== '' && req.body.currentLocation !== 'undefined') {
      user.currentLocation = req.body.currentLocation;
    }
    if (req.body.profession !== undefined && req.body.profession !== '' && req.body.profession !== 'undefined') {
      user.profession = req.body.profession;
    }
    if (req.body.education !== undefined && req.body.education !== '' && req.body.education !== 'undefined') {
      user.education = req.body.education;
    }
    
    if (req.body.maritalStatus !== undefined && req.body.maritalStatus !== '' && req.body.maritalStatus !== 'undefined') {
      user.maritalStatus = req.body.maritalStatus;
    }

    // Update phone number
    if (req.body.phoneNumber !== undefined && req.body.phoneNumber !== 'undefined') {
      user.phoneNumber = req.body.phoneNumber.trim();
    }

    // Handle languages separately (it's an array)
    if (req.body.languages) {
      try {
        const parsedLanguages = JSON.parse(req.body.languages);
        if (Array.isArray(parsedLanguages)) {
          user.languages = parsedLanguages.filter(lang => lang && lang.trim() !== '');
        }
      } catch (e) {
        console.error('Error parsing languages:', e);
      }
    }

    // Handle custom fields (optional fields like complexion, etc.)
    if (req.body.customFields) {
      try {
        const parsedCustomFields = JSON.parse(req.body.customFields);
        user.customFields = parsedCustomFields;
      } catch (e) {
        console.error('Error parsing custom fields:', e);
      }
    }

    // Mark profile as completed
    user.profileCompleted = true;

    await user.save();

    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile',
      error: error.message 
    });
  }
};