/**
 * Merchant Registration Wizard Component
 * 
 * Production-grade onboarding wizard for butcher shops matching user's mockup:
 * - True full-screen layout
 * - Inline field-level validation errors directly below fields (border-red-400, bg-[#FFF5F5], ⓘ message)
 * - Circular back button with chevron
 * - STEP 1 OF 5 and Quick Fill pill with terracotta outline
 * - 5 segmented horizontal progress bars
 * - Serif title (Georgia/serif)
 * - Rounded-md input fields with soft border-zinc-200
 * - Country code + phone input in a single split rounded box
 * - Deep terracotta (#B04A37) CTA button anchored at the bottom
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CountryPickerModal,
  FormField,
  LocationStatusField,
  SelectField,
  StepProgressHeader,
  StoreLocationMapPreview,
  type CountryItem,
} from '@lahm/ui';
import type { MerchantRegistrationFormData } from '@lahm/api';
import * as DocumentPicker from 'expo-document-picker';
import { authApiService, setAccessToken, setActiveMerchant, extractErrorMessage } from '@/services';
import { AddressSearchInput } from './AddressSearchInput';
import { StoreLocationMapModal } from './StoreLocationMapModal';
import { type AddressSuggestion, getResolvedCurrentLocation } from '../services/locationSearchService';

const BRAND_TERRACOTTA = '#B04A37';

const DEFAULT_COUNTRY: CountryItem = {
  flag: '🇮🇳',
  code: '+91',
  name: 'India',
};

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Goa',
  'Assam',
  'Jammu and Kashmir',
  'Puducherry',
];

const STEP_METADATA = [
  {
    step: 1,
    title: 'Personal Details',
    subtitle: 'Primary contact information of the butchery owner',
  },
  {
    step: 2,
    title: 'Shop & Location',
    subtitle: 'Physical storefront address and GPS coordinates',
  },
  {
    step: 3,
    title: 'Certifications',
    subtitle: 'Halal slaughter proof, FSSAI registration, and tax ID',
  },
  {
    step: 4,
    title: 'Bank Settlement',
    subtitle: 'Account details for weekly automated payout transfers',
  },
  {
    step: 5,
    title: 'Store Operations',
    subtitle: 'Daily operating hours and weekly working schedule',
  },
];

export interface MerchantRegisterWizardProps {
  initialPhoneNumber?: string;
  initialCountryCode?: string;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

/**
 * Clean Document Upload Field Component with inline validation error support
 */
interface FileUploadProps {
  label: string;
  required?: boolean;
  hint: string;
  file?: { name: string; size?: number; uri: string } | null;
  error?: string;
  onPick: () => void;
  onRemove: () => void;
}

function FileUploadField({
  label,
  required = false,
  hint,
  file,
  error,
  onPick,
  onRemove,
}: FileUploadProps) {
  const hasError = Boolean(error);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-medium text-zinc-800">
          {label} {required ? <Text className="text-brand-terracotta">*</Text> : null}
        </Text>
        <Text className="text-xs text-zinc-400">{hint}</Text>
      </View>

      {file ? (
        <View className="h-[52px] px-4 rounded-[14px] border border-zinc-200 bg-white flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-medium text-zinc-900" numberOfLines={1}>
              {file.name}
            </Text>
            <Text className="text-xs text-zinc-500 mt-0.5">
              {file.size ? `${(file.size / 1024).toFixed(0)} KB • Attached` : 'Attached'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRemove}
            className="px-2.5 py-1 rounded-md border border-zinc-200 bg-zinc-50 active:bg-zinc-100">
            <Text className="text-xs font-medium text-red-600">Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPick}
          activeOpacity={0.8}
          className={`h-[52px] px-4 rounded-[14px] border flex-row items-center justify-between active:bg-zinc-50 ${
            hasError
              ? 'border-dashed border-red-400 bg-[#FFF5F5]'
              : 'border-dashed border-zinc-300 bg-white'
          }`}>
          <Text className={`text-sm ${hasError ? 'text-red-400' : 'text-zinc-400'}`}>
            Select PDF or image file...
          </Text>
          <View className="px-3 py-1.5 rounded-md bg-zinc-100 border border-zinc-200">
            <Text className="text-xs font-semibold text-zinc-700">Choose File</Text>
          </View>
        </TouchableOpacity>
      )}

      {hasError ? (
        <View className="flex-row items-center gap-1 mt-0.5 ml-0.5">
          <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
          <Text className="text-xs text-red-500 font-normal">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function MerchantRegisterWizard({
  initialPhoneNumber,
  initialCountryCode,
  onSwitchToLogin,
  onSuccess,
}: MerchantRegisterWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  // Country Picker Modal
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
    initialCountryCode
      ? { flag: '🇮🇳', code: initialCountryCode, name: 'India' }
      : DEFAULT_COUNTRY
  );

  // Form State
  const [formData, setFormData] = useState<MerchantRegistrationFormData>({
    name: '',
    shopName: '',
    phoneNumber: initialPhoneNumber || '',
    countryCode: initialCountryCode || DEFAULT_COUNTRY.code,
    email: '',
    shopAddress: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: null,
    longitude: null,
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

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateField = (field: keyof MerchantRegistrationFormData, value: any) => {
    setServerError('');
    clearFieldError(field as string);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Automatically acquire and resolve accurate device GPS location when user enters Step 2 (Store Location)
  React.useEffect(() => {
    if (currentStep === 2 && !formData.latitude && !formData.longitude) {
      getResolvedCurrentLocation()
        .then((resolved) => {
          clearFieldError('location');
          setFormData((prev) => ({
            ...prev,
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            shopAddress: prev.shopAddress || resolved.shopAddress,
            city: prev.city || resolved.city,
            state: prev.state || resolved.state,
            pinCode: prev.pinCode || resolved.pinCode,
          }));
        })
        .catch(() => {
          // If permission is denied or device GPS is unavailable, user can select or enter manually
        });
    }
  }, [currentStep, formData.latitude, formData.longitude]);

  const handleAddressSelected = (suggestion: AddressSuggestion) => {
    clearFieldError('location');
    clearFieldError('shopAddress');
    clearFieldError('city');
    clearFieldError('state');
    clearFieldError('pinCode');

    setFormData((prev) => ({
      ...prev,
      shopAddress: suggestion.shopAddress || prev.shopAddress,
      city: suggestion.city || prev.city,
      state: suggestion.state || prev.state,
      pinCode: suggestion.pinCode || prev.pinCode,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
  };

  const handleMapLocationConfirmed = (location: {
    latitude: number;
    longitude: number;
    addressSuggestion?: AddressSuggestion | null;
  }) => {
    clearFieldError('location');
    setFormData((prev) => {
      const suggestion = location.addressSuggestion;
      return {
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        shopAddress: suggestion?.shopAddress || prev.shopAddress,
        city: suggestion?.city || prev.city,
        state: suggestion?.state || prev.state,
        pinCode: suggestion?.pinCode || prev.pinCode,
      };
    });
  };

  const handleQuickFill = () => {
    setServerError('');
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      name: 'Muhammad Tariq',
      shopName: 'Al Madina Artisanal Butchery',
      phoneNumber: prev.phoneNumber || '9876543210',
      countryCode: prev.countryCode || '+91',
      email: 'tariq@almadinameats.com',
      shopAddress: '12 Market Road (Old MTH), Ambattur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600053',
      latitude: 13.1067,
      longitude: 80.1618,
      halalFile: {
        name: 'halal_certificate_sample.pdf',
        uri: 'sample://halal_cert.pdf',
        size: 1048576,
        mimeType: 'application/pdf',
      },
      fssaiFile: {
        name: 'fssai_license_sample.pdf',
        uri: 'sample://fssai_cert.pdf',
        size: 2097152,
        mimeType: 'application/pdf',
      },
      gstin: '33AAAAA0000A1Z5',
      accountHolderName: 'Al Madina Butchery',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      openingTime: '08:00 AM',
      closingTime: '09:00 PM',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    }));
  };


  const pickDocument = async (field: 'halalFile' | 'fssaiFile') => {
    setServerError('');
    clearFieldError(field);
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
      setServerError('Failed to select file. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    clearFieldError('workingDays');
    setFormData((prev) => {
      const exists = prev.workingDays.includes(day);
      const newDays = exists
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: newDays };
    });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Please enter your full name';
      }
      const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      if (!cleanPhone || cleanPhone.length < 7) {
        newErrors.phoneNumber = 'Please enter your mobile number';
      }
    } else if (currentStep === 2) {
      if (!formData.shopAddress.trim()) {
        newErrors.shopAddress = 'Please enter your shop address';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'Please enter your city';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'Please enter your state';
      }
      if (!formData.pinCode.trim()) {
        newErrors.pinCode = 'Please enter your PIN code';
      }
      if (!formData.latitude || !formData.longitude) {
        newErrors.location = 'Please set your store location on the map';
      }
    } else if (currentStep === 3) {
      if (!formData.halalFile) {
        newErrors.halalFile = 'Please upload your Halal Certificate (PDF or Image)';
      }
      if (!formData.fssaiFile) {
        newErrors.fssaiFile = 'Please upload your FSSAI License Document (PDF or Image)';
      }
      if (!formData.gstin.trim()) {
        newErrors.gstin = 'Please enter your GSTIN number';
      }
    } else if (currentStep === 4) {
      if (!formData.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Please enter the bank account holder name';
      }
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Please enter the bank name';
      }
      if (!formData.ifscCode.trim()) {
        newErrors.ifscCode = 'Please enter the IFSC code';
      }
    } else if (currentStep === 5) {
      if (formData.workingDays.length === 0) {
        newErrors.workingDays = 'Please select at least one working day';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setServerError('');
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onSwitchToLogin();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setServerError('');
    try {
      const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
      const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `${formData.countryCode}${cleanPhone}`;

      const payload = {
        name: formData.name.trim(),
        shopName: formData.shopName?.trim() || undefined,
        phoneNumber: fullPhone,
        email: formData.email?.trim() || undefined,
        shopAddress: formData.shopAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
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
      setServerError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = STEP_METADATA[currentStep - 1];

  // Country label in phone input (e.g. IN +91 or AE +971 matching mockup)
  const countryShort =
    selectedCountry.code === '+91'
      ? 'IN'
      : selectedCountry.code === '+971'
      ? 'AE'
      : selectedCountry.name?.slice(0, 2).toUpperCase() || 'IN';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white w-full">
      <View className="flex-1 bg-white w-full flex-col justify-between">

        {/* 1. Header Bar: Back Circle | STEP X OF 5 | Quick Fill Pill & Segmented Progress */}
        <View className="w-full max-w-[480px] self-center">
          <StepProgressHeader
            currentStep={currentStep}
            totalSteps={5}
            onBack={handleBack}
            actionText="Quick Fill"
            onAction={handleQuickFill}
          />
        </View>

        {/* 3. Scrollable Form Content */}
        <ScrollView
          className="flex-1 w-full"
          contentContainerClassName="px-5 sm:px-6 py-4 max-w-[480px] w-full self-center flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Title & Subtitle matching reference screenshot */}
          <Text className="text-2xl font-bold text-zinc-900 tracking-tight">
            {currentMeta.title}
          </Text>
          <Text className="text-xs text-zinc-400 font-normal mt-1 mb-6">
            {currentMeta.subtitle}
          </Text>

          {/* Form Fields */}
          <View className="gap-4">

            {/* STEP 1: Personal Details */}
            {currentStep === 1 ? (
              <>
                <FormField
                  label="Full Name"
                  required
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  placeholder="e.g. Tariq Mansoor"
                  error={errors.name}
                />

                {/* Mobile Number with Country Pill Split Box */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#18181B' }}>
                    Mobile Number <Text style={{ color: '#B04A37' }}>*</Text>
                  </Text>

                  <View
                    style={{
                      height: 52,
                      minHeight: 52,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: errors.phoneNumber
                        ? '#F87171'
                        : isPhoneFocused
                        ? '#B04A37'
                        : '#E4E4E7',
                      backgroundColor: errors.phoneNumber ? '#FFF5F5' : '#FFFFFF',
                      flexDirection: 'row',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(true)}
                      activeOpacity={0.75}
                      style={{
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: '100%',
                      }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#18181B' }}>
                        {countryShort} {selectedCountry.code}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#A1A1AA', marginLeft: 6 }}>▾</Text>
                    </TouchableOpacity>

                    <View
                      style={{
                        width: 1,
                        height: '100%',
                        backgroundColor: errors.phoneNumber ? '#FECACA' : '#E4E4E7',
                      }}
                    />

                    <TextInput
                      value={formData.phoneNumber}
                      onChangeText={(text) => updateField('phoneNumber', text)}
                      placeholder="50 123 4567"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="phone-pad"
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                      style={{
                        flex: 1,
                        paddingHorizontal: 14,
                        fontSize: 14,
                        fontWeight: '400',
                        color: '#18181B',
                        height: '100%',
                        paddingVertical: 0,
                        ...(Platform.OS === 'web'
                          ? ({ outline: 'none', border: 'none', backgroundColor: 'transparent' } as any)
                          : {}),
                      }}
                    />
                  </View>

                  {errors.phoneNumber ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, marginLeft: 2 }}>
                      <Text style={{ fontSize: 12, color: '#EF4444' }}>ⓘ</Text>
                      <Text style={{ fontSize: 12, color: '#EF4444' }}>{errors.phoneNumber}</Text>
                    </View>
                  ) : null}
                </View>

                <FormField
                  label="Email Address"
                  optional
                  value={formData.email || ''}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="tariq@almadinameats.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </>
            ) : null}

            {/* STEP 2: Shop Details & Coordinates (matches user screenshot pixel-for-pixel) */}
            {currentStep === 2 ? (
              <>
                <FormField
                  label="Shop / Butchery Name"
                  optional
                  value={formData.shopName || ''}
                  onChangeText={(text) => updateField('shopName', text)}
                  placeholder="Al Madina Artisanal Butchery"
                />

                {/* Store Location Field Box (Tapping opens map view) */}
                <LocationStatusField
                  label="Store Location"
                  required
                  addressText={formData.shopAddress}
                  isValidated={Boolean(formData.latitude && formData.longitude)}
                  placeholder="12 Market Road (Old MTH), Ambattur"
                  onPress={() => setShowMapModal(true)}
                  error={errors.location}
                />

                {/* Mini-Map Preview Card directly below Store Location (matches screenshot) */}
                <StoreLocationMapPreview
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  addressText={formData.shopAddress}
                  onPress={() => setShowMapModal(true)}
                />

                {/* Pre-populated & Editable Address Fields */}
                <FormField
                  label="Shop Address"
                  required
                  value={formData.shopAddress}
                  onChangeText={(text) => updateField('shopAddress', text)}
                  placeholder="12 Market Road (Old MTH), Ambattur"
                  error={errors.shopAddress}
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField
                      label="City"
                      required
                      value={formData.city}
                      onChangeText={(text) => updateField('city', text)}
                      placeholder="Chennai"
                      error={errors.city}
                    />
                  </View>

                  <View className="flex-1">
                    <SelectField
                      label="State"
                      required
                      value={formData.state}
                      placeholder="Tamil Nadu"
                      options={INDIAN_STATES}
                      onSelect={(state) => updateField('state', state)}
                      error={errors.state}
                      modalTitle="Select State"
                    />
                  </View>
                </View>

                <FormField
                  label="PIN Code"
                  required
                  value={formData.pinCode}
                  onChangeText={(text) => updateField('pinCode', text)}
                  placeholder="600053"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.pinCode}
                />
              </>
            ) : null}

            {/* STEP 3: Business Verification */}
            {currentStep === 3 ? (
              <>
                <FileUploadField
                  label="Halal Slaughter Certificate"
                  required
                  hint="PDF or Image (max 10MB)"
                  file={formData.halalFile}
                  error={errors.halalFile}
                  onPick={() => pickDocument('halalFile')}
                  onRemove={() => updateField('halalFile', null)}
                />

                <FileUploadField
                  label="FSSAI License Document"
                  required
                  hint="PDF or Image (max 10MB)"
                  file={formData.fssaiFile}
                  error={errors.fssaiFile}
                  onPick={() => pickDocument('fssaiFile')}
                  onRemove={() => updateField('fssaiFile', null)}
                />

                <FormField
                  label="GSTIN Number"
                  required
                  value={formData.gstin}
                  onChangeText={(text) => updateField('gstin', text.toUpperCase())}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  maxLength={15}
                  error={errors.gstin}
                />
              </>
            ) : null}

            {/* STEP 4: Settlement Information */}
            {currentStep === 4 ? (
              <>
                <View className="p-3.5 rounded-md bg-zinc-50 border border-zinc-200">
                  <Text className="text-xs text-zinc-600 leading-relaxed">
                    Direct weekly settlement: Payouts are transferred every Monday directly to your registered bank account via NEFT/IMPS.
                  </Text>
                </View>

                <FormField
                  label="Account Holder Name"
                  required
                  value={formData.accountHolderName}
                  onChangeText={(text) => updateField('accountHolderName', text)}
                  placeholder="e.g. Al Madina Butchery"
                  error={errors.accountHolderName}
                />

                <FormField
                  label="Bank Name"
                  required
                  value={formData.bankName}
                  onChangeText={(text) => updateField('bankName', text)}
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  error={errors.bankName}
                />

                <FormField
                  label="IFSC Code"
                  required
                  value={formData.ifscCode}
                  onChangeText={(text) => updateField('ifscCode', text.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  autoCapitalize="characters"
                  maxLength={11}
                  error={errors.ifscCode}
                />
              </>
            ) : null}

            {/* STEP 5: Store Operations */}
            {currentStep === 5 ? (
              <>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField
                      label="Opening Time"
                      required
                      value={formData.openingTime}
                      onChangeText={(text) => updateField('openingTime', text)}
                      placeholder="08:00 AM"
                      error={errors.openingTime}
                    />
                  </View>

                  <View className="flex-1">
                    <FormField
                      label="Closing Time"
                      required
                      value={formData.closingTime}
                      onChangeText={(text) => updateField('closingTime', text)}
                      placeholder="09:00 PM"
                      error={errors.closingTime}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-[13px] font-medium text-zinc-800">
                    Operating Days <Text className="text-[#B04A37]">*</Text>
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {ALL_DAYS.map((day) => {
                      const isSelected = formData.workingDays.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => toggleDay(day)}
                          activeOpacity={0.8}
                          className={`px-3.5 py-2 rounded-md border transition-all ${
                            isSelected
                              ? 'bg-[#B04A37] border-[#B04A37]'
                              : 'bg-white border-zinc-200'
                          }`}>
                          <Text
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-white' : 'text-zinc-700'
                            }`}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {errors.workingDays ? (
                    <View className="flex-row items-center gap-1 mt-0.5 ml-0.5">
                      <Text className="text-xs text-red-500 leading-none">ⓘ</Text>
                      <Text className="text-xs text-red-500 font-normal">{errors.workingDays}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}

          </View>
        </ScrollView>

        {/* 4. Bottom Sticky Action Bar */}
        <View className="w-full max-w-[480px] self-center px-5 sm:px-6 pt-3 pb-6 bg-white border-t border-zinc-100">
          {serverError ? (
            <View className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
              <Text className="text-red-700 text-xs font-medium leading-normal">
                {serverError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              width: '100%',
              height: 48,
              minHeight: 48,
              borderRadius: 8,
              backgroundColor: '#B04A37',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#B04A37',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                {currentStep < 5 ? 'Continue' : 'Complete Registration'}
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center pt-3.5">
            <Text className="text-xs text-zinc-500">
              Already registered?{' '}
            </Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
              <Text className="text-xs font-semibold text-[#B04A37]">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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

      {/* Store Location Map Modal */}
      <StoreLocationMapModal
        visible={showMapModal}
        initialLatitude={formData.latitude}
        initialLongitude={formData.longitude}
        onClose={() => setShowMapModal(false)}
        onConfirmLocation={handleMapLocationConfirmed}
      />


    </KeyboardAvoidingView>
  );
}
