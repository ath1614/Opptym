const User = require('../models/userModel');

// Middleware to check trial status and enforce restrictions
exports.checkTrialStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For free users, check trial status
    if (user.subscription === 'free') {
      const isInTrial = user.isInTrialPeriod();
      
      if (!isInTrial) {
        return res.status(403).json({
          error: 'Trial expired',
          message: 'Your free trial has expired. Please upgrade to continue using Opptym features.',
          trialExpired: true,
          upgradeRequired: true
        });
      }
      
      // Add trial info to request for use in controllers
      req.trialInfo = {
        isInTrial: true,
        trialEndDate: user.trialEndDate,
        trialDaysLeft: Math.ceil((user.trialEndDate - new Date()) / (1000 * 60 * 60 * 24))
      };
    }

    next();
  } catch (error) {
    console.error('Error in trial middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check usage limits before allowing actions
exports.checkUsageLimit = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has permission to use this feature
      if (!user.hasPermission(`canUse${feature.charAt(0).toUpperCase() + feature.slice(1)}`)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          subscription: user.subscription,
          trialExpired: user.subscription === 'free' && !user.isInTrialPeriod()
        });
      }

      // Check usage limits
      if (!user.checkUsageLimit(feature)) {
        const limits = user.subscriptionLimits;
        const currentUsage = user.currentUsage || {};
        
        return res.status(429).json({ 
          error: 'Usage limit exceeded',
          subscription: user.subscription,
          limit: limits[feature] || 0,
          current: currentUsage[`${feature}Used`] || 0,
          trialExpired: user.subscription === 'free' && !user.isInTrialPeriod(),
          upgradeRequired: user.subscription === 'free'
        });
      }

      next();
    } catch (error) {
      console.error('Error in usage limit middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
