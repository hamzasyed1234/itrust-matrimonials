const User = require('../models/User');
const Connection = require('../models/Connection');

// Get all profiles (opposite gender only)
exports.getProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    console.log('🔍 Current User:', currentUser.firstName, currentUser.lastName);
    console.log('🔍 Current User Gender:', currentUser.gender);
    console.log('🔍 Profile Completed:', currentUser.profileCompleted);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // CHECK IF USER HAS COMPLETED THEIR PROFILE
    if (!currentUser.profileCompleted) {
      return res.status(403).json({ 
        success: false,
        message: 'Please complete your profile before browsing other profiles',
        profileCompleted: false
      });
    }

    // Determine opposite gender (handle both capitalized and lowercase)
    const currentGender = currentUser.gender.toLowerCase();
    const oppositeGender = currentGender === 'male' ? 'Female' : 'Male';
    console.log('🔍 Looking for gender:', oppositeGender);
    
    // Get profiles of opposite gender who have also completed their profiles
    const profiles = await User.find({
      _id: { $ne: currentUser._id },
      gender: { $in: [oppositeGender, oppositeGender.toLowerCase()] },
      email: { $exists: true, $ne: null },
      profileCompleted: true // Only show users who have completed their profiles
    })
    .select('-password -email -phoneNumber') // Hide sensitive fields including phone
    .sort({ createdAt: -1 });

    console.log('✅ Found profiles:', profiles.length);
    console.log('📋 Profile names:', profiles.map(p => `${p.firstName} ${p.lastName}`));

    res.json({
      success: true,
      profiles: profiles,
      count: profiles.length
    });

  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profiles' 
    });
  }
};

// Get single profile by ID (WITHOUT connection check - for browse page)
exports.getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const currentUser = await User.findById(req.user.id);

    console.log('🔍 Fetching profile:', profileId);
    console.log('🔍 Current user:', currentUser.firstName, currentUser.lastName);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // CHECK IF CURRENT USER HAS COMPLETED THEIR PROFILE
    if (!currentUser.profileCompleted) {
      return res.status(403).json({ 
        success: false,
        message: 'Please complete your profile before viewing other profiles',
        profileCompleted: false
      });
    }

    const profile = await User.findById(profileId)
      .select('-password -email -phoneNumber'); // Hide phone number in browse

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if profile is opposite gender (handle both cases)
    const currentGender = currentUser.gender.toLowerCase();
    const oppositeGender = currentGender === 'male' ? 'female' : 'male';
    
    if (profile.gender.toLowerCase() !== oppositeGender) {
      return res.status(403).json({ 
        message: 'You can only view profiles of the opposite gender' 
      });
    }

    console.log('✅ Profile found:', profile.firstName, profile.lastName);

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile' 
    });
  }
};

// Get single profile WITH connection check (for matches page) - NEW FUNCTION
exports.getProfileWithConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    console.log('🔍 Fetching profile with connection status');
    console.log('🔍 Current User ID:', currentUserId);
    console.log('🔍 Target User ID:', userId);

    // Find the user
    const user = await User.findById(userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if they have an accepted connection
    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: currentUserId, status: 'accepted' }
      ]
    });

    const userObj = user.toObject();

    // Only include phone number if they have an accepted match
    if (!connection) {
      delete userObj.phoneNumber;
      console.log('❌ No accepted connection - phone number hidden');
    } else {
      console.log('✅ Accepted connection found - phone number visible');
    }

    res.json({
      success: true,
      profile: userObj,
      isMatched: !!connection
    });

  } catch (error) {
    console.error('❌ Error fetching profile with connection status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile' 
    });
  }
};

// Apply filters to profiles
exports.getFilteredProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // CHECK IF CURRENT USER HAS COMPLETED THEIR PROFILE
    if (!currentUser.profileCompleted) {
      return res.status(403).json({ 
        success: false,
        message: 'Please complete your profile before browsing other profiles',
        profileCompleted: false
      });
    }

    const currentGender = currentUser.gender.toLowerCase();
    const oppositeGender = currentGender === 'male' ? 'Female' : 'Male';
    
    // Build filter query
    let query = {
      _id: { $ne: currentUser._id },
      gender: { $in: [oppositeGender, oppositeGender.toLowerCase()] },
      email: { $exists: true, $ne: null },
      profileCompleted: true // Only show completed profiles
    };

    // Apply filters from request body
    const { 
      minAge, 
      maxAge, 
      ethnicity, 
      minHeight, 
      maxHeight, 
      location, 
      profession,
      education,
      maritalStatus 
    } = req.body;

    // Age filter (if dateOfBirth exists)
    if (minAge || maxAge) {
      const today = new Date();
      if (maxAge) {
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $gte: minDate };
      }
      if (minAge) {
        const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $lte: maxDate };
      }
    }

    // Other filters (only apply if field exists)
    if (ethnicity && ethnicity !== 'Any') {
      query.ethnicity = ethnicity;
    }
    
    if (location) {
      query.currentLocation = { $regex: location, $options: 'i' };
    }
    
    if (profession) {
      query.profession = { $regex: profession, $options: 'i' };
    }

    if (education) {
      query.education = education;
    }

    if (maritalStatus) {
      query.maritalStatus = maritalStatus;
    }

    // Height filter (if height exists)
    if (minHeight || maxHeight) {
      query.height = { $exists: true };
    }

    const profiles = await User.find(query)
      .select('-password -email -phoneNumber') // Hide phone in filtered results
      .sort({ createdAt: -1 });

    console.log('✅ Filtered profiles found:', profiles.length);

    res.json({
      success: true,
      profiles: profiles,
      count: profiles.length
    });

  } catch (error) {
    console.error('❌ Error filtering profiles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while filtering profiles' 
    });
  }
};