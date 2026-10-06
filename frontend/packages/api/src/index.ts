// Client & Utilities
export * from './client';
export * from './types';
export * from './tokenStorage';
export * from './queryClient';
export {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

// Auth Module
export * from './auth/authApiService';
export * from './auth/authApiService.types';
export * from './auth/authStore';
export * from './auth/merchantSession';
export * from './auth/usePhoneAuthFlow';

// Products Module
export * from './products/productsApiService';

// Merchants Module
export * from './merchants/merchantsApiService';

// Firebase Client Phone Auth
export * from './firebase/firebase.config';
export * from './firebase/firebasePhoneAuth.service';
export * from './firebase/firebasePhoneAuth.types';
