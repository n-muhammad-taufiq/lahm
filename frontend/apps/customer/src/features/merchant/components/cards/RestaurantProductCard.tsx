import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ProductResponse } from '@lahm/api';
import { ProductPlaceholderImage } from './ProductPlaceholderImage';

export interface RestaurantProductCardProps {
  product: ProductResponse;
  onAdd?: (product: ProductResponse) => void;
  onPress?: (product: ProductResponse) => void;
  className?: string;
}

export function RestaurantProductCard({
  product,
  onAdd,
  onPress,
  className = '',
}: RestaurantProductCardProps) {
  const hasCustomizations = Boolean(
    product.customizationGroups && product.customizationGroups.length > 0,
  );

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd?.(product);
  };

  const handlePressCard = () => {
    onPress?.(product);
  };

  return (
    <Pressable
      onPress={handlePressCard}
      className={`p-4 bg-white rounded-2xl border border-zinc-100 shadow-xs mb-3 flex-row justify-between items-start active:bg-zinc-50/50 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={product.name}>
      {/* 1. Left Column: Details (Title, Price, Description, Badges) */}
      <View className="flex-1 mr-4 justify-between min-h-[96px]">
        <View>
          {/* Dietary & Trust Badge Row */}
          <View className="flex-row items-center mb-1.5">
            <View className="w-3.5 h-3.5 border border-red-700/80 items-center justify-center rounded-[3px] mr-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-red-700" />
            </View>
            <View className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
              <Text className="text-[10px] font-primary-bold text-emerald-800">Halal</Text>
            </View>
          </View>

          {/* Dish Title */}
          <Text className="text-[15px] font-primary-bold text-zinc-900 leading-snug" numberOfLines={2}>
            {product.name}
          </Text>

          {/* Price */}
          <Text className="text-sm font-primary-extrabold text-zinc-900 mt-1">
            ₹{product.price}
          </Text>

          {/* 2-Line Description */}
          {Boolean(product.description) && (
            <Text className="text-xs font-primary text-zinc-500 mt-1.5 leading-4" numberOfLines={2}>
              {product.description}
            </Text>
          )}
        </View>
      </View>

      {/* 2. Right Column: Media & Anchored Floating Action Button */}
      <View className="items-center relative pt-0.5">
        <View className="relative items-center">
          {product.photoUrl ? (
            <Image
              source={{ uri: product.photoUrl }}
              className="w-24 h-24 rounded-2xl bg-zinc-100"
              resizeMode="cover"
            />
          ) : (
            <ProductPlaceholderImage size={96} />
          )}

          {/* Anchored Floating ADD Button (Partially overlapping bottom edge) */}
          <Pressable
            onPress={handleAdd}
            className="absolute -bottom-2.5 px-5 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-sm active:scale-95 active:bg-zinc-50"
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name}`}>
            <Text className="text-xs font-primary-extrabold text-emerald-700 tracking-wider">
              ADD
            </Text>
          </Pressable>
        </View>

        {/* Customizable Indicator below ADD button */}
        {hasCustomizations && (
          <Text className="text-[10px] font-primary-medium text-zinc-400 mt-3 text-center">
            Customisable
          </Text>
        )}
      </View>
    </Pressable>
  );
}
