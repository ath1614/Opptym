const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');

// Get dashboard analytics for a user
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user's current usage and limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get projects count
    const totalProjects = await Project.countDocuments({ userId });
    const recentProjects = await Project.countDocuments({ 
      userId, 
      createdAt: { $gte: startDate } 
    });

    // Get submissions analytics
    const submissions = await Submission.find({ userId });
    const totalSubmissions = submissions.length;
    const recentSubmissions = await Submission.countDocuments({ 
      userId, 
      createdAt: { $gte: startDate } 
    });

    // Calculate submission success rate
    const successfulSubmissions = submissions.filter(s => 
      s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
    ).length;
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;

    // Calculate average ranking (if available)
    const submissionsWithRanking = submissions.filter(s => s.ranking && s.ranking > 0);
    const averageRanking = submissionsWithRanking.length > 0 
      ? Math.round(submissionsWithRanking.reduce((acc, s) => acc + s.ranking, 0) / submissionsWithRanking.length)
      : 0;

    // Calculate backlinks gained (successful submissions)
    const backlinksGained = successfulSubmissions;

    // Get directories submitted to
    const directoriesSubmitted = await Submission.distinct('directoryId', { userId });

    // Calculate deltas (compare with previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const previousProjects = await Project.countDocuments({ 
      userId, 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });
    
    const previousSubmissions = await Submission.countDocuments({ 
      userId, 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });

    const previousSuccessfulSubmissions = await Submission.countDocuments({ 
      userId, 
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: { $in: ['success', 'completed', 'approved', 'published'] }
    });

    // Calculate percentage changes
    const calculateDelta = (current, previous) => {
      if (previous === 0) {
        return { delta: 0, direction: 'stable' };
      }
      const deltaPercent = ((current - previous) / previous) * 100;
      if (Math.abs(deltaPercent) < 1) {
        return { delta: 0, direction: 'stable' };
      }
      return {
        delta: Math.abs(deltaPercent),
        direction: deltaPercent > 0 ? 'increase' : 'decrease'
      };
    };

    const projectsDelta = calculateDelta(recentProjects, previousProjects);
    const submissionsDelta = calculateDelta(recentSubmissions, previousSubmissions);
    const previousSuccessRate = previousSubmissions > 0 ? Math.round((previousSuccessfulSubmissions / previousSubmissions) * 100) : 0;
    const successRateDelta = calculateDelta(successRate, previousSuccessRate);

    // Get recent activity
    let recentActivity = [];
    try {
      recentActivity = await Submission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('projectId', 'name')
        .populate('directoryId', 'name')
        .select('status directoryName projectName createdAt')
        .lean();
    } catch (populateError) {
      console.error('❌ Error populating recent activity:', populateError);
      // Fallback to basic query without populate
      recentActivity = await Submission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('status directoryName projectName createdAt')
        .lean();
    }

    // Get usage statistics
    const usageStats = {
      submissionsUsed: user.usage?.submissionsUsed || 0,
      projectsUsed: user.usage?.projectsUsed || 0,
      seoToolsUsed: user.usage?.seoToolsUsed || 0,
      apiCallsUsed: user.usage?.apiCallsUsed || 0,
      trialUsage: user.trialUsage
    };

    // Get subscription details
    const subscriptionDetails = user.getSubscriptionDetails();

    res.json({
      success: true,
      analytics: {
        // Current stats
        totalProjects,
        totalSubmissions,
        successRate,
        averageRanking,
        backlinksGained,
        directoriesSubmitted: directoriesSubmitted.length,
        
        // Recent period stats
        recentProjects,
        recentSubmissions,
        
        // Deltas
        deltas: {
          totalProjects: { ...projectsDelta, value: recentProjects },
          totalSubmissions: { ...submissionsDelta, value: recentSubmissions },
          successRate: { ...successRateDelta, value: successRate },
          averageRanking: { delta: 0, direction: 'stable', value: averageRanking },
          backlinksGained: { delta: 0, direction: 'stable', value: backlinksGained },
          directoriesSubmitted: { delta: 0, direction: 'stable', value: directoriesSubmitted.length }
        },
        
        // Additional data
        recentActivity,
        usageStats,
        subscriptionDetails,
        period,
        dateRange: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    console.error('❌ Dashboard analytics error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics', details: error.message });
  }
};

// Get submission analytics
const getSubmissionAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get submissions in date range
    const submissions = await Submission.find({
      userId,
      createdAt: { $gte: startDate, $lte: now }
    }).sort({ createdAt: 1 });

    // Group by time period
    const groupedData = {};
    const statusCounts = { success: 0, pending: 0, failed: 0 };
    
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      let key;
      
      switch (groupBy) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate()) / 7)}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { success: 0, pending: 0, failed: 0, total: 0 };
      }
      
      if (submission.status === 'success' || submission.status === 'completed' || submission.status === 'approved' || submission.status === 'published') {
        groupedData[key].success++;
        statusCounts.success++;
      } else if (submission.status === 'pending' || submission.status === 'processing' || submission.status === 'submitted' || submission.status === 'draft') {
        groupedData[key].pending++;
        statusCounts.pending++;
      } else {
        groupedData[key].failed++;
        statusCounts.failed++;
      }
      
      groupedData[key].total++;
    });

    // Convert to array format for charts
    const chartData = Object.entries(groupedData).map(([date, counts]) => ({
      date,
      success: counts.success,
      pending: counts.pending,
      failed: counts.failed,
      total: counts.total
    }));

    res.json({
      success: true,
      analytics: {
        chartData,
        statusCounts,
        totalSubmissions: submissions.length,
        period,
        groupBy,
        dateRange: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    console.error('❌ Submission analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch submission analytics' });
  }
};

// Get project analytics
const getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all projects
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    // Get submissions per project
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const submissions = await Submission.find({ userId, projectId: project._id });
        const successfulSubmissions = submissions.filter(s => 
          s.status === 'success' || s.status === 'completed' || s.status === 'approved' || s.status === 'published'
        ).length;
        
        return {
          projectId: project._id,
          projectName: project.name,
          totalSubmissions: submissions.length,
          successfulSubmissions,
          successRate: submissions.length > 0 ? Math.round((successfulSubmissions / submissions.length) * 100) : 0,
          createdAt: project.createdAt,
          lastSubmission: submissions.length > 0 ? submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null
        };
      })
    );

    // Calculate overall project statistics
    const totalSubmissions = projectStats.reduce((acc, p) => acc + p.totalSubmissions, 0);
    const totalSuccessfulSubmissions = projectStats.reduce((acc, p) => acc + p.successfulSubmissions, 0);
    const overallSuccessRate = totalSubmissions > 0 ? Math.round((totalSuccessfulSubmissions / totalSubmissions) * 100) : 0;

    res.json({
      success: true,
      analytics: {
        projects: projectStats,
        summary: {
          totalProjects: projects.length,
          totalSubmissions,
          totalSuccessfulSubmissions,
          overallSuccessRate
        }
      }
    });
  } catch (error) {
    console.error('❌ Project analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch project analytics' });
  }
};

// Get directory analytics
const getDirectoryAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Get submissions grouped by directory
    const directoryStats = await Submission.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$directoryId',
          directoryName: { $first: '$directoryName' },
          totalSubmissions: { $sum: 1 },
          successfulSubmissions: {
            $sum: {
              $cond: [
                { $in: ['$status', ['success', 'completed', 'approved', 'published']] },
                1,
                0
              ]
            }
          },
          pendingSubmissions: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'processing', 'submitted', 'draft']] },
                1,
                0
              ]
            }
          },
          failedSubmissions: {
            $sum: {
              $cond: [
                { $in: ['$status', ['failed', 'error', 'rejected']] },
                1,
                0
              ]
            }
          },
          lastSubmission: { $max: '$createdAt' }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$totalSubmissions', 0] },
              { $round: [{ $multiply: [{ $divide: ['$successfulSubmissions', '$totalSubmissions'] }, 100] }] },
              0
            ]
          }
        }
      },
      { $sort: { totalSubmissions: -1 } }
    ]);

    // Get directory details
    const directoryIds = directoryStats.map(stat => stat._id).filter(id => id);
    const directories = await Directory.find({ _id: { $in: directoryIds } });

    // Combine stats with directory details
    const enrichedStats = directoryStats.map(stat => {
      const directory = directories.find(d => d._id.toString() === stat._id.toString());
      return {
        ...stat,
        directory: directory ? {
          name: directory.name,
          domain: directory.domain,
          daScore: directory.daScore,
          pageRank: directory.pageRank,
          country: directory.country,
          category: directory.category
        } : null
      };
    });

    res.json({
      success: true,
      analytics: {
        directories: enrichedStats,
        summary: {
          totalDirectories: enrichedStats.length,
          totalSubmissions: enrichedStats.reduce((acc, d) => acc + d.totalSubmissions, 0),
          totalSuccessfulSubmissions: enrichedStats.reduce((acc, d) => acc + d.successfulSubmissions, 0),
          averageSuccessRate: enrichedStats.length > 0 
            ? Math.round(enrichedStats.reduce((acc, d) => acc + d.successRate, 0) / enrichedStats.length)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Directory analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch directory analytics' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getSubmissionAnalytics,
  getProjectAnalytics,
  getDirectoryAnalytics
};
