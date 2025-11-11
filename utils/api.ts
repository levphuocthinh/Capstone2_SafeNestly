import { Platform } from 'react-native';

import { API_URL } from '../constants/env';

const DEFAULT_PORT = '8080';

export const getApiBaseUrl = (): string => {
  if (API_URL && API_URL.length > 0) {
    return API_URL;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEFAULT_PORT}`;
    }

    // iOS simulator uses localhost
    if (Platform.OS === 'ios') {
      return `http://127.0.0.1:${DEFAULT_PORT}`;
    }
  }

  // Fallback – developers should override via env variable in production
  return `http://localhost:${DEFAULT_PORT}`;
};

export const buildApiUrl = (path: string): string => {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const describeApiTarget = (): string => {
  const base = getApiBaseUrl();
  return base.includes('localhost')
    ? `${base} (máy cục bộ – kiểm tra lại địa chỉ IP nếu dùng thiết bị thật)`
    : base;
};
