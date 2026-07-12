import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle, Platform } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import colors from '../../theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
}

export const Screen = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
  backgroundColor = colors.background,
  statusBarColor = colors.background,
  statusBarStyle = 'dark-content',
}: ScreenProps) => {
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }]} 
      edges={edges}
    >
      <StatusBar 
        backgroundColor={statusBarColor} 
        barStyle={statusBarStyle}
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.inner, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default Screen;
