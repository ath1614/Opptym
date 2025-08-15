const express = require('express');
const router = express.Router();
const ultraSmartController = require('../controllers/ultraSmartController');
const { protect } = require('../middleware/authMiddleware');

// Ultra-smart automation execution route
router.post('/automate', protect, ultraSmartController.openAndUltraFill);

module.exports = router; 