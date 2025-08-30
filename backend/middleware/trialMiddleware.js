const User = require('../models/userModel');

// Check trial status and block expired trials
const checkTrialStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if free user's trial has expired
    if (user.subscription === 'free' && !user.isInTrialPeriod()) {
      return res.status(403).json({
        error: 'Trial expired',
        message: 'Your free trial has expired. Please upgrade to continue using Opptym features.',
        trialExpired: true,
        subscription: user.subscription,
        trialEndDate: user.trialEndDate
      });
    }

    // Attach trial info to request for use in other middleware
    req.trialInfo = {
      isInTrial: user.isInTrialPeriod(),
      trialDaysLeft: user.getTrialDaysLeft(),
      trialEndDate: user.trialEndDate,
      subscription: user.subscription
    };

    next();
  } catch (error) {
    console.error('Error in checkTrialStatus:', error);
    res.status(500).json({ error: 'Failed to check trial status' });
  }
};

// Check usage limits for specific features
const checkUsageLimit = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user can access this feature
      if (!user.hasFeatureAccess(feature)) {
        return res.status(403).json({
          error: 'Feature access denied',
          message: user.subscription === 'free' && !user.isInTrialPeriod() 
            ? 'Your free trial has expired. Please upgrade to continue using this feature.'
            : 'You do not have access to this feature with your current subscription.',
          trialExpired: user.subscription === 'free' && !user.isInTrialPeriod(),
          subscription: user.subscription,
          feature
        });
      }

      // Check usage limits
      if (!user.checkUsageLimit(feature)) {
        const currentUsage = user.usage[feature] || 0;
        const limit = user.planLimits[feature] || 0;
        
        return res.status(429).json({
          error: 'Usage limit exceeded',
          message: `You have reached your ${feature} limit (${currentUsage}/${limit}). Please upgrade your plan for more usage.`,
          feature,
          currentUsage,
          limit,
          remaining: 0,
          subscription: user.subscription,
          requiresUpgrade: true
        });
      }

      // Attach usage info to request
      req.usageInfo = {
        feature,
        currentUsage: user.usage[feature] || 0,
        limit: user.planLimits[feature] || 0,
        remaining: user.planLimits[feature] === -1 ? -1 : Math.max(0, (user.planLimits[feature] || 0) - (user.usage[feature] || 0))
      };

      next();
    } catch (error) {
      console.error(`Error in checkUsageLimit for ${feature}:`, error);
      res.status(500).json({ error: 'Failed to check usage limit' });
    }
  };
};

// Track usage after successful operation
const trackUsage = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Increment usage
      await user.incrementUsage(feature);
      
      console.log(`📊 Usage tracked for user ${user.email}: ${feature} = ${user.usage[feature] || 0}`);

      next();
    } catch (error) {
      console.error(`Error tracking usage for ${feature}:`, error);
      // Don't fail the request if usage tracking fails
      next();
    }
  };
};

// Check subscription plan access
const requireSubscription = (requiredPlans = []) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Admin has access to everything
      if (user.role === 'admin') {
        return next();
      }

      // Check if user's subscription is in the required plans
      if (requiredPlans.length > 0 && !requiredPlans.includes(user.subscription)) {
        return res.status(403).json({
          error: 'Subscription required',
          message: `This feature requires one of the following plans: ${requiredPlans.join(', ')}. Your current plan: ${user.subscription}`,
          requiredPlans,
          currentPlan: user.subscription,
          upgradeRequired: true
        });
      }

      // Check if trial is expired for free users
      if (user.subscription === 'free' && !user.isInTrialPeriod()) {
        return res.status(403).json({
          error: 'Trial expired',
          message: 'Your free trial has expired. Please upgrade to continue using this feature.',
          trialExpired: true,
          subscription: user.subscription
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireSubscription:', error);
      res.status(500).json({ error: 'Failed to check subscription' });
    }
  };
};

// Check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'This feature requires administrator privileges.',
        currentRole: user.role
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireAdmin:', error);
    res.status(500).json({ error: 'Failed to check admin access' });
  }
};

// Rate limiting based on subscription
const subscriptionRateLimit = (defaultLimit = 100, defaultWindow = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Define rate limits based on subscription
      const rateLimits = {
        free: { limit: 10, window: 60 * 1000 }, // 10 requests per minute
        starter: { limit: 50, window: 60 * 1000 }, // 50 requests per minute
        pro: { limit: 200, window: 60 * 1000 }, // 200 requests per minute
        business: { limit: 500, window: 60 * 1000 }, // 500 requests per minute
        enterprise: { limit: 1000, window: 60 * 1000 } // 1000 requests per minute
      };

      const userLimit = rateLimits[user.subscription] || rateLimits.free;
      
      // Simple in-memory rate limiting (in production, use Redis)
      const key = `rate_limit:${user._id}:${req.path}`;
      const now = Date.now();
      
      if (!req.app.locals.rateLimitStore) {
        req.app.locals.rateLimitStore = new Map();
      }
      
      const store = req.app.locals.rateLimitStore;
      const userRequests = store.get(key) || [];
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => now - time < userLimit.window);
      
      if (validRequests.length >= userLimit.limit) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${userLimit.limit} requests per ${userLimit.window / 1000} seconds.`,
          limit: userLimit.limit,
          window: userLimit.window,
          subscription: user.subscription
        });
      }
      
      // Add current request
      validRequests.push(now);
      store.set(key, validRequests);
      
      // Clean up old entries (keep only last 1000 entries)
      if (store.size > 1000) {
        const firstKey = store.keys().next().value;
        store.delete(firstKey);
      }

      next();
    } catch (error) {
      console.error('Error in subscriptionRateLimit:', error);
      // Don't fail the request if rate limiting fails
      next();
    }
  };
};

module.exports = {
  checkTrialStatus,
  checkUsageLimit,
  trackUsage,
  requireSubscription,
  requireAdmin,
  subscriptionRateLimit
};
