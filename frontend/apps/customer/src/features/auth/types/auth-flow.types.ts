import type { CountryItem } from '@lahm/ui';

export type AuthFlowStep = 'phone' | 'otp' | 'success';

export interface AuthSuccessData {
  readonly isNewUser: boolean;
  readonly phoneNumber: string;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly user?: {
    readonly id: string | number;
    readonly name?: string;
    readonly phoneNumber: string;
    readonly role: string;
    readonly email?: string;
  };
}

export type { CountryItem };
