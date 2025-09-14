const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

// Team invitation routes
router.post('/invite', protect, teamController.createInvitation);
router.get('/invitations', protect, teamController.getInvitations);
router.post('/invitations/accept', teamController.acceptInvitation);
router.post('/invitations/decline', teamController.declineInvitation);
router.delete('/invitations/:invitationId', protect, teamController.cancelInvitation);
router.get('/invitations/token/:token', teamController.getInvitationByToken);

// Team management routes
router.post('/create', protect, teamController.createTeam);
router.get('/', protect, teamController.getTeam);

module.exports = router;
