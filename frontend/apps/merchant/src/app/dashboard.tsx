import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import {
  ProductCard,
  ProductCatalogView,
  ProductDeleteModal,
  ProductFormModal,
  useMerchantProducts,
  type CreateProductInput,
  type ProductItem,
} from '../features/products';
import {
  MerchantBottomNav,
  type MerchantNavTab,
} from '../components/navigation/MerchantBottomNav';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isParisienneLoaded = Font.isLoaded('Parisienne');

  // Navigation & Store State
  const [activeTab, setActiveTab] = useState<MerchantNavTab>('home');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Live Backend Hook (Strict Session Resolution: No Fallbacks)
  const {
    merchant,
    products,
    loading,
    refreshing,
    error,
    onRefresh,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  } = useMerchantProducts();

  // Modal Handlers with real backend persistence
  const handleAddProduct = async (input: CreateProductInput) => {
    const success = await createProduct(input);
    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleEditProduct = async (input: CreateProductInput) => {
    if (!editingProduct) return;
    const success = await updateProduct(editingProduct.id, input);
    if (success) {
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const success = await deleteProduct(productId);
    if (success) {
      setDeletingProduct(null);
    }
  };

  // Filtered preview on Home screen
  const homePreviewProducts = useMemo(() => {
    if (!homeSearchQuery.trim()) {
      return products.slice(0, 4);
    }
    return products.filter((p) =>
      p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(homeSearchQuery.toLowerCase())),
    );
  }, [products, homeSearchQuery]);

  return (
    <View className="flex-1 bg-white">
      {/* 1. TOP HEADER BAR */}
      <View
        className="px-5 pb-3.5 bg-white border-b border-[#F0EBE8] flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 6 }}>
        
        {/* Brand Mark */}
        <View className="flex-row items-baseline gap-2">
          <Text
            style={{ fontFamily: isParisienneLoaded ? 'Parisienne' : undefined }}
            className="text-[34px] text-[#1C1611] leading-[38px]">
            Lahm
          </Text>
          <View className="flex-row items-center">
            <View className="w-2.5 h-[1px] bg-[#F2D8CD] mr-1.5" />
            <Text className="text-[10px] font-bold tracking-[1.6px] text-[#B87B6A] uppercase">
              MERCHANT
            </Text>
          </View>
        </View>

        {/* Store Status Toggle & Exit */}
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => setIsStoreOpen(!isStoreOpen)}
            activeOpacity={0.8}
            className={`flex-row items-center px-3 py-1.5 rounded-full border ${
              isStoreOpen
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-zinc-50 border-zinc-200'
            }`}>
            <View
              className={`w-2 h-2 rounded-full mr-1.5 ${
                isStoreOpen ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
            />
            <Text
              className={`text-xs font-semibold ${
                isStoreOpen ? 'text-emerald-700' : 'text-zinc-600'
              }`}>
              {isStoreOpen ? 'Store Online' : 'Store Offline'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/' as any)}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-[#F0EBE8] items-center justify-center">
            <Text className="text-xs text-[#7D6F66]">✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BODY CONTENT */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#E77A62" />
          <Text className="text-sm font-semibold text-[#1C1611] mt-3">
            Loading your catalog...
          </Text>
          <Text className="text-xs text-[#7D6F66] mt-1">
            Connecting to partner database
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Error Banner */}
          {error ? (
            <View className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex-row items-center justify-between">
              <Text className="flex-1 text-xs text-red-600 font-medium pr-2">
                {error}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                activeOpacity={0.7}
                className="px-2.5 py-1 bg-red-100 rounded-md">
                <Text className="text-xs font-bold text-red-700">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {activeTab === 'home' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#E77A62"
                />
              }
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 32,
              }}>
              
              {/* Store Greeting Banner */}
              <View className="mb-5">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1">
                  PARTNER OVERVIEW
                </Text>
                <Text className="text-[26px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                  Partner Portal.
                </Text>
                <Text className="text-sm text-[#7D6F66] mt-1">
                  {merchant?.name || 'Artisanal Butchery'} •{' '}
                  <Text className="text-emerald-600 font-medium">✓ Verified Halal Partner</Text>
                </Text>
              </View>

              {/* Primary Action Button (Brand Peach) */}
              <View className="mb-6">
                <TouchableOpacity
                  onPress={() => setIsAddModalOpen(true)}
                  activeOpacity={0.85}
                  className="w-full h-[48px] rounded-lg bg-[#E77A62] flex-row items-center justify-center shadow-sm">
                  <Text className="text-white font-bold text-[14px]">
                    + Add New Product
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Product Inventory Section Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-lg font-extrabold text-[#1C1611] tracking-tight font-serif">
                    Product Inventory
                  </Text>
                  <Text className="text-xs text-[#7D6F66] mt-0.5">
                    Live products available to your customers
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setActiveTab('products')}
                  activeOpacity={0.7}
                  className="py-1">
                  <Text className="text-xs font-bold text-[#E77A62]">
                    View All ({products.length}) →
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Search */}
              <View className="mb-4">
                <View className="bg-white border border-[#F0EBE8] rounded-lg h-[44px] px-3.5 flex-row items-center shadow-sm">
                  <Text className="text-[#7D6F66] mr-2 text-sm">🔍</Text>
                  <TextInput
                    value={homeSearchQuery}
                    onChangeText={setHomeSearchQuery}
                    placeholder="Search products by name..."
                    placeholderTextColor="#BDB0A8"
                    className="flex-1 text-sm font-medium text-[#1C1611] py-0"
                  />
                  {homeSearchQuery ? (
                    <TouchableOpacity onPress={() => setHomeSearchQuery('')} className="p-1">
                      <Text className="text-xs text-[#7D6F66]">✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Product Cards Preview */}
              {homePreviewProducts.length > 0 ? (
                <View className="gap-3">
                  {homePreviewProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={(p) => setEditingProduct(p)}
                      onDelete={(p) => setDeletingProduct(p)}
                      onToggleAvailability={toggleAvailability}
                    />
                  ))}
                </View>
              ) : (
                <View className="bg-[#FAF7F5] border border-[#F0EBE8] rounded-xl p-6 items-center justify-center my-2">
                  <Text className="text-2xl mb-2">🥩</Text>
                  <Text className="text-base font-bold text-[#1C1611] text-center">
                    {products.length === 0
                      ? 'No products in your catalog yet'
                      : `No products matching "${homeSearchQuery}"`}
                  </Text>
                  <Text className="text-xs text-[#7D6F66] text-center max-w-[260px] mt-1 mb-4">
                    {products.length === 0
                      ? 'List your fresh meat cuts to start receiving orders from verified customers.'
                      : 'Try searching with a different product name.'}
                  </Text>
                  {products.length === 0 ? (
                    <TouchableOpacity
                      onPress={() => setIsAddModalOpen(true)}
                      activeOpacity={0.85}
                      className="h-[42px] px-5 rounded-lg bg-[#E77A62] items-center justify-center shadow-sm">
                      <Text className="text-xs font-bold text-white">
                        + Add First Product
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}

            </ScrollView>
          ) : (
            <ProductCatalogView
              products={products}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onAddNewProduct={() => setIsAddModalOpen(true)}
              onEditProduct={(p) => setEditingProduct(p)}
              onDeleteProduct={(p) => setDeletingProduct(p)}
              onToggleAvailability={toggleAvailability}
            />
          )}
        </View>
      )}

      {/* 3. BOTTOM NAVIGATION */}
      <MerchantBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productsCount={products.length}
      />

      {/* 4. ADD PRODUCT MODAL */}
      <ProductFormModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
      />

      {/* 5. EDIT PRODUCT MODAL */}
      <ProductFormModal
        visible={!!editingProduct}
        initialProduct={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditProduct}
      />

      {/* 6. DELETE PRODUCT CONFIRMATION MODAL */}
      <ProductDeleteModal
        visible={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirmDelete={handleDeleteProduct}
      />
    </View>
  );
}
