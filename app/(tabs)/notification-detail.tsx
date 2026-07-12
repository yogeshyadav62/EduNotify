import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../src/redux/hooks';
import { formatRelativeTime } from '../../src/utils/date';
import AppText from '../../src/components/common/AppText';
import Screen from '../../src/components/common/Screen';
import colors from '../../src/theme/colors';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notifications = useAppSelector(state => state.notifications.items);
  const notification = notifications.find(n => n.id === id);

  if (!notification) {
    return (
      <Screen backgroundColor="#F8FAFC">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <AppText className="text-slate-800 text-lg font-black mt-4">Notice Not Found</AppText>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#0B66EF] px-6 py-2.5 rounded-xl">
            <AppText className="text-white font-bold text-xs">Go Back</AppText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const isPersonal = notification.studentId !== null;

  return (
    <Screen backgroundColor="#0B66EF">
      {/* 1. SOLID BLUE HEADER SECTION */}
      <View className="pt-3 pb-4 px-5 bg-[#0B66EF] flex-row items-center z-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-3 p-1 rounded-xl bg-white/10 active:opacity-75"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <AppText className="text-lg font-black text-white">Notice Details</AppText>
      </View>

      {/* 2. OVERLAY CONTAINER (White card layout) */}
      <View className="flex-1 bg-slate-50 rounded-t-[36px] mt-0 pt-6 shadow-2xl">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {/* Main Notice Card */}
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5">
            {/* Category Indicator and Date */}
            <View className="flex-row justify-between items-center mb-4">
              <View 
                className={`px-3 py-1.5 rounded-xl ${
                  isPersonal ? 'bg-blue-50' : 'bg-orange-50'
                }`}
              >
                <AppText 
                  className={`text-[9px] font-extrabold uppercase tracking-widest ${
                    isPersonal ? 'text-blue-700' : 'text-orange-700'
                  }`}
                >
                  {isPersonal ? 'PERSONAL' : 'BROADCAST'}
                </AppText>
              </View>
              <AppText className="text-slate-400 text-[10px] font-bold">
                {formatRelativeTime(notification.dateTime)}
              </AppText>
            </View>

            {/* Title */}
            <AppText className="text-base font-black text-slate-800 mb-4 leading-6">
              {notification.title}
            </AppText>

            {/* Description */}
            <AppText className="text-slate-600 text-xs leading-5 mb-2">
              {notification.description}
            </AppText>
          </View>

          {/* Details Table Card */}
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <AppText className="text-slate-800 text-xs font-black mb-3">Notice Information</AppText>
            
            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Faculty</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">{notification.facultyName}</AppText>
            </View>
            
            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Class ID</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">{notification.classId}</AppText>
            </View>
            
            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Audience</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">
                {notification.studentId ? `Individual (${notification.studentId})` : 'All Students (Class-wide)'}
              </AppText>
            </View>

            <View className="flex-row justify-between py-2.5">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">
                {new Date(notification.dateTime).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(notification.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
