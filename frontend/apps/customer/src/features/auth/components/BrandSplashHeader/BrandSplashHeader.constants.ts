import { brandColors, fontSizes, neutralColors } from '@lahm/tokens';

export const SPLASH_ANIMATION_DURATION = 650;
export const SPLASH_HOLD_DURATION = 800;
export const LOGO_SLIDE_DURATION = 650;

export const SPLASH_COLORS = {
  brandText: brandColors.primary,
  arabicText: brandColors.primary,
  subtitleText: neutralColors['500'],
} as const;

export const SPLASH_FONT_SIZES = {
  brandDisplay: fontSizes.brandDisplay,
  arabicDisplay: 42,
  subtitle: fontSizes.xs,
} as const;
