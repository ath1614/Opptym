const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'info',           // General information
      'success',        // Success messages
      'warning',        // Warning messages
      'error',          // Error messages
      'subscription',   // Subscription related
      'project',        // Project related
      'submission',     // Submission related
      'seo_tool',       // SEO tool related
      'payment',        // Payment related
      'system'          // System notifications
    ],
    required: true,
    default: 'info'
  },
  
  // Notification title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Notification message
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Additional data (optional)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Action button (optional)
  action: {
    text: {
      type: String,
      trim: true,
      maxlength: 50
    },
    url: {
      type: String,
      trim: true,
      maxlength: 500
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    }
  },
  
  // Expiration date (optional)
  expiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 }
  },
  
  // Auto-delete after read (optional)
  autoDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });

// Static methods
notificationSchema.statics.createNotification = async function(userId, notificationData) {
  const notification = new this({
    userId,
    ...notificationData
  });
  
  return await notification.save();
};

notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    unreadOnly = false,
    type = null,
    priority = null
  } = options;
  
  const query = { userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username email');
};

notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.deleteNotification = async function(notificationId, userId) {
  return await this.findOneAndDelete({ _id: notificationId, userId });
};

notificationSchema.statics.deleteAllRead = async function(userId) {
  return await this.deleteMany({ userId, isRead: true });
};

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Auto-delete if expired
  if (this.isExpired()) {
    return next(new Error('Notification has expired'));
  }
  
  next();
});

// Post-save middleware for auto-delete
notificationSchema.post('save', async function() {
  if (this.autoDelete && this.isRead) {
    // Delete after a short delay to allow UI updates
    setTimeout(async () => {
      try {
        await this.constructor.findByIdAndDelete(this._id);
      } catch (error) {
        console.error('Error auto-deleting notification:', error);
      }
    }, 5000); // 5 seconds delay
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
