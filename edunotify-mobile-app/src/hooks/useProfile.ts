import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { api } from '../services/api';
import { updateUser } from '../redux/slices/authSlice';
import { storage } from '../utils/storage';
import { showToast } from '../redux/slices/uiSlice';
import { User } from '../types/auth';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  // Fetch updated profile from server and sync
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const updatedUser = await api.fetchProfile();
      dispatch(updateUser(updatedUser));
      await storage.saveAuth(updatedUser, token);
    } catch (error: any) {
      console.warn('Failed to fetch profile:', error.message || error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  // Edit/update profile info
  const updateProfileInfo = useCallback(async (name: string, email: string, mobile: string) => {
    if (!token) return false;
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(name, email, mobile);
      dispatch(updateUser(updatedUser));
      await storage.saveAuth(updatedUser, token);
      dispatch(showToast({ message: 'Profile updated successfully', type: 'success' }));
      return true;
    } catch (error: any) {
      const errMsg = error.message || 'Failed to update profile';
      dispatch(showToast({ message: errMsg, type: 'error' }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  // Pick image and upload
  const pickAndUploadAvatar = useCallback(async () => {
    if (!token) return;
    
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      dispatch(showToast({ message: 'Permission to access media library is required', type: 'error' }));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      setLoading(true);

      const uploadResult = await api.updateAvatar(selectedUri);
      
      if (user) {
        const updatedUser: User = {
          ...user,
          avatarUrl: uploadResult.avatarUrl,
        };
        dispatch(updateUser(updatedUser));
        await storage.saveAuth(updatedUser, token);
        dispatch(showToast({ message: 'Profile picture updated successfully', type: 'success' }));
      }
    } catch (error: any) {
      const errMsg = error.message || 'Failed to upload profile picture';
      dispatch(showToast({ message: errMsg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, user]);

  return {
    user,
    loading,
    fetchProfile,
    updateProfileInfo,
    pickAndUploadAvatar,
  };
};
