import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '../src/navigation/stack/RootNavigator';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding during startup checks
SplashScreen.preventAutoHideAsync().catch(() => {});
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux/store';
import { queryClient } from '../src/lib/queryClient';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { hideToast, showToast } from '../src/redux/slices/uiSlice';
import { addNewNotification, removeNotification } from '../src/redux/slices/notificationSlice';
import socketService from '../src/utils/socketService';
import AppText from '../src/Screens/components/common/AppText';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import colors from '../src/theme/colors';
import PushNotificationService from '../src/services/pushNotificationService';
import { api } from '../src/services/api';
import { useFonts } from 'expo-font';
import { 
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold 
} from '@expo-google-fonts/outfit';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}

function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  const dispatch = useAppDispatch();
  const toast = useAppSelector(state => state.ui.toast);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // Real-time Socket Connection management
  useEffect(() => {
    if (isAuthenticated && user && user.classId && user.studentId) {
      console.log(`🔌 Initializing Socket.IO connection for Student: ${user.studentId}, Class: ${user.classId}`);
      
      // Connect to server and subscribe to class and student channels
      socketService.connect(user.classId, user.studentId);

      // Listen for broadcasts targeting this student
      socketService.onNewNotification((newNotice) => {
        // 1. Insert into local Redux store
        dispatch(addNewNotification(newNotice));
        
        // 2. Trigger slide-down alert notification
        dispatch(showToast({
          message: `New notice: "${newNotice.title}"`,
          type: 'info'
        }));
      });

      // Listen for real-time deletions
      socketService.onDeletedNotification((payload) => {
        dispatch(removeNotification(payload.id));
      });
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user, dispatch]);

  // Real-time Push Notification setup
  useEffect(() => {
    let unsubscribeListeners: (() => void) | undefined;

    const setupPushNotifications = async () => {
      if (isAuthenticated && user) {
        try {
          console.log('🔔 Requesting Push Notification Permissions...');
          const hasPermission = await PushNotificationService.requestUserPermission();
          if (hasPermission) {
            const token = await PushNotificationService.getFCMToken();
            if (token) {
              await api.updateFCMToken(token);
              console.log('✅ FCM Token registered to backend successfully');
            }
          }

          // Initialize listeners
          unsubscribeListeners = await PushNotificationService.initNotificationListeners(
            async (remoteMessage) => {
              console.log('📡 Foreground FCM Message:', remoteMessage);
              const id = remoteMessage.data?.notificationId;
              if (id) {
                try {
                  await api.markNotificationDelivered(id);
                } catch (err) {
                  console.warn('Failed to mark delivered via foreground push:', err);
                }
              }
            },
            async (remoteMessage) => {
              console.log('👆 Opened Push Message:', remoteMessage);
              const id = remoteMessage.data?.notificationId;
              if (id) {
                try {
                  await api.markNotificationSeen(id);
                } catch (err) {
                  console.warn('Failed to mark seen on notification click:', err);
                }
              }
            }
          );
        } catch (error) {
          console.warn('⚠️ Error during push notification setup:', error);
        }
      }
    };

    setupPushNotifications();

    return () => {
      if (unsubscribeListeners) {
        unsubscribeListeners();
      }
    };
  }, [isAuthenticated, user]);

  // Auto-hide Toast after 3 seconds
  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible, dispatch]);

  if (!fontsLoaded) {
    return null;
  }

  const getToastBg = () => {
    switch (toast?.type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  const getToastIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (toast?.type) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'close-circle-outline';
      case 'warning': return 'warning-outline';
      default: return 'information-circle-outline';
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <RootNavigator />

      {/* Global Slide-down Toast Notification */}
      {toast?.visible && (
        <Animated.View
          entering={SlideInUp.duration(300)}
          exiting={SlideOutUp.duration(200)}
          className={`absolute top-12 left-4 right-4 z-50 rounded-2xl p-4 shadow-lg flex-row items-center ${getToastBg()}`}
        >
          <Ionicons
            name={getToastIcon()}
            size={22}
            color="white"
            style={{ marginRight: 10 }}
          />
          <AppText className="text-white font-semibold text-sm flex-1 leading-4">
            {toast.message}
          </AppText>
          <TouchableOpacity onPress={() => dispatch(hideToast())}>
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
import { TouchableOpacity } from 'react-native';
