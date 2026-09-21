import { brandColors, fontSizes, neutralColors } from '@lahm/tokens';

export const PHONE_STEP_TEXT = {
  sloganMain: 'Fresh Cut Prime Meats',
  sloganSub: 'Enter your mobile number to get started',
  buttonLabel: 'Continue',
  footerNote: 'Experience luxury butchery, simplified.',
} as const;

export const PHONE_STEP_COLORS = {
  sloganMain: brandColors.primary,
  sloganSub: neutralColors['500'],
  footerNote: neutralColors['400'],
} as const;

export const PHONE_STEP_FONT_SIZES = {
  sloganMain: fontSizes['2xl'],
  sloganSub: fontSizes.sm,
  footerNote: fontSizes.xs,
} as const;
