/**
 * ShopIdentityCard Component
 * 
 * Displays merchant branding, verified halal trust badges, star rating,
 * operational hours, and vertical-specific assurance tags.
 * 
 * Strict styling constraints:
 * - Rule 8: Strictly rounded-md and rounded-full (no 2xl/3xl).
 * - Rule 10: Concise and modular (<150 lines).
 * - Rule 1: Zero mock data fallbacks.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { MerchantCategoryDto } from '@lahm/api';

export interface ShopIdentityCardProps {
  shopName?: string;
  description?: string;
  rating?: number;
  isVerified?: boolean;
  city?: string;
  openingTime?: string;
  closingTime?: string;
  hasHalalCertificate?: boolean;
  hasFssaiCertificate?: boolean;
  categories?: MerchantCategoryDto[];
  vertical?: 'meats' | 'restaurants' | 'groceries';
  activeOutletName?: string;
  onPressBranchSelector?: () => void;
  className?: string;
}

export function ShopIdentityCard({
  shopName,
  description,
  rating = 0,
  isVerified = false,
  city,
  openingTime: _openingTime,
  closingTime,
  hasHalalCertificate = false,
  hasFssaiCertificate = false,
  categories,
  vertical: _vertical,
  activeOutletName,
  onPressBranchSelector,
  className = '',
}: ShopIdentityCardProps) {
  if (!shopName) {
    return null;
  }

  const categoryNames =
    categories && categories.length > 0
      ? categories.map((c) => c.name).join(' • ')
      : null;

  return (
    <View className={`bg-white px-5 pt-2 pb-3.5 border-b border-zinc-100 items-center ${className}`}>
      {/* 1. Centered Accented Store Title */}
      <Text
        numberOfLines={2}
        className="text-[22px] font-display text-zinc-900 text-center tracking-tight leading-7 px-2">
        {shopName}
      </Text>

      {/* 2. Centered Store Description / Cuisines Subtitle */}
      {description ? (
        <Text
          numberOfLines={3}
          className="text-xs font-primary text-zinc-500 text-center max-w-[320px] mt-1 leading-relaxed">
          {description}
        </Text>
      ) : categoryNames ? (
        <Text
          numberOfLines={2}
          className="text-xs font-primary-medium text-zinc-500 text-center max-w-[300px] mt-1 leading-normal">
          {categoryNames}
        </Text>
      ) : null}

      {/* 2.5 Branch Selector: Plain text with small down arrow (no badge/pill) */}
      {activeOutletName ? (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPressBranchSelector?.();
          }}
          hitSlop={8}
          className="flex-row items-center justify-center mt-1.5 active:opacity-60">
          <Text className="text-xs font-primary-semibold text-zinc-700">
            {activeOutletName}
          </Text>
          {onPressBranchSelector ? (
            <Ionicons name="chevron-down" size={13} color="#71717A" style={{ marginLeft: 3 }} />
          ) : null}
        </Pressable>
      ) : null}

      {/* 3. Centered Minimalist Metadata Text Row: Rating • City • Hours */}
      <View className="flex-row items-center justify-center flex-wrap mt-2">
        {rating > 0 && (
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#D97706" />
            <Text className="text-xs font-primary-bold text-zinc-800 ml-1">
              {rating.toFixed(1)}
            </Text>
          </View>
        )}

        {city ? (
          <View className="flex-row items-center">
            <Text className="text-xs text-zinc-300 mx-2">•</Text>
            <Text className="text-xs font-primary-medium text-zinc-600">
              {city}
            </Text>
          </View>
        ) : null}

        {closingTime ? (
          <View className="flex-row items-center">
            <Text className="text-xs text-zinc-300 mx-2">•</Text>
            <Text className="text-xs font-primary-medium text-zinc-600">
              Open until {closingTime}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 4. Centered Halal & Trust Text Row */}
      {Boolean(isVerified && hasHalalCertificate) && (
        <View className="flex-row items-center justify-center mt-2 pt-2 border-t border-zinc-100/80 w-full">
          <Ionicons name="shield-checkmark" size={13} color="#059669" />
          <Text className="text-xs font-primary-semibold text-emerald-700 ml-1.5">
            100% Halal Verified
          </Text>

          {hasFssaiCertificate && (
            <View className="flex-row items-center ml-2.5">
              <Text className="text-xs text-zinc-300 mr-2.5">•</Text>
              <Ionicons name="checkmark-circle" size={13} color="#2563EB" />
              <Text className="text-xs font-primary-medium text-zinc-600 ml-1">
                FSSAI Certified
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
