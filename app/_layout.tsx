import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux/store';
import { queryClient } from '../src/lib/queryClient';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { hideToast } from '../src/redux/slices/uiSlice';
import AppText from '../src/components/common/AppText';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import colors from '../src/theme/colors';

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
  const dispatch = useAppDispatch();
  const toast = useAppSelector(state => state.ui.toast);

  // Auto-hide Toast after 3 seconds
  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible, dispatch]);

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

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
