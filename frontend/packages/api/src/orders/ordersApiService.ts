import { api } from '../client';
import { OutletDto } from '../outlets/outletsApiService.types';
import { ProductResponse } from '../products/productsApiService';

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  DECLINED = 'DECLINED',
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  merchantId: number;
  outletId?: number;
  items: CreateOrderItemDto[];
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product?: ProductResponse;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  merchantId: number;
  outletId?: number;
  outlet?: OutletDto;
  deliveryPartnerId?: number;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  distanceKm?: number;
  deliveryOtp: string;
  cancellationReason?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export const ordersApiService = {
  /**
   * Create a new customer order
   * Endpoint: POST /orders
   */
  async createOrder(dto: CreateOrderDto): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>('/orders', dto);
    return response.data;
  },

  /**
   * Get orders for authenticated customer
   * Endpoint: GET /orders/customer/my-orders
   */
  async getMyOrders(): Promise<OrderResponse[]> {
    const response = await api.get<OrderResponse[]>('/orders/customer/my-orders');
    return response.data;
  },

  /**
   * Get single order by ID
   * Endpoint: GET /orders/:id
   */
  async getOrderById(id: number): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },
};
