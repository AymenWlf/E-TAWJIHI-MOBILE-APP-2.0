import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { buildApiUrl } from '@/constants/api';
import { loginWithPhonePassword, logoutWithToken, refreshWithToken, registerWithPhonePassword, setAuthToken, setRefreshToken, getAuthToken, getRefreshToken, clearAuthToken } from '@/services/auth';
import { httpGetJson } from '@/services/http';
import { unregisterPushToken } from '@/services/pushNotifications';

type AuthUser = {
  id?: number;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  is_setup?: boolean;
  roles?: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthUser>;
  register: (phone: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
  reloadMe: () => Promise<void>;
};

const Ctx = createContext<AuthContextValue | null>(null);

// Helpers to handle multiple API response shapes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractToken(res: any): string | null {
  return (
    res?.data?.token ??
    res?.data?.accessToken ??
    res?.data?.access_token ??
    res?.token ??
    res?.accessToken ??
    null
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRefreshToken(res: any): string | null {
  return (
    res?.data?.refreshToken ??
    res?.data?.refresh_token ??
    res?.refreshToken ??
    res?.refresh_token ??
    null
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractUser(res: any): AuthUser | null {
  return (
    res?.data?.user ??
    res?.user ??
    null
  ) as AuthUser | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadMe = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const url = buildApiUrl('/api/me');
    const res = await httpGetJson<{ success: boolean; data?: { user?: AuthUser } }>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data?.user ?? null);
  }, []);

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    const token = accessToken ?? (await getAuthToken());
    if (token) {
      setAccessTokenState(token);
      return token;
    }
    const rt = refreshToken ?? (await getRefreshToken());
    if (!rt) return null;
    const r = await refreshWithToken(rt);
    const nextAccess = r.data?.token ?? null;
    const nextRefresh = r.data?.refreshToken ?? null;
    if (!nextAccess || !nextRefresh) return null;
    await setAuthToken(nextAccess);
    await setRefreshToken(nextRefresh);
    setAccessTokenState(nextAccess);
    setRefreshTokenState(nextRefresh);
    return nextAccess;
  }, [accessToken, refreshToken]);

  const login = useCallback(async (phone: string, password: string): Promise<AuthUser> => {
    const res = await loginWithPhonePassword(phone, password);
    const at = extractToken(res);
    const rt = extractRefreshToken(res);
    // Only the access token is required — refreshToken may be absent on some server versions
    if (!res.success || !at) {
      throw new Error(res.message || 'Login failed');
    }
    await setAuthToken(at);
    if (rt) await setRefreshToken(rt);
    setAccessTokenState(at);
    if (rt) setRefreshTokenState(rt);
    const nextUser = extractUser(res);
    setUser(nextUser);
    return nextUser ?? {};
  }, []);

  const register = useCallback(async (phone: string, password: string): Promise<AuthUser> => {
    const res = await registerWithPhonePassword(phone, password);
    const at = extractToken(res);
    const rt = extractRefreshToken(res);
    // Only the access token is required — refreshToken may be absent on some server versions
    if (!res.success || !at) {
      throw new Error(res.message || 'Register failed');
    }
    await setAuthToken(at);
    if (rt) await setRefreshToken(rt);
    setAccessTokenState(at);
    if (rt) setRefreshTokenState(rt);
    const nextUser = extractUser(res);
    setUser(nextUser);
    return nextUser ?? {};
  }, []);

  const logout = useCallback(async () => {
    // Révocation push token AVANT de purger l'auth, sinon plus moyen
    // d'authentifier l'appel `DELETE /api/me/push-token` côté backend.
    try {
      await unregisterPushToken(async () => accessToken ?? (await getAuthToken()));
    } catch {
      /* best effort */
    }
    const rt = refreshToken ?? (await getRefreshToken());
    if (rt) {
      try {
        await logoutWithToken(rt);
      } catch {
        // best effort
      }
    }
    await clearAuthToken();
    setUser(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
  }, [accessToken, refreshToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const at = await getAuthToken();
        const rt = await getRefreshToken();
        if (cancelled) return;
        setAccessTokenState(at);
        setRefreshTokenState(rt);
        if (at || rt) {
          await reloadMe();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadMe]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, refreshToken, isLoading, login, register, logout, getValidAccessToken, reloadMe }),
    [user, accessToken, refreshToken, isLoading, login, register, logout, getValidAccessToken, reloadMe],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

