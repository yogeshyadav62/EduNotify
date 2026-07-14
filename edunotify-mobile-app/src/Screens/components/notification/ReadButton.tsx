import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';

interface ReadButtonProps {
  onPress: () => void;
  isRead: boolean;
  className?: string;
}

export const ReadButton = ({ onPress, isRead, className = '' }: ReadButtonProps) => {
  if (isRead) return null;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full active:opacity-75 ${className}`}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons 
        name="checkmark-done" 
        size={16} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );
};

export default ReadButton;
