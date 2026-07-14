import React from 'react';
import { View } from 'react-native';
import AppText from './AppText';

interface BadgeProps {
  value: string | number;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({
  value,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) => {
  let badgeClass = 'items-center justify-center rounded-full ';
  let textClass = 'font-bold text-center ';

  if (variant === 'primary') {
    badgeClass += 'bg-blue-600';
    textClass += 'text-white';
  } else if (variant === 'danger') {
    badgeClass += 'bg-red-600';
    textClass += 'text-white';
  } else if (variant === 'success') {
    badgeClass += 'bg-green-600';
    textClass += 'text-white';
  } else if (variant === 'warning') {
    badgeClass += 'bg-amber-500';
    textClass += 'text-white';
  } else if (variant === 'slate') {
    badgeClass += 'bg-slate-200';
    textClass += 'text-slate-700';
  }

  if (size === 'sm') {
    badgeClass += ' min-w-[16px] h-4 px-1';
    textClass += ' text-[9px] leading-3';
  } else {
    badgeClass += ' min-w-[22px] h-[22px] px-1.5';
    textClass += ' text-[11px] leading-4';
  }

  return (
    <View className={`${badgeClass} ${className}`}>
      <AppText className={textClass}>
        {value}
      </AppText>
    </View>
  );
};

export default Badge;
