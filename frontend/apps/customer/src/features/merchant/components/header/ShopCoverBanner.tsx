/**
 * ShopCoverBanner Component
 * 
 * 16:9 merchant cover image with top safe-area insets, gradient scrim,
 * and floating translucent tactile buttons for back navigation, favorites, and sharing.
 */

import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface ShopCoverBannerProps {
  bannerUrl?: string;
  isFavorite?: boolean;
  onPressBack?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ShopCoverBanner({
  bannerUrl,
  isFavorite = false,
  onPressBack,
  onToggleFavorite,
  onShare,
  className = '',
}: ShopCoverBannerProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressBack?.();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite?.();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare?.();
  };

  return (
    <View className={`relative h-56 w-full bg-zinc-900 overflow-hidden ${className}`}>
      {/* 1. Cover Photo */}
      {bannerUrl ? (
        <Image
          source={{ uri: bannerUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-zinc-800 items-center justify-center">
          <Feather name="image" size={32} color="#71717A" />
        </View>
      )}

      {/* 2. Top & Bottom Subtle Scrims for Controls Legibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.2)']}
        locations={[0, 0.45, 1]}
        className="absolute inset-0"
      />

      {/* 3. Floating Navigation Actions (Safe Area Inset Aware) */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) }}
        className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between">
        
        {/* Back Button */}
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center active:scale-95"
          accessibilityRole="button"
          accessibilityLabel="Go back to marketplace">
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Right Action Icons: Favorite & Share */}
        <View className="flex-row items-center">
          <Pressable
            onPress={handleFavorite}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center active:scale-95 mr-2"
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center active:scale-95"
            accessibilityRole="button"
            accessibilityLabel="Share store">
            <Feather name="share-2" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
