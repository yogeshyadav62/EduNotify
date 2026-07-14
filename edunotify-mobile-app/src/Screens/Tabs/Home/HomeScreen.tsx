import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import NotificationCard from '../../components/notification/NotificationCard';
import { useNotifications } from '../../../hooks/useNotifications';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { setActiveModal } from '../../../redux/slices/uiSlice';
import { Notification } from '../../../types/notification';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const {
    notifications,
    unreadCount,
    readNotificationIds,
    isLoading,
    markAsRead,
    refresh,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  // Pull down to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const recentNotices = notifications.slice(0, 3);
  const noticesWithAttachments = notifications.filter(n => n.attachmentUrl).slice(0, 4);

  const handleCardPress = (notification: Notification) => {
    router.push({
      pathname: '/notification-detail',
      params: { id: notification.id }
    });
    if (!readNotificationIds.includes(notification.id)) {
      markAsRead(notification.id);
    }
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
      <View className="px-5 pb-4 bg-[#0B66EF]">
        <AppText className="text-white font-black" style={{ fontSize: 20, lineHeight: 28, textTransform: 'capitalize' }}>
          Hello, {user?.name?.split(' ')[0] || 'Student'} 👋
        </AppText>
        <AppText className="text-white/80 text-[11px] font-semibold mt-1">
          Class: {user?.classId || 'N/A'}  |  Student: {user?.studentId || 'N/A'}
        </AppText>
      </View>

      {/* 2. OVERLAY CONTAINER (White card overlapping header) */}
      <View className="flex-1 bg-white rounded-t-[36px] -mt-2 pt-6 shadow-2xl">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0B66EF']}
              tintColor="#0B66EF"
            />
          }
        >
          {/* STATS GRID */}
          <View className="flex-row px-5 mb-4 justify-between">
            {/* Card 1: Unread */}
            <View className="bg-red-50 border border-red-100 rounded-2xl p-2.5 flex-1 mr-2 items-center justify-center shadow-sm">
              <View className="bg-red-100 w-7 h-7 rounded-full items-center justify-center mb-1">
                <Ionicons name="mail-unread-outline" size={14} color="#EF4444" />
              </View>
              <AppText className="text-red-700 text-base font-black">{unreadCount}</AppText>
              <AppText className="text-red-500 text-[9px] font-bold">Unread Logs</AppText>
            </View>

            {/* Card 2: Total Announcements */}
            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-2.5 flex-1 mr-2 items-center justify-center shadow-sm">
              <View className="bg-blue-100 w-7 h-7 rounded-full items-center justify-center mb-1">
                <Ionicons name="megaphone-outline" size={14} color="#0B66EF" />
              </View>
              <AppText className="text-blue-700 text-base font-black">{notifications.length}</AppText>
              <AppText className="text-blue-500 text-[9px] font-bold">Total Notices</AppText>
            </View>

            {/* Card 3: Class ID */}
            <View className="bg-purple-50 border border-purple-100 rounded-2xl p-2.5 flex-1 items-center justify-center shadow-sm">
              <View className="bg-purple-100 w-7 h-7 rounded-full items-center justify-center mb-1">
                <Ionicons name="school-outline" size={14} color="#8B5CF6" />
              </View>
              <AppText className="text-purple-700 text-xs font-black" numberOfLines={1}>{user?.classId || 'N/A'}</AppText>
              <AppText className="text-purple-500 text-[9px] font-bold mt-1">Class Code</AppText>
            </View>
          </View>

          {/* QUICK LINKS / ACTION BADGES */}
          <View className="flex-row px-5 mb-4 justify-between gap-2.5">
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/notifications')}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl flex-row items-center justify-center py-2 shadow-sm active:bg-slate-100"
            >
              <Ionicons name="chatbubbles-outline" size={14} color="#475569" style={{ marginRight: 6 }} />
              <AppText className="text-slate-700 text-xs font-bold">Open Hub</AppText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl flex-row items-center justify-center py-2 shadow-sm active:bg-slate-100"
            >
              <Ionicons name="person-outline" size={14} color="#475569" style={{ marginRight: 6 }} />
              <AppText className="text-slate-700 text-xs font-bold">View Profile</AppText>
            </TouchableOpacity>
          </View>

          {/* RECENT NOTICES SECTION */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center px-5 mb-2.5">
              <AppText className="text-slate-800 text-sm font-black">
                Recent Announcements
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
                <AppText className="text-[#0B66EF] text-[11px] font-bold">
                  View All
                </AppText>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="py-10 justify-center items-center">
                <ActivityIndicator size="small" color="#0B66EF" />
              </View>
            ) : recentNotices.length === 0 ? (
              <View className="mx-5 bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-8 px-4 items-center justify-center">
                <Ionicons name="notifications-off-outline" size={32} color="#94A3B8" />
                <AppText className="text-slate-400 text-xs font-bold mt-2">No active announcements</AppText>
              </View>
            ) : (
              recentNotices.map((item, index) => (
                <NotificationCard
                  key={item.id}
                  notification={item}
                  index={index}
                  isRead={readNotificationIds.includes(item.id)}
                  onPress={() => handleCardPress(item)}
                  onMarkAsRead={() => markAsRead(item.id)}
                />
              ))
            )}
          </View>

          {/* RECENT FILES & ATTACHMENTS SECTION */}
          <View className="mb-4">
            <View className="px-5 mb-2.5">
              <AppText className="text-slate-800 text-sm font-black">
                Important Attachments
              </AppText>
            </View>
            {isLoading ? (
              <View className="py-6 justify-center items-center">
                <ActivityIndicator size="small" color="#0B66EF" />
              </View>
            ) : noticesWithAttachments.length === 0 ? (
              <View className="mx-5 bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-6 px-4 items-center justify-center">
                <Ionicons name="attach-outline" size={24} color="#94A3B8" />
                <AppText className="text-slate-400 text-[10px] font-bold mt-1">No attachments available</AppText>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
              >
                {noticesWithAttachments.map((item) => {
                  const isPdf = item.attachmentType === 'application/pdf';
                  const isImage = item.attachmentType?.startsWith('image/');
                  
                  return (
                    <TouchableOpacity
                      key={`att-${item.id}`}
                      onPress={() => {
                        if (item.attachmentUrl) {
                          Linking.openURL(item.attachmentUrl).catch(err => console.error("Couldn't open URL", err));
                        }
                      }}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 w-36 mr-2.5 shadow-sm active:bg-slate-100"
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className={`w-7 h-7 rounded-lg items-center justify-center ${isPdf ? 'bg-red-100' : isImage ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <Ionicons 
                            name={isPdf ? 'document-text' : isImage ? 'image' : 'attach'} 
                            size={14} 
                            color={isPdf ? '#DC2626' : isImage ? '#16A34A' : '#2563EB'} 
                          />
                        </View>
                        <AppText className="text-[8px] font-bold text-slate-400 uppercase">{item.category}</AppText>
                      </View>
                      
                      <AppText className="text-slate-800 text-[10px] font-black mb-1 leading-3.5" numberOfLines={2}>
                        {item.title}
                      </AppText>
                      
                      <AppText className="text-blue-600 text-[8px] font-bold">
                        Tap to download
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
