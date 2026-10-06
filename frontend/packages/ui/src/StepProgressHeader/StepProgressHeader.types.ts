import type { StyleProp, ViewStyle } from 'react-native';

export interface StepProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
