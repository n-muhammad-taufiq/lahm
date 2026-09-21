import { feedbackColors, neutralColors, fontSizes } from '@lahm/tokens';

export const INPUT_HEIGHT = 48;
export const INPUT_BORDER_RADIUS = 10;
export const INPUT_PLACEHOLDER_COLOR = neutralColors['400'];

export const INPUT_FONT_SIZES = {
  label: fontSizes.sm,
  input: fontSizes.base,
  helper: fontSizes.xs,
  error: fontSizes.xs,
  eyeButton: fontSizes.xs,
} as const;

export const INPUT_COLORS = {
  text: neutralColors['900'],
  label: neutralColors['900'],
  helper: neutralColors['500'],
  background: '#FFFFFF',
  borderDefault: neutralColors['200'],
  borderFocused: neutralColors['900'],
  borderError: feedbackColors.errorBorder,
  errorText: feedbackColors.error,
  errorBg: feedbackColors.errorBg,
} as const;
