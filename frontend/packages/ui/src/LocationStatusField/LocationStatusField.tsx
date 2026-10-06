/**
 * LocationStatusField Component
 * 
 * Production-grade form field for displaying confirmed/validated GPS locations:
 * - Clean label row with optional/required indicators
 * - 52dp height with 14dp rounded corners matching the Lahm aesthetic
 * - Red location pin indicator
 * - Mint background and emerald outline when location is verified
 * - Prominent green checkmark circular badge (✓) upon successful confirmation
 * - Seamless press handler to open location picker/map modal
 * - Inline accessible error support
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { LocationStatusFieldProps } from './LocationStatusField.types';

export const LocationStatusField: React.FC<LocationStatusFieldProps> = ({
  label = 'Store Location',
  required = true,
  optional = false,
  addressText,
  isValidated = false,
  placeholder = 'Select storefront location on map',
  onPress,
  error,
  className = '',
  style,
  testID,
}) => {
  const hasError = Boolean(error);

  const containerBorderClass = hasError
    ? 'border-red-400 bg-[#FFF5F5]'
    : isValidated
    ? 'border-emerald-400 bg-emerald-50/50'
    : 'border-zinc-200 bg-white';

  return (
    <View className={`w-full gap-1.5 ${className}`} style={style}>
      {/* Label Row */}
      {label ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-medium text-zinc-800">
            {label} {required ? <Text className="text-brand-terracotta">*</Text> : null}
          </Text>
          {optional ? (
            <Text className="text-xs text-zinc-400 font-normal">Optional</Text>
          ) : null}
        </View>
      ) : null}

      {/* Field Trigger Box */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        testID={testID}
        className={`h-[52px] px-3.5 rounded-[14px] border flex-row items-center justify-between transition-all ${containerBorderClass}`}>
        <View className="flex-row items-center flex-1 mr-2">
          <Text className="text-base mr-2.5">📍</Text>
          <Text
            numberOfLines={1}
            className={`flex-1 text-[15px] ${
              addressText ? 'text-zinc-900 font-medium' : 'text-zinc-400 font-normal'
            }`}>
            {addressText || placeholder}
          </Text>
        </View>

        {isValidated ? (
          <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center shadow-xs">
            <Text className="text-white text-xs font-bold leading-none">✓</Text>
          </View>
        ) : (
          <Text className="text-xs text-zinc-400 font-normal">Tap to pin</Text>
        )}
      </TouchableOpacity>

      {/* Error Row */}
      {hasError ? (
        <View className="flex-row items-center gap-1 mt-0.5 ml-0.5">
          <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
          <Text className="text-xs text-red-500 font-normal">{error}</Text>
        </View>
      ) : null}
    </View>
  );
};
