/**
 * Customer Home Screen
 * 
 * Clean orchestrator container for the Customer Home marketplace feed.
 * Features will be assembled incrementally starting with HomeDeliveryHeader.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { NearbyMerchant } from '@lahm/api';
import { useCustomerLocation } from '../location';
import { useNearbyMerchants } from './hooks/useNearbyMerchants';
import { HomeDeliveryHeader } from './components/HomeDeliveryHeader';
import { HomeSearchBar } from './components/HomeSearchBar';
import { DepartmentSwitcher, type DepartmentId } from './components/DepartmentSwitcher';
import { HeroCampaignBanner } from './components/HeroCampaignBanner';
import { MerchantCarouselSection } from './components/MerchantCarouselSection';
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

export function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, isLocating, detectCurrentLocation } = useCustomerLocation(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('restaurants');

  // Real device GPS coordinates (number | null)
  const { merchants, loading } = useNearbyMerchants({
    latitude: location.latitude,
    longitude: location.longitude,
    search: searchQuery,
  });

  // Dynamic reverse-geocoded address display
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

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      {/* 1. Header: Delivery address & notifications */}
      <HomeDeliveryHeader
        label="Home"
        address={displayAddress}
        isLocating={isLocating}
        hasUnreadNotifications={false}
        onPressAddress={detectCurrentLocation}
        onPressNotifications={() => {}}
      />

      {/* 2. Search & Filter Bar */}
      <HomeSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onPressFilter={() => {
          // Open filter bottom sheet
        }}
      />

      {/* 3. Category Switcher (Option 1 Segmented Capsule Track) */}
      <DepartmentSwitcher
        activeDepartment={activeDepartment}
        onChangeDepartment={setActiveDepartment}
      />

      {/* Scrollable Feed Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
        {/* 4. Brand Hero Banner (Evergreen Warm Terracotta) */}
        <HeroCampaignBanner
          variant="peach"
          tag="LAHM لحم • 100% HALAL VERIFIED"
          title="Pure, Farm-Fresh & 100% Halal Certified"
          subtitle="Fresh meats, curated dining & daily groceries delivered to your door."
          ctaText="Discover Lahm"
          onPressCta={() => {
            // Open Halal Promise or brand modal
          }}
        />

        {/* 5. Multi-Section Marketplace Discovery Feed (Version 9) */}
        <MerchantCarouselSection
          title="Nearby Restaurants"
          merchants={restaurantMerchants}
          isLoading={loading}
          onPressSeeAll={() => {}}
          onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
        />

        <MerchantCarouselSection
          title="Popular Meat Shops"
          merchants={meatMerchants}
          isLoading={loading}
          onPressSeeAll={() => {}}
          onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
        />

        <MerchantCarouselSection
          title="Nearby Halal Groceries"
          merchants={groceryMerchants}
          isLoading={loading}
          onPressSeeAll={() => {}}
          onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
        />
      </ScrollView>

      {/* 6. Floating Cart Capsule (Option 2 - Brand Terracotta Bar) */}
      <FloatingCartCapsule
        onPress={() => {
          // Open Cart Sheet / Flow
        }}
      />
    </View>
  );
}





