import tokensData from './tokens.json';

export const tokens = tokensData;
export const brandColors = tokensData.colors.brand;
export const surfaceColors = tokensData.colors.surface;
export const feedbackColors = tokensData.colors.feedback;
export const neutralColors = tokensData.colors.zinc;
export const borderRadius = tokensData.borderRadius;
export const spacing = tokensData.spacing;
export const layout = tokensData.layout;
export const fontSizes = tokensData.fontSize;
export const fontFamilies = tokensData.fontFamily;

export const themeColors = {
  light: {
    text: tokensData.colors.zinc['900'],
    textSecondary: tokensData.colors.zinc['500'],
    textMuted: tokensData.colors.zinc['400'],
    background: tokensData.colors.surface.light,
    backgroundElement: tokensData.colors.surface.element,
    backgroundSelected: tokensData.colors.surface.selected,
    border: tokensData.colors.border.DEFAULT,
    borderSubtle: tokensData.colors.border.subtle,
    primary: tokensData.colors.brand.primary,
    primaryText: tokensData.colors.brand.primaryText,
    errorText: tokensData.colors.feedback.error,
    errorBg: tokensData.colors.feedback.errorBg,
    errorBorder: tokensData.colors.feedback.errorBorder,
  },
  dark: {
    text: tokensData.colors.zinc['50'],
    textSecondary: tokensData.colors.zinc['400'],
    textMuted: tokensData.colors.zinc['500'],
    background: tokensData.colors.surface.dark,
    backgroundElement: tokensData.colors.surface.elementDark,
    backgroundSelected: tokensData.colors.surface.selectedDark,
    border: tokensData.colors.border.dark,
    borderSubtle: tokensData.colors.surface.elementDark,
    primary: tokensData.colors.surface.light,
    primaryText: tokensData.colors.surface.dark,
    errorText: '#F87171',
    errorBg: '#450A0A',
    errorBorder: '#7F1D1D',
  },
} as const;

export type Tokens = typeof tokensData;
export type BrandColors = typeof brandColors;
export type ThemeColors = typeof themeColors.light;
export type Layout = typeof layout;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
