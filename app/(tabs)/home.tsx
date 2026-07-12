import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image, TextInput, RefreshControl, FlatList, useWindowDimensions, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInLeft, SlideOutLeft, SlideInDown } from 'react-native-reanimated';
import Screen from '../../src/components/common/Screen';
import AppText from '../../src/components/common/AppText';
import AppButton from '../../src/components/common/AppButton';
import EmptyState from '../../src/components/common/EmptyState';
import NotificationCard from '../../src/components/notification/NotificationCard';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useLogin } from '../../src/hooks/useLogin';
import { useAppSelector, useAppDispatch } from '../../src/redux/hooks';
import { showToast, setActiveModal } from '../../src/redux/slices/uiSlice';
import { formatRelativeTime } from '../../src/utils/date';
import colors from '../../src/theme/colors';
import { Notification } from '../../src/types/notification';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { logout } = useLogin();

  // Load notifications state
  const {
    notifications,
    allAllowedNotifications,
    unreadCount,
    readNotificationIds,
    isLoading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull down to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const horizontalListRef = React.useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();
  const screenHeight = Dimensions.get('screen').height;

  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  const handleFilterChange = (newFilter: 'all' | 'class' | 'personal') => {
    setTabLoading(prev => ({ ...prev, [newFilter]: true }));
    setFilter(newFilter);
    const index = newFilter === 'all' ? 0 : newFilter === 'class' ? 1 : 2;
    setTimeout(() => {
      horizontalListRef.current?.scrollToIndex({ index, animated: true });
    }, 50);
    setTimeout(() => {
      setTabLoading(prev => ({ ...prev, [newFilter]: false }));
    }, 400);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;
    if (layoutWidth === 0) return;
    const index = Math.round(contentOffset / layoutWidth);
    const newFilter = index === 0 ? 'all' : index === 1 ? 'class' : 'personal';
    if (filter !== newFilter) {
      setTabLoading(prev => ({ ...prev, [newFilter]: true }));
      setFilter(newFilter);
      setTimeout(() => {
        setTabLoading(prev => ({ ...prev, [newFilter]: false }));
      }, 400);
    }
  };

  const getFilteredNotifications = (category: 'all' | 'class' | 'personal') => {
    const query = searchQuery.toLowerCase().trim();

    // First, filter by the category
    const categoryItems = notifications.filter(item => {
      if (category === 'all') return true;
      if (category === 'class') return item.studentId === null; // broadcast
      if (category === 'personal') return item.studentId !== null; // personal
      return true;
    });

    // Then, apply search query
    if (!query) return categoryItems;
    return categoryItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.facultyName.toLowerCase().includes(query)
    );
  };

  const handleCardPress = (notification: Notification) => {
    router.push({
      pathname: '/notification-detail',
      params: { id: notification.id }
    });
    if (!readNotificationIds.includes(notification.id)) {
      markAsRead(notification.id);
    }
  };

  const triggerLogout = () => {
    setMenuDrawerVisible(false);
    dispatch(setActiveModal('logout'));
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    dispatch(setActiveModal(null));
    await logout();
  };

  const getStudentInitials = () => {
    if (!user?.name) return 'Y';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderNotificationPage = (category: 'all' | 'class' | 'personal') => {
    const list = getFilteredNotifications(category);

    if ((isLoading || tabLoading[category]) && !refreshing) {
      return (
        <View style={{ width: screenWidth }} className="justify-center items-center flex-1 py-10">
          <ActivityIndicator size="small" color="#0B66EF" />
        </View>
      );
    }

    if (list.length === 0) {
      return (
        <View style={{ width: screenWidth }} className="px-8 justify-center items-center flex-1 pb-12 pt-16">
          <View className="w-24 h-24 bg-blue-50 rounded-full justify-center items-center mb-5 border border-blue-100/50">
            <Ionicons name="notifications-outline" size={44} color="#0B66EF" />
          </View>
          <AppText className="text-slate-800 text-lg font-black text-center mb-1.5">
            No Notifications Yet!
          </AppText>
          <AppText className="text-slate-400 text-xs font-bold text-center leading-5 max-w-[250px]">
            You're all caught up. New notifications will appear here.
          </AppText>
        </View>
      );
    }

    return (
      <View style={{ width: screenWidth }} className="flex-1">
        <FlatList<Notification>
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <NotificationCard
              notification={item}
              index={index}
              isRead={readNotificationIds.includes(item.id)}
              onPress={() => handleCardPress(item)}
              onMarkAsRead={() => markAsRead(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0B66EF']}
              tintColor="#0B66EF"
            />
          }
        />
      </View>
    );
  };

  return (
    <Screen backgroundColor="#0B66EF">
      {/* 1. SOLID BLUE HEADER SECTION */}
      <View className="pt-3 pb-2 px-5 bg-[#0B66EF] flex-row justify-between items-center z-10">
        {/* Left Side: Hamburger Menu */}
        <TouchableOpacity
          onPress={() => {
            dispatch(setActiveModal('drawer'));
            setMenuDrawerVisible(true);
          }}
          className="p-1 active:opacity-70"
        >
          <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Right Side: Profile Icon */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          className="p-1 active:opacity-70"
        >
          <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Profile summary card inside header */}
      <View className="px-5 pb-6 bg-[#0B66EF]">
        <AppText className="text-white font-black" style={{ fontSize: 28, lineHeight: 44 }}>
          Hello, {user?.name?.split(' ')[0] || 'Yogesh'} 👋
        </AppText>
        <AppText className="text-white/80 text-sm font-semibold mt-1">
          Class: {user?.classId || 'CS-202'}  |  Student: {user?.studentId || 'STU-101'}
        </AppText>
      </View>

      {/* 2. OVERLAY CONTAINER (White card overlapping header) */}
      <View className="flex-1 bg-white rounded-t-[36px] -mt-2 pt-6 shadow-2xl">

        {/* Search Bar & Notification Bell row */}
        <View className="flex-row px-5 mb-4 items-center">
          <View className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center px-4 py-2.5 shadow-sm mr-2.5">
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notifications..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-slate-800 text-xs font-semibold p-0"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/notifications')}
            className="relative bg-white border border-slate-100 rounded-2xl w-[42px] h-[42px] items-center justify-center shadow-sm active:bg-slate-50"
          >
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#EF4444',
                  borderRadius: 7.5,
                  width: 15,
                  height: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1,
                }}
              >
                <Text
                  className="text-white font-black"
                  style={{
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                    fontSize: 8,
                    lineHeight: 12,
                  }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Filters Chips (Screen 3 Chips) */}
        <View className="flex-row px-5 mb-4 justify-start">
          {/* Chip All */}
          <TouchableOpacity
            onPress={() => handleFilterChange('all')}
            className={`flex-row items-center px-5 py-2 rounded-2xl border mr-2.5 ${filter === 'all'
              ? 'bg-[#0B66EF] border-[#0B66EF]'
              : 'bg-white border-slate-100'
              }`}
          >
            <AppText className={`text-xs font-bold ${filter === 'all' ? 'text-white' : 'text-slate-700'}`}>
              All
            </AppText>
          </TouchableOpacity>

          {/* Chip Broadcast */}
          <TouchableOpacity
            onPress={() => handleFilterChange('class')}
            className={`flex-row items-center px-5 py-2 rounded-2xl border mr-2.5 ${filter === 'class'
              ? 'bg-orange-500 border-orange-500'
              : 'bg-white border-slate-100'
              }`}
          >
            <Ionicons
              name={filter === 'class' ? 'volume-high' : 'volume-high-outline'}
              size={14}
              color={filter === 'class' ? '#FFFFFF' : '#F97316'}
              style={{ marginRight: 6 }}
            />
            <AppText className={`text-xs font-bold ${filter === 'class' ? 'text-white' : 'text-slate-700'}`}>
              Broadcast
            </AppText>
          </TouchableOpacity>

          {/* Chip Personal */}
          <TouchableOpacity
            onPress={() => handleFilterChange('personal')}
            className={`flex-row items-center px-5 py-2 rounded-2xl border ${filter === 'personal'
              ? 'bg-[#0B66EF] border-[#0B66EF]'
              : 'bg-white border-slate-100'
              }`}
          >
            <Ionicons
              name={filter === 'personal' ? 'person' : 'person-outline'}
              size={14}
              color={filter === 'personal' ? '#FFFFFF' : '#0B66EF'}
              style={{ marginRight: 6 }}
            />
            <AppText className={`text-xs font-bold ${filter === 'personal' ? 'text-white' : 'text-slate-700'}`}>
              Personal
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Reload Instruction label */}
        <View className="flex-row justify-center items-center py-1 mb-2">
          <Ionicons name="arrow-down" size={11} color="#0B66EF" style={{ marginRight: 4 }} />
          <AppText className="text-[10px] text-[#0B66EF] font-bold">
            Pull down to refresh
          </AppText>
        </View>

        {/* Horizontal Swiper for swipeable categories */}
        <FlatList
          ref={horizontalListRef}
          data={['all', 'class', 'personal']}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderNotificationPage(item as 'all' | 'class' | 'personal')}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>

      {/* ======================================================== */}
      {/* 8. PROFILE / MENU DRAWER OVERLAY (Screen 8 Left side) */}
      <Modal
        visible={menuDrawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          setMenuDrawerVisible(false);
          dispatch(setActiveModal(null));
        }}
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
              onPress={() => {
                setMenuDrawerVisible(false);
                dispatch(setActiveModal(null));
              }}
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
                onPress={() => {
                  setMenuDrawerVisible(false);
                  dispatch(setActiveModal(null));
                }}
                className="absolute top-10 right-4 p-1 z-20"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Profile Circle Avatar */}
              <View className="items-start mt-4">
                <View className="w-16 h-16 rounded-full bg-white justify-center items-center mb-3 shadow-md">
                  <AppText className="text-xl font-extrabold text-[#0B66EF]">
                    {getStudentInitials()}
                  </AppText>
                </View>
                <AppText className="text-white font-black text-base leading-5">{user?.name || 'Yogesh Yadav'}</AppText>
                <AppText className="text-white/80 text-xs font-semibold mt-1">
                  ID: {user?.studentId || 'STU-101'}  |  Class: {user?.classId || 'CS-202'}
                </AppText>
              </View>
            </View>

            {/* Menu options list */}
            <View className="flex-1 px-5 pt-4">
              <TouchableOpacity
                onPress={() => { setMenuDrawerVisible(false); router.push('/(tabs)/profile'); }}
                className="flex-row items-center py-3.5 border-b border-slate-50"
              >
                <Ionicons name="person-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
                <AppText className="text-slate-700 text-sm font-bold">My Profile</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setMenuDrawerVisible(false); handleFilterChange('all'); }}
                className="flex-row items-center py-3.5 border-b border-slate-50"
              >
                <Ionicons name="mail-unread-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
                <AppText className="text-slate-700 text-sm font-bold">Read Notifications</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setMenuDrawerVisible(false); router.push('/(tabs)/profile'); }}
                className="flex-row items-center py-3.5 border-b border-slate-50"
              >
                <Ionicons name="settings-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
                <AppText className="text-slate-700 text-sm font-bold">Settings</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMenuDrawerVisible(false)}
                className="flex-row items-center py-3.5 border-b border-slate-50"
              >
                <Ionicons name="help-circle-outline" size={21} color="#0B66EF" style={{ marginRight: 12 }} />
                <AppText className="text-slate-700 text-sm font-bold">Help & Support</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMenuDrawerVisible(false)}
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

      {/* ======================================================== */}
      {/* 7. LOGOUT CONFIRMATION MODAL (Screen 7 Modal) */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setLogoutModalVisible(false);
          dispatch(setActiveModal(null));
        }}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/55 justify-center items-center px-6">
          <View className="bg-white rounded-[32px] p-6 w-full max-w-[320px] items-center">

            {/* Red Logout Circle Icon (Screen 7 exit arrow) */}
            <View className="w-14 h-14 bg-red-50 rounded-2xl justify-center items-center mb-4">
              <Ionicons name="log-out" size={28} color="#EF4444" />
            </View>

            {/* Text details */}
            <AppText className="text-slate-800 text-lg font-black mb-1">
              Logout
            </AppText>
            <AppText className="text-slate-400 text-xs font-bold text-center leading-5 mb-6">
              Are you sure you want to logout from EduNotify?
            </AppText>

            {/* Buttons Row */}
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                onPress={() => {
                  setLogoutModalVisible(false);
                  dispatch(setActiveModal(null));
                }}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-3 mr-2 items-center active:bg-slate-100"
              >
                <AppText className="text-slate-500 text-xs font-bold">Cancel</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 bg-[#EF4444] rounded-xl py-3 ml-2 items-center active:bg-red-600"
              >
                <AppText className="text-white text-xs font-black">Logout</AppText>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>


    </Screen>
  );
}
