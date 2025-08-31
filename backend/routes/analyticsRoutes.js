const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

// 🔍 GET Analytics overview
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's projects count
    const totalProjects = await Project.countDocuments({ userId });
    
    // Get user's submissions count
    const totalSubmissions = await Submission.countDocuments({ userId });
    const successfulSubmissions = await Submission.countDocuments({ 
      userId, 
      status: { $in: ['success', 'completed'] } 
    });
    
    // Calculate success rate
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await Submission.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get average SEO score
    const projectsWithScore = await Project.find({ userId, seoScore: { $exists: true } });
    const averageSeoScore = projectsWithScore.length > 0 
      ? Math.round(projectsWithScore.reduce((sum, p) => sum + (p.seoScore || 0), 0) / projectsWithScore.length)
      : 0;

    res.json({
      totalProjects,
      totalSubmissions,
      successfulSubmissions,
      successRate,
      recentSubmissions,
      averageSeoScore,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// 🔍 GET SEO score trends by date
router.get('/trends', protect, async (req, res) => {
  try {
    const trends = await Project.aggregate([
      {
        $match: { userId: req.userId }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          averageScore: { $avg: '$seoScore' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          score: { $round: ['$averageScore', 0] },
          _id: 0
        }
      }
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute trends' });
  }
});

module.exports = router;