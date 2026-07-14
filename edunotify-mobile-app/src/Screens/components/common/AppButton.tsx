import React from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import colors from '../../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
  textClassName?: string;
}

export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  textClassName = '',
}: AppButtonProps) => {
  let btnClass = 'flex-row items-center justify-center py-3.5 px-6 rounded-2xl active:opacity-80 ';
  let textClass = 'font-semibold text-center text-sm ';

  if (variant === 'primary') {
    btnClass += 'bg-blue-600';
    textClass += 'text-white';
  } else if (variant === 'secondary') {
    btnClass += 'bg-blue-700';
    textClass += 'text-white';
  } else if (variant === 'outline') {
    btnClass += 'bg-transparent border border-slate-300';
    textClass += 'text-slate-700';
  } else if (variant === 'danger') {
    btnClass += 'bg-red-600';
    textClass += 'text-white';
  } else if (variant === 'ghost') {
    btnClass += 'bg-transparent';
    textClass += 'text-blue-600';
  }

  if (disabled || loading) {
    btnClass += ' opacity-50';
  }

  return (
    <TouchableOpacity
      className={`${btnClass} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'} 
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'outline' || variant === 'ghost' ? colors.slate[700] : '#FFFFFF'}
              style={{ marginRight: 6 }}
            />
          )}
          
          <AppText className={`${textClass} ${textClassName}`}>
            {title}
          </AppText>

          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'outline' || variant === 'ghost' ? colors.slate[700] : '#FFFFFF'}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
