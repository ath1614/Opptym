const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      limit = 50,
      skip = 0,
      unreadOnly = false,
      type = null,
      priority = null
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type,
      priority
    };

    const notifications = await Notification.getUserNotifications(userId, options);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        limit: options.limit,
        skip: options.skip,
        hasMore: notifications.length === options.limit
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.markAsRead(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await Notification.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.deleteNotification(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Delete all read notifications
const deleteAllRead = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await Notification.deleteAllRead(userId);
    
    res.json({
      success: true,
      message: 'All read notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all read notifications:', error);
    res.status(500).json({ error: 'Failed to delete all read notifications' });
  }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority, action, expiresAt, autoDelete } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'type', 'title', 'message']
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = await Notification.createNotification(userId, {
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      action: action || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      autoDelete: autoDelete || false
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Create notification for multiple users (admin only)
const createBulkNotification = async (req, res) => {
  try {
    const { userIds, type, title, message, data, priority, action, expiresAt, autoDelete } = req.body;

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userIds (array)', 'type', 'title', 'message']
      });
    }

    // Check if all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'Some users not found' });
    }

    const notifications = [];
    for (const userId of userIds) {
      const notification = await Notification.createNotification(userId, {
        type,
        title,
        message,
        data: data || {},
        priority: priority || 'medium',
        action: action || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        autoDelete: autoDelete || false
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `Notifications created successfully for ${notifications.length} users`,
      notifications
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({ error: 'Failed to create bulk notifications' });
  }
};

// Get notification statistics (admin only)
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          }
        }
      },
      {
        $project: {
          total: 1,
          unread: 1,
          read: { $subtract: ['$total', '$unread'] },
          typeStats: {
            $reduce: {
              input: '$byType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        type: '$$this.type',
                        isRead: '$$this.isRead'
                      },
                      in: {
                        $mergeObjects: [
                          { $ifNull: [`$$value.$$type`, { total: 0, read: 0, unread: 0 }] },
                          {
                            total: { $add: [{ $ifNull: [`$$value.$$type.total`, 0] }, 1] },
                            read: { $add: [{ $ifNull: [`$$value.$$type.read`, 0] }, { $cond: ['$$isRead', 1, 0] }] },
                            unread: { $add: [{ $ifNull: [`$$value.$$type.unread`, 0] }, { $cond: ['$$isRead', 0, 1] }] }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || { total: 0, unread: 0, read: 0, typeStats: {} }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification,
  createBulkNotification,
  getNotificationStats
};
