/**
 * AuthSuccessView Component
 * 
 * Sub-view for post-authentication success state, displaying confirmation badge,
 * personalized greeting, and primary action to enter the store.
 * Built strictly with design tokens from @lahm/tokens and primitives from @lahm/ui.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@lahm/ui';

export interface AuthSuccessViewProps {
  isNewUser?: boolean;
  userName?: string;
  onEnterStore: () => void;
}

export const AuthSuccessView: React.FC<AuthSuccessViewProps> = ({
  isNewUser = false,
  userName,
  onEnterStore,
}) => {
  return (
    <View className="w-full items-center py-4">
      {/* Success Badge */}
      <View className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-4">
        <Text className="text-2xl text-emerald-600 font-bold">✓</Text>
      </View>

      {/* Heading */}
      <Text className="text-3xl font-extrabold text-zinc-900 mb-2 font-serif text-center tracking-tight">
        Welcome to Lahm!
      </Text>

      {/* Subtitle with standard token spacing */}
      <Text className="text-sm text-zinc-500 text-center mb-6 leading-relaxed">
        {isNewUser
          ? `Welcome, ${userName || 'Artisanal Member'}. Your account is ready.`
          : `Welcome back, ${userName || 'verified customer'}.`}
      </Text>

      {/* Primary CTA */}
      <Button
        label="Enter Lahm Store →"
        onPress={onEnterStore}
        variant="primary"
        size="md"
        className="w-full"
      />
    </View>
  );
};
