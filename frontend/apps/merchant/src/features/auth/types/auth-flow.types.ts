import type { AuthUser } from '@lahm/api';
import type { CountryItem } from '@lahm/ui';

export type AuthFlowStep = 'phone' | 'otp' | 'register_details' | 'success';

export interface AuthSuccessData {
  isNewUser: boolean;
  phoneNumber: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

export type { CountryItem };
