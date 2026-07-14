import React from 'react';
import { View, TouchableOpacity, Modal, Image, useWindowDimensions, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import AppText from '../../Screens/components/common/AppText';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveModal } from '../../redux/slices/uiSlice';

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const activeModal = useAppSelector(state => state.ui.activeModal);
  
  const isVisible = activeModal === 'drawer';
  const { width: screenWidth } = useWindowDimensions();
  const screenHeight = Dimensions.get('screen').height;

  const getStudentInitials = () => {
    if (!user?.name) return 'Y';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleClose = () => {
    dispatch(setActiveModal(null));
  };

  const handleNavigate = (path: string) => {
    handleClose();
    // Use timeout to let the sidebar modal close smoothly before navigating
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const triggerLogout = () => {
    handleClose();
    setTimeout(() => {
      dispatch(setActiveModal('logout'));
    }, 150);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={{ flex: 1, height: screenHeight }}>
        {/* Outside Backdrop */}
        <Animated.View
          entering={FadeIn.duration(280)}
          className="absolute inset-0 bg-black/45"
          style={{ height: screenHeight }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Drawer Body */}
        <Animated.View
          entering={SlideInLeft.duration(280)}
          exiting={SlideOutLeft.duration(250)}
          className="absolute left-0 top-0 w-[75%] bg-white shadow-2xl overflow-hidden"
          style={{ height: screenHeight }}
        >
          {/* Blue Header Section */}
          <View className="bg-[#0B66EF] pt-14 pb-6 px-5 relative">
            {/* Top Close icon */}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-10 right-4 p-1 z-20"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Profile Circle Avatar */}
            <View className="items-start mt-4">
              <View className="w-16 h-16 rounded-full bg-white justify-center items-center mb-3 shadow-md overflow-hidden">
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <AppText className="text-xl font-extrabold text-[#0B66EF]">
                    {getStudentInitials()}
                  </AppText>
                )}
              </View>
              <AppText className="text-white font-black text-base leading-5" style={{ textTransform: 'capitalize' }}>
                {user?.name || 'Yogesh Yadav'}
              </AppText>
              <AppText className="text-white/80 text-xs font-semibold mt-1">
                ID: {user?.studentId || 'STU-101'}  |  Class: {user?.classId || 'CS-202'}
              </AppText>
            </View>
          </View>

          {/* Menu options list */}
          <View className="flex-1 px-5 pt-4">
            <TouchableOpacity
              onPress={() => handleNavigate('/(tabs)/profile')}
              className="flex-row items-center py-3.5 border-b border-slate-50"
            >
              <Ionicons name="person-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
              <AppText className="text-slate-700 text-sm font-bold">My Profile</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigate('/(tabs)/notifications')}
              className="flex-row items-center py-3.5 border-b border-slate-50"
            >
              <Ionicons name="mail-unread-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
              <AppText className="text-slate-700 text-sm font-bold">Alert Feed</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigate('/(tabs)/profile')}
              className="flex-row items-center py-3.5 border-b border-slate-50"
            >
              <Ionicons name="settings-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
              <AppText className="text-slate-700 text-sm font-bold">Settings</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              className="flex-row items-center py-3.5 border-b border-slate-50"
            >
              <Ionicons name="help-circle-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
              <AppText className="text-slate-700 text-sm font-bold">Help & Support</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              className="flex-row items-center py-3.5"
            >
              <Ionicons name="information-circle-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
              <AppText className="text-slate-700 text-sm font-bold">About EduNotify</AppText>
            </TouchableOpacity>
          </View>

          {/* Logout Row at bottom */}
          <TouchableOpacity
            onPress={triggerLogout}
            className="flex-row items-center py-5 border-t border-slate-100 px-5 mb-8"
          >
            <Ionicons name="log-out-outline" size={21} color="#EF4444" style={{ marginRight: 12 }} />
            <AppText className="text-red-500 text-sm font-black">Logout</AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
