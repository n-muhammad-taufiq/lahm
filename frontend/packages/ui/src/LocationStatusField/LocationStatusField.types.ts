import type { StyleProp, ViewStyle } from 'react-native';

export interface LocationStatusFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  addressText?: string;
  isValidated?: boolean;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
