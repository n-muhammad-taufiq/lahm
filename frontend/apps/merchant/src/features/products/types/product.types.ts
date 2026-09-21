export interface ProductItem {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  merchantId: number;
  unit?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  unit?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  photoUrl?: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
  unit?: string;
}
