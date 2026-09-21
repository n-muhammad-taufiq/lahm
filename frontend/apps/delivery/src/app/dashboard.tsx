import React from 'react';
import { Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-[#1C1611]">Success</Text>
      <Text className="text-sm text-[#8C7A70] mt-1">Delivery Partner Dashboard</Text>
    </View>
  );
}
