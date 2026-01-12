const User = require('../models/User');
// ConnectionRequest model will be needed later for sending connection requests
// const ConnectionRequest = require('../models/ConnectionRequest');

// Get all profiles (opposite gender only)
exports.getProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    console.log('🔍 Current User:', currentUser.firstName, currentUser.lastName);
    console.log('🔍 Current User Gender:', currentUser.gender);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine opposite gender (handle both capitalized and lowercase)
    const currentGender = currentUser.gender.toLowerCase();
    const oppositeGender = currentGender === 'male' ? 'Female' : 'Male';
    console.log('🔍 Looking for gender:', oppositeGender);
    
    // RELAXED REQUIREMENTS - Only require basic fields
    const profiles = await User.find({
      _id: { $ne: currentUser._id },
      gender: { $in: [oppositeGender, oppositeGender.toLowerCase()] }, // Match both cases
      // Only require email and gender - everything else is optional
      email: { $exists: true, $ne: null }
    })
    .select('-password -email') // Hide sensitive fields
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

// Get single profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const currentUser = await User.findById(req.user.id);

    console.log('🔍 Fetching profile:', profileId);
    console.log('🔍 Current user:', currentUser.firstName, currentUser.lastName);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await User.findById(profileId)
      .select('-password -email'); // Exclude sensitive info

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

// Apply filters to profiles
exports.getFilteredProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentGender = currentUser.gender.toLowerCase();
    const oppositeGender = currentGender === 'male' ? 'Female' : 'Male';
    
    // Build filter query
    let query = {
      _id: { $ne: currentUser._id },
      gender: { $in: [oppositeGender, oppositeGender.toLowerCase()] }, // Match both cases
      email: { $exists: true, $ne: null }
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
      // Convert height to inches for comparison
      query.height = { $exists: true };
    }

    const profiles = await User.find(query)
      .select('-password -email')
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

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    // Check if request already exists
    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: 'Connection request already sent' 
      });
    }

    // Create new connection request
    const connectionRequest = new ConnectionRequest({
      sender: senderId,
      recipient: recipientId,
      status: 'pending'
    });

    await connectionRequest.save();

    // Update recipient's pending count
    await User.findByIdAndUpdate(recipientId, {
      $inc: { pendingMatchRequests: 1 }
    });

    console.log('✅ Connection request sent from', senderId, 'to', recipientId);

    res.json({
      success: true,
      message: 'Connection request sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending connection request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while sending connection request' 
    });
  }
};