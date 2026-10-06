/**
 * Merchant Bottom Navigation Bar Component
 * 
 * Fixed bottom navigation bar for merchants to switch between the Home dashboard
 * and the Products catalog with a real-time item count badge.
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MerchantNavTab = 'home' | 'products';

interface MerchantBottomNavProps {
  activeTab: MerchantNavTab;
  onTabChange: (tab: MerchantNavTab) => void;
  productsCount?: number;
}

export const MerchantBottomNav: React.FC<MerchantBottomNavProps> = ({
  activeTab,
  onTabChange,
  productsCount,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-[#F0EBE8] flex-row items-center justify-around px-6 pt-2.5 shadow-sm"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      
      {/* Home Tab */}
      <TouchableOpacity
        onPress={() => onTabChange('home')}
        activeOpacity={0.7}
        className="items-center py-1 px-4">
        <Text
          className={`text-lg mb-0.5 ${
            activeTab === 'home' ? 'opacity-100' : 'opacity-40'
          }`}>
          🏠
        </Text>
        <Text
          className={`text-[11px] font-bold ${
            activeTab === 'home' ? 'text-[#E77A62]' : 'text-[#938479]'
          }`}>
          Home
        </Text>
        {activeTab === 'home' ? (
          <View className="w-1.5 h-1.5 rounded-full bg-[#E77A62] mt-1" />
        ) : (
          <View className="w-1.5 h-1.5 mt-1" />
        )}
      </TouchableOpacity>

      {/* Products Tab */}
      <TouchableOpacity
        onPress={() => onTabChange('products')}
        activeOpacity={0.7}
        className="items-center py-1 px-4 relative">
        <View className="flex-row items-center">
          <Text
            className={`text-lg mb-0.5 ${
              activeTab === 'products' ? 'opacity-100' : 'opacity-40'
            }`}>
            🥩
          </Text>
          {productsCount !== undefined && productsCount > 0 ? (
            <View className="ml-1 bg-[#FAF7F5] border border-[#F2D8CD] px-1.5 py-0.5 rounded-full">
              <Text className="text-[9px] font-bold text-[#B87B6A]">
                {productsCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className={`text-[11px] font-bold ${
            activeTab === 'products' ? 'text-[#E77A62]' : 'text-[#938479]'
          }`}>
          Products
        </Text>
        {activeTab === 'products' ? (
          <View className="w-1.5 h-1.5 rounded-full bg-[#E77A62] mt-1" />
        ) : (
          <View className="w-1.5 h-1.5 mt-1" />
        )}
      </TouchableOpacity>

    </View>
  );
};
