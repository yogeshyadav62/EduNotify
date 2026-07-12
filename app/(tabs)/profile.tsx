import React, { useState } from 'react';
import { View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/common/Screen';
import AppText from '../../src/components/common/AppText';
import ProfileHeader from '../../src/components/profile/ProfileHeader';
import LogoutButton from '../../src/components/profile/LogoutButton';
import { useRouter } from 'expo-router';
import { useLogin } from '../../src/hooks/useLogin';
import colors from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useLogin();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const getStudentInitials = () => {
    if (!user?.name) return 'Y';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Screen backgroundColor="#0B66EF">
      {/* SOLID BLUE HEADER */}
      <View className="pt-4 pb-12 px-5 bg-[#0B66EF] flex-row justify-between items-start z-10">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-3 p-1 -ml-1 active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText className="text-xl font-black text-white">Profile</AppText>
        </View>
        <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
      </View>

      {/* OVERLAY WRAPPER */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white rounded-t-[36px]"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 }}
      >
        {/* Profile Circle Avatar / Name (Screen 8 style) */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-blue-50 border-4 border-slate-50 justify-center items-center mb-3.5 shadow-sm">
            <AppText className="text-3xl font-black text-[#0B66EF]">
              {getStudentInitials()}
            </AppText>
          </View>
          <AppText className="text-xl font-black text-slate-800 mb-1">
            {user?.name || 'Yogesh Yadav'}
          </AppText>
          <AppText className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {user?.studentId || 'STU-101'} | {user?.classId || 'CS-202'}
          </AppText>
        </View>

        {/* Details Grid (Screen 8 details) */}
        <View className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Student ID</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.studentId || 'STU-101'}</AppText>
          </View>

          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Class ID</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.classId || 'CS-202'}</AppText>
          </View>

          <View className="flex-row justify-between items-center py-2.5">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Email (Optional)</AppText>
            <AppText className="text-xs font-bold text-slate-700">
              {user?.name ? `${user.name.toLowerCase().replace(' ', '')}@example.com` : 'yogesh@example.com'}
            </AppText>
          </View>
        </View>

        {/* Preferences */}
        <AppText className="text-slate-500 font-black text-[9px] uppercase tracking-wider mb-3 ml-1">
          Notification Settings
        </AppText>

        <View className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-6">
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-50">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-blue-50 p-2 rounded-xl mr-3">
                <Ionicons name="phone-portrait-outline" size={18} color="#0B66EF" />
              </View>
              <View className="flex-1">
                <AppText className="text-xs font-bold text-slate-800">Push Notifications</AppText>
                <AppText className="text-[9px] text-slate-400 mt-0.5 leading-4" numberOfLines={2}>Receive alerts on lockscreen</AppText>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.slate[200], true: '#93C5FD' }}
              thumbColor={pushEnabled ? '#0B66EF' : colors.slate[300]}
            />
          </View>

          <View className="flex-row justify-between items-center py-2.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-orange-50 p-2 rounded-xl mr-3">
                <Ionicons name="mail-outline" size={18} color="#F97316" />
              </View>
              <View className="flex-1">
                <AppText className="text-xs font-bold text-slate-800">Email Digests</AppText>
                <AppText className="text-[9px] text-slate-400 mt-0.5 leading-4" numberOfLines={2}>Receive weekly digests</AppText>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.slate[200], true: '#FED7AA' }}
              thumbColor={emailAlerts ? '#F97316' : colors.slate[300]}
            />
          </View>
        </View>

        {/* Support items */}
        <View className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-8">
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl mr-3 bg-blue-50">
                <Ionicons name="help-circle-outline" size={18} color="#0B66EF" />
              </View>
              <AppText className="text-xs font-bold text-slate-700">Help & Support</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate[300]} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl mr-3 bg-slate-50">
                <Ionicons name="information-circle-outline" size={18} color={colors.slate[500]} />
              </View>
              <AppText className="text-xs font-bold text-slate-700">About EduNotify</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate[300]} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <LogoutButton onPress={logout} />
      </ScrollView>
    </Screen>
  );
}
