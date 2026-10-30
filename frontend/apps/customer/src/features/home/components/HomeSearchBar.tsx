/**
 * HomeSearchBar Component
 * 
 * Primary marketplace search bar for customers with vector search icon,
 * real-time text input, quick clear action, and tactile filter/sort button.
 */

import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface HomeSearchBarProps {
  /** Current text query value */
  value: string;
  /** Callback fired when text changes */
  onChangeText: (text: string) => void;
  /** Optional callback fired when search is submitted */
  onSubmitEditing?: () => void;
  /** Optional callback fired when filter/sliders button is tapped */
  onPressFilter?: () => void;
  /** Placeholder text (defaults to 'Search for meat, groceries or restaurants...') */
  placeholder?: string;
}

export function HomeSearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  onPressFilter,
  placeholder = 'Search for meat, groceries or restaurants...',
}: HomeSearchBarProps) {
  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressFilter?.();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
  };

  return (
    <View className="px-5 pt-1 pb-3 bg-white">
      <View className="flex-row items-center h-12 px-3.5 rounded-xl bg-[#F7FAFA] border border-[#E2E8E8]">
        {/* Search Magnifying Glass Icon */}
        <Feather name="search" size={18} color="#526B6B" />

        {/* Search Input Field */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#8C9F9F"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          className="flex-1 ml-2.5 text-sm text-[#0F1F1F] font-medium h-full py-0"
        />

        {/* Clear Button (only when text is present) */}
        {value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            className="p-1 mr-1 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="Clear search text">
            <Ionicons name="close-circle" size={18} color="#8C9F9F" />
          </Pressable>
        ) : null}

        {/* Quick Filter / Sliders Button */}
        <Pressable
          onPress={handleFilterPress}
          className="w-8 h-8 items-center justify-center rounded-lg bg-white border border-[#E2E8E8] active:bg-[#E8F2F2]"
          accessibilityRole="button"
          accessibilityLabel="Open search filters">
          <Feather name="sliders" size={16} color="#0C3B3B" />
        </Pressable>
      </View>
    </View>
  );
}
