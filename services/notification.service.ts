import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export interface PushToken {
  token: string;
  platform: string;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationService = {
  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  },

  // Get push notification token
  getPushToken: async (): Promise<string | null> => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // For development, we'll use a mock token if no project ID is configured
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID || 'mock-project-id',
        });
        console.log('Push token:', token.data);
        return token.data;
      } catch (tokenError) {
        console.warn('Could not get Expo push token, using mock token for development:', tokenError);
        return `ExponentPushToken[mock-${Date.now()}]`;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  // Register device for push notifications
  registerForPushNotifications: async (): Promise<void> => {
    try {
      const token = await NotificationService.getPushToken();
      if (!token) {
        throw new Error('Failed to get push token');
      }

      const pushTokenData: PushToken = {
        token,
        platform: Platform.OS,
      };

      try {
        await api.post('/notifications/register', pushTokenData);
        console.log('Device registered for push notifications');
      } catch (apiError) {
        console.warn('Could not register with server, storing token locally:', apiError);
        // Store token locally for when API is available
        // You could use AsyncStorage here if needed
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  },

  // Send local notification
  sendLocalNotification: async (notification: NotificationData): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      },
      trigger: null, // Send immediately
    });
  },

  // Schedule notification
  scheduleNotification: async (
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      },
      trigger,
    });

    return identifier;
  },

  // Cancel scheduled notification
  cancelNotification: async (identifier: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  // Cancel all scheduled notifications
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Get notification history
  getNotificationHistory: async (): Promise<any[]> => {
    try {
      const response = await api.get('/notifications/history');
      return response.data;
    } catch (error) {
      console.error('Error getting notification history:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          title: 'Order Confirmed',
          body: 'Your order #1001 has been confirmed',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          title: 'Order Delivered',
          body: 'Your order #1000 has been delivered',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
      ];
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // For development, just log the action
      console.log(`Notification ${notificationId} marked as read (offline mode)`);
    }
  },

  // Set up notification listeners
  setupNotificationListeners: () => {
    // Listen for notifications received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // Handle foreground notification
      }
    );

    // Listen for user interactions with notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap
        const data = response.notification.request.content.data;
        
        // Navigate based on notification data
        if (data?.screen) {
          // Handle navigation to specific screen
          console.log('Navigate to:', data.screen);
        }
      }
    );

    return {
      foregroundSubscription,
      responseSubscription,
    };
  },

  // Remove notification listeners
  removeNotificationListeners: (subscriptions: any) => {
    if (subscriptions.foregroundSubscription) {
      Notifications.removeNotificationSubscription(subscriptions.foregroundSubscription);
    }
    if (subscriptions.responseSubscription) {
      Notifications.removeNotificationSubscription(subscriptions.responseSubscription);
    }
  },

  // Send order status notification
  sendOrderStatusNotification: async (orderId: number, status: string): Promise<void> => {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      dispatched: 'Your order is on the way!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'Order status updated';

    await NotificationService.sendLocalNotification({
      title: 'Order Update',
      body: message,
      data: {
        orderId,
        status,
        screen: 'orders',
      },
    });
  },

  // Send promotional notification
  sendPromotionalNotification: async (title: string, body: string, data?: any): Promise<void> => {
    await NotificationService.sendLocalNotification({
      title,
      body,
      data: {
        ...data,
        type: 'promotional',
      },
    });
  },

  // Send low stock notification (for admin)
  sendLowStockNotification: async (productName: string, quantity: number): Promise<void> => {
    await NotificationService.sendLocalNotification({
      title: 'Low Stock Alert',
      body: `${productName} is running low (${quantity} left)`,
      data: {
        type: 'low_stock',
        productName,
        quantity,
        screen: 'admin/products',
      },
    });
  },
};

export default NotificationService;