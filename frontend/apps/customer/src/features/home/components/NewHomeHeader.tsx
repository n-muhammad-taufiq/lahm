/**
 * NewHomeHeader Component
 * 
 * Premium top delivery header for the Customer App.
 * Displays delivery location, dropdown indicator, GPS loading state,
 * and user profile/avatar action on the right.
 */

import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface NewHomeHeaderProps {
  /** Delivery address text (e.g. "Anna Nagar, Chennai") */
  address: string;
  /** Whether GPS reverse geocoding is actively resolving */
  isLocating?: boolean;
  /** User name or phone for avatar fallback */
  userName?: string | null;
  /** Callback when user taps the delivery address selector */
  onPressAddress?: () => void;
  /** Callback when user taps the profile/avatar button */
  onPressProfile?: () => void;
  /** Optional custom container style class */
  className?: string;
}

export function NewHomeHeader({
  address,
  isLocating = false,
  userName,
  onPressAddress,
  onPressProfile,
  className = '',
}: NewHomeHeaderProps) {
  const handleAddressPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressAddress?.();
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressProfile?.();
  };

  // Determine user initials if name exists
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <View className={`flex-row items-center justify-between px-5 pt-2 pb-3 bg-white ${className}`}>
      {/* 1. Location Selector (Left) */}
      <Pressable
        onPress={handleAddressPress}
        className="flex-1 mr-3 active:opacity-75"
        accessibilityRole="button"
        accessibilityLabel={`Delivery location: ${address}`}>
        <View className="flex-row items-center gap-1">
          <Text className="text-[10px] font-bold text-[#526B6B] tracking-widest uppercase">
            DELIVER TO
          </Text>
          <Ionicons name="chevron-down" size={13} color="#0C3B3B" />
        </View>

        <View className="flex-row items-center gap-1 mt-0.5">
          <Ionicons name="location-sharp" size={15} color="#0C3B3B" />
          <Text
            className="text-sm font-extrabold text-[#0F1F1F] max-w-[240px]"
            numberOfLines={1}>
            {address}
          </Text>
          {isLocating && (
            <ActivityIndicator size="small" color="#0C3B3B" className="ml-1" />
          )}
        </View>
      </Pressable>

      {/* 2. Profile / Avatar Action (Right) */}
      <Pressable
        onPress={handleProfilePress}
        className="w-10 h-10 rounded-full items-center justify-center bg-[#F7FAFA] border border-[#E2E8E8] active:bg-[#E8F2F2]"
        accessibilityRole="button"
        accessibilityLabel="Customer Account and Profile">
        {initials ? (
          <Text className="text-xs font-bold text-[#0C3B3B]">{initials}</Text>
        ) : (
          <Ionicons name="person-outline" size={18} color="#0C3B3B" />
        )}
      </Pressable>
    </View>
  );
}
