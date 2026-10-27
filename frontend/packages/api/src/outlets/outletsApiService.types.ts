import { MerchantCategoryDto } from '../merchants/merchantsApiService';
import { ProductResponse } from '../products/productsApiService';

export interface OutletDto {
  id: number;
  merchantId: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  openingTime: string;
  closingTime: string;
  workingDays?: string[];
  isActive: boolean;
  rating: number;
  distanceKm?: number | null;
}

export interface SisterOutletDto {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  distanceKm?: number | null;
}

export interface OutletMerchantInfoDto {
  id: number;
  shopName: string;
  description?: string;
  rating: number;
  bannerUrl?: string;
  halalCertificateUrl?: string;
  fssaiCertificateUrl?: string;
  isVerified: boolean;
  categories?: MerchantCategoryDto[];
}

export interface OutletProductResponse extends ProductResponse {
  basePrice: number;
  priceOverride?: number | null;
}

export interface OutletStorefrontResponse {
  outlet: OutletDto;
  merchant: OutletMerchantInfoDto;
  sisterOutlets: SisterOutletDto[];
  products: OutletProductResponse[];
}

export interface OutletStorefrontQuery {
  latitude?: number;
  longitude?: number;
}
