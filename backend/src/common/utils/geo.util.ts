/**
 * Global Geographic Utilities
 */

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the standard Haversine formula.
 *
 * @param lat1 Latitude of origin point
 * @param lon1 Longitude of origin point
 * @param lat2 Latitude of destination point
 * @param lon2 Longitude of destination point
 * @returns Distance in kilometers rounded to 1 decimal place (guaranteed >= 0)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.round(R * c * 10) / 10;
  return Math.max(0, distance);
}
