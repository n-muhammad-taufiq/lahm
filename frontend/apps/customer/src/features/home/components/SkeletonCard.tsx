/**
 * SkeletonCard Component
 * 
 * Pulsing shimmer placeholder for MerchantCard discovery tiles
 * during data fetching or network latency.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { borderRadius } from '@lahm/tokens';

export interface SkeletonCardProps {
  cardWidth?: number | string;
  className?: string;
}

export function SkeletonCard({
  cardWidth = 260,
  className = '',
}: SkeletonCardProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        width: cardWidth as any,
        opacity: pulseAnim,
      }}
      className={`opacity-60 ${className}`}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading merchant details">
      
      {/* 1. Photo Container Placeholder (16:9 ratio) */}
      <View
        style={{ borderRadius: borderRadius['2xl'] }}
        className="relative h-36 w-full bg-zinc-200 overflow-hidden">
        {/* Top-Left Trust Pill Placeholder */}
        <View className="absolute top-2.5 left-2.5 w-14 h-5 rounded-full bg-white/70" />

        {/* Top-Right Favorite Circle Placeholder */}
        <View className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70" />

        {/* Bottom-Left Delivery Chip Placeholder */}
        <View className="absolute bottom-2.5 left-2.5 w-28 h-5 rounded-md bg-white/70" />
      </View>

      {/* 2. Metadata Rows Placeholder */}
      <View className="pt-2.5 px-0.5">
        {/* Name and Rating Placeholder Row */}
        <View className="flex-row items-center justify-between">
          <View className="h-4 w-36 rounded-md bg-zinc-200" />
          <View className="h-4 w-10 rounded-md bg-zinc-200" />
        </View>

        {/* Cuisine / Specialties Tag Placeholder */}
        <View className="h-3 w-28 rounded-md bg-zinc-100 mt-2" />

        {/* Distance & Time Placeholder */}
        <View className="h-3 w-20 rounded-md bg-zinc-100 mt-2" />
      </View>
    </Animated.View>
  );
}
