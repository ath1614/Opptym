const express = require('express');
const router = express.Router();
const ultraSmartController = require('../controllers/ultraSmartController');
const { protect } = require('../middleware/authMiddleware');

// Ultra-smart analysis routes
router.get('/:projectId', protect, ultraSmartController.runUltraSmartAnalysis);

// Ultra-smart automation execution route
router.post('/open-and-ultra-fill', protect, ultraSmartController.openAndUltraFill);

module.exports = router; 