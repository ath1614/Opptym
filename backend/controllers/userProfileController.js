const User = require('../models/userModel');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('profile');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return profile or default if not exists
    const profile = user.profile || {
      businessName: '',
      website: '',
      email: user.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      description: '',
      category: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: ''
      },
      preferences: {
        autoFill: true,
        showInstructions: true,
        defaultCategory: 'Business'
      },
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Profile data is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile with timestamp
    user.profile = {
      ...user.profile,
      ...profile,
      lastUpdated: new Date()
    };

    await user.save();

    console.log('✅ User profile updated:', {
      userId,
      businessName: user.profile.businessName,
      website: user.profile.website,
      lastUpdated: user.profile.lastUpdated
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

// Get profile completion percentage
const getProfileCompletion = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('profile email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile || {};
    const requiredFields = [
      'businessName', 'website', 'email', 'phone', 'address', 
      'city', 'state', 'country', 'description'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = field === 'email' ? user.email : profile[field];
      return value && value.toString().trim() !== '';
    });

    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

    res.json({
      success: true,
      completion: completionPercentage,
      completedFields: completedFields.length,
      totalFields: requiredFields.length,
      missingFields: requiredFields.filter(field => !completedFields.includes(field))
    });

  } catch (error) {
    console.error('Error getting profile completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile completion',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getProfileCompletion
};
