import { useQuery, outletsApiService, OutletDto } from '@lahm/api';

export interface UseMerchantOutletsParams {
  merchantId: number;
  enabled?: boolean;
}

export function useMerchantOutlets({
  merchantId,
  enabled = true,
}: UseMerchantOutletsParams) {
  const query = useQuery<OutletDto[]>({
    queryKey: ['merchant-outlets', merchantId],
    queryFn: () => outletsApiService.getOutletsByMerchant(merchantId),
    enabled: Boolean(merchantId) && enabled,
  });

  return {
    outlets: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
