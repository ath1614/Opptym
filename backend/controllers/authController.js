const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter, emailTemplates } = require('../config/emailConfig');
const crypto = require('crypto');

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

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = await User.create({ 
      username, 
      email, 
      password: hashed,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      status: 'pending' // User starts as pending until email is verified
    });
    
    // Send verification email
    try {
      const mailOptions = emailTemplates.verificationEmail(verificationToken, email);
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail signup if email fails, but log it
    }
    
    res.status(201).json({ 
      message: 'Account created successfully! Please check your email to verify your account.',
      isAdmin: user.isAdmin,
      requiresVerification: true
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ 
      error: 'SIGNUP_FAILED',
      message: 'Failed to create account. Please try again.' 
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
        
        if (!password) {
            return res.status(400).json({ 
                error: 'MISSING_PASSWORD',
                message: 'Password is required' 
            });
        }
        
        const user = await User.findOne({ email });
        console.log("🔍 Found user:", user ? 'Yes' : 'No');
      
        if (!user) {
            return res.status(401).json({ 
                error: 'USER_NOT_FOUND',
                message: 'No account found with this email address. Please check your email or sign up.' 
            });
        }
      
        const match = await bcrypt.compare(password, user.password);
        console.log("✅ Password match:", match);
      
        if (!match) {
            return res.status(401).json({ 
                error: 'WRONG_PASSWORD',
                message: 'Incorrect password. Please try again.' 
            });
        }
        
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({ 
                error: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address before logging in. Check your inbox for a verification link.' 
            });
        }
        
        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({ 
                error: 'ACCOUNT_INACTIVE',
                message: 'Your account is not active. Please contact support.' 
            });
        }
      
        // Use fallback JWT secret if environment variable is not set
        const jwtSecret = process.env.JWT_SECRET || 'opptym-secret-key-2024-fallback';
        console.log("🔑 JWT Secret configured:", !!process.env.JWT_SECRET);
      
        const token = jwt.sign({ 
            userId: user._id, 
            username: user.username,
            isAdmin: user.isAdmin, 
            subscription: user.subscription, 
            email: user.email 
        }, jwtSecret, { expiresIn: '7d' });
        
        console.log("✅ Login successful for user:", user.email);
        
        res.json({ 
            token, 
            isAdmin: user.isAdmin, 
            subscription: user.subscription, 
            email: user.email,
            username: user.username
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
        bio: user.bio
      }
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
        status: user.status
      }
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
