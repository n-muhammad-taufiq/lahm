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
      <View className="flex-row items-center h-12 px-3.5 rounded-2xl bg-white border border-zinc-200">
        {/* Search Magnifying Glass Icon */}
        <Feather name="search" size={18} color="#71717A" />

        {/* Search Input Field */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          className="flex-1 ml-2.5 text-sm text-zinc-900 font-medium h-full py-0"
        />

        {/* Clear Button (only when text is present) */}
        {value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            className="p-1 mr-1 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="Clear search text">
            <Ionicons name="close-circle" size={18} color="#A1A1AA" />
          </Pressable>
        ) : null}

        {/* Quick Filter / Sliders Button */}
        <Pressable
          onPress={handleFilterPress}
          className="w-9 h-9 items-center justify-center rounded-xl active:bg-zinc-100"
          accessibilityRole="button"
          accessibilityLabel="Open search filters">
          <Feather name="sliders" size={18} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}
