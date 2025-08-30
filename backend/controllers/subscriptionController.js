const User = require('../models/userModel');

// Get subscription details
const getSubscriptionDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update trial dates if needed
    if (user.subscription === 'free' && !user.trialEndDate) {
      user.trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    const subscriptionDetails = user.getSubscriptionDetails();
    
    console.log('📊 Subscription details for user:', user.email, subscriptionDetails);
    
    res.json(subscriptionDetails);
  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
};

// Check feature access
const checkFeatureAccess = async (req, res) => {
  try {
    const { feature } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasAccess = user.hasFeatureAccess(feature);
    
    res.json({
      hasAccess,
      feature,
      subscription: user.subscription,
      isInTrial: user.isInTrialPeriod(),
      trialDaysLeft: user.getTrialDaysLeft()
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
};

// Check usage limit
const checkUsageLimit = async (req, res) => {
  try {
    const { feature } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const withinLimit = user.checkUsageLimit(feature);
    const currentUsage = user.usage;
    const limits = user.planLimits;
    
    res.json({
      withinLimit,
      feature,
      currentUsage: currentUsage[feature] || 0,
      limit: limits[feature] || 0,
      remaining: limits[feature] === -1 ? -1 : Math.max(0, (limits[feature] || 0) - (currentUsage[feature] || 0)),
      subscription: user.subscription,
      isInTrial: user.isInTrialPeriod()
    });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    res.status(500).json({ error: 'Failed to check usage limit' });
  }
};

// Track usage
const trackUsage = async (req, res) => {
  try {
    const { feature } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can use this feature
    if (!user.hasFeatureAccess(feature)) {
      return res.status(403).json({ 
        error: 'Feature access denied',
        reason: user.subscription === 'free' && !user.isInTrialPeriod() ? 'trial_expired' : 'insufficient_permissions'
      });
    }

    // Check usage limits
    if (!user.checkUsageLimit(feature)) {
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        feature,
        currentUsage: user.usage[feature] || 0,
        limit: user.planLimits[feature] || 0
      });
    }

    // Increment usage
    await user.incrementUsage(feature);
    
    res.json({
      success: true,
      feature,
      newUsage: user.usage[feature] || 0,
      limit: user.planLimits[feature] || 0
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
};

// Get team management (for admin users)
const getTeamManagement = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all users for admin management
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      users,
      totalUsers: users.length,
      subscriptionBreakdown: {
        free: users.filter(u => u.subscription === 'free').length,
        starter: users.filter(u => u.subscription === 'starter').length,
        pro: users.filter(u => u.subscription === 'pro').length,
        business: users.filter(u => u.subscription === 'business').length,
        enterprise: users.filter(u => u.subscription === 'enterprise').length
      }
    });
  } catch (error) {
    console.error('Error getting team management:', error);
    res.status(500).json({ error: 'Failed to get team management' });
  }
};

// Update user subscription (admin only)
const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscription, subscriptionStatus, trialEndDate } = req.body;
    
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update subscription
    if (subscription) {
      user.subscription = subscription;
      user.updatePlanLimits();
    }
    
    if (subscriptionStatus) {
      user.subscriptionStatus = subscriptionStatus;
    }
    
    if (trialEndDate) {
      user.trialEndDate = new Date(trialEndDate);
    }

    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
        planLimits: user.planLimits
      }
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({ error: 'Failed to update user subscription' });
  }
};

// Get subscription analytics (admin only)
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
    const trialUsers = await User.countDocuments({ 
      subscription: 'free',
      trialEndDate: { $gt: new Date() }
    });
    const expiredTrials = await User.countDocuments({
      subscription: 'free',
      trialEndDate: { $lte: new Date() }
    });

    const subscriptionBreakdown = await User.aggregate([
      {
        $group: {
          _id: '$subscription',
          count: { $sum: 1 }
        }
      }
    ]);

    const usageAnalytics = await User.aggregate([
      {
        $group: {
          _id: null,
          avgSubmissions: { $avg: '$usage.submissionsUsed' },
          avgProjects: { $avg: '$usage.projectsUsed' },
          avgSeoTools: { $avg: '$usage.seoToolsUsed' },
          totalSubmissions: { $sum: '$usage.submissionsUsed' },
          totalProjects: { $sum: '$usage.projectsUsed' },
          totalSeoTools: { $sum: '$usage.seoToolsUsed' }
        }
      }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      trialUsers,
      expiredTrials,
      subscriptionBreakdown,
      usageAnalytics: usageAnalytics[0] || {}
    });
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    res.status(500).json({ error: 'Failed to get subscription analytics' });
  }
};

module.exports = {
  getSubscriptionDetails,
  checkFeatureAccess,
  checkUsageLimit,
  trackUsage,
  getTeamManagement,
  updateUserSubscription,
  getSubscriptionAnalytics
}; 