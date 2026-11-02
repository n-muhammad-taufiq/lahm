/**
 * HomeNearbyList
 *
 * Vertical nearby-merchant feed for the selected department.
 * Handles shimmer loading, empty, error, and success states.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { brandColors, themeColors } from '@lahm/tokens';
import { MerchantCard, type MerchantCardProps } from './MerchantCard';
import { SkeletonCard } from './SkeletonCard';

export interface HomeNearbyListProps {
  title: string;
  merchants: MerchantCardProps[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPressMerchant?: (merchant: MerchantCardProps) => void;
}

export function HomeNearbyList({
  title,
  merchants,
  isLoading = false,
  error = null,
  onRetry,
  onPressMerchant,
}: HomeNearbyListProps) {
  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRetry?.();
  };

  return (
    <View className="pt-4 pb-2">
      <View className="px-5 pb-2.5">
        <Text
          className="text-base font-extrabold"
          style={{ color: themeColors.light.text }}>
          {title}
        </Text>
      </View>

      {error ? (
        <View
          className="mx-5 rounded-md border px-4 py-4"
          style={{
            backgroundColor: themeColors.light.errorBg,
            borderColor: themeColors.light.errorBorder,
          }}>
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: themeColors.light.errorText }}>
            {error}
          </Text>
          <Pressable
            onPress={handleRetry}
            className="self-start rounded-md px-4 py-2 active:opacity-80"
            style={{ backgroundColor: brandColors.primary }}
            accessibilityRole="button"
            accessibilityLabel="Retry nearby merchants">
            <Text className="text-xs font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View className="px-5" style={{ gap: 16 }}>
          <SkeletonCard cardWidth="100%" />
          <SkeletonCard cardWidth="100%" />
        </View>
      ) : merchants.length === 0 ? (
        <View className="mx-5 items-center py-10 px-4">
          <Ionicons name="storefront-outline" size={28} color={brandColors.primary} />
          <Text
            className="mt-3 text-sm font-bold text-center"
            style={{ color: themeColors.light.text }}>
            No stores nearby in this department
          </Text>
          <Text
            className="mt-1 text-xs text-center"
            style={{ color: themeColors.light.textSecondary }}>
            Pull to refresh or try another department.
          </Text>
        </View>
      ) : (
        <View className="px-5" style={{ gap: 16 }}>
          {merchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              {...merchant}
              cardWidth="100%"
              onPress={() => onPressMerchant?.(merchant)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
