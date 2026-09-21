import { brandColors, feedbackColors, fontSizes, neutralColors } from '@lahm/tokens';

export const SUCCESS_STEP_TEXT = {
  badgeTitle: 'VERIFIED',
  title: 'Authentication Successful',
  subtitle: 'Your phone number has been verified and authenticated with the backend.',
  roleLabel: 'Account Role',
  statusLabel: 'Backend Status',
  statusActive: 'Active • Connected',
  buttonLabel: 'Back to Start',
} as const;

export const SUCCESS_STEP_COLORS = {
  badgeBg: feedbackColors.successBg,
  badgeBorder: feedbackColors.successBorder,
  badgeIcon: feedbackColors.success,
  title: brandColors.primary,
  subtitle: neutralColors['500'],
  infoCardBg: neutralColors['50'],
  infoCardBorder: neutralColors['200'],
  infoLabel: neutralColors['500'],
  infoValue: neutralColors['900'],
  statusSuccess: feedbackColors.success,
} as const;

export const SUCCESS_STEP_FONT_SIZES = {
  title: fontSizes['2xl'],
  subtitle: fontSizes.sm,
  infoLabel: fontSizes.xs,
  infoValue: fontSizes.base,
} as const;
