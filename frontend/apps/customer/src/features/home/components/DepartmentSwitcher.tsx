/**
 * DepartmentSwitcher Component
 * 
 * Sleek 44dp segmented capsule track allowing customers to toggle between
 * commercial departments (Meat Shops, Restaurants, Groceries).
 * Features elevated active pill, stroke vector icons, and tactile haptic feedback.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type DepartmentId = 'meats' | 'restaurants' | 'groceries';

export interface DepartmentItem {
  id: DepartmentId;
  label: string;
}

export interface DepartmentSwitcherProps {
  /** Currently active department */
  activeDepartment: DepartmentId;
  /** Callback fired when a department tab is pressed */
  onChangeDepartment: (id: DepartmentId) => void;
  /** Optional custom container style class */
  className?: string;
}

const DEPARTMENTS: { id: DepartmentId; label: string }[] = [
  { id: 'meats', label: 'Meat Shops' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'groceries', label: 'Groceries' },
];

export function DepartmentSwitcher({
  activeDepartment,
  onChangeDepartment,
  className = '',
}: DepartmentSwitcherProps) {
  const handlePress = (id: DepartmentId) => {
    if (id !== activeDepartment) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeDepartment(id);
    }
  };

  const renderIcon = (id: DepartmentId, isActive: boolean) => {
    const color = isActive ? '#FFFFFF' : '#526B6B';
    const size = 15;

    switch (id) {
      case 'meats':
        // Halal Quality Shield icon (avoiding animal / living creature depictions)
        return <Ionicons name="shield-checkmark-outline" size={size} color={color} />;
      case 'restaurants':
        // Dining Cutlery icon
        return <Ionicons name="restaurant-outline" size={size} color={color} />;
      case 'groceries':
        // Shopping Bag icon
        return <Feather name="shopping-bag" size={size} color={color} />;
    }
  };

  return (
    <View className={`px-5 pt-1 pb-3 bg-white ${className}`}>
      <View className="flex-row items-center h-11 p-1 rounded-xl bg-[#F7FAFA] border border-[#E2E8E8]">
        {DEPARTMENTS.map((dept) => {
          const isActive = dept.id === activeDepartment;

          return (
            <Pressable
              key={dept.id}
              onPress={() => handlePress(dept.id)}
              className={`flex-1 h-full flex-row items-center justify-center rounded-lg transition-all ${
                isActive ? 'bg-[#0C3B3B] shadow-xs' : 'bg-transparent'
              }`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${dept.label} tab`}>
              {renderIcon(dept.id, isActive)}
              <Text
                className={`ml-1.5 text-xs ${
                  isActive ? 'font-bold text-white' : 'font-medium text-[#526B6B]'
                }`}>
                {dept.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
