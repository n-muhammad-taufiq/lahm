/**
 * RestaurantCategorySection Component
 * 
 * Renders an individual category section in the restaurant menu,
 * displaying category title, dish count pill badge, optional description,
 * and the list of dish cards.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { ProductResponse } from '@lahm/api';
import { RestaurantProductCard } from '../cards/RestaurantProductCard';

export interface RestaurantCategorySectionProps {
  title: string;
  description?: string;
  products: ProductResponse[];
  onAddProduct: (product: ProductResponse) => void;
  onPressProduct?: (product: ProductResponse) => void;
  className?: string;
}

export function RestaurantCategorySection({
  title,
  description,
  products,
  onAddProduct,
  onPressProduct,
  className = '',
}: RestaurantCategorySectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <View className={`mb-6 ${className}`}>
      {/* 1. Category Header Row */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-zinc-900 tracking-tight">
            {title}
          </Text>
          <View className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/50">
            <Text className="text-[11px] font-semibold text-zinc-600">
              {products.length} {products.length === 1 ? 'dish' : 'dishes'}
            </Text>
          </View>
        </View>

        {Boolean(description) && (
          <Text className="text-xs text-zinc-500 mt-1 leading-4" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* 2. Dish Cards in Category */}
      {products.map((product) => (
        <RestaurantProductCard
          key={product.id}
          product={product}
          onAdd={onAddProduct}
          onPress={onPressProduct}
        />
      ))}
    </View>
  );
}
