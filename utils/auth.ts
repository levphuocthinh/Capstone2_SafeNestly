import { buildApiUrl, describeApiTarget } from './api';

export interface UserSession {
  id: number;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'admin' | 'guest';
  phone?: string;
  gender?: string;
  token: string;
  refreshToken?: string;
  expiresIn?: string;
}

interface BackendLoginResponse {
  statusCode?: number;
  message?: string;
  token?: string;
  refreshToken?: string;
  expirationTime?: string;
  id?: number;
  email?: string;
  fullName?: string;
  role?: string;
  phone?: string;
  gender?: string;
  user?: {
    id?: number;
    email?: string;
    fullName?: string;
    role?: string;
    phone?: string;
    gender?: string;
  };
}

let currentUser: UserSession | null = null;

const mapBackendRole = (role?: string): UserSession['role'] => {
  switch ((role || '').toUpperCase()) {
    case 'RENTER':
      return 'tenant';
    case 'OWNER':
      return 'landlord';
    case 'ADMIN':
      return 'admin';
    default:
      return 'guest';
  }
};

const normaliseName = (fullName?: string, email?: string) => {
  if (fullName && fullName.trim().length > 0) {
    return fullName;
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'User';
};

const parseLoginResponse = (
  data: BackendLoginResponse,
  fallbackEmail: string,
): UserSession | null => {
  if (!data || !data.token) {
    return null;
  }

  const userBlock = data.user || {};
  const id =
    data.id ??
    userBlock.id ??
    Number(
      (data as Record<string, unknown>).userId ??
        (data as Record<string, unknown>).user_id ??
        (data as Record<string, unknown>).accountId ??
        (data as Record<string, unknown>).renterId ??
        (data as Record<string, unknown>).profileId ??
        (data as Record<string, unknown>).id,
    );

  if (!id || Number.isNaN(id)) {
    return null;
  }

  return {
    id,
    email: data.email ?? userBlock.email ?? fallbackEmail,
    name: normaliseName(data.fullName ?? userBlock.fullName, fallbackEmail),
    role: mapBackendRole(data.role ?? userBlock.role),
    phone: data.phone ?? userBlock.phone,
    gender: data.gender ?? userBlock.gender,
    token: data.token,
    refreshToken: data.refreshToken,
    expiresIn: data.expirationTime,
  };
};

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  try {
    const response = await fetch(buildApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as BackendLoginResponse;

    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const message =
        data.message ||
        (response.status === 401
          ? 'Invalid credentials. Please double-check your email and password.'
          : `Unable to sign in (status ${response.status}).`);
      return { success: false, error: message };
    }

    const session = parseLoginResponse(data, email);
    if (!session) {
      return {
        success: false,
        error:
          'Đăng nhập thành công nhưng không xác định được thông tin tài khoản. Vui lòng thử lại.',
      };
    }

    currentUser = session;

    return {
      success: true,
      user: session,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('Network request failed')
        ? `Không thể kết nối tới máy chủ xác thực tại ${describeApiTarget()}. Hãy kiểm tra kết nối mạng hoặc cấu hình API URL.`
        : error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
    return {
      success: false,
      error: message,
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  currentUser = null;
};

export const getCurrentUser = (): UserSession | null => {
  return currentUser;
};

export const isAuthenticated = (): boolean => {
  return currentUser !== null && !!currentUser.token;
};

export const getAuthToken = (): string | undefined => currentUser?.token;

export const getHomeRouteForRole = (role: string): string => {
  switch (role) {
    case 'tenant':
      return '/(tenant)/home';
    case 'landlord':
      return '/(landlord)/dashboard';
    case 'admin':
      return '/(tenant)/home';
    default:
      return '/(tenant)/home';
  }
};

export const getTestAccounts = () => {
  return [
    {
      email: 'tenant@test.com',
      password: 'password123',
      role: 'tenant',
      name: 'Sarah Johnson',
      description:
        'Requires an existing tenant account in the backend (email: tenant@test.com).',
    },
    {
      email: 'landlord@test.com',
      password: 'password123',
      role: 'landlord',
      name: 'Mike Thompson',
      description:
        'Requires an existing owner account in the backend (email: landlord@test.com).',
    },
  ];
};
