import React from 'react';
import { Stack } from 'expo-router';

export const RootNavigator = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default RootNavigator;
