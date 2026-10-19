/**
 * HeroCampaignBanner Component
 * 
 * Evergreen brand hero banner for the Customer Home screen.
 * Displays brand integrity messaging, tactile CTA button, and theme gradients
 * configured through a centralized theme token dictionary.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { borderRadius } from '@lahm/tokens';

export type BannerVariant = 'peach' | 'green';

export interface BannerThemeStyle {
  gradientColors: [string, string, ...string[]];
  gradientLocations: [number, number, ...number[]];
  tagColorClass: string;
  subtitleColorClass: string;
  ctaTextColorClass: string;
  ctaArrowColor: string;
}

export const BANNER_THEMES: Record<BannerVariant, BannerThemeStyle> = {
  peach: {
    gradientColors: ['#E77A62', '#EA8C76', '#D9664E'],
    gradientLocations: [0, 0.5, 1],
    tagColorClass: 'text-amber-100',
    subtitleColorClass: 'text-orange-100',
    ctaTextColorClass: 'text-rose-900',
    ctaArrowColor: '#881337',
  },
  green: {
    gradientColors: ['#15803D', '#166534', '#0F3E22'],
    gradientLocations: [0, 0.55, 1],
    tagColorClass: 'text-emerald-200',
    subtitleColorClass: 'text-emerald-100',
    ctaTextColorClass: 'text-emerald-900',
    ctaArrowColor: '#064E3B',
  },
};

export const DEFAULT_HERO_BANNER = {
  variant: 'peach' as BannerVariant,
  tag: 'LAHM لحم • 100% HALAL VERIFIED',
  title: 'Pure, Farm-Fresh & 100% Halal Certified',
  subtitle: 'Fresh meats, curated dining & daily groceries delivered to your door.',
  ctaText: 'Discover Lahm',
} as const;

export interface HeroCampaignBannerProps {
  /** Color theme variant: 'peach' (warm brand terracotta) or 'green' (natural organic) */
  variant?: BannerVariant;
  /** Small uppercase brand/source tag */
  tag?: string;
  /** Primary headline title */
  title?: string;
  /** Subtitle / brand promise description */
  subtitle?: string;
  /** CTA button text */
  ctaText?: string;
  /** Callback fired when CTA button is tapped */
  onPressCta?: () => void;
  /** Optional container style class */
  className?: string;
}

export function HeroCampaignBanner({
  variant = DEFAULT_HERO_BANNER.variant,
  tag = DEFAULT_HERO_BANNER.tag,
  title = DEFAULT_HERO_BANNER.title,
  subtitle = DEFAULT_HERO_BANNER.subtitle,
  ctaText = DEFAULT_HERO_BANNER.ctaText,
  onPressCta,
  className = '',
}: HeroCampaignBannerProps) {
  const theme = BANNER_THEMES[variant] ?? BANNER_THEMES.peach;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressCta?.();
  };

  return (
    <View className={`px-5 pt-1 pb-3 ${className}`}>
      <LinearGradient
        colors={theme.gradientColors}
        locations={theme.gradientLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: borderRadius['2xl'] }}
        className="p-5 overflow-hidden shadow-xs relative">
        
        {/* Ambient atmospheric light accents */}
        <View
          className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10"
          pointerEvents="none"
        />
        <View
          className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-black/10"
          pointerEvents="none"
        />

        {/* Text Content */}
        <View className="max-w-[85%] z-10">
          <Text className={`text-[10px] font-extrabold tracking-widest uppercase mb-1 ${theme.tagColorClass}`}>
            {tag}
          </Text>

          <Text className="text-xl font-bold leading-6 mb-1 text-white">
            {title}
          </Text>

          <Text className={`text-xs mb-4 leading-4 ${theme.subtitleColorClass}`}>
            {subtitle}
          </Text>

          <Pressable
            onPress={handlePress}
            className="self-start flex-row items-center px-4 py-2 rounded-full bg-white active:opacity-85 shadow-xs"
            accessibilityRole="button"
            accessibilityLabel={ctaText}>
            <Text className={`text-xs font-bold mr-1.5 ${theme.ctaTextColorClass}`}>
              {ctaText}
            </Text>
            <Feather
              name="arrow-right"
              size={13}
              color={theme.ctaArrowColor}
            />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

