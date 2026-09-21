import { brandColors, surfaceColors, neutralColors, fontSizes } from '@lahm/tokens';
import type { ButtonSize, ButtonVariant } from './Button.types';

export const DEFAULT_ACTIVE_OPACITY = 0.85;

export const BUTTON_HEIGHTS: Record<ButtonSize, number> = {
  sm: 40,
  md: 52,
  lg: 56,
} as const;

export const DEFAULT_BUTTON_FONT_SIZE = fontSizes.base;

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand border-transparent active:bg-zinc-800',
  secondary: 'bg-zinc-100 border-transparent active:bg-zinc-200',
  outline: 'bg-transparent border border-zinc-300 active:bg-zinc-50',
  text: 'bg-transparent border-transparent active:opacity-70',
} as const;

export const VARIANT_LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-zinc-900 font-semibold',
  outline: 'text-zinc-900 font-semibold',
  text: 'text-zinc-700 font-medium',
} as const;

export const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 rounded-xl',
  md: 'h-[52px] px-5 rounded-2xl',
  lg: 'h-14 px-6 rounded-2xl',
} as const;

export const VARIANT_BACKGROUND_COLORS: Record<ButtonVariant, string> = {
  primary: brandColors.primary,
  secondary: surfaceColors.element,
  outline: 'transparent',
  text: 'transparent',
} as const;

export const VARIANT_TEXT_COLORS: Record<ButtonVariant, string> = {
  primary: brandColors.primaryText,
  secondary: neutralColors['900'],
  outline: neutralColors['900'],
  text: neutralColors['700'],
} as const;

export const VARIANT_BORDER_COLORS: Record<ButtonVariant, string> = {
  primary: 'transparent',
  secondary: 'transparent',
  outline: neutralColors['200'],
  text: 'transparent',
} as const;
