import "./global.css";
import messaging from '@react-native-firebase/messaging';
import { api } from './src/services/api';

// Register background/killed state message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background/Killed FCM Message Received:', remoteMessage);
  
  const id = remoteMessage.data?.notificationId;
  if (id && typeof id === 'string') {
    try {
      await api.markNotificationDelivered(id);
      console.log(`✅ Marked notice ${id} as delivered in background/killed state`);
    } catch (err) {
      console.warn('Failed to mark delivered in background handler:', err);
    }
  }
});

import "expo-router/entry";

