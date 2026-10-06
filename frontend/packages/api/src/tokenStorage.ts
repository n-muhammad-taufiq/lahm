import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'lahm_access_token';
const REFRESH_TOKEN_KEY = 'lahm_refresh_token';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  /**
   * Securely saves access and refresh tokens to hardware-backed storage
   */
  async saveTokens(tokens: StoredTokens): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  /**
   * Retrieves both tokens from secure storage
   */
  async getTokens(): Promise<StoredTokens | null> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  /**
   * Retrieves only the access token
   */
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  /**
   * Retrieves only the refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  /**
   * Clears all stored credentials from secure storage on logout
   */
  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
