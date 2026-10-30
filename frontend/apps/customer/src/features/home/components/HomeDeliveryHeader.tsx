/**
 * HomeDeliveryHeader Component
 * 
 * Top delivery location switcher and notification entrypoint for the Customer App.
 * Built with @expo/vector-icons, tactile haptic feedback, and design tokens.
 */

import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface HomeDeliveryHeaderProps {
  /** Optional address tag / label (e.g. "Home", "Work", "Office") */
  label?: string;
  /** Street address or locality (e.g. "Anna Nagar, Chennai") */
  address: string;
  /** Whether GPS coordinate resolution is currently in-flight */
  isLocating?: boolean;
  /** Shows unread badge indicator dot on notification bell */
  hasUnreadNotifications?: boolean;
  /** Callback triggered when customer taps the delivery address selector */
  onPressAddress?: () => void;
  /** Callback triggered when customer taps the notification bell */
  onPressNotifications?: () => void;
}

export function HomeDeliveryHeader({
  label = 'Home',
  address,
  isLocating = false,
  hasUnreadNotifications = false,
  onPressAddress,
  onPressNotifications,
}: HomeDeliveryHeaderProps) {
  const handleAddressPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressAddress?.();
  };

  const handleNotificationsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressNotifications?.();
  };

  const displayAddress = label ? `${label} - ${address}` : address;

  return (
    <View className="flex-row items-center justify-between px-5 pt-1 pb-3 bg-white">
      {/* Delivery Location Selector */}
      <Pressable
        onPress={handleAddressPress}
        className="flex-1 mr-3 active:opacity-75"
        accessibilityRole="button"
        accessibilityLabel={`Deliver to: ${displayAddress}`}>
        <Text className="text-[10px] font-bold text-[#526B6B] tracking-widest uppercase">
          DELIVER TO:
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <Text className="text-base font-bold text-[#0F1F1F]" numberOfLines={1}>
            {displayAddress}
          </Text>
          <Ionicons name="location-sharp" size={16} color="#0C3B3B" />
          <Ionicons name="chevron-down" size={14} color="#0C3B3B" />
          {isLocating ? (
            <ActivityIndicator size="small" color="#0C3B3B" className="ml-1" />
          ) : null}
        </View>
      </Pressable>

      {/* Notification Bell Button */}
      <Pressable
        onPress={handleNotificationsPress}
        className="w-10 h-10 rounded-full items-center justify-center bg-[#F7FAFA] border border-[#E2E8E8] active:bg-[#E8F2F2] relative"
        accessibilityRole="button"
        accessibilityLabel="Notifications">
        <Feather name="bell" size={20} color="#0C3B3B" />
        {hasUnreadNotifications ? (
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0C3B3B]" />
        ) : null}
      </Pressable>
    </View>
  );
}
