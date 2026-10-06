import { create } from 'zustand';
import type { AuthUser, AuthTokensResponse } from './authApiService.types';
import { authApiService } from './authApiService';
import { tokenStorage } from '../tokenStorage';
import { setAccessToken, clearAccessToken } from '../client';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  setAuth: (response: AuthTokensResponse) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const tokens = await tokenStorage.getTokens();
      if (!tokens?.accessToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      setAccessToken(tokens.accessToken);
      const user = await authApiService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await clearAccessToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setAuth: async (response: AuthTokensResponse) => {
    await tokenStorage.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    setAccessToken(response.accessToken);
    set({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await clearAccessToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
