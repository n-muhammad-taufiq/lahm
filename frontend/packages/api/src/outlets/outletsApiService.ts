import { api } from '../client';
import {
  OutletDto,
  OutletStorefrontQuery,
  OutletStorefrontResponse,
} from './outletsApiService.types';

export const outletsApiService = {
  /**
   * Fetch outlet storefront with resolved branch pricing, inventory, and sister branches
   * Endpoint: GET /outlets/:id/storefront
   */
  async getOutletStorefront(
    outletId: number,
    query: OutletStorefrontQuery = {},
  ): Promise<OutletStorefrontResponse> {
    const params = new URLSearchParams();
    if (query.latitude !== undefined && query.latitude !== null) {
      params.append('latitude', query.latitude.toString());
    }
    if (query.longitude !== undefined && query.longitude !== null) {
      params.append('longitude', query.longitude.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/outlets/${outletId}/storefront?${queryString}`
      : `/outlets/${outletId}/storefront`;

    const response = await api.get<OutletStorefrontResponse>(endpoint);
    return response.data;
  },

  /**
   * Fetch all operating outlets for a merchant
   * Endpoint: GET /outlets/merchant/:merchantId
   */
  async getOutletsByMerchant(merchantId: number): Promise<OutletDto[]> {
    const response = await api.get<OutletDto[]>(`/outlets/merchant/${merchantId}`);
    return response.data;
  },

  /**
   * Fetch single outlet details by ID
   * Endpoint: GET /outlets/:id
   */
  async getOutletById(outletId: number): Promise<OutletDto> {
    const response = await api.get<OutletDto>(`/outlets/${outletId}`);
    return response.data;
  },
};
