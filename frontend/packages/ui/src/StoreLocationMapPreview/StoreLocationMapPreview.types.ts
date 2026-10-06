import type { StyleProp, ViewStyle } from 'react-native';

export interface StoreLocationMapPreviewProps {
  latitude?: number | null;
  longitude?: number | null;
  addressText?: string;
  onPress: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
