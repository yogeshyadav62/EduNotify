import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image, TextInput, RefreshControl, FlatList, useWindowDimensions, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import EmptyState from '../../components/common/EmptyState';
import NotificationCard from '../../components/notification/NotificationCard';
import { useNotifications } from '../../../hooks/useNotifications';
import { useLogin } from '../../../hooks/useLogin';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { showToast, setActiveModal } from '../../../redux/slices/uiSlice';
import colors from '../../../theme/colors';
import { Notification } from '../../../types/notification';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Load notifications state
  const {
    notifications,
    unreadCount,
    readNotificationIds,
    isLoading,
    isFetchingNextPage,
    filter,
    setFilter,
    markAsRead,
    refresh,
    loadMore,
    hasMore,
  } = useNotifications();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
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
          onEndReached={() => { if (hasMore && !isFetchingNextPage) loadMore(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0B66EF" />
              </View>
            ) : hasMore ? (
              <View style={{ padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600' }}>Scroll for more</Text>
              </View>
            ) : null
          }
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
          }}
          className="p-1 active:opacity-70"
        >
          <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Right Side: Profile Icon */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          className="active:opacity-70"
        >
          <View className="w-8 h-8 rounded-full overflow-hidden justify-center items-center bg-white/20">
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile summary card inside header */}
      <View className="px-5 pb-6 bg-[#0B66EF]">
        <AppText className="text-white font-black" style={{ fontSize: 28, lineHeight: 44, textTransform: 'capitalize' }}>
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


    </Screen>
  );
}
