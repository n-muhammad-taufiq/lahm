/**
 * RestaurantCategoryNav Component
 * 
 * Horizontal category navigation bar with smooth scrolling pills
 * and tactile haptic feedback for quick jumping between menu sections.
 */

import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface CategoryNavItem {
  id: number;
  name: string;
  count?: number;
}

export interface RestaurantCategoryNavProps {
  categories: CategoryNavItem[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
  className?: string;
}

export function RestaurantCategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className = '',
}: RestaurantCategoryNavProps) {
  if (categories.length <= 1) {
    return null;
  }

  const handleSelect = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(id);
  };

  return (
    <View className={`bg-white border-b border-zinc-100 py-3 ${className}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <Pressable
              key={cat.id}
              onPress={() => handleSelect(cat.id)}
              className={`mr-2.5 px-3.5 py-1.5 rounded-full flex-row items-center ${
                isSelected
                  ? 'bg-zinc-900 shadow-xs'
                  : 'bg-white border border-zinc-200/80 active:bg-zinc-50'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Category ${cat.name}`}>
              <Text
                className={`text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-zinc-700'
                }`}>
                {cat.name}
              </Text>
              {typeof cat.count === 'number' && cat.count > 0 && (
                <View
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-zinc-800' : 'bg-zinc-100'
                  }`}>
                  <Text
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                    {cat.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
