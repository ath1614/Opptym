const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');

// Simplified dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    console.log('🔍 Analytics controller called for user:', req.userId);
    
    const userId = req.userId;
    const { period = '30d' } = req.query;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Get basic counts
    const totalProjects = await Project.countDocuments({ userId });
    const totalSubmissions = await Submission.countDocuments({ userId });
    
    console.log('✅ Basic counts - Projects:', totalProjects, 'Submissions:', totalSubmissions);

    // Get submissions for success rate calculation
    const submissions = await Submission.find({ userId });
    const successfulSubmissions = submissions.filter(s => 
      s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
    ).length;
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;

    console.log('✅ Success rate calculated:', successRate + '%');

    // Get usage stats
    const usageStats = {
      submissionsUsed: user.usage?.submissionsUsed || 0,
      projectsUsed: user.usage?.projectsUsed || 0,
      seoToolsUsed: user.usage?.seoToolsUsed || 0,
      apiCallsUsed: user.usage?.apiCallsUsed || 0
    };

    console.log('✅ Usage stats:', usageStats);

    // Get subscription details
    const subscriptionDetails = user.getSubscriptionDetails();
    console.log('✅ Subscription details:', subscriptionDetails.subscription);

    // Return simplified response
    const response = {
      success: true,
      analytics: {
        totalProjects,
        totalSubmissions,
        successRate,
        averageRanking: 0,
        backlinksGained: successfulSubmissions,
        directoriesSubmitted: totalSubmissions,
        recentProjects: 0,
        recentSubmissions: 0,
        deltas: {
          totalProjects: { delta: 0, direction: 'stable', value: 0 },
          totalSubmissions: { delta: 0, direction: 'stable', value: 0 },
          successRate: { delta: 0, direction: 'stable', value: successRate },
          averageRanking: { delta: 0, direction: 'stable', value: 0 },
          backlinksGained: { delta: 0, direction: 'stable', value: successfulSubmissions },
          directoriesSubmitted: { delta: 0, direction: 'stable', value: totalSubmissions }
        },
        recentActivity: [],
        usageStats,
        subscriptionDetails,
        period,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }
    };

    console.log('✅ Response prepared, sending...');
    res.json(response);

  } catch (error) {
    console.error('❌ Simplified analytics error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics', details: error.message });
  }
};

module.exports = {
  getDashboardAnalytics
};
