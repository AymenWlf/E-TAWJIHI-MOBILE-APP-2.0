import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';

const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

export type AuthUserSnapshot = {
  id?: number;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  is_setup?: boolean;
  roles?: string[];
};

export type DeviceTransferSessionSnapshot = {
  sessionId: string;
  deviceId: string;
  platform: string;
  deviceLabel: string;
  platformLabel: string;
  lastSeenAt: string;
};

export type LoginResponse = {
  success: boolean;
  code?: string;
  data?: {
    token?: string;
    refreshToken?: string;
    user?: Record<string, unknown>;
    transferRequired?: boolean;
    transferToken?: string;
    whatsappSent?: boolean;
    supportPhone?: string;
    phone?: string;
    maxDevices?: number;
    activeSessions?: DeviceTransferSessionSnapshot[];
  };
  message?: string;
};

export class DeviceTransferRequiredError extends Error {
  readonly transferToken: string;
  readonly phone?: string;
  readonly supportPhone?: string;
  readonly whatsappSent?: boolean;
  readonly maxDevices?: number;
  readonly activeSessions?: DeviceTransferSessionSnapshot[];

  constructor(payload: {
    transferToken: string;
    phone?: string;
    supportPhone?: string;
    whatsappSent?: boolean;
    maxDevices?: number;
    activeSessions?: DeviceTransferSessionSnapshot[];
    message?: string;
  }) {
    super(payload.message ?? 'DEVICE_TRANSFER_REQUIRED');
    this.name = 'DeviceTransferRequiredError';
    this.transferToken = payload.transferToken;
    this.phone = payload.phone;
    this.supportPhone = payload.supportPhone;
    this.whatsappSent = payload.whatsappSent;
    this.maxDevices = payload.maxDevices;
    this.activeSessions = payload.activeSessions;
  }
}

export async function loginWithPhonePassword(
  phone: string,
  password: string,
  deviceId: string,
  platform: string,
  deviceLabel?: string,
): Promise<LoginResponse> {
  const url = buildApiUrl('/api/login');
  const res = await httpPostJson<
    LoginResponse,
    { phone: string; password: string; deviceId: string; platform: string; deviceLabel?: string }
  >(url, {
    phone,
    password,
    deviceId,
    platform,
    ...(deviceLabel?.trim() ? { deviceLabel: deviceLabel.trim() } : {}),
  });

  if (
    res.success &&
    (res.code === 'DEVICE_TRANSFER_REQUIRED' || res.data?.transferRequired) &&
    res.data?.transferToken
  ) {
    throw new DeviceTransferRequiredError({
      transferToken: res.data.transferToken,
      phone: res.data.phone,
      supportPhone: res.data.supportPhone,
      whatsappSent: res.data.whatsappSent,
      maxDevices: res.data.maxDevices,
      activeSessions: res.data.activeSessions,
      message: res.message,
    });
  }

  return res;
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
    whatsappSent?: boolean;
    phone?: string;
  };
};

export async function forgotPasswordWithPhone(phone: string): Promise<ForgotPasswordResponse> {
  const url = buildApiUrl('/api/forgot-password');
  return await httpPostJson<ForgotPasswordResponse, { phone: string }>(url, { phone: phone.trim() });
}

export type ForgotPasswordCheckPhoneResponse = {
  success: boolean;
  message?: string;
  data?: {
    accountExists?: boolean;
    phone?: string;
  };
};

export async function checkForgotPasswordPhone(phone: string): Promise<ForgotPasswordCheckPhoneResponse> {
  const url = buildApiUrl('/api/forgot-password/check-phone');
  return await httpPostJson<ForgotPasswordCheckPhoneResponse, { phone: string }>(url, { phone: phone.trim() });
}

export type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

export type VerifyResetOtpResponse = {
  success: boolean;
  message?: string;
  data?: { resetToken?: string };
};

export async function verifyResetPasswordOtp(phone: string, otp: string): Promise<VerifyResetOtpResponse> {
  const url = buildApiUrl('/api/reset-password/verify-otp');
  return await httpPostJson<VerifyResetOtpResponse, { phone: string; otp: string }>(url, {
    phone: phone.trim(),
    otp: otp.trim(),
  });
}

export async function validateResetPasswordToken(token: string): Promise<ResetPasswordResponse> {
  const url = buildApiUrl(`/api/reset-password/validate?token=${encodeURIComponent(token.trim())}`);
  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  return (await res.json()) as ResetPasswordResponse;
}

export async function resetPasswordWithToken(token: string, password: string): Promise<ResetPasswordResponse> {
  const url = buildApiUrl('/api/reset-password');
  return await httpPostJson<ResetPasswordResponse, { token: string; password: string }>(url, {
    token: token.trim(),
    password,
  });
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function setStoredUser(user: AuthUserSnapshot): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<AuthUserSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserSnapshot;
  } catch {
    return null;
  }
}

/** Persiste la session (remember me activé par défaut sur mobile). */
export async function persistAuthSession(
  accessToken: string,
  refreshToken: string | null | undefined,
  user: AuthUserSnapshot | null | undefined,
  rememberMe = true,
): Promise<void> {
  if (!rememberMe) {
    await clearAuthToken();
    return;
  }
  await setAuthToken(accessToken);
  if (refreshToken) {
    await setRefreshToken(refreshToken);
  }
  if (user) {
    await setStoredUser(user);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
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

