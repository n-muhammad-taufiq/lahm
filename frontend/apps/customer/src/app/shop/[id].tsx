/**
 * Shop Dynamic Route
 * 
 * Route endpoint: /shop/:id
 * Connects Expo Router params to the MerchantStorefrontScreen feature.
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MerchantStorefrontScreen } from '../../features/merchant/screens/MerchantStorefrontScreen';

export default function ShopRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MerchantStorefrontScreen merchantId={Number(id)} />;
}
