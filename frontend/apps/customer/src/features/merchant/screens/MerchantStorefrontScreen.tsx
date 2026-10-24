/**
 * MerchantStorefrontScreen Component
 * 
 * Orchestrator screen for the merchant storefront / shop profile.
 * Coordinates the composite ShopHeader, category navigation, product catalog,
 * and floating cart capsule.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { merchantsApiService, MerchantStorefrontResponse } from '@lahm/api';
import { ShopHeader } from '../components/header/ShopHeader';

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

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* 1. Composite Shop Header */}
        <ShopHeader
          bannerUrl={storefront?.bannerUrl}
          isFavorite={isFavorite}
          onPressBack={handleBack}
          onToggleFavorite={handleToggleFavorite}
          shopName={storefront?.shopName}
          rating={storefront?.rating}
          isVerified={storefront?.isVerified}
          city={storefront?.city}
          openingTime={storefront?.openingTime}
          closingTime={storefront?.closingTime}
          hasHalalCertificate={Boolean(storefront?.halalCertificateUrl)}
          hasFssaiCertificate={Boolean(storefront?.fssaiCertificateUrl)}
          vertical="meats"
        />

        {/* 2. Storefront Body Area */}
        <View className="flex-1 bg-zinc-50/50 p-4">
          {loading && (
            <Text className="text-xs text-zinc-400 text-center py-6">
              Loading storefront catalog...
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
