/**
 * Customer Home Screen
 *
 * Content-first marketplace feed: location, search, department switcher,
 * nearby vertical list, then secondary department carousels.
 */

import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { NearbyMerchant } from '@lahm/api';
import { brandColors, surfaceColors, themeColors } from '@lahm/tokens';
import { useCustomerLocation } from '../location';
import { useNearbyMerchants } from './hooks/useNearbyMerchants';
import { HomeDeliveryHeader } from './components/HomeDeliveryHeader';
import { HomeSearchBar } from './components/HomeSearchBar';
import { DepartmentSwitcher, type DepartmentId } from './components/DepartmentSwitcher';
import { MerchantCarouselSection } from './components/MerchantCarouselSection';
import { HomeNearbyList } from './components/HomeNearbyList';
import { type MerchantCardProps } from './components/MerchantCard';
import { FloatingCartCapsule } from './components/FloatingCartCapsule';

function mapToMerchantCard(merchant: NearbyMerchant): MerchantCardProps {
  return {
    id: merchant.id,
    name: merchant.shopName,
    coverPhotoUrl: merchant.bannerUrl,
    rating: merchant.rating,
    deliveryTimeRange: merchant.deliveryTimeEstimate,
    distanceKm: merchant.distance ?? undefined,
    specialties: merchant.featuredProducts ?? [],
    isHalalCertified: Boolean(merchant.isVerified && merchant.halalCertificateUrl),
  };
}

const SECTION_TITLES: Record<DepartmentId, string> = {
  restaurants: 'Nearby restaurants',
  meats: 'Nearby meat shops',
  groceries: 'Nearby groceries',
};

export function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, isLocating, detectCurrentLocation } = useCustomerLocation(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('restaurants');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { merchants, loading, error, refetch } = useNearbyMerchants({
    latitude: location.latitude,
    longitude: location.longitude,
    search: searchQuery,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), detectCurrentLocation()]);
    setIsRefreshing(false);
  };

  const displayAddress = location.locality
    ? `${location.locality}${location.city ? `, ${location.city}` : ''}`
    : isLocating
      ? 'Locating your address...'
      : 'Select Location';

  const handlePressMerchant = (merchantId: number) => {
    router.push({ pathname: '/shop/[id]', params: { id: merchantId } });
  };

  const restaurantMerchants = useMemo(
    () =>
      merchants
        .filter((m) => m.categories?.some((c) => c.slug === 'restaurants'))
        .map(mapToMerchantCard),
    [merchants]
  );

  const meatMerchants = useMemo(
    () =>
      merchants
        .filter((m) => m.categories?.some((c) => c.slug === 'meats'))
        .map(mapToMerchantCard),
    [merchants]
  );

  const groceryMerchants = useMemo(
    () =>
      merchants
        .filter((m) => m.categories?.some((c) => c.slug === 'groceries'))
        .map(mapToMerchantCard),
    [merchants]
  );

  const merchantsByDepartment: Record<DepartmentId, MerchantCardProps[]> = {
    restaurants: restaurantMerchants,
    meats: meatMerchants,
    groceries: groceryMerchants,
  };

  const activeMerchants = merchantsByDepartment[activeDepartment];
  const secondarySections = (
    [
      { id: 'restaurants' as const, title: 'Restaurants' },
      { id: 'meats' as const, title: 'Meat shops' },
      { id: 'groceries' as const, title: 'Groceries' },
    ] as const
  ).filter((section) => section.id !== activeDepartment);

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: surfaceColors.element,
        paddingTop: Math.max(insets.top, 16),
      }}>
      <View style={{ backgroundColor: themeColors.light.background }}>
        <HomeDeliveryHeader
          label="Home"
          address={displayAddress}
          isLocating={isLocating}
          onPressAddress={detectCurrentLocation}
        />
        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <DepartmentSwitcher
          activeDepartment={activeDepartment}
          onChangeDepartment={setActiveDepartment}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
        <HomeNearbyList
          title={SECTION_TITLES[activeDepartment]}
          merchants={activeMerchants}
          isLoading={loading}
          error={error}
          onRetry={refetch}
          onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
        />

        {secondarySections.map((section) => (
          <MerchantCarouselSection
            key={section.id}
            title={section.title}
            merchants={merchantsByDepartment[section.id]}
            isLoading={loading}
            onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
          />
        ))}
      </ScrollView>

      <FloatingCartCapsule />
    </View>
  );
}
