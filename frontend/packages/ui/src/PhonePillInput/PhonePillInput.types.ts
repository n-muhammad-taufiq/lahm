import type { StyleProp, ViewStyle } from 'react-native';

export interface PhonePillInputProps {
  countryFlag: string;
  countryCode: string;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onPressCountryPicker: () => void;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
