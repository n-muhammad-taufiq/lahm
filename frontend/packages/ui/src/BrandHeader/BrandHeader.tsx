/**
 * Brand Header Component
 * 
 * Shared typography header that renders the signature "Lahm" script brand logo
 * and customizable role subtitle (e.g., Customer, Merchant Partner, Delivery Partner).
 */

import React from 'react';
import { Text, View } from 'react-native';
import type { BrandHeaderProps } from './BrandHeader.types';

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  subtitle,
  badge,
  showDividers = true,
  isParisienneLoaded = true,
  className = '',
}) => {
  const textContent = subtitle || badge;

  return (
    <View className={`w-full max-w-[400px] self-center items-center justify-center py-7 ${className}`}>
      {/* Brand Logo Text */}
      <Text
        style={{ fontFamily: isParisienneLoaded ? 'Parisienne' : undefined }}
        className="text-[54px] text-[#241913] leading-[64px] text-center">
        Lahm
      </Text>

      {/* Subtitle / Partner Text (Clean typography without box/badge) */}
      {textContent ? (
        <View className="flex-row items-center justify-center mt-1">
          {showDividers ? <View className="w-6 h-[1px] bg-[#F0CEC1] mr-2.5" /> : null}
          <Text className="text-[10px] font-bold tracking-[2.2px] text-[#B87B6A] uppercase">
            {textContent}
          </Text>
          {showDividers ? <View className="w-6 h-[1px] bg-[#F0CEC1] ml-2.5" /> : null}
        </View>
      ) : null}
    </View>
  );
};
