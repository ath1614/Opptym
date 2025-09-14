import axios from 'axios';

export interface Notification {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'subscription' | 'project' | 'submission' | 'seo_tool' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    text: string;
    url: string;
    method: string;
  };
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationOptions {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

class NotificationService {
  private baseURL = '/api/notifications';

  // Get user notifications
  async getNotifications(options: NotificationOptions = {}): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.skip) params.append('skip', options.skip.toString());
    if (options.unreadOnly) params.append('unreadOnly', 'true');
    if (options.type) params.append('type', options.type);
    if (options.priority) params.append('priority', options.priority);

    const response = await axios.get(`${this.baseURL}?${params.toString()}`);
    return response.data;
  }

  // Get unread count
  async getUnreadCount(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await axios.get(`${this.baseURL}/unread-count`);
    return response.data;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await axios.patch(`${this.baseURL}/${notificationId}/read`);
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; modifiedCount: number }> {
    const response = await axios.patch(`${this.baseURL}/mark-all-read`);
    return response.data;
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`${this.baseURL}/${notificationId}`);
    return response.data;
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<{ success: boolean; deletedCount: number }> {
    const response = await axios.delete(`${this.baseURL}/read/all`);
    return response.data;
  }

  // Create notification (admin only)
  async createNotification(notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    action?: any;
    expiresAt?: string;
    autoDelete?: boolean;
  }): Promise<{ success: boolean; notification: Notification }> {
    const response = await axios.post(this.baseURL, notificationData);
    return response.data;
  }

  // Create bulk notifications (admin only)
  async createBulkNotification(notificationData: {
    userIds: string[];
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
    action?: any;
    expiresAt?: string;
    autoDelete?: boolean;
  }): Promise<{ success: boolean; notifications: Notification[] }> {
    const response = await axios.post(`${this.baseURL}/bulk`, notificationData);
    return response.data;
  }

  // Get notification statistics (admin only)
  async getNotificationStats(): Promise<{ success: boolean; stats: any }> {
    const response = await axios.get(`${this.baseURL}/stats`);
    return response.data;
  }
}

export default new NotificationService();
