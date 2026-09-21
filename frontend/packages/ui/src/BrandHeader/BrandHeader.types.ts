export interface BrandHeaderProps {
  /**
   * Subtitle text displayed below the logo
   * e.g., "PREMIUM MEAT DELIVERY" or "MERCHANT PARTNER"
   */
  subtitle?: string;

  /**
   * Optional text displayed below the logo (rendered as clean text without box)
   */
  badge?: string;

  /**
   * Whether to display flanking divider lines beside the text (default: true)
   */
  showDividers?: boolean;

  /**
   * Whether the custom 'Parisienne' font is loaded
   */
  isParisienneLoaded?: boolean;

  /**
   * Optional custom class for container
   */
  className?: string;
}
