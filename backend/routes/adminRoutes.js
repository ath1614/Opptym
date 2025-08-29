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
router.put('/users/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, firstName, lastName, isAdmin, subscription, status, phone, company, website, timezone, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (subscription) user.subscription = subscription;
    if (status) user.status = status;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (website) user.website = website;
    if (timezone) user.timezone = timezone;
    if (bio) user.bio = bio;

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user verification status (admin only)
router.put('/users/:userId/verify', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isEmailVerified, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update verification status
    if (isEmailVerified !== undefined) {
      user.isEmailVerified = isEmailVerified;
      if (isEmailVerified && !user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }
    }

    // Update account status
    if (status) {
      user.status = status;
    }

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user verification:', error);
    res.status(500).json({ error: 'Failed to update user verification status' });
  }
});

// Send verification email to user (admin only)
router.post('/users/:userId/send-verification', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { transporter, emailTemplates } = require('../config/emailConfig');
    const crypto = require('crypto');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'User email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const mailOptions = emailTemplates.verificationEmail(verificationToken, user.email);
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Plan management routes
// Get all plans (admin only)
router.get('/plans', protect, adminOnly, async (req, res) => {
  try {
    // Define plans structure
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        features: ['Basic SEO tools', 'Limited submissions', '3-day trial'],
        limits: { projects: 10, submissions: 50, teamMembers: 0 }
      },
      starter: {
        name: 'Starter',
        price: 999,
        features: ['All SEO tools', '150 submissions/month', 'Email support'],
        limits: { projects: 1, submissions: 150, teamMembers: 0 }
      },
      pro: {
        name: 'Pro',
        price: 3999,
        features: ['All SEO tools', '750 submissions/month', 'Team management', 'Priority support'],
        limits: { projects: 5, submissions: 750, teamMembers: 3 }
      },
      business: {
        name: 'Business',
        price: 8999,
        features: ['All SEO tools', '1500 submissions/month', 'Advanced analytics', 'Dedicated support'],
        limits: { projects: 10, submissions: 1500, teamMembers: 10 }
      },
      enterprise: {
        name: 'Enterprise',
        price: 19999,
        features: ['Unlimited everything', 'Custom integrations', 'Dedicated account manager'],
        limits: { projects: -1, submissions: -1, teamMembers: -1 }
      }
    };

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create new plan (admin only)
router.post('/plans', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, features, limits, isActive } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // In a real application, you would save this to a database
    // For now, we'll just return success
    const newPlan = {
      id: Date.now().toString(),
      name,
      price,
      features: features || [],
      limits: limits || {},
      isActive: isActive !== false
    };

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Update plan (admin only)
router.put('/plans/:planId', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, price, features, limits, isActive } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // In a real application, you would update this in a database
    const updatedPlan = {
      id: planId,
      name,
      price,
      features: features || [],
      limits: limits || {},
      isActive: isActive !== false
    };

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete plan (admin only)
router.delete('/plans/:planId', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;

    // In a real application, you would delete this from a database
    // For now, we'll just return success

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
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

// Create new directory (admin only)
router.post('/directories', protect, adminOnly, async (req, res) => {
  try {
    const { name, domain, category, pageRank, status, description, submissionUrl, requirements } = req.body;

    // Check if directory already exists
    const existingDirectory = await Directory.findOne({ $or: [{ name }, { domain }] });
    if (existingDirectory) {
      return res.status(400).json({ error: 'Directory with this name or domain already exists' });
    }

    // Create new directory
    const directory = new Directory({
      name,
      domain,
      category: category || 'general',
      pageRank: pageRank || 1,
      status: status || 'active',
      description: description || '',
      submissionUrl: submissionUrl || '',
      requirements: requirements || []
    });

    await directory.save();
    
    res.status(201).json(directory);
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// Update directory (admin only)
router.put('/directories/:directoryId', protect, adminOnly, async (req, res) => {
  try {
    const { directoryId } = req.params;
    const { name, domain, category, pageRank, status, description, submissionUrl, requirements } = req.body;

    const directory = await Directory.findById(directoryId);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Update fields if provided
    if (name) directory.name = name;
    if (domain) directory.domain = domain;
    if (category) directory.category = category;
    if (pageRank !== undefined) directory.pageRank = pageRank;
    if (status) directory.status = status;
    if (description !== undefined) directory.description = description;
    if (submissionUrl !== undefined) directory.submissionUrl = submissionUrl;
    if (requirements) directory.requirements = requirements;

    await directory.save();
    
    res.json(directory);
  } catch (error) {
    console.error('Error updating directory:', error);
    res.status(500).json({ error: 'Failed to update directory' });
  }
});

// Delete directory (admin only)
router.delete('/directories/:directoryId', protect, adminOnly, async (req, res) => {
  try {
    const { directoryId } = req.params;

    const directory = await Directory.findById(directoryId);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    await Directory.findByIdAndDelete(directoryId);
    
    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    console.error('Error deleting directory:', error);
    res.status(500).json({ error: 'Failed to delete directory' });
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