import { neutralColors, fontSizes } from '@lahm/tokens';
import type { CountryItem } from './CountryPickerModal.types';

export const MODAL_FONT_SIZES = {
  title: fontSizes.xl,
  closeButton: fontSizes.xs,
  optionFlag: fontSizes['2xl'],
  optionName: fontSizes.base,
  optionCode: fontSizes.sm,
  checkMark: fontSizes.lg,
} as const;

export const GCC_COUNTRIES: readonly CountryItem[] = [
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇦🇪', code: '+971', name: 'United Arab Emirates' },
  { flag: '🇸🇦', code: '+966', name: 'Saudi Arabia' },
  { flag: '🇶🇦', code: '+974', name: 'Qatar' },
  { flag: '🇰🇼', code: '+965', name: 'Kuwait' },
  { flag: '🇴🇲', code: '+968', name: 'Oman' },
  { flag: '🇧🇭', code: '+973', name: 'Bahrain' },
] as const;

export const DEFAULT_MODAL_TITLE = 'Select Country';

export const MODAL_COLORS = {
  overlay: 'rgba(0, 0, 0, 0.45)',
  cardBackground: '#FFFFFF',
  text: neutralColors['900'],
  textMuted: neutralColors['500'],
  border: neutralColors['200'],
  selectedBackground: neutralColors['100'],
  closeButtonBg: neutralColors['100'],
} as const;
