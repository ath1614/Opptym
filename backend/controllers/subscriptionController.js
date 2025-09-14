const User = require('../models/userModel');

// Get subscription details
const getSubscriptionDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update trial dates if needed
    if (user.subscription === 'free' && !user.trialEndDate) {
      user.trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    const subscriptionDetails = user.getSubscriptionDetails();
    const trialLockoutStatus = user.getTrialLockoutStatus();
    
    console.log('📊 Subscription details for user:', user.email, subscriptionDetails);
    console.log('🔒 Trial lockout status:', trialLockoutStatus);
    
    res.json({
      ...subscriptionDetails,
      trialLockoutStatus,
      trialUsage: user.trialUsage
    });
  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
};

// Check feature access
const checkFeatureAccess = async (req, res) => {
  try {
    const { feature } = req.params;
    const user = await User.findById(req.userId);
    
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
    const user = await User.findById(req.userId);
    
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
    const user = await User.findById(req.userId);
    
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
    
    // Also track trial usage for free users
    if (user.subscription === 'free' && user.isInTrialPeriod()) {
      await user.incrementTrialUsage(feature);
    }
    
    // Get updated trial lockout status
    const trialLockoutStatus = user.getTrialLockoutStatus();
    
    res.json({
      success: true,
      feature,
      newUsage: user.usage[feature] || 0,
      trialUsage: user.trialUsage,
      limit: user.planLimits[feature] || 0,
      trialLockoutStatus
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
};

// Get team management (for admin users)
const getTeamManagement = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // For admin users, show team management overview
    // Get users with team management capabilities (business/enterprise)
    const teamUsers = await User.find({
      subscription: { $in: ['business', 'enterprise'] },
      'teamMembers.0': { $exists: true }
    }, '-password').sort({ createdAt: -1 });

    // Get all users for admin overview
    const allUsers = await User.find({}, '-password').sort({ createdAt: -1 });
    
    // Transform team users to show their team members
    const teamMembers = [];
    const teams = [];

    teamUsers.forEach(teamUser => {
      if (teamUser.teamMembers && teamUser.teamMembers.length > 0) {
        // Add the team owner
        teams.push({
          _id: teamUser._id,
          name: `${teamUser.firstName || teamUser.username}'s Team`,
          subscriptionPlan: teamUser.subscription,
          memberCount: teamUser.teamMembers.length + 1, // +1 for owner
          owner: {
            id: teamUser._id,
            username: teamUser.username || teamUser.firstName,
            email: teamUser.email,
            role: 'owner'
          }
        });

        // Add team members
        teamUser.teamMembers.forEach(member => {
          teamMembers.push({
            id: member._id || member.userId,
            username: member.username || member.firstName,
            email: member.email,
            role: member.role || 'employee',
            status: member.status || 'active',
            lastLogin: member.lastLoginAt,
            permissions: member.permissions || {},
            teamOwner: teamUser.username || teamUser.firstName
          });
        });
      }
    });

    // If no teams found, show admin overview
    if (teams.length === 0) {
      const adminOverview = {
        _id: 'admin-overview',
        name: 'Admin Overview',
        subscriptionPlan: 'admin',
        memberCount: allUsers.length,
        description: 'No team management found. This shows all users in the system.'
      };
      
      const adminMembers = allUsers.map(user => ({
        id: user._id,
        username: user.username || user.firstName || user.email,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active',
        lastLogin: user.lastLoginAt,
        permissions: user.customPermissions || {},
        teamOwner: 'System Admin'
      }));

      res.json({
        team: adminOverview,
        members: adminMembers,
        totalUsers: allUsers.length,
        subscriptionBreakdown: {
          free: allUsers.filter(u => u.subscription === 'free').length,
          starter: allUsers.filter(u => u.subscription === 'starter').length,
          pro: allUsers.filter(u => u.subscription === 'pro').length,
          business: allUsers.filter(u => u.subscription === 'business').length,
          enterprise: allUsers.filter(u => u.subscription === 'enterprise').length
        }
      });
    } else {
      res.json({
        team: teams[0], // Show first team for now
        members: teamMembers,
        totalUsers: allUsers.length,
        teams: teams,
        subscriptionBreakdown: {
          free: allUsers.filter(u => u.subscription === 'free').length,
          starter: allUsers.filter(u => u.subscription === 'starter').length,
          pro: allUsers.filter(u => u.subscription === 'pro').length,
          business: allUsers.filter(u => u.subscription === 'business').length,
          enterprise: allUsers.filter(u => u.subscription === 'enterprise').length
        }
      });
    }
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
    
    const adminUser = await User.findById(req.userId);
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
    const user = await User.findById(req.userId);
    
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

// Verify bookmarklet usage (placeholder - implement as needed)
const verifyBookmarkletUsage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can use bookmarklet
    const canUse = user.hasFeatureAccess('submissions') && user.checkUsageLimit('submissions');
    
    res.json({
      canUse,
      remainingSubmissions: user.planLimits.submissions - user.usage.submissionsUsed,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error verifying bookmarklet usage:', error);
    res.status(500).json({ error: 'Failed to verify bookmarklet usage' });
  }
};

// Team management functions
const inviteTeamMember = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    const invitedBy = req.userId;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Import team controller
    const teamController = require('./teamController');
    
    // Create invitation using team controller
    const invitation = await teamController.createInvitation(req, res);
    
  } catch (error) {
    console.error('❌ Invite team member error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
};

const updateTeamMemberPermissions = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, permissions } = req.body;
    const userId = req.userId;

    // Find user's team
    const Team = require('../models/teamModel');
    const team = await Team.findOne({ owner: userId });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Update member permissions
    await team.updateMemberRole(memberId, role, permissions);

    res.json({
      success: true,
      message: 'Team member permissions updated successfully'
    });
  } catch (error) {
    console.error('❌ Update team member error:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.userId;

    // Find user's team
    const Team = require('../models/teamModel');
    const team = await Team.findOne({ owner: userId });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove member
    await team.removeMember(memberId);

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

module.exports = {
  getSubscriptionDetails,
  checkFeatureAccess,
  checkUsageLimit,
  trackUsage,
  verifyBookmarkletUsage,
  getTeamManagement,
  updateUserSubscription,
  getSubscriptionAnalytics,
  inviteTeamMember,
  updateTeamMemberPermissions,
  removeTeamMember
}; 