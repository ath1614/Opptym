const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// User notification routes
router.get('/', protect, notificationController.getUserNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.patch('/:notificationId/read', protect, notificationController.markAsRead);
router.patch('/mark-all-read', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);
router.delete('/read/all', protect, notificationController.deleteAllRead);

// Admin notification routes
router.post('/', protect, adminOnly, notificationController.createNotification);
router.post('/bulk', protect, adminOnly, notificationController.createBulkNotification);
router.get('/stats', protect, adminOnly, notificationController.getNotificationStats);

module.exports = router;
