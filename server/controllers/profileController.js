const User = require('../models/User');

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

// Update profile (Phase 2) - NO PROFILE PICTURE UPLOAD
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // NOTE: Profile picture is assigned randomly on registration and cannot be changed

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
    
    // Residency Status
    if (req.body.residencyStatus !== undefined && req.body.residencyStatus !== '' && req.body.residencyStatus !== 'undefined') {
      user.residencyStatus = req.body.residencyStatus;
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
    
    // Handle tags
    if (req.body.tags) {
      try {
        const parsedTags = JSON.parse(req.body.tags);
        if (Array.isArray(parsedTags)) {
          // Filter out empty tags and limit to 10 tags, 20 chars each
          user.tags = parsedTags
            .filter(tag => tag && tag.trim() !== '')
            .map(tag => tag.trim().substring(0, 20))
            .slice(0, 10);
        }
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    // Check if ALL required fields are completed
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

    // Mark profile as completed only if ALL required fields are filled
    user.profileCompleted = allFieldsCompleted && hasLanguages;

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