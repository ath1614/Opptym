const express = require('express');
const { getSystemSettings, updateSystemSettings, resetSystemSettings } = require('../controllers/systemSettingsController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication and admin access
router.use(protect);
router.use(requireAdmin);

// GET /api/admin/settings - Get system settings
router.get('/', getSystemSettings);

// PUT /api/admin/settings - Update system settings
router.put('/', updateSystemSettings);

// POST /api/admin/settings/reset - Reset system settings to defaults
router.post('/reset', resetSystemSettings);

module.exports = router;
