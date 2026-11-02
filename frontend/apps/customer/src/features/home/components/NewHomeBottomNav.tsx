/**
 * NewHomeBottomNav Component
 * 
 * Sleek bottom navigation bar for the Customer App.
 * Displays 4 primary tabs: Home, Search, Orders, Account.
 * Anchored to the viewport bottom with safe area insets and tactile feedback.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type CustomerTabId = 'home' | 'search' | 'orders' | 'account';

export interface NewHomeBottomNavProps {
  /** Currently active tab ID */
  activeTab?: CustomerTabId;
  /** Callback triggered when a tab is pressed */
  onTabPress?: (tab: CustomerTabId) => void;
  /** Optional container style class */
  className?: string;
}

interface TabConfig {
  id: CustomerTabId;
  label: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    renderIcon: (isActive) =>
      isActive ? (
        <Ionicons name="home" size={20} color="#0C3B3B" />
      ) : (
        <Ionicons name="home-outline" size={20} color="#71717A" />
      ),
  },
  {
    id: 'search',
    label: 'Search',
    renderIcon: (isActive) => (
      <Feather name="search" size={20} color={isActive ? '#0C3B3B' : '#71717A'} />
    ),
  },
  {
    id: 'orders',
    label: 'Orders',
    renderIcon: (isActive) => (
      <Feather name="package" size={20} color={isActive ? '#0C3B3B' : '#71717A'} />
    ),
  },
  {
    id: 'account',
    label: 'Account',
    renderIcon: (isActive) => (
      <Feather name="user" size={20} color={isActive ? '#0C3B3B' : '#71717A'} />
    ),
  },
];

export function NewHomeBottomNav({
  activeTab = 'home',
  onTabPress,
  className = '',
}: NewHomeBottomNavProps) {
  const insets = useSafeAreaInsets();

  const handlePress = (tabId: CustomerTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress?.(tabId);
  };

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
      }}
      className={`bg-white border-t border-[#E2E8E8] ${className}`}>
      <View className="flex-row items-center justify-around h-14 px-2">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              onPress={() => handlePress(tab.id)}
              className="flex-1 items-center justify-center py-1 active:opacity-75"
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}>
              <View className="items-center justify-center h-6">
                {tab.renderIcon(isActive)}
              </View>
              <Text
                className={`text-[11px] mt-1 ${
                  isActive
                    ? 'font-extrabold text-[#0C3B3B]'
                    : 'font-medium text-[#71717A]'
                }`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
