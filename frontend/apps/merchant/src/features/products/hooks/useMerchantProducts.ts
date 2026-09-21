import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  getActiveMerchant,
  productsApiService,
  extractErrorMessage,
  type ActiveMerchant,
  type ProductResponse,
} from '@/services';
import type { CreateProductInput, ProductItem, UpdateProductInput } from '../types/product.types';

function mapResponseToProduct(res: ProductResponse): ProductItem {
  return {
    id: res.id,
    name: res.name,
    description: res.description,
    photoUrl: res.photoUrl,
    price: typeof res.price === 'string' ? parseFloat(res.price) : res.price,
    stock: res.stock,
    isAvailable: res.isAvailable,
    merchantId: res.merchantId,
    unit: 'per kg',
  };
}

export function useMerchantProducts() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<ActiveMerchant | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Resolve Active Merchant Session (Strict: Zero Fallbacks)
  useEffect(() => {
    const currentMerchant = getActiveMerchant();
    if (!currentMerchant) {
      // Unauthenticated session: redirect to login
      router.replace('/' as any);
      return;
    }
    setMerchant(currentMerchant);
  }, [router]);

  // 2. Fetch products for active merchant
  const fetchProducts = useCallback(async () => {
    const currentMerchant = getActiveMerchant();
    if (!currentMerchant) return;

    setError(null);
    try {
      const data = await productsApiService.getProductsByMerchant(currentMerchant.id);
      setProducts(data.map(mapResponseToProduct));
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (merchant) {
      fetchProducts();
    }
  }, [merchant, fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // 3. Create Product
  const createProduct = async (input: CreateProductInput): Promise<boolean> => {
    if (!merchant) {
      setError('Active merchant session required');
      return false;
    }

    setError(null);
    try {
      const created = await productsApiService.createProduct({
        name: input.name,
        price: input.price,
        stock: input.stock,
        description: input.description,
        photoUrl: input.photoUrl,
        isAvailable: input.isAvailable,
        merchantId: merchant.id,
      });

      setProducts((prev) => [mapResponseToProduct(created), ...prev]);
      return true;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      return false;
    }
  };

  // 4. Update Product
  const updateProduct = async (
    id: number,
    input: UpdateProductInput,
  ): Promise<boolean> => {
    setError(null);
    try {
      const updated = await productsApiService.updateProduct(id, {
        name: input.name,
        price: input.price,
        stock: input.stock,
        description: input.description,
        photoUrl: input.photoUrl,
        isAvailable: input.isAvailable,
      });

      setProducts((prev) =>
        prev.map((item) => (item.id === id ? mapResponseToProduct(updated) : item)),
      );
      return true;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      return false;
    }
  };

  // 5. Delete Product
  const deleteProduct = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await productsApiService.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      return false;
    }
  };

  // 6. Toggle Availability
  const toggleAvailability = async (id: number): Promise<void> => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const newAvailability = !existing.isAvailable;
    // Optimistic update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: newAvailability } : item,
      ),
    );

    try {
      await productsApiService.updateProduct(id, {
        isAvailable: newAvailability,
      });
    } catch (err: unknown) {
      // Rollback on failure
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: existing.isAvailable } : item,
        ),
      );
      setError(extractErrorMessage(err));
    }
  };

  return {
    merchant,
    products,
    loading,
    refreshing,
    error,
    onRefresh,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  };
}
