import React from 'react';
import { View } from 'react-native';
import { Link, Stack } from 'expo-router';
import AppText from '../src/Screens/components/common/AppText';
import colors from '../src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-6 bg-slate-50">
        <AppText className="text-xl font-bold text-slate-800 mb-2">
          This screen doesn't exist.
        </AppText>
        
        <Link href="/(tabs)/home" className="mt-4 py-3">
          <AppText className="text-blue-600 font-bold text-sm">
            Go to home screen!
          </AppText>
        </Link>
      </View>
    </>
  );
}
