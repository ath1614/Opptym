const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(require('../config/stripeConfig').STRIPE_SECRET_KEY);

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, isAdmin, subscription, status } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'username, email, and password are required' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, isAdmin, subscription, status });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update user (plan, status, isAdmin, password)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { subscription, isAdmin, status, password, username, email } = req.body;
  try {
    const updateFields = { subscription, isAdmin, status };
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) updateFields.password = await bcrypt.hash(password, 10);
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    console.log('✅ User updated successfully:', user._id, 'Subscription:', user.subscription);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription,
        isAdmin: user.isAdmin,
        status: user.status
      }
    });
  } catch (err) {
    console.error('❌ Update user error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Invite team member
exports.inviteTeamMember = async (req, res) => {
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
  } catch (err) {
    console.error('❌ Invite team member error:', err);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
};

// Save admin settings
exports.saveAdminSettings = async (req, res) => {
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
  } catch (err) {
    console.error('❌ Save admin settings error:', err);
    res.status(500).json({ error: 'Failed to save admin settings' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({});
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all directories (if you have a Directory model, otherwise return unique directory names from submissions)
exports.getAllDirectories = async (req, res) => {
  try {
    // First try to get from Directory model
    const directories = await Directory.find({});
    if (directories.length > 0) {
      res.json(directories);
    } else {
      // Fallback to unique siteNames from submissions
      const directoryNames = await Submission.distinct('siteName');
      const directoryData = directoryNames.map((name, i) => ({
        id: i,
        name,
        domain: '',
        category: 'general',
        pageRank: 5,
        status: 'active',
        submissionCount: 0,
        successRate: 0
      }));
      res.json(directoryData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new directory
exports.createDirectory = async (req, res) => {
  try {
    const { name, domain, category, pageRank, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Directory name is required' });
    
    const directory = await Directory.create({ 
      name, 
      domain, 
      category, 
      pageRank, 
      status,
      updatedAt: new Date()
    });
    res.status(201).json(directory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update directory
exports.updateDirectory = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    updates.updatedAt = new Date();
    const directory = await Directory.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!directory) return res.status(404).json({ error: 'Directory not found' });
    res.json(directory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete directory
exports.deleteDirectory = async (req, res) => {
  const { id } = req.params;
  try {
    const directory = await Directory.findByIdAndDelete(id);
    if (!directory) return res.status(404).json({ error: 'Directory not found' });
    res.json({ message: 'Directory deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get system stats
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    // Stripe revenue aggregation
    let revenue = 0;
    try {
      const prices = [
        'price_1Ro1LgCD7oezJBDYCEE71gAc', // starter pack monthly
        'price_1Ro1MYCD7oezJBDYgAXVoUw6', // pro pack monthly
        'price_1Ro1RGCD7oezJBDY2yHsrEur', // pro pack yearly
        'price_1Ro1NQCD7oezJBDYE4IX9qPE', // business pack monthly
        'price_1Ro1TBCD7oezJBDYEEJGaA75'  // business pack yearly
      ];
      let hasMore = true;
      let startingAfter = undefined;
      while (hasMore) {
        const paymentIntents = await stripe.paymentIntents.list({
          limit: 100,
          ...(startingAfter && { starting_after: startingAfter })
        });
        for (const pi of paymentIntents.data) {
          if (pi.status === 'succeeded' && pi.charges && pi.charges.data.length > 0) {
            // Check if the payment is for one of our prices
            const invoice = pi.invoice ? await stripe.invoices.retrieve(pi.invoice) : null;
            if (invoice && invoice.lines && invoice.lines.data.some(line => prices.includes(line.price && line.price.id))) {
              revenue += pi.amount_received;
            }
          }
        }
        hasMore = paymentIntents.has_more;
        if (hasMore) startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
      }
      revenue = revenue / 100; // convert from cents to dollars
    } catch (err) {
      console.error('Stripe revenue fetch error:', err.message);
    }
    res.json({ totalUsers, activeUsers, totalProjects, totalSubmissions, revenue, successRate: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 