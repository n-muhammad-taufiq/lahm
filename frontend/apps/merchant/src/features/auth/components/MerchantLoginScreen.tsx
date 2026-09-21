import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { cssInterop } from 'nativewind';
import { BrandHeader, CountryPickerModal, FirebaseRecaptchaModal, RecaptchaLegalNotice, type FirebaseRecaptchaVerifierRef } from '@lahm/ui';
import { usePhoneAuthFlow } from '@/services';
import { MerchantRegisterWizard } from './MerchantRegisterWizard';

cssInterop(LinearGradient, { className: 'style' });

/**
 * Minimalist Google 'G' Icon
 */
function GoogleIcon() {
  return (
    <View className="w-5 h-5 mr-3 items-center justify-center rounded-full bg-white">
      <Text className="text-sm font-black text-[#4285F4]">G</Text>
    </View>
  );
}

/**
 * Phone Icon for the Phone Login Button
 */
function PhoneIcon() {
  return (
    <View className="w-5 h-5 mr-3 items-center justify-center">
      <Text className="text-base text-white">📱</Text>
    </View>
  );
}

export function MerchantLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // screenView: 'choice' (shows 2 buttons) | 'phone_form' (shows phone input)
  const [screenView, setScreenView] = useState<'choice' | 'phone_form'>('choice');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const {
    step,
    phoneNumber,
    setPhoneNumber,
    selectedCountry,
    setSelectedCountry,
    showCountryPicker,
    setShowCountryPicker,
    otpCode,
    setOtpCode,
    businessName,
    setBusinessName,
    email,
    setEmail,
    loading,
    error,
    otpNotice,
    successData,
    secondsLeft,
    handleSendOtp,
    handleVerifyOtp,
    handleRegisterBusiness,
    handleResendOtp,
    handleChangeNumber,
  } = usePhoneAuthFlow({ role: 'merchant' });

  const recaptchaVerifierRef = useRef<FirebaseRecaptchaVerifierRef>(null);
  const isParisienneLoaded = Font.isLoaded('Parisienne');
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  const isPhoneReady = cleanPhone.length >= 7;
  const isOtpReady = otpCode.trim().length >= 4;

  const countryShortName = (selectedCountry.name || 'US')
    .slice(0, 2)
    .toLowerCase();

  return (
    <LinearGradient
      colors={['#FCD5C5', '#FDF2EB', '#FFFFFF', '#FFFFFF']}
      locations={[0, 0.28, 0.65, 1]}
      className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        className="flex-1">
        <ScrollView
          className="flex-1"
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
          contentContainerClassName="flex-grow justify-between px-7"
          contentContainerStyle={{
            paddingTop: Math.max(insets?.top || 0, 20) + 8,
            paddingBottom: Math.max(insets?.bottom || 0, 16) + 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* 1. TOP: Brand Logo Header */}
          <View className="py-4 items-center justify-center">
            <BrandHeader
              subtitle="MERCHANT PARTNER"
              isParisienneLoaded={isParisienneLoaded}
            />
          </View>

          {/* 2. AUTHENTICATION / REGISTRATION FLOW */}
          {authMode === 'register' ? (
            <View key="view-register-wizard" className="w-full max-w-[420px] self-center pb-6">
              <MerchantRegisterWizard
                onSwitchToLogin={() => setAuthMode('login')}
                onSuccess={() => router.replace('/dashboard' as any)}
              />
            </View>
          ) : (
            <View key="view-login-flow" className="w-full max-w-[400px] self-center pb-6">
              {/* VIEW A: Initial Choice Screen (2 Buttons) */}
              {screenView === 'choice' && step === 'phone' ? (
                <View key="view-choice" className="w-full">
                  <View className="mb-4">
                    <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                      {authMode === 'login' ? 'Partner Portal.' : 'Join as Partner.'}
                    </Text>
                    <Text className="text-sm text-[#7D6F66] mt-1.5">
                      {authMode === 'login'
                        ? 'Sign in to manage your butchery orders and inventory.'
                        : 'Register your meat shop to reach verified customers.'}
                    </Text>
                  </View>

                  {/* 1. Login with Phone Number Button */}
                  <TouchableOpacity
                    onPress={() => setScreenView('phone_form')}
                    activeOpacity={0.85}
                    className="w-full h-[52px] rounded-md bg-[#E77A62] flex-row items-center justify-center shadow-sm mb-3">
                    <PhoneIcon />
                    <Text className="text-white font-semibold text-[15px]">
                      Login with Phone Number
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Login with Google Button */}
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Merchant Google login pressed');
                    }}
                    activeOpacity={0.85}
                    className="w-full h-[52px] rounded-md bg-white border border-[#F2D8CD] flex-row items-center justify-center shadow-sm mb-3">
                    <GoogleIcon />
                    <Text className="text-[#1C1611] font-semibold text-[15px]">
                      Login with Google
                    </Text>
                  </TouchableOpacity>

                  {/* Legal Terms & Privacy */}
                  <Text className="text-[11.5px] text-[#938479] leading-[17px] mt-1 mb-2 text-center">
                    By continuing, you agree to the{' '}
                    <Text className="underline">Partner Terms</Text> and{' '}
                    <Text className="underline">Privacy Policy</Text>.
                  </Text>

                  {/* Official Google reCAPTCHA Compliance Notice */}
                  <RecaptchaLegalNotice showShield={true} className="mb-2" />
                </View>
              ) : null}

              {/* VIEW B: Phone Input Field & Send Code */}
              {screenView === 'phone_form' && step === 'phone' ? (
                <View key="view-phone-form" className="w-full">
                  {/* Back to choices button */}
                  <TouchableOpacity
                    onPress={() => setScreenView('choice')}
                    className="flex-row items-center mb-3.5">
                    <Text className="text-sm text-[#E77A62] font-semibold">
                      ← Other login options
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                    {authMode === 'login' ? 'Business login.' : 'Register phone.'}
                  </Text>
                  <Text className="text-sm text-[#7D6F66] mt-1.5 mb-5">
                    Enter your registered business number to receive a code.
                  </Text>

                  {/* Field Label */}
                  <Text className="text-[11px] font-bold tracking-[1.2px] text-[#B87B6A] uppercase mb-2">
                    BUSINESS PHONE NUMBER
                  </Text>

                  {/* Phone Input Pill with rounded-md */}
                  <View
                    className={`flex-row items-center bg-white rounded-md border ${error ? 'border-red-400' : 'border-[#F2D8CD]'
                      } h-[52px] px-3 shadow-sm`}>

                    {/* Country Trigger */}
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(true)}
                      activeOpacity={0.7}
                      className="flex-row items-center px-2 py-1.5">
                      <Text className="text-sm font-semibold text-[#1C1611]">
                        {countryShortName} {selectedCountry.code}
                      </Text>
                      <Text className="text-[10px] text-[#B87B6A] ml-1">
                        ⌵
                      </Text>
                    </TouchableOpacity>

                    {/* Vertical Divider */}
                    <View className="w-[1px] h-6 bg-[#F2D8CD] mx-2" />

                    {/* Phone Input Field */}
                    <TextInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="000 000 0000"
                      placeholderTextColor="#D8B5A7"
                      keyboardType="phone-pad"
                      editable={!loading}
                      autoFocus
                      className="flex-1 text-base font-medium text-[#1C1611] py-0"
                    />
                  </View>

                  {/* Error Banner */}
                  {error ? (
                    <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2.5">
                      <Text className="text-red-600 text-xs font-medium">
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Legal Terms */}
                  <Text className="text-[11.5px] text-[#938479] leading-[17px] mt-4 mb-5">
                    By continuing, you agree to our{' '}
                    <Text className="underline">Partner Agreement</Text> and{' '}
                    <Text className="underline">Privacy Policy</Text>.
                  </Text>

                  {/* Send Code Button with rounded-md */}
                  <TouchableOpacity
                    onPress={() => handleSendOtp(recaptchaVerifierRef.current)}
                    disabled={!isPhoneReady || loading}
                    activeOpacity={0.85}
                    className={`w-full h-[52px] rounded-md flex-row items-center justify-center ${!isPhoneReady || loading ? 'bg-[#FDEEE8]' : 'bg-[#E77A62] shadow-sm'
                      }`}>
                    {loading ? (
                      <ActivityIndicator color={isPhoneReady ? '#FFFFFF' : '#D8A89A'} size="small" />
                    ) : (
                      <Text
                        className={`text-[15px] font-semibold ${!isPhoneReady ? 'text-[#D8A89A]' : 'text-white'
                          }`}>
                        Send Code →
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Official Google reCAPTCHA Compliance Notice */}
                  <RecaptchaLegalNotice showShield={true} className="mt-3" />
                </View>
              ) : null}

              {/* STEP 2: OTP Verification State */}
              {step === 'otp' ? (
                <View key="view-otp" className="w-full">
                  <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                    Verify code.
                  </Text>
                  <Text className="text-sm text-[#7D6F66] mt-1.5 mb-5">
                    We sent a 6-digit code to{' '}
                    <Text className="font-bold text-[#1C1611]">
                      {selectedCountry.code} {cleanPhone}
                    </Text>
                  </Text>

                  {otpNotice ? (
                    <View className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 mb-4">
                      <Text className="text-amber-900 text-xs font-semibold leading-[18px]">
                        💡 {otpNotice}
                      </Text>
                    </View>
                  ) : null}

                  {/* 6-Digit OTP Box with rounded-md */}
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="••••••"
                    placeholderTextColor="#D8B5A7"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                    autoFocus
                    className={`bg-white rounded-md border ${error ? 'border-red-400' : 'border-[#F2D8CD]'
                      } h-[54px] text-center text-2xl font-bold tracking-[10px] text-[#1C1611] mb-3`}
                  />

                  {error ? (
                    <View className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
                      <Text className="text-red-600 text-xs font-medium">
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Resend & Change Number Row */}
                  <View className="flex-row items-center justify-between mb-5 px-1">
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={secondsLeft > 0 || loading}>
                      <Text
                        className={`text-xs font-semibold ${secondsLeft > 0 ? 'text-[#A69786]' : 'text-[#E77A62]'
                          }`}>
                        {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleChangeNumber}>
                      <Text className="text-xs font-semibold text-[#7D6F66] underline">
                        Change number
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Verify Button with rounded-md */}
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={!isOtpReady || loading}
                    activeOpacity={0.85}
                    className={`w-full h-[52px] rounded-md items-center justify-center ${!isOtpReady || loading ? 'bg-[#FDEEE8]' : 'bg-[#E77A62] shadow-sm'
                      }`}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text
                        className={`text-[15px] font-semibold ${!isOtpReady ? 'text-[#D8A89A]' : 'text-white'
                          }`}>
                        Verify & Continue →
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* STEP 3: Complete 5-Step Merchant Registration Wizard */}
              {step === 'register_details' ? (
                <View key="view-register-details" className="w-full">
                  <MerchantRegisterWizard
                    initialPhoneNumber={cleanPhone}
                    initialCountryCode={selectedCountry.code}
                    onSwitchToLogin={() => {
                      handleChangeNumber();
                      setAuthMode('login');
                    }}
                    onSuccess={() => router.replace('/dashboard' as any)}
                  />
                </View>
              ) : null}

              {/* STEP 4: Success State */}
              {step === 'success' ? (
                <View key="view-success" className="items-center py-4">
                  <View className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-4">
                    <Text className="text-2xl text-emerald-600 font-bold">✓</Text>
                  </View>

                  <Text className="text-2xl font-extrabold text-[#1C1611] mb-1.5 font-serif">
                    Merchant Verified!
                  </Text>
                  <Text className="text-sm text-[#7D6F66] text-center mb-7">
                    {successData?.isNewUser
                      ? 'Your butchery store is registered. Access your partner dashboard.'
                      : `Welcome back, ${successData?.user?.name || 'Partner'}.`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.replace('/dashboard' as any)}
                    activeOpacity={0.85}
                    className="w-full h-[52px] rounded-md bg-[#E77A62] items-center justify-center shadow-sm">
                    <Text className="text-[15px] font-bold text-white">
                      Enter Dashboard →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* 3. Bottom Footer Switcher */}
              {step === 'phone' ? (
                <View className="flex-row items-center justify-center pt-5">
                  <Text className="text-[13px] text-[#7D6F66]">
                    {authMode === 'login' ? 'New Partner? ' : 'Already registered? '}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
                    }}>
                    <Text className="text-[13px] font-bold text-[#E77A62]">
                      {authMode === 'login' ? 'Create an account' : 'Sign in'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <CountryPickerModal
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelectCountry={setSelectedCountry}
        selectedCountryCode={selectedCountry.code}
      />

      {/* Firebase Phone Auth Invisible reCAPTCHA Verifier Modal */}
      <FirebaseRecaptchaModal ref={recaptchaVerifierRef} />
    </LinearGradient>
  );
}
