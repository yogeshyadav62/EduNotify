import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import colors from '../../theme/colors';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon = 'notifications-off-outline',
  actionTitle,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <View className={`flex-1 items-center justify-center p-8 bg-transparent ${className}`}>
      <View className="bg-slate-100 p-6 rounded-full mb-4">
        <Ionicons
          name={icon}
          size={48}
          color={colors.slate[400]}
        />
      </View>
      
      <AppText className="text-slate-800 text-base font-bold text-center mb-1.5">
        {title}
      </AppText>
      
      <AppText className="text-slate-500 text-xs text-center mb-6 max-w-[240px] leading-4">
        {description}
      </AppText>

      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          className="min-w-[140px]"
        />
      )}
    </View>
  );
};

export default EmptyState;
