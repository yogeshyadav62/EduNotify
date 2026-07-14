import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { api, setAuthToken } from '../services/api';
import { loginStart, loginSuccess, loginFailure, logout } from '../redux/slices/authSlice';
import { clearNotificationsState } from '../redux/slices/notificationSlice';
import { storage } from '../utils/storage';
import { showToast } from '../redux/slices/uiSlice';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useAppSelector(state => state.auth);
  
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');

  const handleLogin = async () => {
    const id = studentId.toUpperCase().trim();
    const cls = classId.toUpperCase().trim();

    // Basic Validation
    if (!id) {
      dispatch(showToast({ message: 'Student ID is required', type: 'error' }));
      return;
    }

    if (!cls) {
      dispatch(showToast({ message: 'Class ID is required', type: 'error' }));
      return;
    }

    // Pattern validation (Student ID format: STU-XXXX)
    const stuIdRegex = /^STU-\d+$/i;

    if (!stuIdRegex.test(id)) {
      dispatch(showToast({ message: 'Student ID must follow the pattern STU-101', type: 'error' }));
      return;
    }

    dispatch(loginStart());
    try {
      const result = await api.login(id, cls);
      // Persist auth session
      await storage.saveAuth(result.user, result.token);
      
      dispatch(loginSuccess(result));
      dispatch(showToast({ message: `Logged in successfully! Welcome, ${result.user.name}`, type: 'success' }));
      
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errMsg));
      dispatch(showToast({ message: errMsg, type: 'error' }));
    }
  };

  const handleLogout = async () => {
    try {
      setAuthToken(null);
      await storage.removeAuth();
      dispatch(logout());
      dispatch(clearNotificationsState());
      dispatch(showToast({ message: 'Logged out successfully', type: 'info' }));
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return {
    studentId,
    setStudentId,
    classId,
    setClassId,
    isLoading: loading,
    error,
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
};
