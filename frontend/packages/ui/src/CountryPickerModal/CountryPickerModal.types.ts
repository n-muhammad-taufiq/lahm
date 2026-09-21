export interface CountryItem {
  readonly flag: string;
  readonly code: string;
  readonly name: string;
}

export interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCountry: (country: CountryItem) => void;
  selectedCountryCode?: string;
  title?: string;
  countries?: readonly CountryItem[];
}
