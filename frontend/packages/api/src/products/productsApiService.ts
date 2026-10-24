import { api } from '../client';

export interface CreateProductDto {
  name: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock?: number;
  isAvailable?: boolean;
  merchantId: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  photoUrl?: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
  merchantId?: number;
}

export interface CustomizationOptionDto {
  id: number;
  groupId: number;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface CustomizationGroupDto {
  id: number;
  productId: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  options?: CustomizationOptionDto[];
}

export interface CategoryTreeNode {
  id: number;
  merchantId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
  depth: number;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  hasChildren?: boolean;
  children?: CategoryTreeNode[];
}

export interface MerchantCategoriesQuery {
  parentId?: number;
  tree?: boolean;
}

export interface MerchantCatalogQuery {
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  merchantId: number;
  categoryId?: number;
  category?: CategoryTreeNode;
  customizationGroups?: CustomizationGroupDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantCatalogResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApiService = {
  /**
   * Fetch all products belonging to a merchant
   * Endpoint: GET /products/merchant/:merchantId
   */
  async getProductsByMerchant(merchantId: number): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(
      `/products/merchant/${merchantId}`,
    );
    return response.data;
  },

  /**
   * Fetch a single product by ID
   * Endpoint: GET /products/:id
   */
  async getProductById(id: number): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product for a merchant
   * Endpoint: POST /products
   */
  async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>('/products', data);
    return response.data;
  },

  /**
   * Update an existing product
   * Endpoint: PATCH /products/:id
   */
  async updateProduct(
    id: number,
    data: UpdateProductDto,
  ): Promise<ProductResponse> {
    const response = await api.patch<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product
   * Endpoint: DELETE /products/:id
   */
  async deleteProduct(id: number): Promise<{ message: string; id: number }> {
    const response = await api.delete<{ message: string; id: number }>(
      `/products/${id}`,
    );
    return response.data;
  },

  /**
   * Fetch hierarchical or flat category tree for a merchant
   * Endpoint: GET /products/merchant/:merchantId/categories
   */
  async getMerchantCategories(
    merchantId: number,
    query: MerchantCategoriesQuery = {},
  ): Promise<CategoryTreeNode[]> {
    const params = new URLSearchParams();
    if (query.parentId !== undefined && query.parentId !== null) {
      params.append('parentId', query.parentId.toString());
    }
    if (query.tree !== undefined && query.tree !== null) {
      params.append('tree', query.tree ? 'true' : 'false');
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/merchant/${merchantId}/categories?${queryString}`
      : `/products/merchant/${merchantId}/categories`;
    const response = await api.get<CategoryTreeNode[]>(endpoint);
    return response.data;
  },

  /**
   * Fetch paginated product catalog for a merchant with category filtering and search
   * Endpoint: GET /products/merchant/:merchantId/catalog
   */
  async getMerchantCatalog(
    merchantId: number,
    query: MerchantCatalogQuery = {},
  ): Promise<MerchantCatalogResponse> {
    const params = new URLSearchParams();
    if (query.categoryId !== undefined && query.categoryId !== null) {
      params.append('categoryId', query.categoryId.toString());
    }
    if (query.search && query.search.trim().length > 0) {
      params.append('search', query.search.trim());
    }
    if (query.page !== undefined && query.page !== null) {
      params.append('page', query.page.toString());
    }
    if (query.limit !== undefined && query.limit !== null) {
      params.append('limit', query.limit.toString());
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/merchant/${merchantId}/catalog?${queryString}`
      : `/products/merchant/${merchantId}/catalog`;
    const response = await api.get<MerchantCatalogResponse>(endpoint);
    return response.data;
  },
};
