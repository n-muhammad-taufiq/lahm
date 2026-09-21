import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import type { ProductItem } from '../types/product.types';

interface ProductDeleteModalProps {
  visible: boolean;
  product?: ProductItem | null;
  onClose: () => void;
  onConfirmDelete: (productId: number) => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  visible,
  product,
  onClose,
  onConfirmDelete,
}) => {
  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 items-center justify-center px-5">
        <View className="w-full max-w-[380px] bg-white rounded-2xl border border-[#F0EBE8] p-5 shadow-lg">
          
          {/* Warning Icon Badge */}
          <View className="w-10 h-10 rounded-full bg-red-50 border border-red-200 items-center justify-center mb-3.5 self-center">
            <Text className="text-red-600 text-base font-bold">✕</Text>
          </View>

          {/* Title */}
          <Text className="text-xl font-extrabold text-[#1C1611] font-serif text-center mb-1">
            Delete Product?
          </Text>

          {/* Product Details Box */}
          <View className="my-3 p-3 bg-[#FAF7F5] border border-[#F0EBE8] rounded-xl items-center">
            <Text className="text-sm font-bold text-[#1C1611] text-center">
              {product.name}
            </Text>
            <Text className="text-xs text-[#7D6F66] mt-0.5">
              ₹{product.price.toLocaleString('en-IN')} {product.unit || 'per kg'}
            </Text>
          </View>

          {/* Explanation */}
          <Text className="text-xs text-[#7D6F66] text-center leading-[18px] mb-5">
            This product will be permanently removed from your catalog and will no longer be available to customers.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 h-[46px] rounded-lg bg-white border border-[#F0EBE8] items-center justify-center">
              <Text className="text-sm font-semibold text-[#1C1611]">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onConfirmDelete(product.id)}
              activeOpacity={0.85}
              className="flex-1 h-[46px] rounded-lg bg-red-600 items-center justify-center shadow-sm">
              <Text className="text-sm font-bold text-white">
                Delete Product
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};
