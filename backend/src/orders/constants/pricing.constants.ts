export interface DeliveryPricingConfig {
  baseFare: number;
  baseKm: number;
  perKmRate: number;
}

export const DEFAULT_PRICING_CONFIG: DeliveryPricingConfig = {
  baseFare: 5.0,
  baseKm: 2.0,
  perKmRate: 1.5,
};

export const DEFAULT_PLATFORM_FEE = 1.0;
