/**
 * MerchantCard Component
 * 
 * Version 9 Standard Discovery Card for butchers, restaurants, and grocery merchants.
 * Displays 16:9 photo container, Halal Quality Shield, quick delivery chip,
 * store metadata, and tactile interaction.
 */

import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { borderRadius } from '@lahm/tokens';

export interface MerchantCardProps {
  id: number;
  name: string;
  coverPhotoUrl?: string;
  rating?: number;
  ratingCount?: number;
  deliveryTimeRange?: string; // e.g. "20-30 min"
  distanceKm?: number;
  isFreeDelivery?: boolean;
  specialties?: string[]; // e.g. ["Mandi", "Arabian", "Indian"]
  isHalalCertified?: boolean;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
  cardWidth?: number | string;
}

export function MerchantCard({
  name,
  coverPhotoUrl,
  rating = 0,
  deliveryTimeRange = '',
  distanceKm,
  isFreeDelivery = false,
  specialties = [],
  isHalalCertified = false,
  isFavorite = false,
  onPress,
  onToggleFavorite,
  className = '',
  cardWidth = 260,
}: MerchantCardProps) {
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite?.();
  };

  const formattedSpecialties = specialties.slice(0, 3).join(' • ');

  return (
    <Pressable
      onPress={handleCardPress}
      style={{ width: cardWidth as any }}
      className={`active:opacity-90 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={`View storefront for ${name}`}>
      
      {/* 1. Visual Photo Container (16:9 ratio) */}
      <View
        style={{ borderRadius: borderRadius.lg }}
        className="relative h-36 w-full overflow-hidden bg-[#F7FAFA] border border-[#E2E8E8]">
        {coverPhotoUrl ? (
          <Image
            source={{ uri: coverPhotoUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-[#F7FAFA] items-center justify-center">
            <Feather name="image" size={24} color="#8C9F9F" />
          </View>
        )}

        {/* Top-Left: Halal Quality Trust Pill */}
        {isHalalCertified && (
          <View className="absolute top-2.5 left-2.5 flex-row items-center px-2 py-0.5 rounded-md bg-white/95 border border-[#E2E8E8] shadow-xs">
            <Ionicons name="shield-checkmark" size={11} color="#0C3B3B" />
            <Text className="text-[10px] font-bold text-[#0F1F1F] ml-1">Halal</Text>
          </View>
        )}

        {/* Top-Right: Favorite Button */}
        <Pressable
          onPress={handleFavoritePress}
          hitSlop={8}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/35 items-center justify-center active:scale-95"
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={14}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </Pressable>

        {/* Bottom-Left: Quick Delivery & Fee Chip */}
        {Boolean(deliveryTimeRange) && (
          <View className="absolute bottom-2.5 left-2.5 flex-row items-center px-2 py-0.5 rounded-md bg-white/95 border border-[#E2E8E8] shadow-xs">
            <Feather name="zap" size={10} color="#0C3B3B" />
            <Text className="text-[10px] font-bold text-[#0F1F1F] ml-1">
              {deliveryTimeRange} {isFreeDelivery ? '• Free Delivery' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Store Metadata (Under Photo) */}
      <View className="pt-2 px-0.5">
        {/* Name and Rating Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-[#0F1F1F] flex-1 mr-2" numberOfLines={1}>
            {name}
          </Text>
          {rating > 0 && (
            <View className="flex-row items-center bg-[#F7FAFA] border border-[#E2E8E8] px-1.5 py-0.5 rounded-md">
              <Ionicons name="star" size={10} color="#D4AF37" />
              <Text className="text-[11px] font-extrabold text-[#0F1F1F] ml-1">
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Specialties / Cuisine Tags */}
        {Boolean(formattedSpecialties) && (
          <Text className="text-xs text-[#526B6B] mt-0.5" numberOfLines={1}>
            {formattedSpecialties}
          </Text>
        )}

        {/* Delivery Time & Distance */}
        {(Boolean(deliveryTimeRange) || distanceKm !== undefined) && (
          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={10} color="#526B6B" />
            <Text className="text-[11px] text-[#526B6B] ml-1">
              {deliveryTimeRange}
              {distanceKm !== undefined ? ` • ${distanceKm.toFixed(1)} km` : ''}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
