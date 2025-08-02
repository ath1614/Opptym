const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ✅ fixed import
const Project = require('../models/projectModel');

// 🔍 GET SEO score trends by date
router.get('/trends', protect, async (req, res) => {
  try {
    const trends = await Project.aggregate([
      {
        $match: { user: req.user.userId }
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