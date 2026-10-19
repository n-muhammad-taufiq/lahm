/**
 * Customer Home Screen
 * 
 * Clean orchestrator container for the Customer Home marketplace feed.
 * Features will be assembled incrementally starting with HomeDeliveryHeader.
 */

import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerLocation } from '../location';
import { HomeDeliveryHeader } from './components/HomeDeliveryHeader';
import { HomeSearchBar } from './components/HomeSearchBar';
import { DepartmentSwitcher, type DepartmentId } from './components/DepartmentSwitcher';
import { HeroCampaignBanner } from './components/HeroCampaignBanner';

export function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { location, isLocating, detectCurrentLocation } = useCustomerLocation(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentId>('restaurants');

  const displayAddress = location.locality
    ? `${location.locality}${location.city ? `, ${location.city}` : ''}`
    : 'Anna Nagar, Chennai';

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
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
      </ScrollView>
    </View>
  );
}





