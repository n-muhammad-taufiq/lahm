import type { CountryItem } from '@lahm/ui';

export interface PhoneStepProps {
  phoneNumber: string;
  onPhoneNumberChange: (val: string) => void;
  selectedCountry: CountryItem;
  onPressCountryPicker: () => void;
  onContinue: () => void;
  loading?: boolean;
  errorMessage?: string;
}
