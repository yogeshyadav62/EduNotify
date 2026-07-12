import React, { useState } from 'react';
import { View, FlatList, Modal, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, RefreshControl, useWindowDimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Screen from '../../src/components/common/Screen';
import AppText from '../../src/components/common/AppText';
import AppButton from '../../src/components/common/AppButton';
import NotificationCard from '../../src/components/notification/NotificationCard';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useAppSelector, useAppDispatch } from '../../src/redux/hooks';
import { setActiveModal } from '../../src/redux/slices/uiSlice';
import { formatRelativeTime } from '../../src/utils/date';
import colors from '../../src/theme/colors';
import { Notification } from '../../src/types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Load notifications state
  const {
    notifications,
    unreadCount,
    readNotificationIds,
    isLoading,
    filter,
    setFilter,
    markAsRead,
    refresh,
  } = useNotifications();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pull down to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const horizontalListRef = React.useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();

  const handleFilterChange = (newFilter: 'all' | 'class' | 'personal') => {
    setFilter(newFilter);
    const index = newFilter === 'all' ? 0 : newFilter === 'class' ? 1 : 2;
    setTimeout(() => {
      horizontalListRef.current?.scrollToIndex({ index, animated: true });
    }, 50);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;
    if (layoutWidth === 0) return;
    const index = Math.round(contentOffset / layoutWidth);
    const newFilter = index === 0 ? 'all' : index === 1 ? 'class' : 'personal';
    if (filter !== newFilter) {
      setFilter(newFilter);
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

  const renderNotificationPage = (category: 'all' | 'class' | 'personal') => {
    const list = getFilteredNotifications(category);

    if (isLoading && !refreshing) {
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
      {/* SOLID BLUE HEADER SECTION */}
      <View className="pt-3 pb-4 px-5 bg-[#0B66EF] flex-row justify-between items-center z-10">
        <View className="flex-row items-center">
          <Ionicons name="notifications-circle-outline" size={26} color="#FFFFFF" style={{ marginRight: 8 }} />
          <AppText className="text-xl font-black text-white">Alert Feed</AppText>
        </View>

        <TouchableOpacity 
          onPress={() => handleFilterChange('all')}
          className="relative p-1 active:opacity-70"
        >
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
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
                borderColor: '#FFFFFF'
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

      {/* Profile summary card inside header */}
      <View className="px-5 pb-5 bg-[#0B66EF]">
        <AppText className="text-white/80 text-xs font-bold">
          Filter and review notices for {user?.name || 'Yogesh'} ({user?.classId})
        </AppText>
      </View>

      {/* OVERLAY CONTAINER */}
      <View className="flex-1 bg-white rounded-t-[36px] -mt-2 pt-6 shadow-2xl">
        
        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="bg-slate-50 border border-slate-100 rounded-2xl flex-row items-center px-4 py-2.5 shadow-sm">
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notifications..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-slate-800 text-xs font-bold p-0"
              autoCorrect={false}
            />
            <TouchableOpacity 
              onPress={() => handleFilterChange('all')}
              className="p-0.5"
            >
              <Ionicons name="funnel-outline" size={16} color="#0B66EF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filters Chips */}
        <View className="flex-row px-5 mb-4 justify-start">
          {/* Chip All */}
          <TouchableOpacity
            onPress={() => handleFilterChange('all')}
            className={`flex-row items-center px-4 py-2 rounded-2xl border mr-2 ${
              filter === 'all' ? 'bg-[#0B66EF] border-[#0B66EF]' : 'bg-white border-slate-100'
            }`}
          >
            <AppText className={`text-[10px] font-black ${filter === 'all' ? 'text-white' : 'text-slate-500'}`}>
              All
            </AppText>
          </TouchableOpacity>

          {/* Chip Broadcast */}
          <TouchableOpacity
            onPress={() => handleFilterChange('class')}
            className={`flex-row items-center px-4 py-2 rounded-2xl border mr-2 ${
              filter === 'class' ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-100'
            }`}
          >
            <Ionicons name="megaphone-outline" size={11} color={filter === 'class' ? '#FFFFFF' : '#F97316'} style={{ marginRight: 4 }} />
            <AppText className={`text-[10px] font-black ${filter === 'class' ? 'text-white' : 'text-slate-500'}`}>
              Broadcast
            </AppText>
          </TouchableOpacity>

          {/* Chip Personal */}
          <TouchableOpacity
            onPress={() => handleFilterChange('personal')}
            className={`flex-row items-center px-4 py-2 rounded-2xl border ${
              filter === 'personal' ? 'bg-[#0B66EF] border-[#0B66EF]' : 'bg-white border-slate-100'
            }`}
          >
            <Ionicons name="person-outline" size={11} color={filter === 'personal' ? '#FFFFFF' : '#0B66EF'} style={{ marginRight: 4 }} />
            <AppText className={`text-[10px] font-black ${filter === 'personal' ? 'text-white' : 'text-slate-500'}`}>
              Personal
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Reload Instruction label */}
        <View className="flex-row justify-center items-center py-1 mb-2">
          <Ionicons name="refresh-outline" size={11} color="#94A3B8" style={{ marginRight: 4 }} />
          <AppText className="text-[10px] text-slate-400 font-bold">
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


    </Screen>
  );
}
