import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@lahm/ui';
import type { AuthSuccessStepProps } from './AuthSuccessStep.types';
import { SUCCESS_STEP_TEXT } from './AuthSuccessStep.constants';

export const AuthSuccessStep: React.FC<AuthSuccessStepProps> = ({
  successData,
  onDone,
}) => {
  const phone = successData?.phoneNumber || 'Verified Phone';
  const role = successData?.user?.role?.toUpperCase() || 'CUSTOMER';

  return (
    <View
      className="w-full rounded-[32px] p-6 border border-zinc-200/80 gap-5 items-center"
      style={{
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
      }}>
      <View className="items-center justify-center">
        <View className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 items-center justify-center">
          <Text className="text-3xl font-extrabold text-emerald-600">✓</Text>
        </View>
      </View>

      <View className="items-center gap-1 px-2">
        <Text className="text-zinc-900 text-2xl font-bold text-center tracking-tight">
          {SUCCESS_STEP_TEXT.title}
        </Text>
        <Text className="text-zinc-500 text-sm text-center">
          {SUCCESS_STEP_TEXT.subtitle}
        </Text>
      </View>

      <View className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-zinc-500 text-xs font-semibold tracking-wider">
            PHONE NUMBER
          </Text>
          <Text className="text-zinc-900 text-sm font-bold">{phone}</Text>
        </View>

        <View className="h-px bg-zinc-200" />

        <View className="flex-row justify-between items-center">
          <Text className="text-zinc-500 text-xs font-semibold tracking-wider">
            {SUCCESS_STEP_TEXT.roleLabel}
          </Text>
          <Text className="text-zinc-900 text-sm font-bold">{role}</Text>
        </View>

        <View className="h-px bg-zinc-200" />

        <View className="flex-row justify-between items-center">
          <Text className="text-zinc-500 text-xs font-semibold tracking-wider">
            {SUCCESS_STEP_TEXT.statusLabel}
          </Text>
          <Text className="text-emerald-600 text-sm font-bold">
            {SUCCESS_STEP_TEXT.statusActive}
          </Text>
        </View>
      </View>

      <Button
        label={SUCCESS_STEP_TEXT.buttonLabel}
        onPress={onDone}
        variant="primary"
        size="md"
        className="w-full mt-1"
      />
    </View>
  );
};
