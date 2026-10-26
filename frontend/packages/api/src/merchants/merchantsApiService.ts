import { api } from '../client';
import { ProductResponse } from '../products/productsApiService';

export interface MerchantCategoryDto {
  id: number;
  slug: string;
  name: string;
}

export interface NearbyMerchant {
  id: number;
  shopName: string;
  description?: string;
  shopAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number | null;
  deliveryTimeEstimate: string;
  rating: number;
  bannerUrl?: string;
  halalCertificateUrl?: string;
  fssaiCertificateUrl?: string;
  openingTime: string;
  closingTime: string;
  workingDays?: string[];
  isVerified: boolean;
  productCount: number;
  featuredProducts: string[];
  categories?: MerchantCategoryDto[];
}

export interface NearbyMerchantsQuery {
  latitude?: number;
  longitude?: number;
  radius?: number;
  city?: string;
  search?: string;
}

export interface MerchantStorefrontResponse {
  id: number;
  shopName: string;
  description?: string;
  shopAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  bannerUrl?: string;
  halalCertificateUrl?: string;
  fssaiCertificateUrl?: string;
  openingTime: string;
  closingTime: string;
  workingDays?: string[];
  isVerified: boolean;
  categories?: MerchantCategoryDto[];
  products: ProductResponse[];
}

export const merchantsApiService = {
  /**
   * Fetch nearby butchery merchants filtered by coordinates and radius
   * Endpoint: GET /merchant/nearby
   */
  async getNearbyMerchants(query: NearbyMerchantsQuery = {}): Promise<NearbyMerchant[]> {
    const params = new URLSearchParams();
    if (query.latitude !== undefined && query.latitude !== null) {
      params.append('latitude', query.latitude.toString());
    }
    if (query.longitude !== undefined && query.longitude !== null) {
      params.append('longitude', query.longitude.toString());
    }
    if (query.radius !== undefined && query.radius !== null) {
      params.append('radius', query.radius.toString());
    }
    if (query.city) {
      params.append('city', query.city.trim());
    }
    if (query.search) {
      params.append('search', query.search.trim());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/merchant/nearby?${queryString}` : '/merchant/nearby';
    const response = await api.get<NearbyMerchant[]>(endpoint);
    return response.data;
  },

  /**
   * Fetch merchant storefront and their live products
   * Endpoint: GET /merchant/storefront/:id
   */
  async getMerchantStorefront(merchantId: number): Promise<MerchantStorefrontResponse> {
    const response = await api.get<MerchantStorefrontResponse>(`/merchant/storefront/${merchantId}`);
    return response.data;
  },

  /**
   * Fetch raw merchant details by ID
   * Endpoint: GET /merchant/:id
   */
  async getMerchantById(merchantId: number): Promise<any> {
    const response = await api.get<any>(`/merchant/${merchantId}`);
    return response.data;
  },
};
