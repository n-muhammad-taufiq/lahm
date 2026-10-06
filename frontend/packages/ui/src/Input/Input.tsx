/**
 * Text Input Component
 * 
 * Reusable form text input supporting floating labels, error messages,
 * helper text, password visibility toggles, and icon adornments.
 */

import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { InputProps } from './Input.types';
import { INPUT_PLACEHOLDER_COLOR } from './Input.constants';

export const Input: React.FC<InputProps> = ({
  label,
  errorMessage,
  helperText,
  isPassword = false,
  leftIcon,
  rightAction,
  className = '',
  inputClassName = '',
  containerStyle,
  inputStyle,
  placeholderTextColor = INPUT_PLACEHOLDER_COLOR,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  const hasError = Boolean(errorMessage);

  const borderClass = hasError
    ? 'border-feedback-error'
    : isFocused
    ? 'border-brand'
    : 'border-zinc-200';

  return (
    <View className={`w-full gap-1.5 ${className}`} style={containerStyle}>
      {label ? (
        <Text className="text-zinc-900 text-sm font-semibold">{label}</Text>
      ) : null}

      <View
        className={`h-12 rounded-lg border bg-white flex-row items-center px-3.5 ${borderClass}`}>
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}

        <TextInput
          className={`flex-1 h-full text-zinc-900 text-base ${inputClassName}`}
          style={inputStyle}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword ? isSecure : false}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...textInputProps}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            className="py-1.5 px-2"
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}>
            <Text className="text-zinc-500 text-xs font-semibold">
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : rightAction ? (
          <View className="ml-2">{rightAction}</View>
        ) : null}
      </View>

      {hasError ? (
        <Text className="text-feedback-error text-xs mt-0.5">{errorMessage}</Text>
      ) : helperText ? (
        <Text className="text-zinc-500 text-xs mt-0.5">{helperText}</Text>
      ) : null}
    </View>
  );
};
