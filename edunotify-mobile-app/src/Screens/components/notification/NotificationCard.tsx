import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutLeft } from 'react-native-reanimated';
import AppText from '../common/AppText';
import { Notification } from '../../../types/notification';
import { formatRelativeTime } from '../../../utils/date';
import colors from '../../../theme/colors';

interface NotificationCardProps {
  notification: Notification;
  index: number;
  isRead: boolean;
  onPress: () => void;
  onMarkAsRead: () => void;
}

export const NotificationCard = ({
  notification,
  index,
  isRead,
  onPress,
  onMarkAsRead,
}: NotificationCardProps) => {
  const isPersonal = notification.studentId !== null;

  // Mock faculty images or avatar initials
  const getFacultyAvatar = (name: string) => {
    if (name.includes('Sharma') || name.includes('Malhotra')) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60';
    } else if (name.includes('Rao') || name.includes('Desai')) {
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60';
    } else if (name.includes('Kulkarni')) {
      return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=60';
    } else if (name.includes('Office') || name.includes('Desk') || name.includes('Cell') || name.includes('Coordinator')) {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=60';
    }
    return null;
  };

  const avatarUrl = getFacultyAvatar(notification.facultyName);

  return (
    <Animated.View
      entering={FadeInUp.delay(Math.min(index * 50, 300)).duration(350)}
      exiting={FadeOutLeft.duration(200)}
      className="mb-2.5 px-5"
    >
      <TouchableOpacity
        onPress={onPress}
        className={`bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm flex-row items-center ${isRead ? 'opacity-70' : ''
          }`}
        activeOpacity={0.7}
      >
        {/* Left Side: Circular Type Icon (Compact Indicator) */}
        <View
          className={`w-9 h-9 rounded-full items-center justify-center mr-2.5 ${isPersonal ? 'bg-blue-50' : 'bg-orange-50'
            }`}
        >
          <Ionicons
            name={isPersonal ? 'person' : 'volume-high'}
            size={16}
            color={isPersonal ? '#0B66EF' : '#F97316'}
          />
        </View>

        {/* Right Side: Column Content */}
        <View className="flex-1">
          {/* Top Row: Category Label */}
          <View className="flex-row justify-between items-center mb-0.5">
            <AppText
              className={`text-[7px] font-black uppercase tracking-widest ${isPersonal ? 'text-blue-600' : 'text-orange-500'
                }`}
            >
              {isPersonal ? 'PERSONAL' : 'BROADCAST'}
            </AppText>
          </View>

          {/* Middle Row: Title & Description */}
          <View className="mb-1.5">
            <AppText className="text-slate-800 text-[11px] font-bold mb-0.5 leading-3.5" numberOfLines={1}>
              {notification.title}
            </AppText>
            <AppText
              numberOfLines={1}
              className="text-slate-500 text-[9px] leading-3"
            >
              {notification.description}
            </AppText>
          </View>

          {/* Bottom Row: Faculty & Time */}
          <View className="flex-row justify-between items-center border-t border-slate-50 pt-1.5">
            <View className="flex-row items-center">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-4 h-4 rounded-full mr-1.5 border border-slate-100"
                />
              ) : (
                <View className="bg-slate-100 w-4 h-4 rounded-full mr-1.5 items-center justify-center border border-slate-100">
                  <Ionicons name="person" size={8} color={colors.slate[400]} />
                </View>
              )}
              <AppText className="text-[8px] font-bold text-slate-500">
                {notification.facultyName}
              </AppText>
            </View>

            <View className="flex-row items-center">
              <AppText className="text-[7.5px] text-slate-400 font-bold mr-1">
                {formatRelativeTime(notification.dateTime)}
              </AppText>
              <Ionicons
                name={(notification.isSeen || isRead) ? "checkmark-done" : (notification.isDelivered ? "checkmark-done" : "checkmark")}
                size={12}
                color={(notification.isSeen || isRead) ? "#0B66EF" : "#94A3B8"}
              />
            </View>
          </View>
        </View>

      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationCard;
