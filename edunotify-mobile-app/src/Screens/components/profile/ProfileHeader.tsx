import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import { User } from '../../../types/auth';
import colors from '../../../theme/colors';

interface ProfileHeaderProps {
  user: User | null;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  if (!user) return null;

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm items-center mb-6">
      {/* Avatar Container */}
      <View className="relative mb-4">
        {user.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            className="w-24 h-24 rounded-full border-4 border-slate-100"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center border-4 border-slate-100">
            <Ionicons name="person" size={48} color={colors.slate[300]} />
          </View>
        )}
      </View>

      {/* Name */}
      <AppText className="text-xl font-bold text-slate-800 mb-1">
        {user.name}
      </AppText>
      
      <AppText className="text-slate-400 text-xs mb-5 font-bold uppercase tracking-wider">
        Active Student
      </AppText>

      {/* Role Specific Details Grid */}
      <View className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-row justify-around">
        <View className="items-center flex-1">
          <AppText className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Student ID</AppText>
          <AppText className="text-sm font-semibold text-slate-700">{user.studentId}</AppText>
        </View>
        
        <View className="w-[1px] bg-slate-200 h-8 self-center" />
        
        <View className="items-center flex-1">
          <AppText className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Class ID</AppText>
          <AppText className="text-sm font-semibold text-slate-700">{user.classId}</AppText>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
