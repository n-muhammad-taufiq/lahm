/**
 * Phone Number Input Step Component
 * 
 * First step in the phone auth flow where customers select their country code
 * and enter their phone number to receive an SMS verification code.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Button, PhonePillInput } from '@lahm/ui';
import type { PhoneStepProps } from './PhoneStep.types';

export const PhoneStep: React.FC<PhoneStepProps> = ({
  phoneNumber,
  onPhoneNumberChange,
  selectedCountry,
  onPressCountryPicker,
  onContinue,
  loading = false,
  errorMessage,
}) => {
  const isReady = phoneNumber.replace(/[\s-]/g, '').length >= 7;

  return (
    <View
      className="w-full rounded-[32px] p-6 border border-zinc-200/80 gap-5"
      style={{
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
      }}>
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-zinc-900 text-2xl font-bold tracking-tight">
            Sign In or Register
          </Text>
          <View className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <Text className="text-[11px] font-bold text-emerald-700 tracking-wide">
              100% HALAL
            </Text>
          </View>
        </View>
        <Text className="text-zinc-500 text-sm font-normal">
          Enter your phone number to receive an OTP code.
        </Text>
      </View>

      <View className="w-full gap-3.5">
        <PhonePillInput
          countryFlag={selectedCountry.flag}
          countryCode={selectedCountry.code}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={onPhoneNumberChange}
          onPressCountryPicker={onPressCountryPicker}
          errorMessage={errorMessage}
          disabled={loading}
        />

        <Button
          label="Continue"
          rightIcon={<Text className="text-white text-base font-bold">→</Text>}
          onPress={onContinue}
          loading={loading}
          disabled={!isReady || loading}
          size="md"
          className="mt-1"
        />
      </View>

      <View className="flex-row items-center justify-center gap-1.5 pt-1">
        <Text className="text-zinc-400 text-xs">🔒</Text>
        <Text className="text-zinc-400 text-[11px] font-medium text-center">
          Secure verification • No spam or passwords required
        </Text>
      </View>
    </View>
  );
};
