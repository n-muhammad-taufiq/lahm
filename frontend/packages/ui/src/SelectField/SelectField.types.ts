import type { StyleProp, ViewStyle } from 'react-native';

export type SelectOption = string | { label: string; value: string };

export interface SelectFieldProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  modalTitle?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
