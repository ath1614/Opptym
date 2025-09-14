const Notification = require('../models/notificationModel');

class NotificationHelper {
  // Create notification for subscription events
  static async createSubscriptionNotification(userId, type, data = {}) {
    const notifications = {
      'trial_started': {
        type: 'subscription',
        title: 'Welcome to OPPTYM!',
        message: 'Your 3-day free trial has started. Explore all features and see the power of automated SEO submissions.',
        priority: 'high',
        action: {
          text: 'Get Started',
          url: '/dashboard',
          method: 'GET'
        }
      },
      'trial_expiring': {
        type: 'warning',
        title: 'Trial Expiring Soon',
        message: `Your free trial expires in ${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}. Upgrade now to continue using OPPTYM.`,
        priority: 'high',
        action: {
          text: 'Upgrade Now',
          url: '/pricing',
          method: 'GET'
        }
      },
      'trial_expired': {
        type: 'error',
        title: 'Trial Expired',
        message: 'Your free trial has expired. Upgrade to continue using OPPTYM and unlock all features.',
        priority: 'urgent',
        action: {
          text: 'Upgrade Now',
          url: '/pricing',
          method: 'GET'
        }
      },
      'subscription_upgraded': {
        type: 'success',
        title: 'Subscription Upgraded!',
        message: `Welcome to ${data.planName}! You now have access to all premium features.`,
        priority: 'high',
        action: {
          text: 'Explore Features',
          url: '/dashboard',
          method: 'GET'
        }
      },
      'subscription_cancelled': {
        type: 'warning',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You can continue using your current plan until the end of your billing period.',
        priority: 'medium'
      },
      'payment_failed': {
        type: 'error',
        title: 'Payment Failed',
        message: 'We couldn\'t process your payment. Please update your payment method to avoid service interruption.',
        priority: 'urgent',
        action: {
          text: 'Update Payment',
          url: '/profile#billing',
          method: 'GET'
        }
      },
      'payment_success': {
        type: 'success',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully. Thank you for your subscription!',
        priority: 'medium'
      }
    };

    const notificationData = notifications[type];
    if (!notificationData) {
      console.error(`Unknown subscription notification type: ${type}`);
      return null;
    }

    return await Notification.createNotification(userId, notificationData);
  }

  // Create notification for project events
  static async createProjectNotification(userId, type, data = {}) {
    const notifications = {
      'project_created': {
        type: 'project',
        title: 'Project Created',
        message: `Your project "${data.projectName}" has been created successfully.`,
        priority: 'medium',
        action: {
          text: 'View Project',
          url: `/projects/${data.projectId}`,
          method: 'GET'
        }
      },
      'project_limit_reached': {
        type: 'warning',
        title: 'Project Limit Reached',
        message: `You've reached your project limit (${data.limit}). Upgrade to create more projects.`,
        priority: 'high',
        action: {
          text: 'Upgrade',
          url: '/pricing',
          method: 'GET'
        }
      },
      'project_deleted': {
        type: 'info',
        title: 'Project Deleted',
        message: `Your project "${data.projectName}" has been deleted.`,
        priority: 'low'
      }
    };

    const notificationData = notifications[type];
    if (!notificationData) {
      console.error(`Unknown project notification type: ${type}`);
      return null;
    }

    return await Notification.createNotification(userId, notificationData);
  }

  // Create notification for submission events
  static async createSubmissionNotification(userId, type, data = {}) {
    const notifications = {
      'submission_started': {
        type: 'submission',
        title: 'Submission Started',
        message: `Your submission to ${data.directoryName} has been started.`,
        priority: 'medium'
      },
      'submission_completed': {
        type: 'success',
        title: 'Submission Completed',
        message: `Your submission to ${data.directoryName} has been completed successfully.`,
        priority: 'medium',
        action: {
          text: 'View Results',
          url: `/submissions/${data.submissionId}`,
          method: 'GET'
        }
      },
      'submission_failed': {
        type: 'error',
        title: 'Submission Failed',
        message: `Your submission to ${data.directoryName} failed. ${data.reason || 'Please try again.'}`,
        priority: 'high',
        action: {
          text: 'Retry',
          url: `/submissions/${data.submissionId}`,
          method: 'GET'
        }
      },
      'submission_limit_reached': {
        type: 'warning',
        title: 'Submission Limit Reached',
        message: `You've reached your submission limit (${data.limit}). Upgrade to submit to more directories.`,
        priority: 'high',
        action: {
          text: 'Upgrade',
          url: '/pricing',
          method: 'GET'
        }
      }
    };

    const notificationData = notifications[type];
    if (!notificationData) {
      console.error(`Unknown submission notification type: ${type}`);
      return null;
    }

    return await Notification.createNotification(userId, notificationData);
  }

  // Create notification for SEO tool events
  static async createSEOToolNotification(userId, type, data = {}) {
    const notifications = {
      'seo_tool_completed': {
        type: 'seo_tool',
        title: 'SEO Analysis Complete',
        message: `Your ${data.toolName} analysis for ${data.url} has been completed.`,
        priority: 'medium',
        action: {
          text: 'View Results',
          url: `/seo-tools/results/${data.resultId}`,
          method: 'GET'
        }
      },
      'seo_tool_failed': {
        type: 'error',
        title: 'SEO Analysis Failed',
        message: `Your ${data.toolName} analysis failed. ${data.reason || 'Please try again.'}`,
        priority: 'medium'
      },
      'seo_tool_limit_reached': {
        type: 'warning',
        title: 'SEO Tool Limit Reached',
        message: `You've reached your SEO tool usage limit (${data.limit}). Upgrade to use more tools.`,
        priority: 'high',
        action: {
          text: 'Upgrade',
          url: '/pricing',
          method: 'GET'
        }
      }
    };

    const notificationData = notifications[type];
    if (!notificationData) {
      console.error(`Unknown SEO tool notification type: ${type}`);
      return null;
    }

    return await Notification.createNotification(userId, notificationData);
  }

  // Create notification for system events
  static async createSystemNotification(userId, type, data = {}) {
    const notifications = {
      'maintenance_scheduled': {
        type: 'system',
        title: 'Scheduled Maintenance',
        message: `System maintenance is scheduled for ${data.date}. The service may be temporarily unavailable.`,
        priority: 'medium',
        expiresAt: data.maintenanceDate
      },
      'feature_update': {
        type: 'info',
        title: 'New Feature Available',
        message: data.message || 'A new feature has been added to OPPTYM. Check it out!',
        priority: 'medium',
        action: {
          text: 'Learn More',
          url: data.url || '/features',
          method: 'GET'
        }
      },
      'security_alert': {
        type: 'error',
        title: 'Security Alert',
        message: data.message || 'We detected unusual activity on your account. Please review your security settings.',
        priority: 'urgent',
        action: {
          text: 'Review Security',
          url: '/profile#security',
          method: 'GET'
        }
      }
    };

    const notificationData = notifications[type];
    if (!notificationData) {
      console.error(`Unknown system notification type: ${type}`);
      return null;
    }

    return await Notification.createNotification(userId, notificationData);
  }

  // Create custom notification
  static async createCustomNotification(userId, notificationData) {
    return await Notification.createNotification(userId, notificationData);
  }

  // Create bulk notifications for multiple users
  static async createBulkNotification(userIds, notificationData) {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await Notification.createNotification(userId, notificationData);
      notifications.push(notification);
    }
    return notifications;
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
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
        }
      ]);
      return stats[0] || { total: 0, unread: 0, read: 0 };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, read: 0 };
    }
  }
}

module.exports = NotificationHelper;
