import axios, { type AxiosError } from 'axios';
import Constants from 'expo-constants';
import type { ApiError } from './types';

function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Detect Expo Metro host IP if running on physical device
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000`;
    }
  }

  return 'http://192.168.1.6:3000';
}

const baseUrl = getApiBaseUrl();

export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentAccessToken: string | null = null;

/**
 * Updates the global access token used in Authorization headers
 */
export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

/**
 * Returns the currently active access token
 */
export function getAccessToken(): string | null {
  return currentAccessToken;
}

/**
 * Clears the stored access token
 */
export function clearAccessToken() {
  currentAccessToken = null;
}

// Automatically attach Bearer token to requests if available
api.interceptors.request.use((config) => {
  if (currentAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

/**
 * Formats Axios and NestJS error responses into a human-readable message string
 */
export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  if (axiosError.response?.data?.message) {
    const msg = axiosError.response.data.message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  if (axiosError.message) {
    return axiosError.message;
  }
  return 'An unexpected network error occurred. Please try again.';
}
