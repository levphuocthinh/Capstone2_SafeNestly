import AsyncStorage from '@react-native-async-storage/async-storage';

// User interface
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'RENTER' | 'OWNER' | 'ADMIN';
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  bio?: string;
  createdAt?: string;
}

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token storage utilities
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

export const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored refresh token:', error);
    return null;
  }
};

export const storeTokens = async (
  token: string,
  refreshToken: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

export const clearStoredAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.error('Error clearing stored auth:', error);
    throw new Error('Failed to clear authentication data');
  }
};

// Auth state management (deprecated - using AsyncStorage now)
let currentUser: User | null = null;

// User storage key
const USER_KEY = 'user_data';

// User storage utilities
export const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw new Error('Failed to store user data');
  }
};

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const clearStoredUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing stored user:', error);
  }
};

// Legacy functions for backward compatibility
export const getCurrentUser = async (): Promise<User | null> => {
  return await getStoredUser();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getStoredUser();
  return user !== null;
};

export const getHomeRouteForRole = (role: string): string => {
  switch (role) {
    case 'RENTER':
      return '/(tenant)/home';
    case 'OWNER':
      return '/(landlord)/dashboard';
    case 'ADMIN':
      return '/(guest)/home';
    default:
      return '/(tenant)/home';
  }
};
