const express = require('express');
const router = express.Router();
const smartTabController = require('../controllers/smartTabController');
const { protect } = require('../middleware/authMiddleware');

// Smart tab analysis routes
router.get('/:projectId', protect, smartTabController.runSmartTabAnalysis);

module.exports = router; 