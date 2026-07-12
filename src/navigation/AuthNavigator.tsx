import React from 'react';
import { Redirect } from 'expo-router';

export const AuthNavigator = () => {
  return <Redirect href="/(auth)/login" />;
};

export default AuthNavigator;
