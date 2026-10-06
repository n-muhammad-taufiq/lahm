/**
 * Country Picker Modal Component
 * 
 * Modal dialog for selecting international country calling codes and flags (e.g. GCC nations).
 */

import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { CountryPickerModalProps } from './CountryPickerModal.types';
import {
  DEFAULT_MODAL_TITLE,
  GCC_COUNTRIES,
} from './CountryPickerModal.constants';

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  onClose,
  onSelectCountry,
  selectedCountryCode,
  title = DEFAULT_MODAL_TITLE,
  countries = GCC_COUNTRIES,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/45 justify-center items-center p-5"
        onPress={onClose}>
        <Pressable
          className="w-full max-w-[400px] bg-white rounded-2xl max-h-[75%] overflow-hidden shadow-lg"
          onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-zinc-200">
            <Text className="text-xl font-bold text-zinc-900">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-7 h-7 rounded-full bg-zinc-100 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Close country picker">
              <Text className="text-xs font-bold text-zinc-900">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="py-2" showsVerticalScrollIndicator={false}>
            {countries.map((item) => {
              const isSelected = item.code === selectedCountryCode;
              return (
                <TouchableOpacity
                  key={item.code}
                  className={`flex-row items-center px-5 py-3.5 border-b border-zinc-200 ${
                    isSelected ? 'bg-zinc-100' : ''
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectCountry(item);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, dialing code ${item.code}`}>
                  <Text className="text-2xl mr-3">{item.flag}</Text>
                  <Text className="flex-1 text-base font-medium text-zinc-900">
                    {item.name}
                  </Text>
                  <Text className="text-sm font-semibold text-zinc-500 mr-2">
                    {item.code}
                  </Text>
                  {isSelected ? (
                    <Text className="text-lg font-bold text-zinc-900">✓</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
