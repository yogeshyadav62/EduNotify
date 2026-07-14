import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import Badge from '../common/Badge';
import colors from '../../../theme/colors';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  title?: string;
}

export const NotificationHeader = ({
  unreadCount,
  onMarkAllAsRead,
  title = 'Notifications',
}: NotificationHeaderProps) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-100">
      <View className="flex-row items-center">
        <AppText className="text-xl font-bold text-slate-900 mr-2.5">
          {title}
        </AppText>
        {unreadCount > 0 && (
          <Badge value={unreadCount} variant="danger" size="sm" />
        )}
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={onMarkAllAsRead}
          className="flex-row items-center bg-blue-50/50 active:bg-blue-100/50 px-3 py-1.5 rounded-full"
        >
          <Ionicons
            name="checkmark-done"
            size={14}
            color={colors.primary}
            style={{ marginRight: 4 }}
          />
          <AppText className="text-[11px] font-bold text-blue-600">
            Mark all read
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NotificationHeader;
