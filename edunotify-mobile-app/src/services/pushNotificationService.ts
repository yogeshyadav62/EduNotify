import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how Expo-Notifications shows notifications in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  /**
   * Request user permission for push notifications (required for iOS and Android 13+)
   */
  async requestUserPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // Request Expo notifications permission explicitly
      const { status: localStatus } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      const localEnabled = localStatus === 'granted';

      if (enabled || localEnabled) {
        console.log('✅ FCM/Local Notification permission granted');
        
        // Setup local notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
            showBadge: true,
          });
        }
        return true;
      }
      console.log('❌ FCM Notification permission denied.');
      return false;
    } catch (error) {
      console.warn('⚠️ Error requesting FCM permission:', error);
      return false;
    }
  }

  /**
   * Fetch current Firebase FCM push token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Register device for remote messages on iOS
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }
      
      const token = await messaging().getToken();
      if (token) {
        console.log('🔑 Device FCM Registration Token:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for token updates
   */
  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(token => {
      console.log('🔄 FCM Token refreshed:', token);
      callback(token);
    });
  }

  /**
   * Set up all push notification event listeners
   * @param onNotificationReceived - Callback when notification is received in the foreground
   * @param onNotificationOpened - Callback when user clicks on a notification (from bg or killed state)
   */
  async initNotificationListeners(
    onNotificationReceived: (notification: any) => void,
    onNotificationOpened: (notification: any) => void
  ): Promise<() => void> {
    
    // 1. App is in Foreground: Receive notification
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('📡 Foreground FCM Message Received:', remoteMessage);
      
      onNotificationReceived(remoteMessage);
      
      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'EduNotify',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data || {},
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            channelId: 'default',
          },
        });
      }
    });

    // 2. App in Background (Not killed): User clicks/taps notification
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('👆 Notification clicked from background state:', remoteMessage);
      onNotificationOpened(remoteMessage);
    });

    // 3. App is Killed/Closed: User clicks notification (Cold Start)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('👆 Notification clicked from killed/quit state:', remoteMessage);
          onNotificationOpened(remoteMessage);
        }
      });

    // Return cleanup unsubscribers
    return () => {
      unsubscribeOnMessage();
      unsubscribeNotificationOpened();
    };
  }
}

export default new PushNotificationService();
