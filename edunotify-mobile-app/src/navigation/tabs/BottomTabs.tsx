import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import colors from '../../theme/colors';

export const BottomTabs = () => {
  // Grab unread count from Redux to display in the tab bar badge
  const unreadCount = useAppSelector(state => {
    const user = state.auth.user;
    if (!user || !user.classId || !user.studentId) return 0;
    
    // Filter by classId and studentId (or null for broadcasts)
    const allowed = state.notifications.items.filter(item => {
      if (!item || !item.classId) return false;
      const isSameClass = item.classId.toUpperCase() === user.classId.toUpperCase();
      const isClassWide = item.studentId === null;
      const isPersonalToMe = item.studentId !== null && item.studentId.toUpperCase() === user.studentId.toUpperCase();
      return isSameClass && (isClassWide || isPersonalToMe);
    });

    // Count those not marked as read
    return allowed.filter(item => !state.notifications.readNotificationIds.includes(item.id)).length;
  });

  const activeModal = useAppSelector(state => state.ui.activeModal);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.slate[400],
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          display: activeModal ? 'none' : 'flex',
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 90 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notices',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            color: 'white',
            fontSize: 8,
            fontWeight: 'bold',
            minWidth: 15,
            height: 15,
            borderRadius: 7.5,
            lineHeight: 14,
            padding: 0,
            marginTop: -2,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'notifications' : 'notifications-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default BottomTabs;
