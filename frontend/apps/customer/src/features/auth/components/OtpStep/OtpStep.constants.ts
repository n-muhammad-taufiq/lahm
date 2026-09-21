import { brandColors, feedbackColors, fontSizes, neutralColors } from '@lahm/tokens';

export const OTP_STEP_TEXT = {
  title: 'Verify Phone Number',
  subtitlePrefix: 'Enter the code sent to',
  buttonLabel: 'Verify & Login',
  changeNumberText: 'Change Number',
  resendText: 'Resend Code',
  resendInPrefix: 'Resend code in',
} as const;

export const OTP_STEP_COLORS = {
  title: brandColors.primary,
  subtitle: neutralColors['500'],
  inputBackground: '#FFFFFF',
  inputBorder: neutralColors['200'],
  inputBorderFocused: neutralColors['900'],
  inputText: neutralColors['900'],
  inputPlaceholder: neutralColors['400'],
  actionLink: neutralColors['900'],
  actionLinkDisabled: neutralColors['400'],
  dotSeparator: neutralColors['300'],
  errorText: feedbackColors.error,
} as const;

export const OTP_STEP_FONT_SIZES = {
  title: fontSizes['2xl'],
  subtitle: fontSizes.sm,
  input: 24,
  actionLink: fontSizes.sm,
  errorText: fontSizes.xs,
} as const;
