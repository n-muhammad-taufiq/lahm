/**
 * FloatingCartCapsule Component
 * 
 * Option 2: The Solid Brand Terracotta Floating Cart Bar.
 * High-visibility floating pill anchored in the natural thumb zone above safe bottom insets.
 * Displays item count, formatted subtotal, merchant subtitle, and "VIEW CART ➔" CTA.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../../cart/cartStore';

export interface FloatingCartCapsuleProps {
  /** Optional delivery badge from server delivery quote */
  deliveryBadge?: string;
  /** Callback fired when the capsule is pressed */
  onPress?: () => void;
  /** Optional container style class */
  className?: string;
}

export function FloatingCartCapsule({
  deliveryBadge,
  onPress,
  className = '',
}: FloatingCartCapsuleProps) {
  const insets = useSafeAreaInsets();
  const merchant = useCartStore((state) => state.merchant);
  const itemCount = useCartStore((state) => state.getItemCount());
  const subtotal = useCartStore((state) => state.getSubtotal());

  if (itemCount <= 0 || !merchant) {
    return null;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const formattedSubtotal = `₹${subtotal.toLocaleString('en-IN')}`;

  return (
    <View
      pointerEvents="box-none"
      style={{ bottom: Math.max(insets.bottom, 16) }}
      className="absolute left-4 right-4 z-50">
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: '#0C3B3B',
          shadowColor: '#0C3B3B',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 12,
          elevation: 8,
        }}
        className={`rounded-xl px-4 py-3 flex-row items-center justify-between active:opacity-95 active:scale-[0.99] ${className}`}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${itemCount} items totaling ${formattedSubtotal}`}>
        
        {/* Left Side: Bag Icon + Count + Subtotal + Merchant Subtitle */}
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-10 h-10 rounded-lg bg-white/15 items-center justify-center mr-3">
            <Ionicons name="bag-handle" size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-extrabold text-sm tracking-wide">
              {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} • {formattedSubtotal}
            </Text>
            <Text className="text-[#E8F2F2] text-xs font-medium mt-0.5" numberOfLines={1}>
              {merchant.name}
              {merchant.outletName ? ` • ${merchant.outletName}` : ''}
              {deliveryBadge ? ` • ${deliveryBadge}` : ''}
            </Text>
          </View>
        </View>

        {/* Right Side: Action CTA "VIEW CART ➔" */}
        <View className="flex-row items-center bg-white/15 px-3.5 py-2 rounded-lg">
          <Text className="text-white font-bold text-xs mr-1 tracking-wider">
            VIEW CART
          </Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </View>
      </Pressable>
    </View>
  );
}
