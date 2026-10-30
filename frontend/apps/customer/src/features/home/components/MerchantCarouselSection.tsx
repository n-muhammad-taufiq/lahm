/**
 * MerchantCarouselSection Component
 * 
 * Reusable horizontal discovery section for customer marketplace feeds.
 * Renders a section title with "See all" action and a smooth horizontal
 * carousel of MerchantCards.
 */

import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MerchantCard, type MerchantCardProps } from './MerchantCard';
import { SkeletonCard } from './SkeletonCard';

export interface MerchantCarouselSectionProps {
  /** Section title header (e.g. "Nearby Restaurants", "Popular Meat Shops") */
  title: string;
  /** Label for the see-all CTA button (defaults to "See all") */
  seeAllText?: string;
  /** Callback fired when "See all" is tapped */
  onPressSeeAll?: () => void;
  /** List of merchant data objects to render */
  merchants?: MerchantCardProps[];
  /** Whether the carousel is currently in loading state */
  isLoading?: boolean;
  /** Number of skeleton placeholder cards to show when loading (defaults to 3) */
  skeletonCount?: number;
  /** Callback fired when an individual merchant card is tapped */
  onPressMerchant?: (merchant: MerchantCardProps) => void;
  /** Callback fired when favorite button on a card is toggled */
  onToggleFavorite?: (merchantId: number) => void;
  /** Optional container style class */
  className?: string;
}

export function MerchantCarouselSection({
  title,
  seeAllText = 'See all',
  onPressSeeAll,
  merchants = [],
  isLoading = false,
  skeletonCount = 3,
  onPressMerchant,
  onToggleFavorite,
  className = '',
}: MerchantCarouselSectionProps) {
  const handleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressSeeAll?.();
  };

  if (!isLoading && (!merchants || merchants.length === 0)) {
    return null;
  }

  return (
    <View className={`pt-4 pb-2 ${className}`}>
      {/* 1. Section Header Row */}
      <View className="px-5 pb-2.5 flex-row items-center justify-between">
        <Text className="text-base font-extrabold text-[#0F1F1F]">
          {title}
        </Text>
        {onPressSeeAll && (
          <Pressable
            onPress={handleSeeAll}
            hitSlop={8}
            className="active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`${seeAllText} for ${title}`}>
            <Text className="text-xs font-bold text-[#0C3B3B]">
              {seeAllText}
            </Text>
          </Pressable>
        )}
      </View>

      {/* 2. Horizontal Scroll Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          : merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                {...merchant}
                onPress={() => onPressMerchant?.(merchant)}
                onToggleFavorite={() => onToggleFavorite?.(merchant.id)}
              />
            ))}
      </ScrollView>
    </View>
  );
}
