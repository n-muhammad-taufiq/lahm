/**
 * Customer Home Screen Component
 * 
 * Main marketplace feed for customers featuring delivery location detection,
 * automatic permission prompt on mount, and nearby butchery merchant list.
 */

import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerLocation } from '../location';
import { useNearbyMerchants } from './hooks/useNearbyMerchants';

export function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. Automatically prompts for location permission on mount
  const { location, isLocating, detectCurrentLocation } = useCustomerLocation(true);

  // 2. Fetch nearby merchants whenever real coordinates are acquired
  const {
    merchants,
    loading: merchantsLoading,
    error: merchantsError,
    refetch,
  } = useNearbyMerchants({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const hasLocation = Boolean(location.latitude && location.longitude);
  const displayAddress = location.locality
    ? `${location.locality}${location.city ? `, ${location.city}` : ''}`
    : isLocating
    ? 'Detecting delivery location...'
    : 'Location required';

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom }}>
      
      {/* Header Bar */}
      <View className="px-5 pt-2 pb-4 bg-white border-b border-[#F0EBE8] flex-row items-center justify-between">
        <TouchableOpacity
          onPress={detectCurrentLocation}
          activeOpacity={0.8}
          className="flex-1 mr-3">
          <View className="flex-row items-center gap-1.5">
            <View className={`w-2 h-2 rounded-full ${hasLocation ? 'bg-emerald-500' : 'bg-[#E77A62]'}`} />
            <Text className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
              DELIVER TO
            </Text>
            {isLocating ? <ActivityIndicator size="small" color="#E77A62" /> : null}
          </View>
          <Text className="text-base font-bold text-zinc-900 mt-0.5" numberOfLines={1}>
            {displayAddress}
          </Text>
        </TouchableOpacity>

        <Pressable
          onPress={() => router.replace('/' as any)}
          className="bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full active:opacity-70">
          <Text className="text-xs font-bold text-zinc-700">Logout</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="py-4 pb-10"
        showsVerticalScrollIndicator={false}>

        {/* Permission Required / Error Banner */}
        {location.error ? (
          <View className="p-4 rounded-md bg-[#FFF5F2] border border-[#FCD5C5] mb-4">
            <Text className="text-sm font-bold text-[#1C1611]">
              Location Access Needed
            </Text>
            <Text className="text-xs text-[#7D6F66] mt-1 mb-3">
              Allow location access to find halal butcheries near your doorstep.
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={detectCurrentLocation}
                className="px-3 py-2 rounded-md bg-[#E77A62] items-center justify-center">
                <Text className="text-xs font-bold text-white">Retry Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                className="px-3 py-2 rounded-md bg-white border border-[#F2D8CD] items-center justify-center">
                <Text className="text-xs font-bold text-[#1C1611]">Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Store Discovery Status */}
        {merchantsLoading && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#E77A62" />
            <Text className="text-xs text-zinc-500 mt-3 font-medium">
              Discovering butcheries near you...
            </Text>
          </View>
        )}

        {/* Merchant Cards List */}
        {!merchantsLoading && merchants.length > 0 && (
          <View className="gap-3">
            <Text className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-1">
              NEARBY BUTCHERIES ({merchants.length})
            </Text>
            {merchants.map((merchant) => (
              <View
                key={merchant.id}
                className="p-4 rounded-md border border-[#F2D8CD] bg-white shadow-xs">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-zinc-900" numberOfLines={1}>
                    {merchant.shopName}
                  </Text>
                  <View className="px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-200">
                    <Text className="text-[11px] font-bold text-emerald-700">★ {merchant.rating || '4.8'}</Text>
                  </View>
                </View>
                <Text className="text-xs text-zinc-500 mt-1" numberOfLines={1}>
                  {merchant.shopAddress || `${merchant.city}, ${merchant.state}`}
                </Text>
                <View className="flex-row items-center gap-3 mt-2.5 pt-2.5 border-t border-zinc-100">
                  <Text className="text-xs text-zinc-600">⚡ {merchant.deliveryTimeEstimate || '30-45 mins'}</Text>
                  {merchant.distance ? (
                    <Text className="text-xs text-zinc-400">• {merchant.distance.toFixed(1)} km away</Text>
                  ) : null}
                  <Text className="text-xs text-zinc-400">• {merchant.productCount || 0} cuts</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!merchantsLoading && hasLocation && merchants.length === 0 && !merchantsError && (
          <View className="py-16 items-center justify-center px-4">
            <View className="w-16 h-16 rounded-full bg-[#FFF5F2] items-center justify-center mb-3">
              <Text className="text-2xl">🥩</Text>
            </View>
            <Text className="text-base font-bold text-zinc-900 text-center">
              No Butcheries Found Nearby
            </Text>
            <Text className="text-xs text-zinc-500 text-center mt-1 max-w-[260px]">
              We couldn't find registered partners in your immediate delivery radius yet.
            </Text>
            <TouchableOpacity
              onPress={refetch}
              className="mt-4 px-4 py-2 rounded-md bg-[#E77A62]">
              <Text className="text-xs font-bold text-white">Refresh Stores</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
