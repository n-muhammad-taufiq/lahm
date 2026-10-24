/**
 * Customer Cart Store (Zustand)
 * 
 * Manages client-side basket items and active merchant scoping.
 * Contains ZERO hardcoded delivery pricing or mock thresholds;
 * all delivery quotes are server-authoritative and fetched via API.
 */

import { create } from 'zustand';

export type MerchantVertical = 'meats' | 'restaurants' | 'groceries';

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  specialInstructions?: string;
}

export interface CartMerchant {
  id: number;
  name: string;
  vertical: MerchantVertical;
  distanceKm?: number;
}

export interface CartState {
  merchant: CartMerchant | null;
  items: CartItem[];
  addItem: (
    merchant: CartMerchant,
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
  ) => void;
  removeItem: (itemId: number | string) => void;
  updateQuantity: (itemId: number | string, delta: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  merchant: null,
  items: [],

  addItem: (merchant, item) => {
    set((state) => {
      // Single-merchant scoping: replaces cart if switching merchants
      const isSameMerchant = state.merchant?.id === merchant.id;
      const currentItems = isSameMerchant ? state.items : [];
      const existingIndex = currentItems.findIndex((i) => i.id === item.id);

      let newItems: CartItem[];
      const qtyToAdd = item.quantity ?? 1;

      if (existingIndex > -1) {
        newItems = [...currentItems];
        newItems[existingIndex].quantity += qtyToAdd;
      } else {
        newItems = [...currentItems, { ...item, quantity: qtyToAdd }];
      }

      return { merchant, items: newItems };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return {
        items: newItems,
        merchant: newItems.length === 0 ? null : state.merchant,
      };
    });
  },

  updateQuantity: (itemId, delta) => {
    set((state) => {
      const newItems = state.items
        .map((i) => {
          if (i.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null);

      return {
        items: newItems,
        merchant: newItems.length === 0 ? null : state.merchant,
      };
    });
  },

  clearCart: () => set({ items: [], merchant: null }),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  getSubtotal: () =>
    Math.round(
      get().items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
    ) / 100,
}));
