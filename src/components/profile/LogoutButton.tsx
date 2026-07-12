import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import colors from '../../theme/colors';

interface LogoutButtonProps {
  onPress: () => void;
  className?: string;
}

export const LogoutButton = ({ onPress, className = '' }: LogoutButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full bg-red-50 hover:bg-red-100 border border-red-100 rounded-2xl px-5 py-4 flex-row justify-between items-center active:opacity-75 ${className}`}
    >
      <View className="flex-row items-center">
        <View className="bg-red-500/10 p-2 rounded-xl mr-4">
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.error}
          />
        </View>
        <AppText className="text-red-600 font-bold text-sm">
          Log Out Account
        </AppText>
      </View>
      
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.error}
        style={{ opacity: 0.6 }}
      />
    </TouchableOpacity>
  );
};

export default LogoutButton;
