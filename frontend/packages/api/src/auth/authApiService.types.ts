export type UserRole = 'customer' | 'delivery_partner' | 'merchant';

export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
}

// Request DTOs
export interface FirebaseOtpLoginRequest {
  idToken: string;
  role: UserRole;
}

export interface FirebaseOtpRegisterRequest {
  idToken: string;
  role: UserRole;
  name: string;
  email?: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

// Response Types
export interface ExistingUserAuthResponse {
  isNewUser: false;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface NewUserAuthResponse {
  isNewUser: true;
  phoneNumber: string;
  message: string;
}

export type FirebaseOtpLoginResponse = ExistingUserAuthResponse | NewUserAuthResponse;

export interface AuthTokensResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export type FirebaseOtpRegisterResponse = AuthTokensResponse;
export type EmailLoginResponse = AuthTokensResponse;
export type UserProfileResponse = AuthUser;

// Shared Hook Types
export interface CountryItem {
  flag: string;
  code: string;
  name: string;
}

export type AuthFlowStep = 'phone' | 'otp' | 'register_details' | 'success';

export interface AuthSuccessData {
  isNewUser: boolean;
  phoneNumber: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface UsePhoneAuthFlowOptions {
  /**
   * Target role for authentication: 'customer' | 'merchant' | 'delivery_partner'
   */
  role: UserRole;

  /**
   * Default country for dialing code (default: UAE +971)
   */
  defaultCountry?: CountryItem;

  /**
   * Resend cooldown duration in seconds (default: 60)
   */
  resendCooldownSeconds?: number;

  /**
   * Whether to prompt for registration details (name, email) if user is new.
   * Defaults to: true for 'merchant' and 'delivery_partner', false for 'customer'
   */
  requireRegistrationDetails?: boolean;
}

export interface UploadedFile {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
}

export interface MerchantRegistrationFormData {
  // Step 1: Personal Details
  name: string;
  phoneNumber: string;
  countryCode: string;
  email?: string;

  // Step 2: Shop Details
  shopName?: string;
  shopAddress: string;
  city: string;
  state: string;
  pinCode: string;
  latitude?: number | null;
  longitude?: number | null;

  // Step 3: Business Verification
  halalFile?: UploadedFile | null;
  fssaiFile?: UploadedFile | null;
  gstin: string;

  // Step 4: Settlement Information
  accountHolderName: string;
  bankName: string;
  ifscCode: string;

  // Step 5: Store Operations
  openingTime: string;
  closingTime: string;
  workingDays: string[];
}

export interface DeliveryPartnerRegistrationFormData {
  name: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  vehicleType: string;
  vehicleRegistrationNumber?: string;
  drivingLicenseNumber?: string;
  drivingLicensePhotoUrl?: string;
  vehicleRcPhotoUrl?: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifsc: string;
  bankName: string;
  preferredDeliveryArea?: string;
  workingHours?: string;
  maxDeliveryRadiusKm?: string;
}



