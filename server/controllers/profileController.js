const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update profile (Phase 2)
exports.updateProfile = async (req, res) => {
  try {
    const {
      profilePicture,
      ethnicity,
      height,
      birthPlace,
      currentLocation,
      profession,
      education,
      languages,
      bio
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (profilePicture) user.profilePicture = profilePicture;
    if (ethnicity) user.ethnicity = ethnicity;
    if (height) user.height = height;
    if (birthPlace) user.birthPlace = birthPlace;
    if (currentLocation) user.currentLocation = currentLocation;
    if (profession) user.profession = profession;
    if (education) user.education = education;
    if (languages) user.languages = languages;
    if (bio) user.bio = bio;

    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};