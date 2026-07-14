import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppDispatch } from '../src/redux/hooks';
import { restoreAuth } from '../src/redux/slices/authSlice';
import { storage } from '../src/utils/storage';
import { setAuthToken } from '../src/services/api';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      autoNavigate();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const autoNavigate = async () => {
    try {
      const authData = await storage.getAuth();
      if (authData && authData.token && authData.user && authData.user.studentId) {
        setAuthToken(authData.token);
        dispatch(restoreAuth({ user: authData.user, token: authData.token }));
        router.replace('/(tabs)/home');
      } else {
        setAuthToken(null);
        await storage.removeAuth();
        router.replace('/(auth)/login');
      }
    } catch (e) {
      console.error('Error during splash auth check', e);
      setAuthToken(null);
      router.replace('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      {/* Top Logo emblem */}
      <Animated.View
        entering={FadeIn.duration(800)}
        className="items-center mb-8"
      >
        {/* Enlarged Logo (w-64 h-64) */}
        <Image
          source={require('../assets/images/logo.png')}
          className="w-64 h-64"
          resizeMode="contain"
        />
      </Animated.View>

      {/* Center Illustration using login1.png */}
      <Animated.View
        entering={FadeIn.delay(300).duration(800)}
        className="w-full items-center justify-center"
      >
        <Image
          source={require('../assets/images/login1.png')}
          className="w-full h-80"
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
