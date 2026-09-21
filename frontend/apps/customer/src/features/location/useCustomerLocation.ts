import { useCallback, useState } from 'react';
import { CustomerLocationState, LocalityPreset, POPULAR_LOCALITIES } from './types';

export function useCustomerLocation(initialPreset: LocalityPreset = POPULAR_LOCALITIES[0]) {
  const [location, setLocation] = useState<CustomerLocationState>({
    locality: initialPreset.name,
    city: initialPreset.city,
    latitude: initialPreset.latitude,
    longitude: initialPreset.longitude,
    isLocating: false,
    error: null,
  });

  const selectLocality = useCallback((preset: LocalityPreset) => {
    setLocation({
      locality: preset.name,
      city: preset.city,
      latitude: preset.latitude,
      longitude: preset.longitude,
      isLocating: false,
      error: null,
    });
  }, []);

  const detectCurrentLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setLocation((prev) => ({ ...prev, isLocating: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            locality: 'Current Location',
            city: 'Chennai',
            latitude,
            longitude,
            isLocating: false,
            error: null,
          });
        },
        (error) => {
          setLocation((prev) => ({
            ...prev,
            isLocating: false,
            error: error.message || 'Unable to retrieve your GPS location.',
          }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocation((prev) => ({
        ...prev,
        isLocating: false,
        error: 'Geolocation is not supported by your device or browser.',
      }));
    }
  }, []);

  return {
    location,
    selectLocality,
    detectCurrentLocation,
    popularLocalities: POPULAR_LOCALITIES,
  };
}
