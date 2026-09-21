import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  isPassword?: boolean;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
  inputClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}
