/**
 * ShopHeader Component
 * 
 * Composite header orchestrator for merchant storefronts.
 * Assembles ShopCoverBanner, ShopIdentityCard, and ShopDeliveryIncentiveBar
 * into a single cohesive, multi-vertical header unit.
 */

import React from 'react';
import { View } from 'react-native';
import { ShopCoverBanner } from './ShopCoverBanner';
import { ShopIdentityCard } from './ShopIdentityCard';

export interface ShopHeaderProps {
  bannerUrl?: string;
  isFavorite?: boolean;
  onPressBack?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  // Identity details
  shopName?: string;
  rating?: number;
  isVerified?: boolean;
  city?: string;
  openingTime?: string;
  closingTime?: string;
  hasHalalCertificate?: boolean;
  hasFssaiCertificate?: boolean;
  vertical?: 'meats' | 'restaurants' | 'groceries';
  className?: string;
}

export function ShopHeader({
  bannerUrl,
  isFavorite,
  onPressBack,
  onToggleFavorite,
  onShare,
  shopName,
  rating,
  isVerified,
  city,
  openingTime,
  closingTime,
  hasHalalCertificate,
  hasFssaiCertificate,
  vertical,
  className = '',
}: ShopHeaderProps) {
  return (
    <View className={`w-full bg-white ${className}`}>
      {/* 1. Cover Banner & Top Floating Controls */}
      <ShopCoverBanner
        bannerUrl={bannerUrl}
        isFavorite={isFavorite}
        onPressBack={onPressBack}
        onToggleFavorite={onToggleFavorite}
        onShare={onShare}
      />

      {/* 2. Shop Identity Card (Store branding, Halal shield, rating, hours) */}
      <ShopIdentityCard
        shopName={shopName}
        rating={rating}
        isVerified={isVerified}
        city={city}
        openingTime={openingTime}
        closingTime={closingTime}
        hasHalalCertificate={hasHalalCertificate}
        hasFssaiCertificate={hasFssaiCertificate}
        vertical={vertical}
      />

      {/* 3. ShopDeliveryIncentiveBar (Will be mounted here next) */}
    </View>
  );
}
