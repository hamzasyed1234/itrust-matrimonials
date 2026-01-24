const User = require('../models/User');

// Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { 
      gender, 
      minAge, 
      maxAge, 
      profileCompleted,
      search,
      page = 1,
      limit = 50 
    } = req.query;

    let query = { isAdmin: { $ne: true } }; // Exclude admin from results

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Age filters
    if (minAge || maxAge) {
      const today = new Date();
      
      if (maxAge) {
        const minDate = new Date(today.getFullYear() - parseInt(maxAge) - 1, today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $gte: minDate };
      }
      
      if (minAge) {
        const maxDate = new Date(today.getFullYear() - parseInt(minAge), today.getMonth(), today.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $lte: maxDate };
      }
    }

    // Profile completion filter
    if (profileCompleted !== undefined) {
      query.profileCompleted = profileCompleted === 'true';
    }

    // Search filter (name or email)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
    const maleUsers = await User.countDocuments({ gender: 'male', isAdmin: { $ne: true } });
    const femaleUsers = await User.countDocuments({ gender: 'female', isAdmin: { $ne: true } });
    const completedProfiles = await User.countDocuments({ profileCompleted: true, isAdmin: { $ne: true } });
    const incompleteProfiles = await User.countDocuments({ profileCompleted: false, isAdmin: { $ne: true } });

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        maleUsers,
        femaleUsers,
        completedProfiles,
        incompleteProfiles
      }
    });

  } catch (error) {
    console.error('Admin get statistics error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = { getAllUsers, getStatistics };