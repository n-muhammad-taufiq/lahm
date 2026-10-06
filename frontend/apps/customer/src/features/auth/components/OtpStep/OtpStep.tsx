/**
 * OTP Verification Step Component
 * 
 * A 6-digit one-time password (OTP) input card with countdown timer,
 * resend button, and change phone number option.
 */

import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@lahm/ui';
import type { OtpStepProps } from './OtpStep.types';
import { OTP_STEP_TEXT } from './OtpStep.constants';

export const OtpStep: React.FC<OtpStepProps> = ({
  otpCode,
  onOtpCodeChange,
  countryCode,
  phoneNumber,
  onVerify,
  onResend,
  onChangeNumber,
  secondsLeft,
  loading = false,
  errorMessage,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const canResend = secondsLeft <= 0;
  const isComplete = otpCode.trim().length === 6;

  const borderClass = errorMessage
    ? 'border-feedback-error bg-red-50'
    : isFocused
    ? 'border-zinc-900 bg-white'
    : 'border-zinc-200 bg-zinc-50';

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
        <Text className="text-zinc-900 text-2xl font-bold tracking-tight">
          {OTP_STEP_TEXT.title}
        </Text>
        <Text className="text-zinc-500 text-sm font-normal">
          {OTP_STEP_TEXT.subtitlePrefix} <Text className="text-zinc-900 font-semibold">{countryCode} {phoneNumber}</Text>
        </Text>
      </View>

      <View className="w-full gap-3.5">
        <TextInput
          className={`h-14 border rounded-2xl text-center text-2xl font-bold tracking-[12px] text-zinc-900 ${borderClass}`}
          placeholder="••••••"
          placeholderTextColor="#A1A1AA"
          keyboardType="number-pad"
          maxLength={6}
          value={otpCode}
          onChangeText={onOtpCodeChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!loading}
          autoFocus
        />

        {errorMessage ? (
          <Text className="text-feedback-error text-xs font-medium text-center">
            {errorMessage}
          </Text>
        ) : null}

        <Button
          label={OTP_STEP_TEXT.buttonLabel}
          rightIcon={<Text className="text-white text-base font-bold">→</Text>}
          onPress={onVerify}
          loading={loading}
          disabled={!isComplete || loading}
          size="md"
          className="mt-1"
        />

        <View className="flex-row justify-center items-center gap-2.5 pt-1">
          <TouchableOpacity onPress={onChangeNumber} disabled={loading} activeOpacity={0.7}>
            <Text className="text-zinc-800 text-sm font-semibold">
              {OTP_STEP_TEXT.changeNumberText}
            </Text>
          </TouchableOpacity>

          <Text className="text-zinc-300 text-xs">•</Text>

          <TouchableOpacity
            onPress={onResend}
            disabled={!canResend || loading}
            activeOpacity={0.7}>
            <Text
              className={`text-sm ${
                canResend
                  ? 'text-zinc-900 font-bold underline'
                  : 'text-zinc-400 font-normal'
              }`}>
              {canResend
                ? OTP_STEP_TEXT.resendText
                : `${OTP_STEP_TEXT.resendInPrefix} ${secondsLeft}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
