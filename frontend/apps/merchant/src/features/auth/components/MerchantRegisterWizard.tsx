import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CountryPickerModal, type CountryItem } from '@lahm/ui';
import type { MerchantRegistrationFormData, UploadedFile } from '@lahm/api';
import * as DocumentPicker from 'expo-document-picker';
import { authApiService, setAccessToken, setActiveMerchant, extractErrorMessage } from '@/services';

const DEFAULT_COUNTRY: CountryItem = {
  flag: '🇦🇪',
  code: '+971',
  name: 'United Arab Emirates',
};

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface MerchantRegisterWizardProps {
  initialPhoneNumber?: string;
  initialCountryCode?: string;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export function MerchantRegisterWizard({
  initialPhoneNumber,
  initialCountryCode,
  onSwitchToLogin,
  onSuccess,
}: MerchantRegisterWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Country Picker Modal
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
    initialCountryCode
      ? { flag: '🇦🇪', code: initialCountryCode, name: 'Country' }
      : DEFAULT_COUNTRY
  );

  // Form State
  const [formData, setFormData] = useState<MerchantRegistrationFormData>({
    name: '',
    phoneNumber: initialPhoneNumber || '',
    countryCode: initialCountryCode || DEFAULT_COUNTRY.code,
    email: '',
    shopAddress: '',
    city: '',
    state: '',
    pinCode: '',
    halalFile: null,
    fssaiFile: null,
    gstin: '',
    accountHolderName: '',
    bankName: '',
    ifscCode: '',
    openingTime: '08:00 AM',
    closingTime: '09:00 PM',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  });

  const updateField = (field: keyof MerchantRegistrationFormData, value: any) => {
    setError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickDocument = async (field: 'halalFile' | 'fssaiFile') => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        updateField(field, {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType,
        });
      }
    } catch (err: any) {
      setError('Failed to select file. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.workingDays.includes(day);
      const newDays = exists
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: newDays };
    });
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return false;
      }
      const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      if (!cleanPhone || cleanPhone.length < 7) {
        setError('Please enter a valid mobile number');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.shopAddress.trim()) {
        setError('Please enter your shop address');
        return false;
      }
      if (!formData.city.trim()) {
        setError('Please enter your city');
        return false;
      }
      if (!formData.state.trim()) {
        setError('Please enter your state');
        return false;
      }
      if (!formData.pinCode.trim()) {
        setError('Please enter your PIN / Postal code');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.halalFile) {
        setError('Please upload your Halal Certificate document (PDF or Image)');
        return false;
      }
      if (!formData.fssaiFile) {
        setError('Please upload your FSSAI Certificate document (PDF or Image)');
        return false;
      }
      if (!formData.gstin.trim()) {
        setError('Please enter your GSTIN number');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.accountHolderName.trim()) {
        setError('Please enter the bank account holder name');
        return false;
      }
      if (!formData.bankName.trim()) {
        setError('Please enter the bank name');
        return false;
      }
      if (!formData.ifscCode.trim()) {
        setError('Please enter the IFSC code');
        return false;
      }
    } else if (currentStep === 5) {
      if (formData.workingDays.length === 0) {
        setError('Please select at least one working day');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onSwitchToLogin();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `${formData.countryCode}${cleanPhone}`;

      const payload = {
        name: formData.name.trim(),
        phoneNumber: fullPhone,
        email: formData.email?.trim() || undefined,
        shopAddress: formData.shopAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        halalCertificateUrl: formData.halalFile?.name ? `certificates/halal/${formData.halalFile.name}` : undefined,
        fssaiCertificateUrl: formData.fssaiFile?.name ? `certificates/fssai/${formData.fssaiFile.name}` : undefined,
        gstin: formData.gstin.trim() || undefined,
        accountHolderName: formData.accountHolderName.trim(),
        bankName: formData.bankName.trim(),
        ifscCode: formData.ifscCode.trim(),
        openingTime: formData.openingTime || '08:00 AM',
        closingTime: formData.closingTime || '09:00 PM',
        workingDays: formData.workingDays,
      };

      const res = await authApiService.registerMerchant(payload);
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
      }
      if (res?.merchant) {
        setActiveMerchant(res.merchant);
      }
      onSuccess();
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Personal Details',
    'Shop Details',
    'Business Verification',
    'Settlement Information',
    'Store Operations',
  ];

  const countryShortName = (selectedCountry.name || 'US').slice(0, 2).toLowerCase();

  return (
    <View className="w-full bg-white rounded-2xl border border-[#F2D8CD] p-5 shadow-md">
      
      {/* 1. Stepper Header & Progress Bar */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-[11px] font-bold tracking-[1.5px] text-[#B87B6A] uppercase">
            STEP {currentStep} OF 5
          </Text>
          <Text className="text-xs font-semibold text-[#7D6F66]">
            {Math.round((currentStep / 5) * 100)}% Completed
          </Text>
        </View>

        <Text className="text-[20px] font-extrabold text-[#1C1611] tracking-tight font-serif mb-2">
          {stepTitles[currentStep - 1]}
        </Text>

        {/* Progress Fill Bar */}
        <View className="h-1.5 w-full bg-[#FDF2EB] rounded-full overflow-hidden">
          <View
            className="h-full bg-[#E77A62] rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </View>
      </View>

      {/* 2. Scrollable Step Form Fields with Height */}
      <View className="min-h-[260px] justify-center">

        {/* STEP 1: Personal Details */}
        {currentStep === 1 ? (
          <View key="step-1">
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              FULL NAME *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="e.g. Tariq Mansoor"
              placeholderTextColor="#D8B5A7"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-3.5 shadow-sm"
            />

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              MOBILE NUMBER *
            </Text>
            <View className="flex-row items-center bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3 mb-3.5 shadow-sm">
              <TouchableOpacity
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.7}
                className="flex-row items-center px-1">
                <Text className="text-sm font-semibold text-[#1C1611]">
                  {countryShortName} {selectedCountry.code}
                </Text>
                <Text className="text-[10px] text-[#B87B6A] ml-1">⌵</Text>
              </TouchableOpacity>
              <View className="w-[1px] h-6 bg-[#F2D8CD] mx-2" />
              <TextInput
                value={formData.phoneNumber}
                onChangeText={(text) => updateField('phoneNumber', text)}
                placeholder="50 123 4567"
                placeholderTextColor="#D8B5A7"
                keyboardType="phone-pad"
                className="flex-1 text-base font-medium text-[#1C1611] py-0"
              />
            </View>

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              EMAIL ADDRESS (OPTIONAL)
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="tariq@halalmeats.com"
              placeholderTextColor="#D8B5A7"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-1 shadow-sm"
            />
          </View>
        ) : null}

        {/* STEP 2: Shop Details */}
        {currentStep === 2 ? (
          <View key="step-2">
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              SHOP ADDRESS *
            </Text>
            <TextInput
              value={formData.shopAddress}
              onChangeText={(text) => updateField('shopAddress', text)}
              placeholder="Shop No. 12, Deira Central Market"
              placeholderTextColor="#D8B5A7"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-3.5 shadow-sm"
            />

            <View className="flex-row gap-2 mb-3.5">
              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  CITY *
                </Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholder="Dubai"
                  placeholderTextColor="#D8B5A7"
                  className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] shadow-sm"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  STATE *
                </Text>
                <TextInput
                  value={formData.state}
                  onChangeText={(text) => updateField('state', text)}
                  placeholder="Dubai"
                  placeholderTextColor="#D8B5A7"
                  className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] shadow-sm"
                />
              </View>
            </View>

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              PIN / POSTAL CODE *
            </Text>
            <TextInput
              value={formData.pinCode}
              onChangeText={(text) => updateField('pinCode', text)}
              placeholder="00000"
              placeholderTextColor="#D8B5A7"
              keyboardType="number-pad"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-1 shadow-sm"
            />
          </View>
        ) : null}

        {/* STEP 3: Business Verification */}
        {currentStep === 3 ? (
          <View key="step-3">
            {/* 1. Halal Certificate File */}
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              HALAL CERTIFICATE (FILE ATTACHMENT) *
            </Text>
            {!formData.halalFile ? (
              <TouchableOpacity
                onPress={() => pickDocument('halalFile')}
                activeOpacity={0.7}
                className="w-full border border-dashed border-[#F2D8CD] bg-[#FDF2EB]/40 rounded-md p-3.5 items-center justify-center mb-3.5">
                <Text className="text-2xl mb-1">📄</Text>
                <Text className="text-sm font-semibold text-[#1C1611]">
                  Select Halal Certificate File
                </Text>
                <Text className="text-[11px] text-[#7D6F66] mt-0.5">
                  PDF, JPG, or PNG document
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="w-full border border-emerald-200 bg-emerald-50/60 rounded-md p-3 flex-row items-center justify-between mb-3.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <Text className="text-xl mr-2">✅</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#1C1611]" numberOfLines={1}>
                      {formData.halalFile.name}
                    </Text>
                    <Text className="text-[10px] text-emerald-700">
                      {formData.halalFile.size ? `${(formData.halalFile.size / 1024).toFixed(1)} KB` : 'Attached'} • Document ready
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => updateField('halalFile', null)}
                  className="px-2.5 py-1 bg-white border border-red-200 rounded">
                  <Text className="text-[11px] font-bold text-red-500">Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. FSSAI Certificate File */}
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              FSSAI CERTIFICATE (FILE ATTACHMENT) *
            </Text>
            {!formData.fssaiFile ? (
              <TouchableOpacity
                onPress={() => pickDocument('fssaiFile')}
                activeOpacity={0.7}
                className="w-full border border-dashed border-[#F2D8CD] bg-[#FDF2EB]/40 rounded-md p-3.5 items-center justify-center mb-3.5">
                <Text className="text-2xl mb-1">📜</Text>
                <Text className="text-sm font-semibold text-[#1C1611]">
                  Select FSSAI Certificate File
                </Text>
                <Text className="text-[11px] text-[#7D6F66] mt-0.5">
                  PDF, JPG, or PNG document
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="w-full border border-emerald-200 bg-emerald-50/60 rounded-md p-3 flex-row items-center justify-between mb-3.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <Text className="text-xl mr-2">✅</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#1C1611]" numberOfLines={1}>
                      {formData.fssaiFile.name}
                    </Text>
                    <Text className="text-[10px] text-emerald-700">
                      {formData.fssaiFile.size ? `${(formData.fssaiFile.size / 1024).toFixed(1)} KB` : 'Attached'} • Document ready
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => updateField('fssaiFile', null)}
                  className="px-2.5 py-1 bg-white border border-red-200 rounded">
                  <Text className="text-[11px] font-bold text-red-500">Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. GSTIN Number (Number Only) */}
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              GSTIN NUMBER *
            </Text>
            <TextInput
              value={formData.gstin}
              onChangeText={(text) => updateField('gstin', text.toUpperCase())}
              placeholder="e.g. 07AAAAA0000A1Z5"
              placeholderTextColor="#D8B5A7"
              autoCapitalize="characters"
              maxLength={15}
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-1 shadow-sm"
            />
          </View>
        ) : null}

        {/* STEP 4: Settlement Information */}
        {currentStep === 4 ? (
          <View key="step-4">
            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              ACCOUNT HOLDER NAME *
            </Text>
            <TextInput
              value={formData.accountHolderName}
              onChangeText={(text) => updateField('accountHolderName', text)}
              placeholder="e.g. Al-Madina Halal Meats LLC"
              placeholderTextColor="#D8B5A7"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-3.5 shadow-sm"
            />

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              BANK NAME *
            </Text>
            <TextInput
              value={formData.bankName}
              onChangeText={(text) => updateField('bankName', text)}
              placeholder="e.g. Emirates NBD / HDFC Bank"
              placeholderTextColor="#D8B5A7"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-3.5 shadow-sm"
            />

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
              IFSC / SWIFT / IBAN CODE *
            </Text>
            <TextInput
              value={formData.ifscCode}
              onChangeText={(text) => updateField('ifscCode', text)}
              placeholder="e.g. EBILAEADXXX / HDFC0001234"
              placeholderTextColor="#D8B5A7"
              autoCapitalize="characters"
              className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] mb-1 shadow-sm"
            />
          </View>
        ) : null}

        {/* STEP 5: Store Operations */}
        {currentStep === 5 ? (
          <View key="step-5">
            <View className="flex-row gap-2 mb-3.5">
              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  OPENING TIME *
                </Text>
                <TextInput
                  value={formData.openingTime}
                  onChangeText={(text) => updateField('openingTime', text)}
                  placeholder="08:00 AM"
                  placeholderTextColor="#D8B5A7"
                  className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] shadow-sm"
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-1.5">
                  CLOSING TIME *
                </Text>
                <TextInput
                  value={formData.closingTime}
                  onChangeText={(text) => updateField('closingTime', text)}
                  placeholder="09:00 PM"
                  placeholderTextColor="#D8B5A7"
                  className="bg-white rounded-md border border-[#F2D8CD] h-[48px] px-3.5 text-base font-medium text-[#1C1611] shadow-sm"
                />
              </View>
            </View>

            <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-2">
              WORKING DAYS *
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {ALL_DAYS.map((day) => {
                const isSelected = formData.workingDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.8}
                    className={`px-3 py-2 rounded-md border ${
                      isSelected
                        ? 'bg-[#E77A62] border-[#E77A62]'
                        : 'bg-[#FDF2EB] border-[#F2D8CD]'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-[#7D6F66]'
                      }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

      </View>

      {/* 3. Error Banner */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 my-3">
          <Text className="text-red-600 text-xs font-medium">{error}</Text>
        </View>
      ) : null}

      {/* 4. Action Buttons */}
      <View className="flex-row items-center mt-4">
        {currentStep > 1 ? (
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            className="h-[48px] px-4 rounded-md border border-[#F2D8CD] bg-white items-center justify-center mr-2.5">
            <Text className="text-sm font-bold text-[#7D6F66]">← Back</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.85}
          className="flex-1 h-[48px] rounded-md bg-[#E77A62] items-center justify-center shadow-sm">
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-[15px] font-bold text-white">
              {currentStep < 5 ? 'Next Step →' : 'Complete Partner Registration →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 5. Switcher back to Login */}
      <View className="flex-row items-center justify-center pt-4">
        <Text className="text-[12.5px] text-[#7D6F66]">
          Already registered?{' '}
        </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text className="text-[12.5px] font-bold text-[#E77A62]">
            Sign in
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <CountryPickerModal
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          updateField('countryCode', country.code);
        }}
        selectedCountryCode={selectedCountry.code}
      />
    </View>
  );
}
