export const DEFAULT_MAX_CONCURRENT_ORDERS = 2;
export const GPS_STALE_THRESHOLD_MINUTES = 5;
export const DISPATCH_COUNTDOWN_SECONDS = 20; // 20s exclusive timer per 1-by-1 offer
export const INITIAL_DISPATCH_RADIUS_KM = 5;
export const EXPANDED_DISPATCH_RADIUS_KM = 10;
export const MAX_SERIAL_DISPATCH_ATTEMPTS = 8; // Top 8 closest nearby couriers offered 1-by-1
export const MAX_DISPATCH_ATTEMPTS = 50; // Expands to broadcast pool reaching up to 50 couriers
export const BROADCAST_DISPATCH_WINDOW_SECONDS = 120; // 2-minute open radar window for Stage 2
