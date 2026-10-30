import { useQuery, outletsApiService, OutletStorefrontResponse } from '@lahm/api';

export interface UseOutletStorefrontParams {
  outletId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  enabled?: boolean;
}

export function useOutletStorefront({
  outletId,
  latitude,
  longitude,
  enabled = true,
}: UseOutletStorefrontParams) {
  const query = useQuery<OutletStorefrontResponse>({
    queryKey: ['outlet-storefront', outletId, { latitude, longitude }],
    queryFn: () =>
      outletsApiService.getOutletStorefront(outletId!, {
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      }),
    enabled: Boolean(outletId) && enabled,
  });

  return {
    outletStorefront: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
