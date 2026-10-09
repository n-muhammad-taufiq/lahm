/**
 * ChoiceView Component
 * 
 * Initial choice screen allowing users to choose their authentication method
 * (Phone Number or Google OAuth) with tokenized typography and legal compliance.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Button, RecaptchaLegalNotice } from '@lahm/ui';

export interface ChoiceViewProps {
  authMode: 'login' | 'register';
  onSelectPhone: () => void;
  onSelectGoogle?: () => void;
}

function GoogleIcon() {
  return (
    <View className="w-5 h-5 mr-2 items-center justify-center rounded-full bg-white">
      <Text className="text-sm font-black text-blue-500">G</Text>
    </View>
  );
}

export const ChoiceView: React.FC<ChoiceViewProps> = ({
  authMode,
  onSelectPhone,
  onSelectGoogle,
}) => {
  return (
    <View className="w-full">
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-zinc-900 tracking-tight font-serif">
          {authMode === 'login' ? 'Welcome back.' : 'Create an account.'}
        </Text>
        <Text className="text-sm text-zinc-500 mt-1">
          {authMode === 'login'
            ? 'Sign in to access your artisanal cuts.'
            : 'Join Lahm for farm-fresh halal meat delivered.'}
        </Text>
      </View>

      {/* 1. Login with Phone Number Button */}
      <Button
        label="Login with Phone Number"
        onPress={onSelectPhone}
        variant="primary"
        size="md"
        className="mb-3"
      />

      {/* 2. Login with Google Button */}
      <Button
        label="Login with Google"
        onPress={onSelectGoogle || (() => {})}
        variant="outline"
        size="md"
        leftIcon={<GoogleIcon />}
        className="mb-3"
      />

      {/* Legal Terms & Privacy */}
      <Text className="text-xs text-zinc-400 mt-1 mb-2 text-center">
        By continuing, you agree to our{' '}
        <Text className="underline">Terms of Service</Text> and{' '}
        <Text className="underline">Privacy Policy</Text>.
      </Text>

      {/* Official Google reCAPTCHA Compliance Notice */}
      <RecaptchaLegalNotice showShield={true} className="mb-2" />
    </View>
  );
};
