import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fontSize?: number;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  labelClassName?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
