const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Directory = require('../models/directoryModel');
const User = require('../models/userModel');

// Get all directories (public - for users to see available directories)
router.get('/', protect, async (req, res) => {
  try {
    const { country, classification, category } = req.query;
    
    let filter = { status: 'active' };
    
    // Add filters if provided
    if (country && country !== 'all') {
      filter.country = country;
    }
    if (classification && classification !== 'all') {
      filter.classification = classification;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const directories = await Directory.find(filter)
      .select('-requiredFields -submissionGuidelines')
      .sort({ 
        isCustom: -1, // Custom directories first
        priority: -1, // Then by priority
        pageRank: -1, // Then by page rank
        daScore: -1   // Then by DA score
      });
    
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

// Get available countries and classifications (public)
router.get('/filters', protect, async (req, res) => {
  try {
    const countries = await Directory.distinct('country');
    const classifications = await Directory.distinct('classification');
    const categories = await Directory.distinct('category');
    
    res.json({
      countries: countries.sort(),
      classifications: classifications.sort(),
      categories: categories.sort()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// Get directory by ID (public - for users to see directory details)
router.get('/:id', protect, async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id);
    
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }
    
    res.json(directory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directory' });
  }
});

// Create new directory (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      domain,
      description,
      category,
      country,
      classification,
      pageRank,
      daScore,
      spamScore,
      isPremium,
      requiresApproval,
      submissionUrl,
      contactEmail,
      submissionGuidelines,
      requiredFields,
      freeUserLimit,
      starterUserLimit,
      proUserLimit,
      businessUserLimit,
      enterpriseUserLimit,
      priority
    } = req.body;

    // Check if directory with same name already exists
    const existingDirectory = await Directory.findOne({ name });
    if (existingDirectory) {
      return res.status(400).json({ error: 'Directory with this name already exists' });
    }

    const directory = new Directory({
      name,
      domain,
      description,
      category,
      country: country || 'Global',
      classification: classification || 'General',
      pageRank: pageRank || 0,
      daScore: daScore || 0,
      spamScore: spamScore || 0,
      isPremium: isPremium || false,
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
      submissionUrl,
      contactEmail,
      submissionGuidelines,
      requiredFields: requiredFields || [],
      freeUserLimit: freeUserLimit || 0,
      starterUserLimit: starterUserLimit || 5,
      proUserLimit: proUserLimit || 20,
      businessUserLimit: businessUserLimit || 50,
      enterpriseUserLimit: enterpriseUserLimit || -1,
      priority: priority || 0,
      isCustom: true, // Mark as custom directory
      createdBy: req.userId
    });

    await directory.save();
    
    res.status(201).json(directory);
  } catch (error) {
    console.error('Directory creation error:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// Update directory (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id);
    
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Update fields
    const updateFields = req.body;
    delete updateFields.createdBy; // Don't allow changing creator
    
    const updatedDirectory = await Directory.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(updatedDirectory);
  } catch (error) {
    console.error('Directory update error:', error);
    res.status(500).json({ error: 'Failed to update directory' });
  }
});

// Delete directory (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const directory = await Directory.findByIdAndDelete(req.params.id);
    
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete directory' });
  }
});

// Get directories by category
router.get('/category/:category', protect, async (req, res) => {
  try {
    const directories = await Directory.find({ 
      category: req.params.category,
      status: 'active' 
    }).sort({ pageRank: -1, daScore: -1 });
    
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directories by category' });
  }
});

// Get premium directories only
router.get('/premium/list', protect, async (req, res) => {
  try {
    const directories = await Directory.find({ 
      isPremium: true,
      status: 'active' 
    }).sort({ pageRank: -1, daScore: -1 });
    
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch premium directories' });
  }
});

// Check if user can submit to directory
router.get('/:id/can-submit', protect, async (req, res) => {
  try {
    const directory = await Directory.findById(req.params.id);
    const user = await User.findById(req.userId);
    
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const canSubmit = directory.canUserSubmit(user.subscription);
    
    res.json({
      canSubmit,
      userSubscription: user.subscription,
      directoryLimit: directory[`${user.subscription}UserLimit`] || 0,
      currentSubmissions: directory.totalSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check submission eligibility' });
  }
});

// Get directory statistics (admin only)
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalDirectories = await Directory.countDocuments();
    const activeDirectories = await Directory.countDocuments({ status: 'active' });
    const premiumDirectories = await Directory.countDocuments({ isPremium: true });
    
    const totalSubmissions = await Directory.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSubmissions' } } }
    ]);
    
    const avgSuccessRate = await Directory.aggregate([
      { $group: { _id: null, avgRate: { $avg: '$successRate' } } }
    ]);

    res.json({
      totalDirectories,
      activeDirectories,
      premiumDirectories,
      totalSubmissions: totalSubmissions[0]?.total || 0,
      avgSuccessRate: Math.round(avgSuccessRate[0]?.avgRate || 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch directory statistics' });
  }
});

module.exports = router; 