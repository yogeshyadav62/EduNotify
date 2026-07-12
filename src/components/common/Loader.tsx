import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppText from './AppText';
import colors from '../../theme/colors';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loader = ({ message, fullScreen = false }: LoaderProps) => {
  const containerClass = fullScreen 
    ? 'absolute inset-0 bg-slate-50/80 items-center justify-center z-50'
    : 'flex-1 items-center justify-center p-6 bg-transparent';

  return (
    <View className={containerClass}>
      <View className="bg-white p-6 rounded-3xl items-center shadow-md border border-slate-100">
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <AppText className="text-slate-500 font-medium text-xs mt-3 text-center">
            {message}
          </AppText>
        )}
      </View>
    </View>
  );
};

export default Loader;
