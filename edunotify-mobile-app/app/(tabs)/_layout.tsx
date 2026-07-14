import React from 'react';
import { View } from 'react-native';
import BottomTabs from '../../src/navigation/tabs/BottomTabs';
import Sidebar from '../../src/navigation/sidebar/Sidebar';
import LogoutModal from '../../src/navigation/modal/LogoutModal';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <BottomTabs />
      <Sidebar />
      <LogoutModal />
    </View>
  );
}
