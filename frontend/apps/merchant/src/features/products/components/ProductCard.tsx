/**
 * Product Card Component
 * 
 * Displays a product item card showing name, price, stock status, and actions
 * to toggle stock availability, edit details, or delete the item.
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { ProductItem } from '../types/product.types';

interface ProductCardProps {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onToggleAvailability: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <View className="bg-white border border-[#F0EBE8] rounded-xl p-4 shadow-sm">
      {/* Top Details Row */}
      <View className="flex-row items-start justify-between">
        {/* Product Info */}
        <View className="flex-1 pr-3">
          {/* Stock Status Badge (No category pill) */}
          <View className="flex-row items-center mb-1.5">
            {isOutOfStock ? (
              <View className="bg-zinc-100 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Out of Stock
                </Text>
              </View>
            ) : isLowStock ? (
              <View className="bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Low Stock ({product.stock} {product.unit || 'kg'} left)
                </Text>
              </View>
            ) : (
              <View className="bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  In Stock ({product.stock} {product.unit || 'kg'})
                </Text>
              </View>
            )}
          </View>

          {/* Product Name */}
          <Text className="text-[16px] font-bold text-[#1C1611]">
            {product.name}
          </Text>

          {/* Product Description */}
          {product.description ? (
            <Text
              className="text-xs text-[#7D6F66] mt-0.5 leading-[17px]"
              numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}
        </View>

        {/* Price in INR */}
        <View className="items-end pl-2">
          <Text className="text-[18px] font-extrabold text-[#1C1611] font-serif">
            ₹{product.price.toLocaleString('en-IN')}
          </Text>
          <Text className="text-[11px] text-[#7D6F66] mt-0.5">
            {product.unit || 'per kg'}
          </Text>
        </View>
      </View>

      {/* Bottom Controls Row */}
      <View className="mt-3.5 pt-3 border-t border-[#F0EBE8] flex-row items-center justify-between">
        {/* Availability Toggle */}
        <TouchableOpacity
          onPress={() => onToggleAvailability(product.id)}
          activeOpacity={0.7}
          className="flex-row items-center py-1">
          <View
            className={`w-2.5 h-2.5 rounded-full mr-1.5 ${
              product.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
          <Text
            className={`text-xs font-semibold ${
              product.isAvailable ? 'text-emerald-700' : 'text-zinc-500'
            }`}>
            {product.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </TouchableOpacity>

        {/* Edit and Delete Action Buttons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => onEdit(product)}
            activeOpacity={0.7}
            className="px-3 py-1.5 rounded-md bg-white border border-[#F0EBE8]">
            <Text className="text-xs font-semibold text-[#1C1611]">
              Edit Product
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(product)}
            activeOpacity={0.7}
            className="px-3 py-1.5 rounded-md bg-white border border-red-100">
            <Text className="text-xs font-semibold text-red-500">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
