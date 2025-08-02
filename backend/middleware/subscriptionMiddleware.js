const User = require('../models/userModel');

// Check if user can create a new project
const canCreateProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;
    const currentUsage = user.currentUsage || {};

    if (limits.projects === -1) {
      return next(); // Unlimited
    }

    if (currentUsage.projectsCreated >= limits.projects) {
      return res.status(403).json({ 
        error: 'Project limit reached',
        limit: limits.projects,
        current: currentUsage.projectsCreated,
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check project limits' });
  }
};

// Check if user can make a submission
const canMakeSubmission = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;
    const currentUsage = user.currentUsage || {};

    if (limits.submissions === -1) {
      return next(); // Unlimited
    }

    if (currentUsage.submissionsMade >= limits.submissions) {
      return res.status(403).json({ 
        error: 'Submission limit reached',
        limit: limits.submissions,
        current: currentUsage.submissionsMade,
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check submission limits' });
  }
};

// Check if user can use SEO tools
const canUseSeoTools = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;

    if (!limits.tools) {
      return res.status(403).json({ 
        error: 'SEO tools not available in your plan',
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check SEO tools access' });
  }
};

// Check if user can access premium directories
const canAccessPremiumDirectories = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only pro, business, and enterprise users can access premium directories
    const allowedPlans = ['pro', 'business', 'enterprise'];
    
    if (!allowedPlans.includes(user.subscription)) {
      return res.status(403).json({ 
        error: 'Premium directories require Pro plan or higher',
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check premium directory access' });
  }
};

// Check if user can add team members
const canAddTeamMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;
    const currentTeamSize = user.teamMembers?.length || 0;

    if (limits.teamMembers === -1) {
      return next(); // Unlimited
    }

    if (currentTeamSize >= limits.teamMembers) {
      return res.status(403).json({ 
        error: 'Team member limit reached',
        limit: limits.teamMembers,
        current: currentTeamSize,
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check team member limits' });
  }
};

// Check if user can export reports
const canExportReports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only pro, business, and enterprise users can export reports
    const allowedPlans = ['pro', 'business', 'enterprise'];
    
    if (!allowedPlans.includes(user.subscription)) {
      return res.status(403).json({ 
        error: 'Report export requires Pro plan or higher',
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check export permissions' });
  }
};

// Check if user can use advanced SEO tools
const canUseAdvancedTools = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only business and enterprise users can use advanced tools
    const allowedPlans = ['business', 'enterprise'];
    
    if (!allowedPlans.includes(user.subscription)) {
      return res.status(403).json({ 
        error: 'Advanced SEO tools require Business plan or higher',
        subscription: user.subscription,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check advanced tools access' });
  }
};

// Get user subscription info
const getSubscriptionInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;
    const currentUsage = user.currentUsage || {};

    req.subscriptionInfo = {
      subscription: user.subscription,
      status: user.subscriptionStatus,
      limits,
      currentUsage,
      canUpgrade: user.subscription !== 'enterprise',
      nextBillingDate: user.subscriptionEndDate
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription info' });
  }
};

module.exports = {
  canCreateProject,
  canMakeSubmission,
  canUseSeoTools,
  canAccessPremiumDirectories,
  canAddTeamMember,
  canExportReports,
  canUseAdvancedTools,
  getSubscriptionInfo
}; 