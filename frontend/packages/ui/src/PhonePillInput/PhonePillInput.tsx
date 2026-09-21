import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { PhonePillInputProps } from './PhonePillInput.types';
import { DEFAULT_PHONE_PLACEHOLDER } from './PhonePillInput.constants';

export const PhonePillInput: React.FC<PhonePillInputProps> = ({
  countryFlag,
  countryCode,
  phoneNumber,
  onPhoneNumberChange,
  onPressCountryPicker,
  placeholder = DEFAULT_PHONE_PLACEHOLDER,
  errorMessage,
  disabled = false,
  autoFocus = false,
  className = '',
  style,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  const borderClass = hasError
    ? 'border-feedback-error bg-red-50'
    : isFocused
    ? 'border-zinc-900 bg-white'
    : 'border-zinc-200 bg-zinc-50';

  return (
    <View className={`w-full gap-1.5 ${className}`}>
      <View
        className={`h-14 rounded-2xl border flex-row items-center px-2.5 ${borderClass} ${
          disabled ? 'opacity-50' : ''
        }`}
        style={[
          isFocused
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }
            : null,
          style,
        ]}
        testID={testID}>
        <TouchableOpacity
          className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-zinc-200 gap-1.5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}
          activeOpacity={0.75}
          onPress={onPressCountryPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Select country code, currently ${countryCode}`}>
          <Text className="text-xl">{countryFlag}</Text>
          <Text className="text-[15px] font-bold text-zinc-900">{countryCode}</Text>
          <Text className="text-xs text-zinc-400 font-bold ml-0.5">▾</Text>
        </TouchableOpacity>

        <View className="w-px h-6 bg-zinc-200 mx-2.5" />

        <TextInput
          className="flex-1 h-full text-lg font-semibold tracking-wide text-zinc-900 px-1"
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          editable={!disabled}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Phone number input"
        />
      </View>

      {hasError ? (
        <Text className="text-xs font-medium text-feedback-error ml-3 mt-0.5">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};
