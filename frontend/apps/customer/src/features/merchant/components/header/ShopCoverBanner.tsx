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
    <View
      style={{ paddingTop: Math.max(insets.top, 12) }}
      className={`w-full bg-white px-4 pb-2 flex-row items-center justify-between ${className}`}>
      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        hitSlop={8}
        className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/80 items-center justify-center active:scale-95 active:bg-zinc-100"
        accessibilityRole="button"
        accessibilityLabel="Go back to marketplace">
        <Ionicons name="chevron-back" size={20} color="#18181B" />
      </Pressable>

      {/* Right Action Icons: Favorite & Share */}
      <View className="flex-row items-center">
        <Pressable
          onPress={handleFavorite}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/80 items-center justify-center active:scale-95 active:bg-zinc-100 mr-2"
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={19}
            color={isFavorite ? '#EF4444' : '#18181B'}
          />
        </Pressable>

        <Pressable
          onPress={handleShare}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/80 items-center justify-center active:scale-95 active:bg-zinc-100"
          accessibilityRole="button"
          accessibilityLabel="Share store">
          <Feather name="share-2" size={17} color="#18181B" />
        </Pressable>
      </View>
    </View>
  );
}
