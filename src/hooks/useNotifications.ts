import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import NotificationService, { Notification, NotificationOptions } from '../services/NotificationService';

export const useNotifications = (options: NotificationOptions = {}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (append = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await NotificationService.getNotifications({
        ...options,
        skip: append ? notifications.length : 0
      });

      if (append) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, options, notifications.length]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await NotificationService.deleteAllRead();
      
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
    }
  }, []);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && notifications.length > 0) {
      fetchNotifications(true);
    }
  }, [loading, notifications.length, fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchNotifications(false);
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    loadMore,
    refresh
  };
};
