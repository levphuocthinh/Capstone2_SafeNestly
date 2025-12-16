import { api, ApiResponse, getStoredRefreshToken } from '../utils/fetcher';
import {
  storeTokens,
  storeUser,
  clearStoredAuth,
  clearStoredUser,
  getStoredUser,
} from '../utils/auth-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User interface
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'RENTER';
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  bio?: string;
  createdAt?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  try {
    // Use ky without auth headers for login
    const data: ApiResponse = await api
      .post('auth/login', {
        json: {
          email: email.trim(),
          password,
        },
      })
      .json();

    if (data.statusCode === 200 && data.token) {
      // Create user object from response
      const user: User = {
        id: data.id!,
        email: data.email!,
        fullName: data.fullName!,
        role: data.role as 'RENTER' | 'OWNER' | 'ADMIN',
        phone: data.phone,
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
        dob: data.dob,
        bio: data.bio,
        createdAt: data.createdAt,
      };

      // Store tokens and user data
      await storeTokens(data.token, data.refreshToken || '');
      await storeUser(user);

      // Clear filter preferences when user logs in (fresh session)
      try {
        await AsyncStorage.removeItem('applied_filters');
      } catch (error) {
        console.error('Error clearing filters on login:', error);
        // Continue with login even if clearing filters fails
      }

      const storedUser = await getStoredUser();
      console.log('Stored user:', storedUser);
      const storedToken = await getStoredRefreshToken();
      console.log('Stored refresh token:', storedToken);
      return {
        success: true,
        user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } else {
      await clearStoredAuth();
      await clearStoredUser();
      return {
        success: false,
        error: data.message || data.error || 'Login failed',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    await clearStoredAuth();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const registerUser = async (userData: {
  email: string;
  password: string;
  fullName: string;
  role: 'RENTER' | 'OWNER' | 'ADMIN';
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  bio?: string;
}): Promise<LoginResult> => {
  try {
    // Use ky without auth headers for registration
    const data: ApiResponse = await api
      .post('auth/register', {
        json: userData,
      })
      .json();

    if (data.statusCode === 200) {
      // Registration successful, but user needs to login separately
      return {
        success: true,
        message: data.message || 'Registration successful',
      };
    } else {
      return {
        success: false,
        error: data.message || data.error || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const refreshToken = async (): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    const refreshTokenValue = await getStoredRefreshToken();
    if (!refreshTokenValue) {
      return { success: false, error: 'No refresh token available' };
    }

    // Use ky without auth headers for token refresh
    const data: ApiResponse = await api
      .post('auth/refresh', {
        json: { token: refreshTokenValue },
      })
      .json();

    if (data.statusCode === 200 && data.token) {
      // Update stored token
      await storeTokens(data.token, data.refreshToken || refreshTokenValue);
      return { success: true, token: data.token };
    } else {
      return { success: false, error: data.message || 'Token refresh failed' };
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const getUserProfile = async (): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> => {
  try {
    // Use ky with automatic auth header from interceptor
    const data: ApiResponse = await api.get('renterowner/get-profile').json();

    if (data.statusCode === 200) {
      const user: User = {
        id: data.id!,
        email: data.email!,
        fullName: data.fullName!,
        role: data.role as 'RENTER' | 'OWNER' | 'ADMIN',
        phone: data.phone,
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
        dob: data.dob,
        bio: data.bio,
        createdAt: data.createdAt,
      };

      // Update stored user data
      await storeUser(user);
      return { success: true, user };
    } else {
      return { success: false, error: data.message || 'Failed to get profile' };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await clearStoredAuth();
    await clearStoredUser();
    // Clear filter preferences when user logs out
    await AsyncStorage.removeItem('applied_filters');
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with logout even if clearing storage fails
  }
};
