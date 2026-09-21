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

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  merchantId: number;
  createdAt?: string;
  updatedAt?: string;
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
};
