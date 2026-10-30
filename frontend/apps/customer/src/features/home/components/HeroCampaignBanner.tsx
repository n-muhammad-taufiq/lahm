/**
 * HeroCampaignBanner Component
 * 
 * Evergreen brand hero banner for the Customer Home screen.
 * Displays brand integrity messaging, tactile CTA button, and theme gradients
 * configured through a centralized theme token dictionary.
 */

import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { borderRadius } from '@lahm/tokens';

const heroBannerBg = require('../../../../assets/images/hero-banner-bg.jpg');

export type BannerVariant = 'teal' | 'peach' | 'green';

export interface BannerThemeStyle {
  gradientColors: [string, string, ...string[]];
  gradientLocations: [number, number, ...number[]];
  tagColorClass: string;
  subtitleColorClass: string;
  ctaTextColorClass: string;
  ctaArrowColor: string;
}

export const BANNER_THEMES: Record<BannerVariant, BannerThemeStyle> = {
  teal: {
    gradientColors: ['rgba(12, 59, 59, 0.97)', 'rgba(8, 40, 40, 0.92)', 'rgba(6, 30, 30, 0.70)'],
    gradientLocations: [0, 0.58, 1],
    tagColorClass: 'text-[#D4AF37]',
    subtitleColorClass: 'text-[#E8F2F2]',
    ctaTextColorClass: 'text-[#0C3B3B]',
    ctaArrowColor: '#0C3B3B',
  },
  peach: {
    gradientColors: ['rgba(12, 59, 59, 0.97)', 'rgba(8, 40, 40, 0.92)', 'rgba(6, 30, 30, 0.70)'],
    gradientLocations: [0, 0.58, 1],
    tagColorClass: 'text-[#D4AF37]',
    subtitleColorClass: 'text-[#E8F2F2]',
    ctaTextColorClass: 'text-[#0C3B3B]',
    ctaArrowColor: '#0C3B3B',
  },
  green: {
    gradientColors: ['rgba(21, 128, 61, 0.95)', 'rgba(22, 101, 52, 0.85)', 'rgba(15, 62, 34, 0.35)'],
    gradientLocations: [0, 0.55, 1],
    tagColorClass: 'text-emerald-200',
    subtitleColorClass: 'text-emerald-100',
    ctaTextColorClass: 'text-emerald-900',
    ctaArrowColor: '#064E3B',
  },
};

export const DEFAULT_HERO_BANNER = {
  variant: 'teal' as BannerVariant,
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
      <View
        style={{ borderRadius: borderRadius.xl }}
        className="overflow-hidden shadow-xs relative">
        <ImageBackground
          source={heroBannerBg}
          resizeMode="cover"
          className="w-full">
          <LinearGradient
            colors={theme.gradientColors}
            locations={theme.gradientLocations}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="p-5">
            {/* Text Content */}
            <View className="max-w-[78%] z-10">
              <Text className={`text-[10px] font-extrabold tracking-widest uppercase mb-1.5 ${theme.tagColorClass}`}>
                {tag}
              </Text>

              <Text className="text-xl font-bold leading-6 mb-1.5 text-white">
                {title}
              </Text>

              <Text className={`text-xs mb-4 leading-4 font-normal ${theme.subtitleColorClass}`}>
                {subtitle}
              </Text>

              <Pressable
                onPress={handlePress}
                className="self-start flex-row items-center px-4 py-2 rounded-lg bg-white active:opacity-90 shadow-xs"
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
        </ImageBackground>
      </View>
    </View>
  );
}

