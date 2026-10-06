/**
 * Product Form Modal Component
 * 
 * Add/Edit modal form for butcher shop products, including fields for name,
 * price, stock count, selling unit (per kg/piece), description, and photo URL.
 */

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CreateProductInput, ProductItem } from '../types/product.types';

interface ProductFormModalProps {
  visible: boolean;
  initialProduct?: ProductItem | null;
  onClose: () => void;
  onSave: (data: CreateProductInput) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  initialProduct,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialProduct;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('per kg');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setPrice(String(initialProduct.price));
      setStock(String(initialProduct.stock));
      setUnit(initialProduct.unit || 'per kg');
      setDescription(initialProduct.description || '');
      setPhotoUrl(initialProduct.photoUrl || '');
      setIsAvailable(initialProduct.isAvailable);
      setError('');
    } else {
      setName('');
      setPrice('');
      setStock('');
      setUnit('per kg');
      setDescription('');
      setPhotoUrl('');
      setIsAvailable(true);
      setError('');
    }
  }, [initialProduct, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter the product name');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid price in ₹');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError('Please enter a valid stock quantity');
      return;
    }

    setError('');
    onSave({
      name: name.trim(),
      price: parsedPrice,
      stock: parsedStock,
      unit: unit.trim() || 'per kg',
      description: description.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      isAvailable,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-black/40 items-center justify-center px-4">
        
        <View className="w-full max-w-[440px] bg-white rounded-2xl border border-[#F0EBE8] p-5 shadow-lg max-h-[85%]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-[#F0EBE8]">
            <View>
              <Text className="text-[10px] font-bold tracking-[1.4px] text-[#B87B6A] uppercase">
                {isEditing ? 'UPDATE INVENTORY' : 'NEW LISTING'}
              </Text>
              <Text className="text-xl font-extrabold text-[#1C1611] font-serif mt-0.5">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-[#F0EBE8] items-center justify-center">
              <Text className="text-sm text-[#7D6F66]">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Scroll Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="pt-4"
            keyboardShouldPersistTaps="handled">
            
            {/* Error Banner */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3.5">
                <Text className="text-xs text-red-600 font-medium">{error}</Text>
              </View>
            ) : null}

            {/* Product Name */}
            <View className="mb-3.5">
              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                PRODUCT NAME *
              </Text>
              <TextInput
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError('');
                }}
                placeholder="e.g. Najdi Fresh Lamb Leg"
                placeholderTextColor="#C4B7AF"
                className="h-[48px] px-3.5 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
              />
            </View>

            {/* Price & Stock in Row */}
            <View className="flex-row gap-3 mb-3.5">
              {/* Price (INR) */}
              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  PRICE (₹) *
                </Text>
                <TextInput
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    setError('');
                  }}
                  placeholder="e.g. 450"
                  placeholderTextColor="#C4B7AF"
                  keyboardType="numeric"
                  className="h-[48px] px-3.5 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
                />
              </View>

              {/* Stock */}
              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  STOCK (QTY) *
                </Text>
                <TextInput
                  value={stock}
                  onChangeText={(t) => {
                    setStock(t);
                    setError('');
                  }}
                  placeholder="e.g. 25"
                  placeholderTextColor="#C4B7AF"
                  keyboardType="numeric"
                  className="h-[48px] px-3.5 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
                />
              </View>
            </View>

            {/* Pricing Unit */}
            <View className="mb-3.5">
              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                PRICING UNIT
              </Text>
              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g. per kg, per 500g, per piece"
                placeholderTextColor="#C4B7AF"
                className="h-[48px] px-3.5 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
              />
            </View>

            {/* Description */}
            <View className="mb-3.5">
              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                DESCRIPTION
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Details, trim specs, cuts..."
                placeholderTextColor="#C4B7AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="min-h-[72px] p-3 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
              />
            </View>

            {/* Photo URL */}
            <View className="mb-4">
              <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                PHOTO URL (OPTIONAL)
              </Text>
              <TextInput
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="https://..."
                placeholderTextColor="#C4B7AF"
                autoCapitalize="none"
                className="h-[48px] px-3.5 bg-white border border-[#F0EBE8] rounded-lg text-sm font-medium text-[#1C1611]"
              />
            </View>

            {/* Availability Switch */}
            <View className="mb-5 p-3.5 bg-[#FAF7F5] border border-[#F0EBE8] rounded-xl flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-[#1C1611]">
                  Available in Store
                </Text>
                <Text className="text-xs text-[#7D6F66] mt-0.5">
                  Customers can view and order this product immediately
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsAvailable(!isAvailable)}
                activeOpacity={0.8}
                className={`w-12 h-7 rounded-full p-1 transition-all ${
                  isAvailable ? 'bg-emerald-500' : 'bg-zinc-300'
                }`}>
                <View
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    isAvailable ? 'self-end' : 'self-start'
                  }`}
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5 pb-2">
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="flex-1 h-[48px] rounded-lg bg-white border border-[#F0EBE8] items-center justify-center">
                <Text className="text-sm font-semibold text-[#1C1611]">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                className="flex-1 h-[48px] rounded-lg bg-[#E77A62] items-center justify-center shadow-sm">
                <Text className="text-sm font-bold text-white">
                  {isEditing ? 'Save Changes' : 'Save Product'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
};
