/**
 * Customer Home Screen
 * 
 * Clean orchestrator container for the Customer Home marketplace feed.
 * Features will be assembled incrementally starting with HomeDeliveryHeader.
 */

import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real device GPS coordinates (number | null)
  const { merchants, loading, refetch } = useNearbyMerchants({
    latitude: location.latitude,
    longitude: location.longitude,
    search: searchQuery,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), detectCurrentLocation()]);
    setIsRefreshing(false);
  };

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

  const feedSections = useMemo(() => {
    const all = [
      {
        id: 'restaurants' as DepartmentId,
        title: 'Nearby Restaurants',
        merchants: restaurantMerchants,
      },
      {
        id: 'meats' as DepartmentId,
        title: 'Popular Meat Shops',
        merchants: meatMerchants,
      },
      {
        id: 'groceries' as DepartmentId,
        title: 'Nearby Halal Groceries',
        merchants: groceryMerchants,
      },
    ];
    return [
      ...all.filter((s) => s.id === activeDepartment),
      ...all.filter((s) => s.id !== activeDepartment),
    ];
  }, [activeDepartment, restaurantMerchants, meatMerchants, groceryMerchants]);

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

      {/* Scrollable Feed Container with Dark Teal Pull-to-Refresh */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0C3B3B"
            colors={['#0C3B3B']}
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
        {/* 4. Brand Hero Banner (Evergreen Dark Teal & Gold) */}
        <HeroCampaignBanner
          variant="teal"
          tag="LAHM لحم • 100% HALAL VERIFIED"
          title="Pure, Farm-Fresh & 100% Halal Certified"
          subtitle="Fresh meats, curated dining & daily groceries delivered to your door."
          ctaText="Discover Lahm"
          onPressCta={() => {
            // Open Halal Promise or brand modal
          }}
        />

        {/* 5. Multi-Section Marketplace Discovery Feed */}
        {feedSections.map((section) => (
          <MerchantCarouselSection
            key={section.id}
            title={section.title}
            merchants={section.merchants}
            isLoading={loading}
            onPressSeeAll={() => {}}
            onPressMerchant={(merchant) => handlePressMerchant(merchant.id)}
          />
        ))}
      </ScrollView>

      {/* 6. Floating Cart Capsule (Option 2 - Brand Dark Teal Bar) */}
      <FloatingCartCapsule
        onPress={() => {
          // Open Cart Sheet / Flow
        }}
      />
    </View>
  );
}





