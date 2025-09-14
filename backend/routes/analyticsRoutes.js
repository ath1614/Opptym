const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

// Dashboard analytics
router.get('/dashboard', protect, analyticsController.getDashboardAnalytics);

// Submission analytics
router.get('/submissions', protect, analyticsController.getSubmissionAnalytics);

// Project analytics
router.get('/projects', protect, analyticsController.getProjectAnalytics);

// Directory analytics
router.get('/directories', protect, analyticsController.getDirectoryAnalytics);

module.exports = router;