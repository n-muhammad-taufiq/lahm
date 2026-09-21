export interface ActiveMerchant {
  id: number;
  userId?: number;
  name?: string;
  shopAddress?: string;
  city?: string;
  isVerified?: boolean;
}

let activeMerchant: ActiveMerchant | null = null;

/**
 * Sets the currently authenticated merchant in session memory
 */
export function setActiveMerchant(merchant: ActiveMerchant | null): void {
  activeMerchant = merchant;
}

/**
 * Retrieves the currently authenticated merchant, or null if unauthenticated.
 * Strict resolution: no arbitrary fallback IDs.
 */
export function getActiveMerchant(): ActiveMerchant | null {
  return activeMerchant;
}

/**
 * Returns the active merchant ID if authenticated, or null.
 */
export function getActiveMerchantId(): number | null {
  return activeMerchant?.id ?? null;
}

/**
 * Clears the active merchant session upon logout
 */
export function clearActiveMerchant(): void {
  activeMerchant = null;
}
