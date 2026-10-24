import { useQuery, productsApiService, CategoryTreeNode } from '@lahm/api';

export interface UseMerchantCategoriesParams {
  merchantId: number;
  parentId?: number;
  tree?: boolean;
  enabled?: boolean;
}

export function useMerchantCategories({
  merchantId,
  parentId,
  tree = true,
  enabled = true,
}: UseMerchantCategoriesParams) {
  const query = useQuery<CategoryTreeNode[]>({
    queryKey: ['merchant-categories', merchantId, { parentId, tree }],
    queryFn: () =>
      productsApiService.getMerchantCategories(merchantId, { parentId, tree }),
    enabled: Boolean(merchantId) && enabled,
  });

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
