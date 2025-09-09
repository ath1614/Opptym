const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

// Debug endpoint to get user limits and usage
router.get('/user-limits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure usage and planLimits are initialized
    if (!user.usage) {
      user.usage = {
        submissionsUsed: 0,
        projectsUsed: 0,
        seoToolsUsed: 0,
        apiCallsUsed: 0
      };
    }

    if (!user.planLimits) {
      user.setPlanLimitsSync();
    }

    const userLimits = {
      subscription: user.subscription,
      planLimits: user.planLimits,
      usage: user.usage,
      features: user.features,
      isInTrialPeriod: user.isInTrialPeriod(),
      trialDaysLeft: user.getTrialDaysLeft(),
      trialEndDate: user.trialEndDate,
      role: user.role
    };

    console.log(`🔍 DEBUG: User limits for ${user.email}:`, userLimits);

    res.json(userLimits);
  } catch (error) {
    console.error('Error fetching user limits:', error);
    res.status(500).json({ error: 'Failed to fetch user limits' });
  }
});

// Debug endpoint to reset user usage (for testing only)
router.post('/reset-usage', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow admins or free users to reset usage (for testing)
    if (user.role !== 'admin' && user.subscription !== 'free') {
      return res.status(403).json({ error: 'Only admins and free users can reset usage for testing' });
    }

    user.usage = {
      submissionsUsed: 0,
      projectsUsed: 0,
      seoToolsUsed: 0,
      apiCallsUsed: 0
    };

    await user.save();

    console.log(`🔍 DEBUG: Reset usage for user ${user.email}`);

    res.json({
      message: 'Usage reset successfully',
      usage: user.usage
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
});

// Debug endpoint to set user subscription (for testing only)
router.post('/set-subscription', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow admins to change subscription
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change subscription' });
    }

    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription is required' });
    }

    user.subscription = subscription;
    user.setPlanLimitsSync();
    await user.save();

    console.log(`🔍 DEBUG: Set subscription for user ${user.email} to ${subscription}`);

    res.json({
      message: 'Subscription updated successfully',
      subscription: user.subscription,
      planLimits: user.planLimits,
      features: user.features
    });
  } catch (error) {
    console.error('Error setting subscription:', error);
    res.status(500).json({ error: 'Failed to set subscription' });
  }
});

module.exports = router;
