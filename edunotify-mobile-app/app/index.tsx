import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../src/redux/hooks';
import { restoreAuth } from '../src/redux/slices/authSlice';
import { storage } from '../src/utils/storage';
import { setAuthToken } from '../src/services/api';
import * as SplashScreen from 'expo-splash-screen';

export default function AuthCheckScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    autoNavigate();
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
    } finally {
      // Hide native splash screen after navigation starts
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 200);
    }
  };

  return null;
}
