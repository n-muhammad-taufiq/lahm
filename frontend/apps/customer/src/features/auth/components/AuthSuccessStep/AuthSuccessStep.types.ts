import type { AuthSuccessData } from '../../types/auth-flow.types';

export interface AuthSuccessStepProps {
  successData: AuthSuccessData | null;
  onDone: () => void;
}
