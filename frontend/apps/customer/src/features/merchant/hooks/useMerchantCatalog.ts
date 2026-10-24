import { useQuery, productsApiService, MerchantCatalogResponse } from '@lahm/api';

export interface UseMerchantCatalogParams {
  merchantId: number;
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useMerchantCatalog({
  merchantId,
  categoryId,
  search = '',
  page = 1,
  limit = 20,
  enabled = true,
}: UseMerchantCatalogParams) {
  const query = useQuery<MerchantCatalogResponse>({
    queryKey: ['merchant-catalog', merchantId, { categoryId, search: search.trim(), page, limit }],
    queryFn: () =>
      productsApiService.getMerchantCatalog(merchantId, {
        categoryId,
        search: search.trim() || undefined,
        page,
        limit,
      }),
    enabled: Boolean(merchantId) && enabled,
  });

  return {
    catalog: query.data,
    products: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    currentPage: query.data?.page ?? page,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
