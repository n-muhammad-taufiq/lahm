import { api } from '../client';
import type {
  EmailLoginRequest,
  EmailLoginResponse,
  FirebaseOtpLoginRequest,
  FirebaseOtpLoginResponse,
  FirebaseOtpRegisterRequest,
  FirebaseOtpRegisterResponse,
  UserProfileResponse,
} from './authApiService.types';

/**
 * Authentication Module API Service
 * Centralizes all HTTP calls for authentication endpoints across apps
 */
export const authApiService = {
  /**
   * Verify Firebase ID Token and log in
   * Endpoint: POST /auth/firebase-otp-login
   */
  async firebaseOtpLogin(
    data: FirebaseOtpLoginRequest,
  ): Promise<FirebaseOtpLoginResponse> {
    const response = await api.post<FirebaseOtpLoginResponse>(
      '/auth/firebase-otp-login',
      data,
    );
    return response.data;
  },

  /**
   * Register a new user using Firebase ID Token
   * Endpoint: POST /auth/firebase-otp-register
   */
  async firebaseOtpRegister(
    data: FirebaseOtpRegisterRequest,
  ): Promise<FirebaseOtpRegisterResponse> {
    const response = await api.post<FirebaseOtpRegisterResponse>(
      '/auth/firebase-otp-register',
      data,
    );
    return response.data;
  },

  /**
   * Log in with email and password
   * Endpoint: POST /auth/email-login
   */
  async emailLogin(
    data: EmailLoginRequest,
  ): Promise<EmailLoginResponse> {
    const response = await api.post<EmailLoginResponse>(
      '/auth/email-login',
      data,
    );
    return response.data;
  },

  /**
   * Get the profile of the currently authenticated user
   * Endpoint: GET /auth/me (Uses Bearer token automatically via Axios interceptor)
   */
  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/auth/me');
    return response.data;
  },

  /**
   * Register a new delivery partner
   * Endpoint: POST /delivery-partners/register
   */
  async registerDeliveryPartner(
    data: any,
  ): Promise<any> {
    const response = await api.post('/delivery-partners/register', data);
    return response.data;
  },

  /**
   * Register a new merchant partner with all 5 steps
   * Endpoint: POST /merchant/register
   */
  async registerMerchant(
    data: any,
  ): Promise<any> {
    const response = await api.post('/merchant/register', data);
    return response.data;
  },

  /**
   * Fetch merchant profile by user ID
   * Endpoint: GET /merchant/user/:userId
   */
  async getMerchantByUserId(userId: number): Promise<any> {
    const response = await api.get(`/merchant/user/${userId}`);
    return response.data;
  },

  /**
   * Fetch merchant profile by merchant ID
   * Endpoint: GET /merchant/:id
   */
  async getMerchantById(merchantId: number): Promise<any> {
    const response = await api.get(`/merchant/${merchantId}`);
    return response.data;
  },
};
