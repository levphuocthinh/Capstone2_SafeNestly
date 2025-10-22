import ky from 'ky';
import { API_URL } from '../constants/env';
import { router } from 'expo-router';
import {
  getStoredToken,
  getStoredRefreshToken,
  storeTokens,
  clearStoredAuth,
} from './auth-storage';

// API Response interface
export interface ApiResponse {
  id?: number;
  statusCode: number;
  error?: string;
  message: string;
  token?: string;
  refreshToken?: string;
  expirationTime?: string;
  fullName?: string;
  role?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  bio?: string;
  createdAt?: string;
  user?: any;
}

// Create ky instance with auth interceptors
export const api = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getStoredToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Try to refresh token
          const refreshToken = await getStoredRefreshToken();
          if (refreshToken) {
            try {
              const refreshResponse = await ky
                .post(`${API_URL}/auth/refresh`, {
                  json: { token: refreshToken },
                })
                .json<ApiResponse>();

              if (refreshResponse.statusCode === 200 && refreshResponse.token) {
                // Store new tokens
                await storeTokens(
                  refreshResponse.token,
                  refreshResponse.refreshToken || refreshToken,
                );
                // Retry the original request with new token
                request.headers.set(
                  'Authorization',
                  `Bearer ${refreshResponse.token}`,
                );
                return ky(request);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }

          // If refresh failed or no refresh token, logout and redirect
          await clearStoredAuth();
          // Redirect to login screen
          if (router.canGoBack()) {
            router.dismissAll();
          }
          router.replace('/(auth)/login');
          throw new Error('Authentication expired. Please login again.');
        }
      },
    ],
  },
});

export { getStoredRefreshToken };
