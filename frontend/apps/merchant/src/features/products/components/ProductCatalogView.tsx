/**
 * Product Catalog View Component
 * 
 * Complete catalog view for merchants with search filtering, stock status summary chips,
 * pull-to-refresh, empty states, and product list rendering.
 */

import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ProductItem } from '../types/product.types';
import { ProductCard } from './ProductCard';

interface ProductCatalogViewProps {
  products: ProductItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onAddNewProduct: () => void;
  onEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (product: ProductItem) => void;
  onToggleAvailability: (productId: number) => void;
}

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({
  products,
  refreshing,
  onRefresh,
  onAddNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'low_stock'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'available') {
        return product.isAvailable && product.stock > 0;
      }
      if (statusFilter === 'low_stock') {
        return product.stock > 0 && product.stock <= 5;
      }
      return true;
    });
  }, [products, searchQuery, statusFilter]);

  const availableCount = products.filter((p) => p.isAvailable && p.stock > 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <View className="flex-1 bg-white">
      {/* Catalog Header with Add Product CTA */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#F0EBE8]">
        <View>
          <Text className="text-[10px] font-bold tracking-[1.4px] text-[#B87B6A] uppercase">
            STORE INVENTORY
          </Text>
          <Text className="text-xl font-extrabold text-[#1C1611] font-serif">
            Product Catalog
          </Text>
        </View>

        <TouchableOpacity
          onPress={onAddNewProduct}
          activeOpacity={0.85}
          className="h-[38px] px-3.5 rounded-lg bg-[#E77A62] flex-row items-center justify-center shadow-sm">
          <Text className="text-white font-bold text-xs">
            + Add Product
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input & Status Filter Pills */}
      <View className="px-5 pt-3.5 pb-2">
        {/* Search Bar */}
        <View className="bg-white border border-[#F0EBE8] rounded-lg h-[44px] px-3 flex-row items-center shadow-sm">
          <Text className="text-[#7D6F66] mr-2 text-sm">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products by name..."
            placeholderTextColor="#BDB0A8"
            className="flex-1 text-sm font-medium text-[#1C1611] py-0"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Text className="text-xs text-[#7D6F66]">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Pills (No category pills) */}
        <View className="flex-row gap-2 mt-2.5">
          <TouchableOpacity
            onPress={() => setStatusFilter('all')}
            activeOpacity={0.7}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'all'
                ? 'bg-[#1C1611] border-[#1C1611]'
                : 'bg-white border-[#F0EBE8]'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                statusFilter === 'all' ? 'text-white' : 'text-[#7D6F66]'
              }`}>
              All Products ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStatusFilter('available')}
            activeOpacity={0.7}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'available'
                ? 'bg-[#1C1611] border-[#1C1611]'
                : 'bg-white border-[#F0EBE8]'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                statusFilter === 'available' ? 'text-white' : 'text-[#7D6F66]'
              }`}>
              Available ({availableCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStatusFilter('low_stock')}
            activeOpacity={0.7}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === 'low_stock'
                ? 'bg-[#1C1611] border-[#1C1611]'
                : 'bg-white border-[#F0EBE8]'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                statusFilter === 'low_stock' ? 'text-white' : 'text-[#7D6F66]'
              }`}>
              Low Stock ({lowStockCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? false}
              onRefresh={onRefresh}
              tintColor="#E77A62"
            />
          ) : undefined
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 40,
          gap: 12,
        }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleAvailability={onToggleAvailability}
            />
          ))
        ) : (
          <View className="py-16 items-center justify-center">
            <View className="w-12 h-12 rounded-full bg-[#FAF7F5] border border-[#F0EBE8] items-center justify-center mb-3">
              <Text className="text-xl">🥩</Text>
            </View>
            <Text className="text-base font-bold text-[#1C1611] mb-1">
              No products found
            </Text>
            <Text className="text-xs text-[#7D6F66] text-center max-w-[240px] mb-4">
              {searchQuery
                ? `No products matching "${searchQuery}"`
                : 'Your catalog is empty. Add your first product to get started.'}
            </Text>
            <TouchableOpacity
              onPress={onAddNewProduct}
              activeOpacity={0.85}
              className="h-[42px] px-5 rounded-lg bg-[#E77A62] items-center justify-center">
              <Text className="text-white font-bold text-xs">
                + Add Product
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
