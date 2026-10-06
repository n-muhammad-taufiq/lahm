/**
 * StepProgressHeader Component
 * 
 * Production-grade navigation and progress header for onboarding wizards:
 * - Circular back button with chevron
 * - Centered tracked step counter text ('STEP X OF Y')
 * - Customizable right action pill (e.g. 'Quick Fill') with brand terracotta styling
 * - Segmented horizontal progress bars with rounded ends
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { StepProgressHeaderProps } from './StepProgressHeader.types';

export const StepProgressHeader: React.FC<StepProgressHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  actionText = 'Quick Fill',
  onAction,
  showAction = true,
  className = '',
  style,
  testID,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className={`w-full px-5 pt-3 pb-2 bg-white ${className}`} style={style} testID={testID}>
      {/* Top Navigation Row: Back Button, Step Indicator, Action Button */}
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-10 h-10 rounded-full border border-zinc-200 bg-white items-center justify-center active:bg-zinc-50">
            <Text className="text-zinc-600 text-base font-semibold leading-none mb-0.5">‹</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}

        <Text className="text-xs font-semibold text-zinc-400 tracking-[1.5px] uppercase">
          STEP {currentStep} OF {totalSteps}
        </Text>

        {showAction && onAction ? (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={actionText}
            className="px-3.5 py-1.5 rounded-full border border-brand-terracotta bg-white active:bg-brand-terracottaLight">
            <Text className="text-xs font-semibold text-brand-terracotta">{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>

      {/* Segmented Progress Bars */}
      <View className="flex-row gap-2 mt-4 mb-2">
        {steps.map((step) => {
          const isCompleteOrActive = step <= currentStep;
          return (
            <View
              key={step}
              className={`h-1 flex-1 rounded-full ${
                isCompleteOrActive ? 'bg-brand-terracotta' : 'bg-zinc-200'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};
