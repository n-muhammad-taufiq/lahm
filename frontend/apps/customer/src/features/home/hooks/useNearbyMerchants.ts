import { useCallback, useEffect, useState } from 'react';
import { merchantsApiService, NearbyMerchant } from '@lahm/api';

interface UseNearbyMerchantsParams {
  latitude: number | null;
  longitude: number | null;
  radius?: number;
  search?: string;
}

export function useNearbyMerchants({
  latitude,
  longitude,
  radius = 25,
  search = '',
}: UseNearbyMerchantsParams) {
  const [merchants, setMerchants] = useState<NearbyMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await merchantsApiService.getNearbyMerchants({
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        radius,
        search: search.trim() || undefined,
      });

      setMerchants(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to find nearby merchants.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, search]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  return {
    merchants,
    loading,
    error,
    refetch: fetchNearby,
  };
}
