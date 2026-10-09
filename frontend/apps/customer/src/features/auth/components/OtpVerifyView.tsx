/**
 * OtpVerifyView Component
 * 
 * Modular sub-view for 6-digit SMS OTP verification, countdown timer,
 * resend code action, and phone number change trigger.
 * Built strictly with design tokens from @lahm/tokens and primitives from @lahm/ui.
 */

import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@lahm/ui';
import { neutralColors } from '@lahm/tokens';

export interface OtpVerifyViewProps {
  countryCode: string;
  phoneNumber: string;
  otpCode: string;
  onOtpCodeChange: (code: string) => void;
  error?: string | null;
  secondsLeft: number;
  loading?: boolean;
  onResendOtp: () => void;
  onChangeNumber: () => void;
  onVerifyOtp: () => void;
}

export const OtpVerifyView: React.FC<OtpVerifyViewProps> = ({
  countryCode,
  phoneNumber,
  otpCode,
  onOtpCodeChange,
  error,
  secondsLeft,
  loading = false,
  onResendOtp,
  onChangeNumber,
  onVerifyOtp,
}) => {
  const isOtpReady = otpCode.trim().length >= 4;

  return (
    <View className="w-full">
      <Text className="text-3xl font-extrabold text-zinc-900 tracking-tight font-serif">
        Verify code.
      </Text>
      <Text className="text-sm text-zinc-500 mt-1 mb-5">
        We sent a 6-digit code to{' '}
        <Text className="font-bold text-zinc-900">
          {countryCode} {phoneNumber}
        </Text>
      </Text>

      {/* 6-Digit OTP Box */}
      <TextInput
        value={otpCode}
        onChangeText={onOtpCodeChange}
        placeholder="••••••"
        placeholderTextColor={neutralColors[400]}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
        autoFocus
        className={`bg-white rounded-md border ${
          error ? 'border-red-400' : 'border-border'
        } h-13 text-center text-2xl font-bold tracking-widest text-zinc-900 mb-3 shadow-sm`}
      />

      {/* Error Banner */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          <Text className="text-red-600 text-xs font-medium">{error}</Text>
        </View>
      ) : null}

      {/* Resend & Change Number Row */}
      <View className="flex-row items-center justify-between mb-5 px-1">
        <TouchableOpacity
          onPress={onResendOtp}
          disabled={secondsLeft > 0 || loading}>
          <Text
            className={`text-xs font-semibold ${
              secondsLeft > 0 ? 'text-zinc-400' : 'text-brand-terracotta'
            }`}>
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onChangeNumber}>
          <Text className="text-xs font-semibold text-zinc-500 underline">
            Change number
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verify Button using shared @lahm/ui Button */}
      <Button
        label="Verify & Continue →"
        onPress={onVerifyOtp}
        disabled={!isOtpReady || loading}
        loading={loading}
        variant="primary"
        size="md"
      />
    </View>
  );
};
