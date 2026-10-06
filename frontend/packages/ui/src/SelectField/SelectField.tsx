/**
 * SelectField Component
 * 
 * Reusable dropdown/select form field matching Lahm's visual style:
 * - 52dp height with 14dp rounded corners matching FormField
 * - Downward chevron indicator (⌄)
 * - Integrated accessible modal picker with instant search & checkmark selection
 * - Label row with optional/required indicators
 * - Inline error support
 */

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { SelectFieldProps, SelectOption } from './SelectField.types';

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select option...',
  required = false,
  optional = false,
  error,
  modalTitle,
  className = '',
  style,
  testID,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasError = Boolean(error);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [normalizedOptions, searchQuery]);

  const selectedOptionLabel = useMemo(() => {
    if (!value) return '';
    const match = normalizedOptions.find((opt) => opt.value === value);
    return match ? match.label : value;
  }, [normalizedOptions, value]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const containerBorderClass = hasError
    ? 'border-red-400 bg-[#FFF5F5]'
    : 'border-zinc-200 bg-white';

  return (
    <View className={`w-full gap-1.5 ${className}`} style={style}>
      {/* Label Row */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-medium text-zinc-800">
          {label} {required ? <Text className="text-brand-terracotta">*</Text> : null}
        </Text>
        {optional ? (
          <Text className="text-xs text-zinc-400 font-normal">Optional</Text>
        ) : null}
      </View>

      {/* Select Trigger Box */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedOptionLabel || placeholder}`}
        testID={testID}
        className={`h-[52px] px-4 rounded-[14px] border flex-row items-center justify-between transition-all active:bg-zinc-50 ${containerBorderClass}`}>
        <Text
          numberOfLines={1}
          className={`flex-1 text-[15px] ${
            value ? 'text-zinc-900 font-normal' : 'text-zinc-400 font-normal'
          }`}>
          {selectedOptionLabel || placeholder}
        </Text>
        <Text className="text-zinc-400 text-xs font-semibold ml-2">⌄</Text>
      </TouchableOpacity>

      {/* Error Row */}
      {hasError ? (
        <View className="flex-row items-center gap-1 mt-0.5 ml-0.5">
          <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
          <Text className="text-xs text-red-500 font-normal">{error}</Text>
        </View>
      ) : null}

      {/* Options Selection Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <SafeAreaView className="bg-white rounded-t-[24px] max-h-[80%] overflow-hidden">
            {/* Modal Header */}
            <View className="px-5 py-4 border-b border-zinc-100 flex-row items-center justify-between">
              <Text className="text-base font-bold text-zinc-900">
                {modalTitle || `Select ${label}`}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center">
                <Text className="text-zinc-500 text-sm font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Optional Search Bar for long lists (e.g. States, Cities) */}
            {normalizedOptions.length > 8 ? (
              <View className="px-5 pt-3 pb-2">
                <View className="h-11 px-3.5 rounded-[12px] bg-zinc-100 border border-zinc-200 flex-row items-center">
                  <Text className="text-zinc-400 mr-2 text-sm">🔍</Text>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm text-zinc-900 py-0"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Text className="text-zinc-400 text-xs">Clear</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Options List */}
            <ScrollView className="px-5 py-2" keyboardShouldPersistTaps="handled">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleSelect(opt.value)}
                      activeOpacity={0.7}
                      className={`h-12 flex-row items-center justify-between px-3 my-0.5 rounded-[10px] ${
                        isSelected ? 'bg-brand-terracottaLight' : 'active:bg-zinc-50'
                      }`}>
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? 'font-semibold text-brand-terracotta'
                            : 'font-normal text-zinc-800'
                        }`}>
                        {opt.label}
                      </Text>
                      {isSelected ? (
                        <Text className="text-brand-terracotta font-bold text-sm">✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="py-8 items-center justify-center">
                  <Text className="text-xs text-zinc-400">No matching options</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};
