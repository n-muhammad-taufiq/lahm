/**
 * Compact nearby-merchant row for the rebuilt customer home feed.
 * Uses a square thumbnail and hairline divider instead of carousel cards.
 */

import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { borderRadius, brandColors, themeColors } from '@lahm/tokens';
import type { MerchantCardProps } from './MerchantCard';

export function HomeMerchantRow({
  name,
  coverPhotoUrl,
  rating = 0,
  deliveryTimeRange = '',
  distanceKm,
  specialties = [],
  isHalalCertified = false,
  onPress,
}: MerchantCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const meta = [
    deliveryTimeRange,
    distanceKm !== undefined ? `${distanceKm.toFixed(1)} km` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center px-5 py-3 active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel={`View storefront for ${name}`}>
      <View
        className="overflow-hidden items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: borderRadius.md,
          backgroundColor: themeColors.light.backgroundElement,
          borderWidth: 1,
          borderColor: themeColors.light.border,
        }}>
        {coverPhotoUrl ? (
          <Image source={{ uri: coverPhotoUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Feather name="image" size={20} color={themeColors.light.textMuted} />
        )}
      </View>

      <View className="flex-1 ml-3 mr-2">
        <Text
          className="text-[15px] font-bold"
          numberOfLines={1}
          style={{ color: themeColors.light.text }}>
          {name}
        </Text>
        {specialties.length > 0 ? (
          <Text
            className="text-xs mt-0.5"
            numberOfLines={1}
            style={{ color: themeColors.light.textSecondary }}>
            {specialties.slice(0, 3).join(' · ')}
          </Text>
        ) : null}
        <View className="flex-row items-center mt-1">
          {isHalalCertified ? (
            <Ionicons name="shield-checkmark" size={12} color={brandColors.primary} />
          ) : null}
          {meta ? (
            <Text
              className="text-[11px]"
              style={{
                color: themeColors.light.textSecondary,
                marginLeft: isHalalCertified ? 4 : 0,
              }}>
              {isHalalCertified ? `Halal  ·  ${meta}` : meta}
            </Text>
          ) : null}
        </View>
      </View>

      {rating > 0 ? (
        <View className="flex-row items-center">
          <Ionicons name="star" size={12} color={brandColors.gold} />
          <Text
            className="text-xs font-bold ml-1"
            style={{ color: themeColors.light.text }}>
            {rating.toFixed(1)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
