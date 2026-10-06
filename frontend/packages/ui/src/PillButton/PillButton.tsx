/**
 * PillButton Component
 * 
 * Reusable rounded-full outline/badge button matching the "Quick Fill" styling:
 * - Rounded-full border with brand terracotta accent
 * - Subtle active state feedback
 * - Compact touch-target
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import type { PillButtonProps } from './PillButton.types';

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  onPress,
  variant = 'terracotta',
  disabled = false,
  className = '',
  labelClassName = '',
  style,
  labelStyle,
  accessibilityLabel,
  testID,
}) => {
  const isTerracotta = variant === 'terracotta';

  const containerClasses = isTerracotta
    ? 'border border-brand-terracotta bg-white active:bg-brand-terracottaLight'
    : 'border border-zinc-300 bg-white active:bg-zinc-50';

  const textClasses = isTerracotta
    ? 'text-brand-terracotta'
    : 'text-zinc-700';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      className={`px-3.5 py-1.5 rounded-full items-center justify-center ${containerClasses} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      style={style}>
      <Text
        className={`text-xs font-semibold ${textClasses} ${labelClassName}`}
        style={labelStyle}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
