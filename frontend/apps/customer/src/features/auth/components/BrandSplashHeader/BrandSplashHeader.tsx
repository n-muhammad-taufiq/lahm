/**
 * Brand Splash Header Component
 * 
 * Displays the animated Lahm brand header with smooth fade and zoom effects during auth.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
} from 'react-native';
import * as Font from 'expo-font';
import type { BrandSplashHeaderProps } from './BrandSplashHeader.types';

export const BrandSplashHeader: React.FC<BrandSplashHeaderProps> = ({
  onSplashFinish,
}) => {
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      onSplashFinish?.();
    });

    const fallback = setTimeout(() => {
      logoOpacity.setValue(1);
      logoScale.setValue(1);
      onSplashFinish?.();
    }, 500);

    return () => clearTimeout(fallback);
  }, []);

  const hasParisienne = Font.isLoaded('Parisienne');

  return (
    <View className="w-full items-center pt-1 pb-1" pointerEvents="box-none">
      <Animated.View
        className="items-center justify-center py-1"
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}>
        <View className="flex-row items-center justify-center">
          <Text
            className="text-zinc-950 text-[48px] font-normal"
            style={{
              fontFamily: hasParisienne ? 'Parisienne' : undefined,
              lineHeight: 56,
              includeFontPadding: true,
            }}>
            Lahm
          </Text>
          <Text className="text-zinc-950 text-[32px] font-black ml-3 pb-1">
            لحم
          </Text>
        </View>
        <Text className="text-zinc-400 text-[10px] font-bold tracking-[2.5px] mt-0.5 text-center uppercase">
          100% HALAL • ARTISANAL MEAT DELIVERY
        </Text>
      </Animated.View>
    </View>
  );
};
