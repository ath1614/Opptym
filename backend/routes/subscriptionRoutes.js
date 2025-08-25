const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Subscription management routes
router.get('/status', protect, subscriptionController.getSubscriptionDetails);
router.get('/details', protect, subscriptionController.getSubscriptionDetails);
router.get('/feature/:feature', protect, subscriptionController.checkFeatureAccess);
router.post('/track-usage', protect, subscriptionController.trackUsage);
router.post('/verify-usage', protect, subscriptionController.verifyBookmarkletUsage);

// Team management routes
router.get('/team', protect, subscriptionController.getTeamManagement);
router.post('/team/invite', protect, subscriptionController.inviteTeamMember);
router.put('/team/member/:memberId', protect, subscriptionController.updateTeamMemberPermissions);
router.delete('/team/member/:memberId', protect, subscriptionController.removeTeamMember);

module.exports = router; 