const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Load email config with error handling
let transporter, emailTemplates;
try {
  const emailConfig = require('../config/emailConfig');
  transporter = emailConfig.transporter;
  emailTemplates = emailConfig.emailTemplates;
  console.log('✅ Email configuration loaded successfully');
} catch (error) {
  console.error('❌ Error loading email configuration:', error);
  console.log('⚠️ Email verification will be disabled');
  transporter = null;
  emailTemplates = null;
}



const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Validate username
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        error: 'INVALID_USERNAME',
        message: 'Username must be at least 3 characters long' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists. Please login instead.' 
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'USERNAME_EXISTS',
        message: 'This username is already taken. Please choose a different one.' 
      });
    }

    // Create new user
    console.log('🔍 Creating new user with data:', { username, email, isEmailVerified: true, status: 'active' });
    
    const user = new User({
      username,
      email,
      password,
      isEmailVerified: true,
      status: 'active'
    });

    console.log('🔍 User object created, attempting to save...');
    console.log('🔍 User object before save:', {
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      subscription: user.subscription,
      role: user.role,
      employeeRole: user.employeeRole
    });
    
    await user.save();
    console.log('✅ User saved successfully:', user._id);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    console.log('🔐 Generating JWT token for signup user:', user._id);
    
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username || '',
      isAdmin: user.isAdmin || false,
      subscription: user.subscription || 'free',
      email: user.email
    };
    
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        subscription: user.subscription
      }
    });
    
  } catch (err) {
    console.error('❌ Signup error:', err);
    console.error('❌ Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      errors: err.errors
    });
    
    res.status(400).json({ 
      error: 'SIGNUP_FAILED',
      message: 'Failed to create account. Please try again.',
      details: err.message
    });
  }
};

const login = async (req, res) => {
    console.log("🛠️ Incoming login payload:", req.body);
  
    try {
        const { email, password } = req.body;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'INVALID_EMAIL',
                message: 'Please enter a valid email address' 
            });
        }
        
        if (!password || password.trim() === '') {
            return res.status(400).json({ 
                error: 'MISSING_PASSWORD',
                message: 'Password is required' 
            });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                error: 'USER_NOT_FOUND',
                message: 'No account found with this email address' 
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                error: 'WRONG_PASSWORD',
                message: 'Incorrect password' 
            });
        }

        // Check if user is verified
        if (!user.isEmailVerified) {
            return res.status(400).json({ 
                error: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address before logging in' 
            });
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('❌ JWT_SECRET environment variable is not set');
          return res.status(500).json({ error: 'Server configuration error' });
        }
        
        console.log('🔐 Generating JWT token for login user:', user._id);
        
        const tokenPayload = {
          userId: user._id.toString(),
          username: user.username || '',
          isAdmin: user.isAdmin || false,
          subscription: user.subscription || 'free',
          email: user.email
        };
        
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                subscription: user.subscription
            }
        });
        
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, firstName, lastName, phone, company, website, timezone, bio } = req.body;
    const userId = req.userId;

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (company) updateFields.company = company;
    if (website) updateFields.website = website;
    if (timezone) updateFields.timezone = timezone;
    if (bio) updateFields.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      company: user.company,
      website: user.website,
      timezone: user.timezone,
      bio: user.bio
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(400).json({ error: err.message || 'Failed to change password' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      company: user.company,
      website: user.website,
      timezone: user.timezone,
      bio: user.bio,
      subscription: user.subscription,
      isAdmin: user.isAdmin,
      status: user.status
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(400).json({ error: err.message || 'Failed to get profile' });
  }
};

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    const Project = require('../models/projectModel');
    const Submission = require('../models/submissionModel');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's projects and submissions
    const projects = await Project.find({ userId }).select('-__v');
    const submissions = await Submission.find({ userId }).select('-__v');

    const exportData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        website: user.website,
        timezone: user.timezone,
        bio: user.bio,
        subscription: user.subscription,
        isAdmin: user.isAdmin,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      projects: projects,
      submissions: submissions,
      exportDate: new Date().toISOString()
    };

    res.json(exportData);
  } catch (err) {
    console.error('Export user data error:', err);
    res.status(400).json({ error: err.message || 'Failed to export user data' });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's projects and submissions first
    const Project = require('../models/projectModel');
    const Submission = require('../models/submissionModel');
    
    await Project.deleteMany({ userId });
    await Submission.deleteMany({ userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(400).json({ error: err.message || 'Failed to delete account' });
  }
};

module.exports = { signup, login, updateProfile, changePassword, getProfile, exportUserData, deleteAccount };
