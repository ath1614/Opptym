const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');

// Get all users (admin only)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system stats (admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    // Calculate new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Calculate growth rate (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const usersLastMonth = await User.countDocuments({
      createdAt: { $lt: startOfMonth, $gte: lastMonth }
    });
    const growthRate = usersLastMonth > 0 ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100) : 0;

    // Calculate success rate
    const successfulSubmissions = await Submission.countDocuments({ status: 'success' });
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;

    // Mock revenue (in real app, this would come from payment system)
    const revenue = totalUsers * 10; // Mock calculation

    res.json({
      totalUsers,
      activeUsers,
      totalProjects,
      totalSubmissions,
      revenue,
      successRate,
      newUsersThisMonth,
      growthRate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Create new user (admin only)
router.post('/users', protect, adminOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, password, isAdmin, subscription, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      firstName,
      lastName,
      password,
      isAdmin: isAdmin || false,
      subscription: subscription || 'free',
      status: status || 'active'
    });

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, password, isAdmin, subscription, status } = req.body;
    
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      isAdmin: isAdmin || false,
      subscription: subscription || 'free',
      status: status || 'active'
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all directories (admin only)
router.get('/directories', protect, adminOnly, async (req, res) => {
  try {
    const directories = await Directory.find({}).sort({ createdAt: -1 });
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

// Get all projects (admin only)
router.get('/projects', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get all submissions (admin only)
router.get('/submissions', protect, adminOnly, async (req, res) => {
  try {
    const submissions = await Submission.find({});
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Invite team member (admin only)
router.post('/invite-team-member', protect, adminOnly, async (req, res) => {
  try {
    const { email, role, teamId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create invitation (mock implementation)
    const invitation = {
      email,
      role: role || 'employee',
      teamId: teamId || null,
      status: 'pending',
      invitedBy: req.userId,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    console.log('✅ Team member invitation created:', invitation);

    res.json({
      success: true,
      message: 'Team member invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('❌ Invite team member error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

// Save admin settings (admin only)
router.post('/save-settings', protect, adminOnly, async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Mock implementation for saving admin settings
    const adminSettings = {
      ...settings,
      updatedAt: new Date(),
      updatedBy: req.userId
    };

    console.log('✅ Admin settings saved:', adminSettings);

    res.json({
      success: true,
      message: 'Admin settings saved successfully',
      settings: adminSettings
    });
  } catch (error) {
    console.error('❌ Save admin settings error:', error);
    res.status(500).json({ error: 'Failed to save admin settings' });
  }
});

// Get admin settings (admin only)
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    // Mock admin settings
    const adminSettings = {
      systemName: 'OPPTYM',
      contactEmail: 'admin@opptym.com',
      maxUsers: 1000,
      maxProjects: 100,
      maintenanceMode: false,
      autoBackup: true,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    res.json(adminSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
});

module.exports = router; 