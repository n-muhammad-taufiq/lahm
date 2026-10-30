/**
 * RestaurantStorefront Component
 * 
 * Specialized vertical storefront layout for Food / Restaurants.
 * Assembles the restaurant shop header, category navigation pill bar,
 * and category-grouped menu sections using real category tree data.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  CategoryTreeNode,
  MerchantStorefrontResponse,
  OutletDto,
  ProductResponse,
  SisterOutletDto,
} from '@lahm/api';
import { ShopHeader } from '../header/ShopHeader';
import { ShopOutletSelectionSheet } from '../outlets/ShopOutletSelectionSheet';
import { RestaurantCategoryNav } from './RestaurantCategoryNav';
import { RestaurantCategorySection } from './RestaurantCategorySection';
import { useMerchantCategories } from '../../hooks/useMerchantCategories';
import { useMerchantOutlets } from '../../hooks/useMerchantOutlets';
import { useOutletStorefront } from '../../hooks/useOutletStorefront';
import { useCustomerLocation } from '../../../location';
import { useCartStore } from '../../../cart/cartStore';

/**
 * Recursively collects a category's own ID and all nested descendant IDs (any depth)
 */
function collectAllCategoryIds(node: CategoryTreeNode): number[] {
  const ids: number[] = [node.id];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      ids.push(...collectAllCategoryIds(child));
    }
  }
  return ids;
}

export interface RestaurantStorefrontProps {
  storefront: MerchantStorefrontResponse;
  isFavorite?: boolean;
  onPressBack?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export function RestaurantStorefront({
  storefront,
  isFavorite = false,
  onPressBack,
  onToggleFavorite,
  className = '',
}: RestaurantStorefrontProps) {
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartMerchant = useCartStore((state) => state.merchant);
  const cartItems = useCartStore((state) => state.items);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useState(false);

  // 1. Fetch real category tree and branches for this restaurant
  const { categories } = useMerchantCategories({
    merchantId: storefront.id,
    tree: true,
  });

  const { outlets } = useMerchantOutlets({
    merchantId: storefront.id,
  });

  // Track active outlet (scoped to existing cart outlet for this merchant or first branch)
  const [activeOutlet, setActiveOutlet] = useState<OutletDto | SisterOutletDto | null>(null);

  // 2. Fetch customer GPS coordinates for live distance calculation
  const { location } = useCustomerLocation(false);

  // 3. Fetch branch-scoped storefront (price overrides, branch stock, sister branches with distance)
  const { outletStorefront } = useOutletStorefront({
    outletId: activeOutlet?.id,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  // Use branch-scoped products with price overrides, falling back to storefront products
  const products = outletStorefront?.products ?? storefront.products ?? [];

  // Merge active outlet and sister outlets with live GPS distance calculated by backend
  const displayOutlets: SisterOutletDto[] = useMemo(() => {
    if (!outletStorefront) {
      return outlets;
    }
    const currentAsSister: SisterOutletDto = {
      id: outletStorefront.outlet.id,
      name: outletStorefront.outlet.name,
      address: outletStorefront.outlet.address,
      city: outletStorefront.outlet.city,
      state: outletStorefront.outlet.state,
      pinCode: outletStorefront.outlet.pinCode,
      latitude: outletStorefront.outlet.latitude,
      longitude: outletStorefront.outlet.longitude,
      phoneNumber: outletStorefront.outlet.phoneNumber,
      openingTime: outletStorefront.outlet.openingTime,
      closingTime: outletStorefront.outlet.closingTime,
      rating: outletStorefront.outlet.rating,
      distanceKm: outletStorefront.outlet.distanceKm,
    };
    return [currentAsSister, ...outletStorefront.sisterOutlets];
  }, [outletStorefront, outlets]);

  useEffect(() => {
    if (outlets.length > 0 && !activeOutlet) {
      if (cartMerchant?.id === storefront.id && cartMerchant.outletId) {
        const matching = outlets.find((o) => o.id === cartMerchant.outletId);
        setActiveOutlet(matching || outlets[0]);
      } else {
        setActiveOutlet(outlets[0]);
      }
    }
  }, [outlets, cartMerchant, storefront.id, activeOutlet]);

  const handleBranchSelect = (outlet: SisterOutletDto) => {
    if (activeOutlet && activeOutlet.id !== outlet.id) {
      if (cartMerchant?.id === storefront.id && cartItems.length > 0) {
        clearCart();
      }
      setActiveOutlet(outlet);
    }
  };

  const handleAddToCart = (product: ProductResponse) => {
    addItem(
      {
        id: storefront.id,
        name: storefront.shopName,
        vertical: 'restaurants',
        outletId: activeOutlet?.id,
        outletName: activeOutlet?.name,
      },
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
      },
    );
  };

  // 2. Group products into category sections
  const categoryGroups = useMemo(() => {
    if (categories.length === 0) {
      return [
        {
          id: 0,
          name: 'Menu Items',
          description: undefined,
          products,
        },
      ];
    }

    const groups = categories
      .map((rootCategory) => {
        // Collect root ID and all nested subcategory/leaf IDs recursively
        const categoryIds = new Set<number>(collectAllCategoryIds(rootCategory));

        const groupProducts = products.filter(
          (p) => p.categoryId && categoryIds.has(p.categoryId),
        );

        return {
          id: rootCategory.id,
          name: rootCategory.name,
          description: rootCategory.description,
          products: groupProducts,
        };
      })
      .filter((g) => g.products.length > 0);

    // Collect any products that don't belong to the fetched root categories
    const categorizedProductIds = new Set(
      groups.flatMap((g) => g.products.map((p) => p.id)),
    );
    const uncategorizedProducts = products.filter(
      (p) => !categorizedProductIds.has(p.id),
    );

    if (uncategorizedProducts.length > 0) {
      groups.push({
        id: -1,
        name: 'Specialties',
        description: undefined,
        products: uncategorizedProducts,
      });
    }

    return groups;
  }, [categories, products]);

  // 3. Category pills for horizontal nav
  const navItems = useMemo(() => {
    return categoryGroups.map((g) => ({
      id: g.id,
      name: g.name,
      count: g.products.length,
    }));
  }, [categoryGroups]);

  // 4. Filtered sections (toggle category selection or view all)
  const visibleGroups = useMemo(() => {
    if (selectedCategoryId === null) {
      return categoryGroups;
    }
    const filtered = categoryGroups.filter((g) => g.id === selectedCategoryId);
    return filtered.length > 0 ? filtered : categoryGroups;
  }, [categoryGroups, selectedCategoryId]);

  const handleSelectCategory = (id: number) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        className={`flex-1 bg-white ${className}`}>
        {/* 1. Restaurant Header */}
        <ShopHeader
          bannerUrl={storefront.bannerUrl}
          isFavorite={isFavorite}
          onPressBack={onPressBack}
          onToggleFavorite={onToggleFavorite}
          shopName={storefront.shopName}
          description={storefront.description}
          rating={storefront.rating}
          isVerified={storefront.isVerified}
          city={storefront.city}
          openingTime={storefront.openingTime}
          closingTime={storefront.closingTime}
          hasHalalCertificate={Boolean(storefront.halalCertificateUrl)}
          hasFssaiCertificate={Boolean(storefront.fssaiCertificateUrl)}
          vertical="restaurants"
          activeOutletName={activeOutlet?.name}
          onPressBranchSelector={
            outlets.length > 1 ? () => setIsBranchSheetOpen(true) : undefined
          }
        />

        {/* 2. Horizontal Category Navigation Bar */}
        <RestaurantCategoryNav
          categories={navItems}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. Category-Grouped Menu Sections */}
        <View className="flex-1 bg-zinc-50/60 px-4 pt-4 pb-12">
          {visibleGroups.map((group) => (
            <RestaurantCategorySection
              key={group.id}
              title={group.name}
              description={group.description}
              products={group.products}
              onAddProduct={handleAddToCart}
            />
          ))}

          {/* 4. Empty State */}
          {products.length === 0 && (
            <View className="py-12 items-center justify-center">
              <Text className="text-sm text-zinc-400">
                No dishes currently available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Branch Selection Bottom Sheet */}
      <ShopOutletSelectionSheet
        isOpen={isBranchSheetOpen}
        onClose={() => setIsBranchSheetOpen(false)}
        activeOutletId={activeOutlet?.id}
        outlets={displayOutlets}
        onSelectOutlet={handleBranchSelect}
        hasCartItems={cartMerchant?.id === storefront.id && cartItems.length > 0}
      />
    </View>
  );
}

