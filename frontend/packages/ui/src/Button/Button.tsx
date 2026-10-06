/**
 * Button Component
 * 
 * Reusable button supporting multiple visual variants (primary, secondary, outline, ghost),
 * sizes, loading spinners, and optional left/right icons.
 */

import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ButtonProps } from './Button.types';
import {
  DEFAULT_ACTIVE_OPACITY,
  DEFAULT_BUTTON_FONT_SIZE,
  SIZE_CLASSES,
  VARIANT_CLASSES,
  VARIANT_LABEL_CLASSES,
  VARIANT_TEXT_COLORS,
} from './Button.constants';

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fontSize = DEFAULT_BUTTON_FONT_SIZE,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  labelClassName = '',
  style,
  labelStyle,
  accessibilityLabel,
  testID,
}) => {
  const isInteractive = !disabled && !loading;
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];
  const labelColorClass = VARIANT_LABEL_CLASSES[variant];
  const textColor = VARIANT_TEXT_COLORS[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      testID={testID}
      className={`w-full justify-center items-center ${sizeClass} ${variantClass} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      style={style}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <Text
            className={`tracking-wide ${labelColorClass} ${labelClassName}`}
            style={[{ fontSize }, labelStyle]}>
            {label}
          </Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};
