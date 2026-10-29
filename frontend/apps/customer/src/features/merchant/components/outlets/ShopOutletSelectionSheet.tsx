/**
 * ShopOutletSelectionSheet Component
 * 
 * Native mobile bottom sheet modal for branch switching.
 * Displays branch distances from customer GPS, operational hours,
 * and guards against accidental cart clearing when switching branches.
 * 
 * Constraints:
 * - Rule 8: Strictly rounded-sm, rounded-md, or rounded-full (no 2xl/3xl).
 * - Rule 1: Zero mock data.
 * - Under ~200 lines.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SisterOutletDto } from '@lahm/api';

export interface ShopOutletSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeOutletId?: number;
  outlets: SisterOutletDto[];
  onSelectOutlet: (outlet: SisterOutletDto) => void;
  hasCartItems?: boolean;
}

export function ShopOutletSelectionSheet({
  isOpen,
  onClose,
  activeOutletId,
  outlets,
  onSelectOutlet,
  hasCartItems = false,
}: ShopOutletSelectionSheetProps) {
  const insets = useSafeAreaInsets();
  const [pendingOutlet, setPendingOutlet] = useState<SisterOutletDto | null>(null);

  const handleBranchPress = (outlet: SisterOutletDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (outlet.id === activeOutletId) {
      onClose();
      return;
    }

    if (hasCartItems) {
      setPendingOutlet(outlet);
    } else {
      onSelectOutlet(outlet);
      onClose();
    }
  };

  const handleConfirmSwitch = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (pendingOutlet) {
      onSelectOutlet(pendingOutlet);
      setPendingOutlet(null);
      onClose();
    }
  };

  const handleCancelSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingOutlet(null);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />

        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="bg-white rounded-t-md px-5 pt-3 max-h-[80%]">
          {/* Drag Handle */}
          <View className="w-10 h-1 bg-zinc-300 rounded-full self-center mb-3" />

          {pendingOutlet ? (
            /* Cart Clearing Confirmation Prompt */
            <View className="py-2">
              <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center self-center mb-3">
                <Ionicons name="warning-outline" size={22} color="#D97706" />
              </View>
              <Text className="text-base font-primary-bold text-zinc-900 text-center mb-1">
                Switch to {pendingOutlet.name}?
              </Text>
              <Text className="text-xs font-primary text-zinc-500 text-center leading-relaxed px-4 mb-5">
                Your cart contains items from your current branch. Switching branches will reset your current basket.
              </Text>

              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={handleCancelSwitch}
                  className="flex-1 py-3 rounded-md bg-zinc-100 items-center justify-center">
                  <Text className="text-xs font-primary-bold text-zinc-700">
                    Keep Current
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmSwitch}
                  className="flex-1 py-3 rounded-md bg-zinc-900 items-center justify-center">
                  <Text className="text-xs font-primary-bold text-white">
                    Clear & Switch
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Standard Branch List */
            <>
              <View className="flex-row items-center justify-between pb-3 border-b border-zinc-100">
                <View>
                  <Text className="text-base font-primary-bold text-zinc-900">
                    Select Branch
                  </Text>
                  <Text className="text-xs font-primary text-zinc-400 mt-0.5">
                    Choose fulfilling outlet for your order
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center">
                  <Ionicons name="close" size={18} color="#71717A" />
                </Pressable>
              </View>

              <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
                {outlets.map((outlet) => {
                  const isSelected = outlet.id === activeOutletId;

                  return (
                    <Pressable
                      key={outlet.id}
                      onPress={() => handleBranchPress(outlet)}
                      className={`p-3.5 mb-2.5 rounded-md border flex-row items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40'
                          : 'border-zinc-200 bg-white'
                      }`}>
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center">
                          <Text
                            className={`text-sm font-primary-bold ${
                              isSelected ? 'text-emerald-900' : 'text-zinc-900'
                            }`}>
                            {outlet.name}
                          </Text>
                          {outlet.distanceKm !== null && outlet.distanceKm !== undefined && (
                            <View className="ml-2 flex-row items-center bg-zinc-100 px-1.5 py-0.5 rounded-sm">
                              <Ionicons name="location-sharp" size={10} color="#059669" />
                              <Text className="text-[10px] font-primary-medium text-zinc-700 ml-0.5">
                                {outlet.distanceKm.toFixed(1)} km
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          numberOfLines={1}
                          className="text-xs font-primary text-zinc-500 mt-1">
                          {outlet.address}
                        </Text>

                        <Text className="text-[11px] font-primary text-zinc-400 mt-0.5">
                          Open until {outlet.closingTime}
                        </Text>
                      </View>

                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={isSelected ? '#059669' : '#D4D4D8'}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
