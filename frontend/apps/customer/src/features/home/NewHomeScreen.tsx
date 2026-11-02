/**
 * NewHomeScreen Component
 * 
 * Flagship customer home marketplace screen for Lahm.
 * Built with Teal & White visual language, subtle warm off-white canvas (#F8F7F5),
 * real GPS reverse geocoding, multi-category discovery, featured stores carousel,
 * Halal Quality Promise banner, and bottom navigation bar.
 */

import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, type NearbyMerchant } from '@lahm/api';
import { useCustomerLocation } from '../location';
import { useNearbyMerchants } from './hooks/useNearbyMerchants';
import { NewHomeHeader } from './components/NewHomeHeader';
import { HomeSearchBar } from './components/HomeSearchBar';
import { DepartmentSwitcher, type DepartmentId } from './components/DepartmentSwitcher';
import { HeroCampaignBanner } from './components/HeroCampaignBanner';
import { MerchantCarouselSection } from './components/MerchantCarouselSection';
import { type MerchantCardProps } from './components/MerchantCard';
import { FloatingCartCapsule } from './components/FloatingCartCapsule';
import { NewHomeBottomNav, type CustomerTabId } from './components/NewHomeBottomNav';

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

export function NewHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { location, isLocating, detectCurrentLocation } = useCustomerLocation(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('restaurants');
  const [activeTab, setActiveTab] = useState<CustomerTabId>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live GPS coordinates & search query integration
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

  // Reverse-geocoded address display
  const displayAddress = location.locality
    ? `${location.locality}${location.city ? `, ${location.city}` : ''}`
    : isLocating
      ? 'Locating your address...'
      : 'Select Delivery Location';

  const handlePressMerchant = (merchantId: number) => {
    router.push({ pathname: '/shop/[id]', params: { id: merchantId } });
  };

  const handlePressProfile = () => {
    if (!user) {
      router.push('/login');
    }
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

  // Dynamic discovery sections prioritized by active department tab
  const feedSections = useMemo(() => {
    const all = [
      {
        id: 'restaurants' as DepartmentId,
        title: 'Featured Restaurants',
        merchants: restaurantMerchants,
      },
      {
        id: 'meats' as DepartmentId,
        title: 'Fresh Meat Shops',
        merchants: meatMerchants,
      },
      {
        id: 'groceries' as DepartmentId,
        title: 'Halal Groceries & Essentials',
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
      {/* A. Location & User Header */}
      <NewHomeHeader
        address={displayAddress}
        isLocating={isLocating}
        userName={user?.name}
        onPressAddress={detectCurrentLocation}
        onPressProfile={handlePressProfile}
      />

      {/* B. Integrated Search Bar */}
      <HomeSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search stores, products, or dishes"
      />

      {/* C. Merchant Category Navigation Track */}
      <DepartmentSwitcher
        activeDepartment={activeDepartment}
        onChangeDepartment={setActiveDepartment}
      />

      {/* Scrollable Marketplace Feed with Teal Pull-to-Refresh */}
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* D. Brand Halal Assurance & Spotlight Banner */}
        <HeroCampaignBanner
          variant="teal"
          tag=""
          title="Direct from Certified Halal Butchers & Kitchens"
          subtitle="Strictly verified, fresh daily cuts, artisan dining, and groceries delivered."
          ctaText="Our Halal Standards"
          onPressCta={() => {}}
        />

        {/* E & F. Discovery Sections (Featured & Nearby) */}
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

      {/* Floating Cart Pill */}
      <FloatingCartCapsule onPress={() => {}} />

      {/* G. Bottom Navigation Bar */}
      <NewHomeBottomNav
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'account' && !user) {
            router.push('/login');
          }
        }}
      />
    </View>
  );
}
