/**
 * Location & Geocoding Service for Merchant Onboarding (Mobile)
 *
 * Uses OpenStreetMap Photon and Nominatim APIs via their standardized GeocodeJSON specifications:
 * - Komoot Photon API: https://photon.komoot.io (Elasticsearch-backed OSM GeocodeJSON)
 * - OpenStreetMap Nominatim API: format=geocodejson (Standardized GeocodeJSON spec)
 */

export interface AddressSuggestion {
  id: string;
  title: string;
  subtitle: string;
  shopAddress: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  source: 'photon' | 'nominatim' | 'gps';
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// ============================================================================
// 1. EXACT SCHEMA: Komoot Photon API (https://photon.komoot.io)
// ============================================================================

export interface PhotonProperties {
  osm_id: number;
  osm_type: 'N' | 'W' | 'R';
  osm_key?: string;
  osm_value?: string;
  type?: 'house' | 'street' | 'district' | 'city' | 'county' | 'state' | 'country';
  name?: string;
  housenumber?: string;
  street?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countrycode?: string;
}

export interface PhotonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: PhotonProperties;
}

export interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

// ============================================================================
// 2. EXACT SCHEMA: OpenStreetMap Nominatim GeocodeJSON API
// (https://nominatim.org/release-docs/latest/api/Output/#geocodejson)
// ============================================================================

export interface NominatimGeocodingProperties {
  place_id: number;
  osm_type: string;
  osm_id: number;
  osm_key?: string;
  osm_value?: string;
  type?: string;
  label?: string;
  name?: string;
  housenumber?: string;
  street?: string;
  locality?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  admin?: Record<string, string>;
}

export interface NominatimGeocodeJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    geocoding: NominatimGeocodingProperties;
  };
}

export interface NominatimGeocodeJsonResponse {
  type: 'FeatureCollection';
  geocoding: {
    version: string;
    attribution: string;
    licence: string;
    query?: string;
  };
  features: NominatimGeocodeJsonFeature[];
}

// In-memory query and reverse-geocode caches
const queryCache = new Map<string, AddressSuggestion[]>();
const reverseCache = new Map<string, AddressSuggestion>();

/**
 * Builds a clean, deduplicated subtitle from ordered address components.
 */
function buildSubtitle(parts: (string | undefined | null)[]): string {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const trimmed = part.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      clean.push(trimmed);
    }
  }
  return clean.join(', ');
}

/**
 * Maps a Photon GeoJSON Feature to AddressSuggestion using exact Photon property fields.
 */
function mapPhotonFeatureToSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const p = feature.properties;
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const lon = Number(coords[0]);
  const lat = Number(coords[1]);
  if (isNaN(lat) || isNaN(lon)) return null;

  const name = p.name?.trim() || '';
  const street = p.street?.trim() || '';
  const housenumber = p.housenumber?.trim() || '';
  const streetAddress = [housenumber, street].filter(Boolean).join(' ');

  // Primary title: specific place name, or street name, or locality
  const title = name || street || p.district || p.city || 'Location';

  // Subtitle: area breakdown (avoid repeating title)
  const subtitle =
    buildSubtitle([
      street !== title ? streetAddress || street : '',
      p.district,
      p.city,
      p.state,
      p.postcode,
    ]) || p.country || '';

  // Shop address: Street line or place name
  const shopAddress = streetAddress || name || subtitle;

  return {
    id: `photon-${p.osm_id}-${lat.toFixed(5)}-${lon.toFixed(5)}`,
    title,
    subtitle,
    shopAddress,
    city: p.city?.trim() || p.county?.trim() || '',
    state: p.state?.trim() || '',
    pinCode: p.postcode?.trim() || '',
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    source: 'photon',
  };
}

/**
 * Maps a Nominatim GeocodeJSON Feature to AddressSuggestion using exact GeocodeJSON property fields.
 */
function mapNominatimGeocodeJsonFeature(
  feature: NominatimGeocodeJsonFeature,
  source: 'nominatim' | 'reverse'
): AddressSuggestion | null {
  const g = feature.properties?.geocoding;
  if (!g) return null;

  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const lon = Number(coords[0]);
  const lat = Number(coords[1]);
  if (isNaN(lat) || isNaN(lon)) return null;

  const name = g.name?.trim() || '';
  const street = g.street?.trim() || '';
  const housenumber = g.housenumber?.trim() || '';
  const locality = g.locality?.trim() || '';
  const district = g.district?.trim() || '';
  const city = g.city?.trim() || g.county?.trim() || '';
  const state = g.state?.trim() || '';
  const pinCode = g.postcode?.trim() || '';

  const streetAddress = [housenumber, street].filter(Boolean).join(' ');

  // Primary title: POI name > street > locality > district > city
  const title = name || streetAddress || street || locality || district || city || 'Pinned Location';

  // Subtitle: hierarchical locality, district, city, state, postal code
  const subtitle =
    buildSubtitle([
      street !== title ? streetAddress || street : '',
      locality !== title ? locality : '',
      district,
      city,
      state,
      pinCode,
    ]) || g.label || `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;

  // Shop address
  const shopAddress = streetAddress || name || locality || subtitle;

  return {
    id: `${source}-${g.place_id || `${lat.toFixed(5)}-${lon.toFixed(5)}`}`,
    title,
    subtitle,
    shopAddress,
    city,
    state,
    pinCode,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    source: 'nominatim',
  };
}

/**
 * Autocomplete search for address, area, or landmark.
 * Queries Photon first (fast Elasticsearch OSM index), with Nominatim GeocodeJSON fallback.
 */
export async function searchAddressSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const cacheKey = trimmed.toLowerCase();
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  let photonError: Error | null = null;

  // 1. Try Photon first
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
    const response = await fetch(photonUrl, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data: PhotonResponse = await response.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        const results: AddressSuggestion[] = data.features
          .map(mapPhotonFeatureToSuggestion)
          .filter((item): item is AddressSuggestion => item !== null);

        if (results.length > 0) {
          queryCache.set(cacheKey, results);
          return results;
        }
      }
    } else {
      photonError = new Error(`Photon API returned HTTP ${response.status}`);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    photonError = err;
  }

  // 2. Fallback: Nominatim with standardized geocodejson format
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=geocodejson&addressdetails=1&limit=6&q=${encodeURIComponent(
      trimmed
    )}`;
    const response = await fetch(nominatimUrl, {
      signal,
      headers: {
        'User-Agent': 'LahmMerchantApp/1.0 (contact@lahm.meats)',
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data: NominatimGeocodeJsonResponse = await response.json();
      if (Array.isArray(data.features)) {
        const results: AddressSuggestion[] = data.features
          .map((f) => mapNominatimGeocodeJsonFeature(f, 'nominatim'))
          .filter((item): item is AddressSuggestion => item !== null);

        queryCache.set(cacheKey, results);
        return results;
      }
    } else {
      throw new Error(`Nominatim API returned HTTP ${response.status}`);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (photonError) {
      throw new Error(`Address search service error: ${err.message || 'Network request failed'}`);
    }
    throw err;
  }

  return [];
}

import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Reverse geocode latitude and longitude to get full address details.
 * Queries Nominatim first; falls back to Photon reverse API if Nominatim fails or rate-limits.
 * Returns null if network fails or no address is found (never fake data).
 */
export async function reverseGeocodeCoords(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<AddressSuggestion | null> {
  const roundLat = Number(lat.toFixed(5));
  const roundLon = Number(lon.toFixed(5));
  const cacheKey = `${roundLat},${roundLon}`;

  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)!;
  }

  // 1. Try Nominatim GeocodeJSON
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat=${roundLat}&lon=${roundLon}&addressdetails=1`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    // Browsers forbid custom User-Agent in fetch and trigger CORS preflight failures
    if (Platform.OS !== 'web') {
      headers['User-Agent'] = 'LahmMerchantApp/1.0 (contact@lahm.meats)';
    }

    const response = await fetch(nominatimUrl, {
      signal,
      headers,
    });

    if (response.ok) {
      const data: NominatimGeocodeJsonResponse = await response.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        const result = mapNominatimGeocodeJsonFeature(data.features[0], 'reverse');
        if (result) {
          reverseCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    // Nominatim failed or rate-limited; proceed to Photon fallback below
  }

  // 2. Fallback: Komoot Photon Reverse API (CORS friendly, elasticsearch backed)
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${roundLat}&lon=${roundLon}`;
    const response = await fetch(photonUrl, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data: PhotonResponse = await response.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        const result = mapPhotonFeatureToSuggestion(data.features[0]);
        if (result) {
          reverseCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  return null;
}

/**
 * Access device GPS with high accuracy.
 * Attempts last known position first for instant response, then High/Balanced accuracy.
 * On web, tries high accuracy then gracefully falls back to standard accuracy without fake coords.
 */
export async function getCurrentDevicePosition(): Promise<Coordinates> {
  // Mobile / Native Expo path
  if (Platform.OS !== 'web') {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission was denied. Please allow location access in your device settings.');
      }

      // Fast check: last known position if recent and available
      const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
      if (lastKnown?.coords) {
        return {
          latitude: Number(lastKnown.coords.latitude.toFixed(6)),
          longitude: Number(lastKnown.coords.longitude.toFixed(6)),
          accuracy: lastKnown.coords.accuracy ?? undefined,
        };
      }

      // Live position with High accuracy (balanced for indoors/cellular)
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        return {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: position.coords.accuracy ?? undefined,
        };
      } catch {
        // Fallback to balanced accuracy if GPS satellite fix is unavailable indoors
        const fallbackPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        return {
          latitude: Number(fallbackPosition.coords.latitude.toFixed(6)),
          longitude: Number(fallbackPosition.coords.longitude.toFixed(6)),
          accuracy: fallbackPosition.coords.accuracy ?? undefined,
        };
      }
    } catch (expoError: any) {
      throw expoError;
    }
  }

  // Web / Browser path
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve, reject) => {
      // 1. Try high accuracy first with 5s timeout
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          // 2. If high accuracy times out (e.g. laptops without GPS), fallback to standard accuracy
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: Number(pos.coords.latitude.toFixed(6)),
                longitude: Number(pos.coords.longitude.toFixed(6)),
                accuracy: pos.coords.accuracy,
              });
            },
            (webErr) => {
              reject(new Error(webErr.message || 'Could not access device location. Please enable location permissions.'));
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    });
  }

  throw new Error('Geolocation is not supported by your current environment.');
}

/**
 * Gets real current device position AND reverse geocodes it into an AddressSuggestion.
 * Never returns fake fallback coordinates or dummy addresses.
 */
export async function getResolvedCurrentLocation(): Promise<AddressSuggestion> {
  const coords = await getCurrentDevicePosition();
  let resolved: AddressSuggestion | null = null;

  try {
    resolved = await reverseGeocodeCoords(coords.latitude, coords.longitude);
  } catch {
    resolved = null;
  }

  if (resolved) {
    return {
      ...resolved,
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: 'gps',
    };
  }

  // Real GPS coordinates obtained, but address lookup failed over network
  return {
    id: `gps-${coords.latitude.toFixed(5)}-${coords.longitude.toFixed(5)}`,
    title: `${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`,
    subtitle: 'Current Device GPS Location',
    shopAddress: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: coords.latitude,
    longitude: coords.longitude,
    source: 'gps',
  };
}

