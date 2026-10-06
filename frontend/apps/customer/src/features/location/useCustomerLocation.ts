import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { CustomerLocationState } from './types';

export function useCustomerLocation(autoPrompt: boolean = true) {
  const [location, setLocation] = useState<CustomerLocationState>({
    locality: '',
    city: '',
    latitude: null,
    longitude: null,
    isLocating: false,
    error: null,
  });
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const requestAndAcquireLocation = useCallback(async () => {
    try {
      setLocation((prev) => ({ ...prev, isLocating: true, error: null }));

      // 1. Check existing permission status
      let { status } = await Location.getForegroundPermissionsAsync();

      // 2. If not granted or undetermined, request permission
      if (status !== Location.PermissionStatus.GRANTED) {
        const response = await Location.requestForegroundPermissionsAsync();
        status = response.status;
      }

      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocation((prev) => ({
          ...prev,
          isLocating: false,
          error: 'Location permission not granted. Please enable location to find nearby stores.',
        }));
        return null;
      }

      // 3. Fast lookup: check recent last known position
      const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
      let coords = lastKnown?.coords;

      // 4. Live position fallback with Balanced accuracy
      if (!coords) {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = current.coords;
      }

      const { latitude, longitude } = coords;

      // 5. Reverse geocode to real street/district locality
      let localityName = 'Current Location';
      let cityName = '';
      try {
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded.length > 0) {
          const item = geocoded[0];
          localityName = item.district || item.subregion || item.name || item.street || 'Current Location';
          cityName = item.city || item.region || '';
        }
      } catch {
        // Geocode network issue; real coordinates are already secured
      }

      const newState: CustomerLocationState = {
        locality: localityName,
        city: cityName,
        latitude,
        longitude,
        isLocating: false,
        error: null,
      };

      setLocation(newState);
      return newState;
    } catch (err: any) {
      const errorMsg = err?.message || 'Unable to retrieve device location.';
      setLocation((prev) => ({ ...prev, isLocating: false, error: errorMsg }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoPrompt) {
      requestAndAcquireLocation();
    }
  }, [autoPrompt, requestAndAcquireLocation]);

  return {
    location,
    isLocating: location.isLocating,
    permissionStatus,
    detectCurrentLocation: requestAndAcquireLocation,
    setLocation,
  };
}
