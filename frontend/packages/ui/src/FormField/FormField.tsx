/**
 * FormField Component
 * 
 * Reusable form text input supporting:
 * - Clean label row with optional/required indicators (terracotta asterisk)
 * - 52dp touch target with 14dp rounded corners matching the Lahm visual design
 * - Smooth focus (terracotta outline) and error states (light red background + border)
 * - Inline accessible error message with ⓘ indicator
 * - Support for left icons and right actions
 */

import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
} from 'react-native';
import type { FormFieldProps } from './FormField.types';

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  required = false,
  optional = false,
  error,
  helperText,
  placeholder,
  leftIcon,
  rightAction,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  className = '',
  inputClassName = '',
  containerStyle,
  inputStyle,
  testID,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  const containerBorderClass = hasError
    ? 'border-red-400 bg-[#FFF5F5]'
    : isFocused
    ? 'border-brand-terracotta bg-white'
    : 'border-zinc-200 bg-white';

  return (
    <View className={`w-full gap-1.5 ${className}`} style={containerStyle}>
      {/* Label Row */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-medium text-zinc-800">
          {label} {required ? <Text className="text-brand-terracotta">*</Text> : null}
        </Text>
        {optional ? (
          <Text className="text-xs text-zinc-400 font-normal">Optional</Text>
        ) : null}
      </View>

      {/* Input Box */}
      <View
        className={`h-[52px] px-4 rounded-[14px] border flex-row items-center transition-all ${containerBorderClass}`}>
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          testID={testID}
          className={`flex-1 h-full text-[15px] font-normal text-zinc-900 py-0 ${inputClassName}`}
          style={inputStyle}
          {...rest}
        />

        {rightAction ? <View className="ml-2">{rightAction}</View> : null}
      </View>

      {/* Error / Helper Row */}
      {hasError ? (
        <View className="flex-row items-center gap-1 mt-0.5 ml-0.5">
          <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
          <Text className="text-xs text-red-500 font-normal">{error}</Text>
        </View>
      ) : helperText ? (
        <Text className="text-xs text-zinc-500 mt-0.5 ml-0.5 font-normal">{helperText}</Text>
      ) : null}
    </View>
  );
};
