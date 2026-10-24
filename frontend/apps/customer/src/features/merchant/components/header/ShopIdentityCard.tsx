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
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MerchantCategoryDto } from '@lahm/api';

export interface ShopIdentityCardProps {
  shopName?: string;
  rating?: number;
  isVerified?: boolean;
  city?: string;
  openingTime?: string;
  closingTime?: string;
  hasHalalCertificate?: boolean;
  hasFssaiCertificate?: boolean;
  categories?: MerchantCategoryDto[];
  className?: string;
}

export function ShopIdentityCard({
  shopName,
  rating = 0,
  isVerified = false,
  city,
  openingTime,
  closingTime,
  hasHalalCertificate = false,
  hasFssaiCertificate = false,
  categories,
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
    <View className={`px-4 pt-3.5 pb-3 bg-white border-b border-zinc-100 ${className}`}>
      {/* 1. Shop Title */}
      <Text
        numberOfLines={1}
        className="text-xl font-black text-slate-900 tracking-tight">
        {shopName}
      </Text>

      {/* 2. Metadata Text Row: Rating • Category • City • Operating Hours */}
      <View className="flex-row items-center flex-wrap mt-1">
        {rating > 0 && (
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#D97706" />
            <Text className="text-xs font-bold text-slate-800 ml-1">
              {rating.toFixed(1)}
            </Text>
            <Text className="text-xs text-zinc-400 mx-1.5">•</Text>
          </View>
        )}

        {categoryNames ? (
          <Text className="text-xs font-medium text-zinc-600">
            {categoryNames}
          </Text>
        ) : null}

        {city ? (
          <View className="flex-row items-center">
            <Text className="text-xs text-zinc-400 mx-1.5">•</Text>
            <Text className="text-xs text-zinc-600 font-medium">{city}</Text>
          </View>
        ) : null}

        {closingTime ? (
          <View className="flex-row items-center">
            <Text className="text-xs text-zinc-400 mx-1.5">•</Text>
            <Text className="text-xs text-zinc-600 font-medium">
              Open until {closingTime}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 3. Verification & Trust Row (Clean Minimal Text) */}
      {Boolean(isVerified && hasHalalCertificate) && (
        <View className="flex-row items-center mt-2 pt-2 border-t border-zinc-100">
          <Ionicons name="shield-checkmark" size={13} color="#059669" />
          <Text className="text-xs font-semibold text-emerald-700 ml-1.5">
            100% Halal Verified
          </Text>

          {hasFssaiCertificate && (
            <View className="flex-row items-center ml-2.5">
              <Text className="text-xs text-zinc-300 mr-2.5">|</Text>
              <Ionicons name="checkmark-circle" size={13} color="#2563EB" />
              <Text className="text-xs font-medium text-zinc-600 ml-1">
                FSSAI Certified
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
