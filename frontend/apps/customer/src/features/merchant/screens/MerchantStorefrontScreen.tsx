/**
 * MerchantStorefrontScreen Component
 * 
 * Dispatcher screen for merchant storefront profiles.
 * Determines the merchant category via MerchantCategorySlug enum and renders
 * the vertical-specialized storefront (e.g. RestaurantStorefront).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { merchantsApiService, MerchantStorefrontResponse } from '@lahm/api';
import { MerchantCategorySlug } from '../types';
import { RestaurantStorefront } from '../components/storefronts/RestaurantStorefront';

export interface MerchantStorefrontScreenProps {
  merchantId: number;
}

export function MerchantStorefrontScreen({ merchantId }: MerchantStorefrontScreenProps) {
  const router = useRouter();
  const [storefront, setStorefront] = useState<MerchantStorefrontResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchStorefront = useCallback(async () => {
    try {
      setLoading(true);
      const data = await merchantsApiService.getMerchantStorefront(merchantId);
      setStorefront(data);
    } catch (err) {
      console.error('Failed to load merchant storefront:', err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchStorefront();
  }, [fetchStorefront]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  // 1. Loading State
  if (loading && !storefront) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <ActivityIndicator size="small" color="#0F172A" />
        <Text className="text-xs text-zinc-400 mt-3">
          Loading storefront...
        </Text>
      </View>
    );
  }

  // 2. Not Found Fallback
  if (!storefront) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-sm text-zinc-500">
          Storefront not found
        </Text>
      </View>
    );
  }

  // 3. Category-Driven Vertical Dispatcher
  const primaryCategory = storefront.categories?.[0]?.slug as MerchantCategorySlug | undefined;

  switch (primaryCategory) {
    case MerchantCategorySlug.RESTAURANTS:
      return (
        <RestaurantStorefront
          storefront={storefront}
          isFavorite={isFavorite}
          onPressBack={handleBack}
          onToggleFavorite={handleToggleFavorite}
        />
      );

    default:
      return (
        <View className="flex-1 bg-white items-center justify-center p-6">
          <Text className="text-sm font-semibold text-zinc-900 mb-1">
            {storefront.shopName}
          </Text>
          <Text className="text-xs text-zinc-400 text-center">
            Storefront layout for this category is under active development.
          </Text>
        </View>
      );
  }
}

