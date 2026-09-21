import { feedbackColors, neutralColors, surfaceColors, fontSizes } from '@lahm/tokens';

export const PILL_HEIGHT = 52;
export const PILL_BORDER_RADIUS = 9999;
export const DEFAULT_PHONE_PLACEHOLDER = '50 123 4567';

export const PILL_FONT_SIZES = {
  flag: fontSizes.xl,
  countryCode: fontSizes.base,
  chevron: fontSizes.sm,
  input: fontSizes.lg,
  error: fontSizes.xs,
} as const;

export const PILL_COLORS = {
  background: surfaceColors.element,
  backgroundFocused: '#FFFFFF',
  border: neutralColors['200'],
  borderFocused: neutralColors['900'],
  borderError: feedbackColors.errorBorder,
  text: neutralColors['900'],
  placeholder: neutralColors['400'],
  divider: neutralColors['200'],
  chevron: neutralColors['400'],
  errorText: feedbackColors.error,
} as const;
