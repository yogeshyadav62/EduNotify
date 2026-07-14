import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import colors from '../../../theme/colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export const ErrorState = ({
  message = 'An unexpected error occurred while loading content.',
  onRetry,
  icon = 'alert-circle-outline',
  className = '',
}: ErrorStateProps) => {
  return (
    <View className={`flex-1 items-center justify-center p-8 bg-transparent ${className}`}>
      <View className="bg-red-50 p-5 rounded-full mb-4">
        <Ionicons
          name={icon}
          size={44}
          color={colors.error}
        />
      </View>
      
      <AppText className="text-slate-800 text-base font-bold text-center mb-1.5">
        Oops! Something went wrong
      </AppText>
      
      <AppText className="text-slate-500 text-xs text-center mb-6 max-w-[240px] leading-4">
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          icon="reload"
          className="min-w-[140px]"
        />
      )}
    </View>
  );
};

export default ErrorState;
