import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'terracotta' | 'outline' | 'solid';
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
