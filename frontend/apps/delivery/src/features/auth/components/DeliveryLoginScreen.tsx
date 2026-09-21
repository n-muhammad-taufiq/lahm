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
import { DeliveryRegisterWizard } from './DeliveryRegisterWizard';

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

export function DeliveryLoginScreen() {
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
    name,
    setName,
    email,
    setEmail,
    loading,
    error,
    otpNotice,
    secondsLeft,
    successData,
    handleSendOtp,
    handleVerifyOtp,
    handleRegister,
    handleResendOtp,
    resetAuthFlow,
  } = usePhoneAuthFlow({
    role: 'delivery_partner',
    requireRegistrationDetails: false,
  });

  const isParisienneLoaded = Font.isLoaded('Parisienne');
  const recaptchaVerifierRef = useRef<FirebaseRecaptchaVerifierRef>(null);

  const onSendCode = () => {
    handleSendOtp(recaptchaVerifierRef.current);
  };

  // Switch to register wizard or login
  const toggleAuthMode = () => {
    if (authMode === 'login') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
      setScreenView('choice');
      resetAuthFlow();
    }
  };

  return (
    <View className="flex-1">
      {/* 1. Luminous Peach Gradient Background */}
      <LinearGradient
        colors={['#FCD5C5', '#FDEEE9', '#FFFFFF']}
        locations={[0, 0.45, 0.85]}
        className="absolute inset-0 w-full h-full"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        className="flex-1">
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 28,
            paddingTop: Math.max(insets?.top || 0, 20) + 8,
            paddingBottom: Math.max(insets?.bottom || 0, 16) + 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* 1. TOP: Brand Logo Header */}
          <View className="py-4 items-center justify-center">
            <BrandHeader
              subtitle="DELIVERY PARTNER"
              isParisienneLoaded={isParisienneLoaded}
            />
          </View>

          {/* 2. AUTHENTICATION / REGISTRATION FLOW */}
          {authMode === 'register' ? (
            <View key="view-register-wizard" className="w-full max-w-[420px] self-center pb-6">
              <DeliveryRegisterWizard
                onSwitchToLogin={() => setAuthMode('login')}
                onSuccess={() => router.replace('/dashboard' as any)}
              />
            </View>
          ) : (
            <View key="view-login-flow" className="w-full max-w-[400px] self-center mt-auto pt-8">
              {/* VIEW A: Initial Choice Screen (2 Buttons) */}
              {screenView === 'choice' && step === 'phone' ? (
                <View key="view-choice" className="w-full">
                  <View className="mb-4">
                    <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                      Rider Portal.
                    </Text>
                    <Text className="text-[13.5px] text-[#8C7A70] mt-1 font-sans">
                      Sign in to manage and accept your food & meat deliveries.
                    </Text>
                  </View>

                  {/* Primary Button 1: Login with Phone Number */}
                  <TouchableOpacity
                    onPress={() => setScreenView('phone_form')}
                    activeOpacity={0.85}
                    className="w-full h-[52px] bg-[#E77A62] rounded-md flex-row items-center justify-center px-4 mb-3 shadow-sm">
                    <PhoneIcon />
                    <Text className="text-white font-bold text-base tracking-wide">
                      Login with Phone Number
                    </Text>
                  </TouchableOpacity>

                  {/* Primary Button 2: Login with Google */}
                  <TouchableOpacity
                    onPress={() => {
                      // Google auth hook / provider
                    }}
                    activeOpacity={0.85}
                    className="w-full h-[52px] bg-[#1C1611] rounded-md flex-row items-center justify-center px-4 mb-4 shadow-sm">
                    <GoogleIcon />
                    <Text className="text-white font-bold text-base tracking-wide">
                      Login with Google
                    </Text>
                  </TouchableOpacity>

                  {/* Terms & Conditions Notice */}
                  <Text className="text-[11.5px] text-[#9E8E84] text-center leading-[17px] mb-2 px-2">
                    By continuing, you agree to our{' '}
                    <Text className="underline">Rider Terms</Text> and{' '}
                    <Text className="underline">Privacy Policy</Text>.
                  </Text>

                  {/* Official Google reCAPTCHA Compliance Notice */}
                  <RecaptchaLegalNotice showShield={true} className="mb-4" />
                </View>
              ) : null}

              {/* VIEW B: Phone Number Input Form */}
              {screenView === 'phone_form' && step === 'phone' ? (
                <View key="view-phone-form" className="w-full">
                  {/* Back to 2-Button Choice View */}
                  <TouchableOpacity
                    onPress={() => setScreenView('choice')}
                    className="mb-3 flex-row items-center py-1 self-start"
                    activeOpacity={0.7}>
                    <Text className="text-xs font-bold text-[#B87B6A]">
                      ← Back to options
                    </Text>
                  </TouchableOpacity>

                  <View className="mb-4">
                    <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                      Welcome back.
                    </Text>
                    <Text className="text-[13.5px] text-[#8C7A70] mt-1 font-sans">
                      Enter your mobile number to receive a verification code.
                    </Text>
                  </View>

                  {/* Input Card with Integrated Country Code & Phone Input */}
                  <View className="w-full h-[56px] bg-white rounded-md border border-[#F2D8CD] flex-row items-center px-3.5 mb-2.5 shadow-sm">
                    {/* Country Code Trigger */}
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(true)}
                      className="flex-row items-center py-2 px-1"
                      activeOpacity={0.7}>
                      <Text className="text-xl mr-1.5">{selectedCountry.flag}</Text>
                      <Text className="text-base font-bold text-[#1C1611]">
                        {selectedCountry.code}
                      </Text>
                      <Text className="text-xs text-[#8C7A70] ml-1">▼</Text>
                    </TouchableOpacity>

                    {/* Subtle Vertical Divider */}
                    <View className="w-[1px] h-6 bg-[#F2D8CD] mx-3" />

                    {/* Phone Number Input */}
                    <TextInput
                      className="flex-1 h-full text-base font-medium text-[#1C1611]"
                      placeholder="50 123 4567"
                      placeholderTextColor="#D8B5A7"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      autoFocus={true}
                      editable={!loading}
                    />
                  </View>

                  {/* Error Message Display */}
                  {error ? (
                    <Text className="text-xs font-medium text-red-500 mb-3 ml-1">
                      {error}
                    </Text>
                  ) : null}

                  {/* Legal Terms */}
                  <Text className="text-[11.5px] text-[#938479] leading-[17px] mb-4 text-center">
                    By continuing, you agree to our{' '}
                    <Text className="underline">Rider Agreement</Text> and{' '}
                    <Text className="underline">Privacy Policy</Text>.
                  </Text>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={onSendCode}
                    disabled={loading || phoneNumber.trim().length < 5}
                    activeOpacity={0.85}
                    className={`w-full h-[52px] rounded-md items-center justify-center mb-3 shadow-sm ${
                      phoneNumber.trim().length >= 5 && !loading
                        ? 'bg-[#E77A62]'
                        : 'bg-[#F5DDD4]'
                    }`}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">
                        Send Code →
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Official Google reCAPTCHA Compliance Notice */}
                  <RecaptchaLegalNotice showShield={true} className="mb-4" />
                </View>
              ) : null}

              {/* VIEW C: OTP Code Verification View */}
              {step === 'otp' ? (
                <View key="view-otp" className="w-full">
                  <TouchableOpacity
                    onPress={resetAuthFlow}
                    className="mb-3 flex-row items-center py-1 self-start"
                    activeOpacity={0.7}>
                    <Text className="text-xs font-bold text-[#B87B6A]">
                      ← Change number
                    </Text>
                  </TouchableOpacity>

                  <View className="mb-4">
                    <Text className="text-[27px] font-extrabold text-[#1C1611] tracking-tight font-serif">
                      Verification Code.
                    </Text>
                    <Text className="text-[13.5px] text-[#8C7A70] mt-1 font-sans">
                      Enter the 6-digit code sent to {selectedCountry.code}{' '}
                      {phoneNumber}.
                    </Text>
                  </View>

                  {otpNotice ? (
                    <View className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 mb-4">
                      <Text className="text-amber-900 text-xs font-semibold leading-[18px]">
                        💡 {otpNotice}
                      </Text>
                    </View>
                  ) : null}

                  {/* 6-Digit OTP Box Grid */}
                  <View className="flex-row justify-between mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = otpCode[index] || '';
                      const isFocused = otpCode.length === index;
                      return (
                        <View
                          key={index}
                          className={`w-12 h-14 bg-white rounded-md border items-center justify-center shadow-sm ${
                            digit
                              ? 'border-[#E77A62] bg-[#FFFBF9]'
                              : isFocused
                              ? 'border-[#E77A62]'
                              : 'border-[#F2D8CD]'
                          }`}>
                          <Text className="text-xl font-bold text-[#1C1611]">
                            {digit}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Hidden Overlay TextInput for Native Keyboard */}
                  <TextInput
                    className="absolute opacity-0 w-full h-14"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    autoFocus={true}
                    editable={!loading}
                  />

                  {/* Resend Timer & Link */}
                  <View className="flex-row justify-center items-center mb-5">
                    {secondsLeft > 0 ? (
                      <Text className="text-xs text-[#8C7A70]">
                        Resend code in{' '}
                        <Text className="font-bold text-[#E77A62]">
                          {secondsLeft}s
                        </Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={loading}
                        hitSlop={8}>
                        <Text className="text-xs font-bold text-[#E77A62] underline">
                          Resend Code
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Error Message Display */}
                  {error ? (
                    <Text className="text-xs font-medium text-red-500 mb-3 text-center">
                      {error}
                    </Text>
                  ) : null}

                  {/* Verify & Continue Button */}
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={loading || otpCode.length < 6}
                    activeOpacity={0.85}
                    className={`w-full h-[52px] rounded-md items-center justify-center mb-5 shadow-sm ${
                      otpCode.length === 6 && !loading
                        ? 'bg-[#E77A62]'
                        : 'bg-[#F5DDD4]'
                    }`}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">
                        Verify & Continue →
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* VIEW D: Success View */}
              {step === 'success' ? (
                <View key="view-success" className="w-full items-center py-4">
                  <View className="w-16 h-16 rounded-full bg-[#E77A62]/15 items-center justify-center mb-4">
                    <Text className="text-3xl">✓</Text>
                  </View>
                  <Text className="text-2xl font-bold text-[#1C1611] font-serif text-center mb-2">
                    Welcome to Lahm Fleet!
                  </Text>
                  <Text className="text-sm text-[#8C7A70] text-center mb-6">
                    {successData?.isNewUser
                      ? 'Your delivery rider account is ready. Access your dashboard.'
                      : `Welcome back, ${successData?.user?.name || 'Rider'}.`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.replace('/dashboard' as any)}
                    className="w-full h-[52px] bg-[#E77A62] rounded-md items-center justify-center shadow-sm">
                    <Text className="text-white font-bold text-base tracking-wide">
                      Go to Rider Dashboard →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Mode Switcher Footer (Login <-> Register) */}
              {step === 'phone' ? (
                <View className="flex-row justify-center items-center pt-2 border-t border-[#F2D8CD]/60">
                  <Text className="text-[13px] text-[#8C7A70]">
                    New delivery rider?{' '}
                  </Text>
                  <Pressable onPress={toggleAuthMode} hitSlop={8}>
                    <Text className="text-[13px] font-bold text-[#E77A62]">
                      Register as Partner
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}

          {/* Country Picker Modal */}
          <CountryPickerModal
            visible={showCountryPicker}
            onClose={() => setShowCountryPicker(false)}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              setShowCountryPicker(false);
            }}
            selectedCountryCode={selectedCountry.code}
          />

          {/* Firebase Phone Auth Invisible reCAPTCHA Verifier Modal */}
          <FirebaseRecaptchaModal ref={recaptchaVerifierRef} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
