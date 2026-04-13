import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

import HomeOutlineIcon from '@/assets/icons/home-outline.svg';
import HomeIcon from '@/assets/icons/home.svg';
import ReceiptOutlineIcon from '@/assets/icons/receipt-outline.svg';
import ReceiptIcon from '@/assets/icons/receipt.svg';
import SettingsOutlineIcon from '@/assets/icons/settings-outline.svg';
import SettingsIcon from '@/assets/icons/settings.svg';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8E8E93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c1c1e' : '#fff',
          borderTopColor: isDark ? '#333' : '#e0e0e0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <HomeIcon width={24} height={24} fill={color} />
              : <HomeOutlineIcon width={24} height={24} stroke={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <ReceiptIcon width={24} height={24} fill={color} />
              : <ReceiptOutlineIcon width={24} height={24} stroke={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            focused
              ? <SettingsIcon width={24} height={24} fill={color} />
              : <SettingsOutlineIcon width={24} height={24} stroke={color} />
          ),
        }}
      />
    </Tabs>
  );
}
