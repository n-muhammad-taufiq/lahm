/**
 * ProductPlaceholderImage Component
 * 
 * Reusable, warm-neutral image placeholder container featuring a centered
 * question mark '?' icon. Strictly complies with zero raw meat, zero animal,
 * and zero human depiction standards.
 */

import React from 'react';
import { View, Text } from 'react-native';

export interface ProductPlaceholderImageProps {
  /** Size in dp (square dimension) */
  size?: number;
  /** Optional container style class */
  className?: string;
}

export function ProductPlaceholderImage({
  size = 76,
  className = '',
}: ProductPlaceholderImageProps) {
  return (
    <View
      className={`bg-zinc-100 rounded-2xl items-center justify-center overflow-hidden border border-zinc-200/60 ${className}`}
      style={{ width: size, height: size }}>
      <Text className="text-xl font-bold text-zinc-400">?</Text>
    </View>
  );
}
