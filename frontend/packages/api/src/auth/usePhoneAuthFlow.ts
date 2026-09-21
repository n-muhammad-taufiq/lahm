import { useState, useEffect, useRef } from 'react';
import { api, setAccessToken, extractErrorMessage } from '../client';
import { authApiService } from './authApiService';
import { setActiveMerchant } from './merchantSession';
import { firebasePhoneAuthService } from '../firebase/firebasePhoneAuth.service';
import type {
  AuthFlowStep,
  AuthSuccessData,
  CountryItem,
  UsePhoneAuthFlowOptions,
} from './authApiService.types';

export const DEFAULT_COUNTRY: CountryItem = {
  flag: '🇦🇪',
  code: '+971',
  name: 'United Arab Emirates',
};

export const DEFAULT_RESEND_COOLDOWN = 60;

/**
 * Unified Authentication Flow Hook
 * Shared across Customer, Merchant, and Delivery Partner applications.
 */
export function usePhoneAuthFlow(options: UsePhoneAuthFlowOptions) {
  const {
    role,
    defaultCountry = DEFAULT_COUNTRY,
    resendCooldownSeconds = DEFAULT_RESEND_COOLDOWN,
    requireRegistrationDetails = role !== 'customer',
  } = options;

  const [step, setStep] = useState<AuthFlowStep>('phone');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [successData, setSuccessData] = useState<AuthSuccessData | null>(null);

  // Resend Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState(resendCooldownSeconds);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 'otp' && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, secondsLeft]);

  const handleSendOtp = async (appVerifier?: any) => {
    setError('');
    setOtpNotice('');
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code}${cleanPhone}`;

    // Master safety timer: guarantee loading state is NEVER stuck indefinitely
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const res = await firebasePhoneAuthService.sendOtp(fullPhone, appVerifier);
      clearTimeout(safetyTimer);
      if (res.message) {
        setOtpNotice(res.message);
      }
      setSecondsLeft(resendCooldownSeconds);
      setStep('otp');
    } catch (err: any) {
      clearTimeout(safetyTimer);
      setError(err?.message || 'Failed to send verification code. Please try again.');
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/[\s-]/g, '')}`;

    try {
      // 1. Confirm OTP with Firebase to retrieve cryptographically signed idToken
      const verifyResult = await firebasePhoneAuthService.confirmOtp(otpCode);
      setFirebaseIdToken(verifyResult.idToken);

      // 2. Call NestJS Backend: POST /auth/firebase-otp-login with the specified role
      const backendRes = await authApiService.firebaseOtpLogin({
        idToken: verifyResult.idToken,
        role,
      });

      if (backendRes.isNewUser) {
        if (requireRegistrationDetails) {
          // Switch to registration details step (e.g. Shop Name or User Name)
          setStep('register_details');
        } else {
          // Instant success for roles that do not require upfront details
          setSuccessData({
            isNewUser: true,
            phoneNumber: backendRes.phoneNumber || fullPhone,
          });
          setStep('success');
        }
      } else {
        setAccessToken(backendRes.accessToken);

        if (backendRes.user.role === 'merchant') {
          try {
            const merchantData = await authApiService.getMerchantByUserId(backendRes.user.id);
            if (merchantData) {
              setActiveMerchant({
                id: merchantData.id,
                userId: backendRes.user.id,
                name: backendRes.user.name,
                shopAddress: merchantData.shopAddress,
                city: merchantData.city,
                isVerified: merchantData.isVerified,
              });
            }
          } catch {
            // If merchant profile query fails, session remains unauthenticated
          }
        }

        setSuccessData({
          isNewUser: false,
          phoneNumber: backendRes.user.phoneNumber,
          user: backendRes.user,
          accessToken: backendRes.accessToken,
          refreshToken: backendRes.refreshToken,
        });
        setStep('success');
      }
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) {
      setError(role === 'merchant' ? 'Please enter your Shop or Business Name' : 'Please enter your Name');
      return;
    }

    if (!firebaseIdToken) {
      setError('Authentication session expired. Please verify your phone number again.');
      setStep('phone');
      return;
    }

    setLoading(true);
    try {
      const registerRes = await authApiService.firebaseOtpRegister({
        idToken: firebaseIdToken,
        role,
        name: name.trim(),
        email: email.trim() || undefined,
      });

      setAccessToken(registerRes.accessToken);
      setSuccessData({
        isNewUser: true,
        phoneNumber: registerRes.user.phoneNumber,
        user: registerRes.user,
        accessToken: registerRes.accessToken,
        refreshToken: registerRes.refreshToken,
      });
      setStep('success');
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0 || loading) return;
    await handleSendOtp();
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtpCode('');
    setError('');
  };

  const resetAuthFlow = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtpCode('');
    setName('');
    setEmail('');
    setError('');
    setSuccessData(null);
    setFirebaseIdToken('');
  };

  return {
    step,
    setStep,
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
    // Alias for merchant apps
    businessName: name,
    setBusinessName: setName,
    email,
    setEmail,
    loading,
    error,
    setError,
    otpNotice,
    successData,
    secondsLeft,
    handleSendOtp,
    handleVerifyOtp,
    handleRegister,
    // Alias for merchant apps
    handleRegisterBusiness: handleRegister,
    handleResendOtp,
    handleChangeNumber,
    resetAuthFlow,
  };
}
