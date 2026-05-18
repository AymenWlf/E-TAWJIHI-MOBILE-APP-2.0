import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';

const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';

export type LoginResponse = {
  success: boolean;
  data?: {
    token?: string;
    refreshToken?: string;
    user?: Record<string, unknown>;
  };
  message?: string;
};

export async function loginWithPhonePassword(phone: string, password: string): Promise<LoginResponse> {
  const url = buildApiUrl('/api/login');
  return await httpPostJson<LoginResponse, { phone: string; password: string }>(url, {
    phone,
    password,
  });
}

export async function registerWithPhonePassword(
  phone: string,
  password: string,
  referralCode?: string | null,
): Promise<LoginResponse> {
  const url = buildApiUrl('/api/register');
  const body: { phone: string; password: string; referralCode?: string } = {
    phone,
    password,
  };
  const code = (referralCode ?? '').trim();
  if (code.length > 0) {
    body.referralCode = code;
  }
  return await httpPostJson<LoginResponse, typeof body>(url, body);
}

export type RefreshResponse = {
  success: boolean;
  data?: {
    token?: string;
    refreshToken?: string;
  };
  message?: string;
};

export async function refreshWithToken(refreshToken: string): Promise<RefreshResponse> {
  const url = buildApiUrl('/auth/refresh');
  return await httpPostJson<RefreshResponse, { refreshToken: string }>(url, { refreshToken });
}

export type LogoutResponse = { success: boolean; message?: string };

export async function logoutWithToken(refreshToken: string): Promise<LogoutResponse> {
  const url = buildApiUrl('/auth/logout');
  return await httpPostJson<LogoutResponse, { refreshToken: string }>(url, { refreshToken });
}

export type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
  data?: {
    password?: string;
  };
};

export async function forgotPasswordWithPhone(_phone: string): Promise<ForgotPasswordResponse> {
  return {
    success: false,
    message: 'La réinitialisation du mot de passe en ligne est désactivée.',
  };
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await AsyncStorage.setItem(REFRESH_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

