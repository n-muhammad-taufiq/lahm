import React from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom }}>
      {/* Header Bar */}
      <View className="px-5 pt-2 pb-4 bg-white border-b border-[#F0EBE8] flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-[#E77A62]" />
            <Text className="text-[11px] font-bold text-zinc-400 tracking-wider">
              DELIVER TO
            </Text>
          </View>
          <Text className="text-base font-bold text-zinc-900 mt-0.5">
            Detecting location...
          </Text>
        </View>

        <Pressable
          onPress={() => router.replace('/' as any)}
          className="bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full active:opacity-70">
          <Text className="text-xs font-bold text-zinc-700">Logout</Text>
        </Pressable>
      </View>

      {/* Main Content Area - Clean & Empty Canvas for Proximity Discovery */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-[#FFF5F2] items-center justify-center mb-4">
          <Text className="text-2xl text-[#E77A62]">📍</Text>
        </View>
        <Text className="text-lg font-bold text-zinc-900 text-center">
          Proximity Discovery Engine
        </Text>
        <Text className="text-sm text-zinc-500 text-center mt-1 max-w-[280px]">
          Connecting to nearby registered butchery merchants...
        </Text>
      </View>
    </View>
  );
}
