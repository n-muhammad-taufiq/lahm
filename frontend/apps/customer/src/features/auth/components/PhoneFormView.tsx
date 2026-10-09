/**
 * PhoneFormView Component
 * 
 * Sub-view for entering phone number with country code picker trigger,
 * error banner, and Send Verification Code action.
 * Built strictly with design tokens and shared UI primitives.
 */

import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, RecaptchaLegalNotice } from '@lahm/ui';
import { neutralColors } from '@lahm/tokens';

export interface PhoneFormViewProps {
  authMode: 'login' | 'register';
  phoneNumber: string;
  onPhoneNumberChange: (val: string) => void;
  selectedCountry: { code: string; name?: string; flag?: string };
  onPressCountryPicker: () => void;
  onBackToChoice: () => void;
  onSendCode: () => void;
  loading: boolean;
  error?: string | null;
}

export const PhoneFormView: React.FC<PhoneFormViewProps> = ({
  authMode,
  phoneNumber,
  onPhoneNumberChange,
  selectedCountry,
  onPressCountryPicker,
  onBackToChoice,
  onSendCode,
  loading,
  error,
}) => {
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  const isPhoneReady = cleanPhone.length >= 7;
  const countryShortName = (selectedCountry.name || 'US').slice(0, 2).toLowerCase();

  return (
    <View className="w-full">
      {/* Back to choices button */}
      <TouchableOpacity
        onPress={onBackToChoice}
        className="flex-row items-center mb-4"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text className="text-sm text-brand-terracotta font-semibold">
          ← Other login options
        </Text>
      </TouchableOpacity>

      <Text className="text-3xl font-extrabold text-zinc-900 tracking-tight font-serif">
        {authMode === 'login' ? 'Phone login.' : 'Enter phone.'}
      </Text>
      <Text className="text-sm text-zinc-500 mt-1 mb-5">
        Enter your number to receive a verification code.
      </Text>

      {/* Field Label */}
      <Text className="text-xs font-bold tracking-wider text-brand-terracotta uppercase mb-2">
        PHONE NUMBER
      </Text>

      {/* Phone Input Container */}
      <View
        className={`flex-row items-center bg-white rounded-md border ${
          error ? 'border-red-400' : 'border-border'
        } h-13 px-3 shadow-sm`}>
        {/* Country Trigger */}
        <TouchableOpacity
          onPress={onPressCountryPicker}
          activeOpacity={0.7}
          className="flex-row items-center px-2 py-1.5">
          <Text className="text-sm font-semibold text-zinc-900">
            {countryShortName} {selectedCountry.code}
          </Text>
          <Text className="text-xs text-brand-terracotta ml-1">
            ▼
          </Text>
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View className="w-[1px] h-6 bg-border mx-2" />

        {/* Phone Input Field */}
        <TextInput
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          placeholder="000 000 0000"
          placeholderTextColor={neutralColors[400]}
          keyboardType="phone-pad"
          editable={!loading}
          autoFocus
          className="flex-1 text-base font-medium text-zinc-900 py-0"
        />
      </View>

      {/* Error Banner */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
          <Text className="text-red-600 text-xs font-medium">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Legal Terms */}
      <Text className="text-xs text-zinc-400 mt-4 mb-5">
        By continuing, you agree to our{' '}
        <Text className="underline">Terms of Service</Text> and{' '}
        <Text className="underline">Privacy Policy</Text>.
      </Text>

      {/* Send Code Button using shared Button primitive */}
      <Button
        label="Send Code →"
        onPress={onSendCode}
        disabled={!isPhoneReady || loading}
        loading={loading}
        variant="primary"
        size="md"
      />

      {/* Official Google reCAPTCHA Compliance Notice */}
      <RecaptchaLegalNotice showShield={true} className="mt-3" />
    </View>
  );
};
