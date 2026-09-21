import type { CountryItem } from '@lahm/ui';

export const DEFAULT_COUNTRY: CountryItem = {
  flag: '🇦🇪',
  code: '+971',
  name: 'United Arab Emirates',
} as const;

export const OTP_CODE_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 45;
export const ROLE_CUSTOMER = 'customer';
export const BACKEND_LOGIN_ENDPOINT = '/auth/firebase-otp-login';
