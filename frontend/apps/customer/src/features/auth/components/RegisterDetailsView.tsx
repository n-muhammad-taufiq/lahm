/**
 * RegisterDetailsView Component
 * 
 * Sub-view for first-time customer registration, capturing required full name
 * (for order labeling and delivery handoff) and optional email (for digital invoices).
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

export interface RegisterDetailsViewProps {
  name: string;
  onNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  loading?: boolean;
  error?: string | null;
  onChangeNumber: () => void;
  onRegister: () => void;
}

export const RegisterDetailsView: React.FC<RegisterDetailsViewProps> = ({
  name,
  onNameChange,
  email,
  onEmailChange,
  loading = false,
  error,
  onChangeNumber,
  onRegister,
}) => {
  const isNameReady = name.trim().length >= 2;

  return (
    <View className="w-full">
      {/* Top Header Badge & Change Number */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-brand-terracotta" />
          <Text className="text-xs font-bold tracking-widest text-brand-terracotta uppercase">
            NEW CUSTOMER SETUP
          </Text>
        </View>
        <TouchableOpacity onPress={onChangeNumber} hitSlop={8}>
          <Text className="text-xs font-semibold text-zinc-500 underline">
            Change number
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-3xl font-extrabold text-zinc-900 tracking-tight font-serif">
        Welcome to Lahm.
      </Text>
      <Text className="text-sm text-zinc-500 mt-1 mb-5">
        How should our butchers and delivery partners address your orders?
      </Text>

      {/* Full Name Field (Required) */}
      <Text className="text-xs font-bold tracking-wider text-brand-terracotta uppercase mb-2">
        YOUR FULL NAME *
      </Text>
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g. Tariq Mansoor"
        placeholderTextColor={neutralColors[400]}
        editable={!loading}
        autoFocus
        className="bg-white rounded-md border border-border h-13 px-4 text-base font-medium text-zinc-900 mb-4 shadow-sm"
      />

      {/* Email Field (Optional) */}
      <Text className="text-xs font-bold tracking-wider text-brand-terracotta uppercase mb-2">
        EMAIL ADDRESS (OPTIONAL)
      </Text>
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        placeholder="name@example.com"
        placeholderTextColor={neutralColors[400]}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        className="bg-white rounded-md border border-border h-13 px-4 text-base font-medium text-zinc-900 mb-1 shadow-sm"
      />
      <Text className="text-xs text-zinc-400 mb-5">
        For your digital butcher invoices and exclusive cut arrivals.
      </Text>

      {/* Error Banner */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          <Text className="text-red-600 text-xs font-medium">{error}</Text>
        </View>
      ) : null}

      {/* Complete Registration Button */}
      <Button
        label="Complete & Enter Store →"
        onPress={onRegister}
        disabled={!isNameReady || loading}
        loading={loading}
        variant="primary"
        size="md"
      />
    </View>
  );
};
