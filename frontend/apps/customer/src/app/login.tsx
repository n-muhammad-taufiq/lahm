/**
 * Customer Authentication & Welcome Screen Route
 * 
 * Accessible when customers need to log in or register.
 * Orchestrates: ChoiceView, PhoneFormView, OtpVerifyView, RegisterDetailsView, AuthSuccessView.
 */

import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { cssInterop } from 'nativewind';
import {
  BrandHeader,
  CountryPickerModal,
  FirebaseRecaptchaModal,
  type FirebaseRecaptchaVerifierRef,
} from '@lahm/ui';
import {
  AuthSuccessView,
  ChoiceView,
  OtpVerifyView,
  PhoneFormView,
  RegisterDetailsView,
  usePhoneAuthFlow,
} from '../features/auth';

cssInterop(LinearGradient, { className: 'style' });

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    successData,
    secondsLeft,
    handleSendOtp,
    handleVerifyOtp,
    handleRegister,
    handleResendOtp,
    handleChangeNumber,
  } = usePhoneAuthFlow();

  const recaptchaVerifierRef = useRef<FirebaseRecaptchaVerifierRef>(null);
  const isParisienneLoaded = Font.isLoaded('Parisienne');

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
          <View className="py-4 justify-center items-center">
            <BrandHeader
              subtitle="PREMIUM MEAT DELIVERY"
              isParisienneLoaded={isParisienneLoaded}
            />
          </View>

          {/* 2. Authentication Flow Content */}
          <View className="w-full max-w-[400px] self-center pb-6">
            {screenView === 'choice' && step === 'phone' && (
              <ChoiceView
                authMode={authMode}
                onSelectPhone={() => setScreenView('phone_form')}
                onSelectGoogle={() => {
                  // Google OAuth integration hook point
                }}
              />
            )}

            {screenView === 'phone_form' && step === 'phone' && (
              <PhoneFormView
                authMode={authMode}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                selectedCountry={selectedCountry}
                onPressCountryPicker={() => setShowCountryPicker(true)}
                onBackToChoice={() => setScreenView('choice')}
                onSendCode={() => handleSendOtp(recaptchaVerifierRef.current)}
                loading={loading}
                error={error}
              />
            )}

            {step === 'otp' && (
              <OtpVerifyView
                countryCode={selectedCountry.code}
                phoneNumber={phoneNumber.replace(/[\s-]/g, '')}
                otpCode={otpCode}
                onOtpCodeChange={setOtpCode}
                error={error}
                secondsLeft={secondsLeft}
                loading={loading}
                onResendOtp={handleResendOtp}
                onChangeNumber={handleChangeNumber}
                onVerifyOtp={handleVerifyOtp}
              />
            )}

            {step === 'register_details' && (
              <RegisterDetailsView
                name={name}
                onNameChange={setName}
                email={email}
                onEmailChange={setEmail}
                loading={loading}
                error={error}
                onChangeNumber={handleChangeNumber}
                onRegister={handleRegister}
              />
            )}

            {step === 'success' && (
              <AuthSuccessView
                isNewUser={successData?.isNewUser}
                userName={successData?.user?.name || name}
                onEnterStore={() => router.replace('/' as any)}
              />
            )}

            {/* Bottom Footer Switcher */}
            {step === 'phone' && (
              <View className="flex-row items-center justify-center pt-5">
                <Text className="text-sm text-zinc-500">
                  {authMode === 'login' ? 'New to Lahm? ' : 'Already have an account? '}
                </Text>
                <Pressable
                  onPress={() => {
                    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
                  }}>
                  <Text className="text-sm font-bold text-brand-terracotta">
                    {authMode === 'login' ? 'Create an account' : 'Sign in'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
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
