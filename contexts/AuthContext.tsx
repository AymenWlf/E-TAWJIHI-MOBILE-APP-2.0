import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { buildApiUrl } from '@/constants/api';
import {
  DeviceTransferRequiredError,
  loginWithPhonePassword,
  logoutWithToken,
  refreshWithToken,
  registerWithPhonePassword,
  persistAuthSession,
  setStoredUser,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  clearAuthToken,
} from '@/services/auth';
import { confirmDeviceTransfer } from '@/services/deviceTransfer';
import { initDeviceRequestContext } from '@/utils/deviceRequestContext';
import { getAuthPlatform, getOrCreateDeviceId } from '@/utils/deviceId';
import { getDeviceLabel } from '@/utils/deviceLabel';
import { httpGetJson, type ApiError } from '@/services/http';
import { promptNotificationPermissionAfterAuth, unregisterPushToken } from '@/services/pushNotifications';
import { clearPendingDiagnosticNavigation } from '@/utils/schoolDiagnosticBackgroundSubmit';
import { clearSchoolDiagnosticLastResult } from '@/utils/schoolDiagnosticStorage';
import { subscribeSessionExpired } from '@/utils/sessionExpired';

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
  /** Lecture AsyncStorage des jetons terminée. */
  isLoading: boolean;
  /** Session `/api/me` résolue (ou aucun jeton en stockage). */
  sessionReady: boolean;
  login: (phone: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  completeDeviceTransfer: (
    transferToken: string,
    revokeSessionId?: string,
    rememberMe?: boolean,
  ) => Promise<AuthUser>;
  register: (phone: string, password: string, referralCode?: string | null, rememberMe?: boolean) => Promise<AuthUser>;
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
  const [sessionReady, setSessionReady] = useState(false);
  const userRef = useRef<AuthUser | null>(null);
  userRef.current = user;
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = accessToken;
  const refreshTokenRef = useRef<string | null>(null);
  refreshTokenRef.current = refreshToken;
  const expireSessionRef = useRef(false);

  const expireSessionLocal = useCallback(async () => {
    if (expireSessionRef.current) return;
    expireSessionRef.current = true;
    try {
      await clearAuthToken();
      await clearSchoolDiagnosticLastResult();
      await clearPendingDiagnosticNavigation();
      setUser(null);
      accessTokenRef.current = null;
      refreshTokenRef.current = null;
      setAccessTokenState(null);
      setRefreshTokenState(null);
      setSessionReady(true);
    } finally {
      expireSessionRef.current = false;
    }
  }, []);

  /**
   * Identité stable : évite de relancer en boucle les `useEffect([getValidAccessToken])`
   * à chaque refresh JWT (plusieurs écrans montés au boot).
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = accessTokenRef.current ?? (await getAuthToken());
      if (token) {
        return token;
      }
      const rt = refreshTokenRef.current ?? (await getRefreshToken());
      if (!rt) {
        if (userRef.current) {
          await expireSessionLocal();
        }
        return null;
      }
      const r = await refreshWithToken(rt);
      const nextAccess = r.data?.token ?? null;
      const nextRefresh = r.data?.refreshToken ?? null;
      if (!r.success || !nextAccess || !nextRefresh) {
        await expireSessionLocal();
        return null;
      }
      await persistAuthSession(nextAccess, nextRefresh, userRef.current, true);
      accessTokenRef.current = nextAccess;
      refreshTokenRef.current = nextRefresh;
      setAccessTokenState(nextAccess);
      setRefreshTokenState(nextRefresh);
      return nextAccess;
    } catch (e) {
      const status = (e as ApiError)?.status;
      if (status === 401 || status === 403) {
        await expireSessionLocal();
      }
      return null;
    }
  }, [expireSessionLocal]);

  const reloadMe = useCallback(async () => {
    try {
      const token = await getValidAccessToken();
      if (!token) {
        return;
      }
      const url = buildApiUrl('/api/me');
      const res = await httpGetJson<{ success: boolean; data?: { user?: AuthUser } }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const next = res.data?.user ?? null;
      setUser((prev) => {
        if (prev === next) return prev;
        if (
          prev &&
          next &&
          prev.id === next.id &&
          prev.is_setup === next.is_setup &&
          prev.firstName === next.firstName &&
          prev.phone === next.phone
        ) {
          return prev;
        }
        return next;
      });
      if (next) {
        await setStoredUser(next);
      }
    } catch (e) {
      const status = (e as ApiError)?.status;
      if (status === 401 || status === 403) {
        await expireSessionLocal();
      }
    }
  }, [expireSessionLocal, getValidAccessToken]);

  const login = useCallback(async (phone: string, password: string, rememberMe = true): Promise<AuthUser> => {
    const deviceId = await getOrCreateDeviceId();
    const deviceLabel = await getDeviceLabel();
    let res;
    try {
      res = await loginWithPhonePassword(phone, password, deviceId, getAuthPlatform(), deviceLabel);
    } catch (e) {
      if (e instanceof DeviceTransferRequiredError) {
        throw e;
      }
      throw e;
    }
    const at = extractToken(res);
    const rt = extractRefreshToken(res);
    // Only the access token is required — refreshToken may be absent on some server versions
    if (!res.success || !at) {
      throw new Error(res.message || 'Login failed');
    }
    const nextUser = extractUser(res) ?? {};
    await persistAuthSession(at, rt, nextUser, rememberMe);
    accessTokenRef.current = at;
    refreshTokenRef.current = rt;
    setAccessTokenState(at);
    if (rt) setRefreshTokenState(rt);
    setUser(nextUser);
    setSessionReady(true);
    return nextUser;
  }, []);

  const completeDeviceTransfer = useCallback(
    async (
      transferToken: string,
      revokeSessionId?: string,
      rememberMe = true,
    ): Promise<AuthUser> => {
      const res = await confirmDeviceTransfer(transferToken, revokeSessionId);
      const at = extractToken(res);
      const rt = extractRefreshToken(res);
      if (!res.success || !at) {
        throw new Error(res.message || 'Transfer failed');
      }
      const nextUser = extractUser(res) ?? {};
      await persistAuthSession(at, rt, nextUser, rememberMe);
      accessTokenRef.current = at;
      refreshTokenRef.current = rt;
      setAccessTokenState(at);
      if (rt) setRefreshTokenState(rt);
      setUser(nextUser);
      setSessionReady(true);
      return nextUser;
    },
    [],
  );

  const register = useCallback(
    async (phone: string, password: string, referralCode?: string | null, rememberMe = true): Promise<AuthUser> => {
    const res = await registerWithPhonePassword(phone, password, referralCode);
    const at = extractToken(res);
    const rt = extractRefreshToken(res);
    // Only the access token is required — refreshToken may be absent on some server versions
    if (!res.success || !at) {
      throw new Error(res.message || 'Register failed');
    }
    const nextUser = extractUser(res) ?? {};
    await persistAuthSession(at, rt, nextUser, rememberMe);
    accessTokenRef.current = at;
    refreshTokenRef.current = rt;
    setAccessTokenState(at);
    if (rt) setRefreshTokenState(rt);
    setUser(nextUser);
    setSessionReady(true);
    if (nextUser.is_setup) {
      void promptNotificationPermissionAfterAuth(getValidAccessToken);
    }
    return nextUser ?? {};
  }, [getValidAccessToken]);

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
    await clearSchoolDiagnosticLastResult();
    await clearPendingDiagnosticNavigation();
    setUser(null);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setSessionReady(true);
  }, [accessToken, refreshToken]);

  useEffect(() => {
    void initDeviceRequestContext();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initDeviceRequestContext();
        const at = await getAuthToken();
        const rt = await getRefreshToken();
        const cachedUser = at || rt ? await getStoredUser() : null;
        if (cancelled) return;
        accessTokenRef.current = at;
        refreshTokenRef.current = rt;
        setAccessTokenState(at);
        setRefreshTokenState(rt);
        if (cachedUser) {
          setUser(cachedUser);
        }
        setIsLoading(false);
        if (at || rt) {
          try {
            const url = buildApiUrl('/api/me');
            const res = await httpGetJson<{ success: boolean; data?: { user?: AuthUser } }>(url, {
              headers: { Authorization: `Bearer ${at}` },
            });
            if (cancelled) return;
            const next = res.data?.user ?? null;
            setUser((prev) => {
              if (prev === next) return prev;
              if (
                prev &&
                next &&
                prev.id === next.id &&
                prev.is_setup === next.is_setup &&
                prev.firstName === next.firstName &&
                prev.phone === next.phone
              ) {
                return prev;
              }
              return next;
            });
            if (next) {
              await setStoredUser(next);
            }
          } catch (e) {
            const status = (e as ApiError)?.status;
            if (status === 401 || status === 403) {
              await clearAuthToken();
              if (!cancelled) {
                setUser(null);
                accessTokenRef.current = null;
                refreshTokenRef.current = null;
                setAccessTokenState(null);
                setRefreshTokenState(null);
              }
            }
          } finally {
            if (!cancelled) setSessionReady(true);
          }
        } else {
          setSessionReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
          setSessionReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeSessionExpired(() => void expireSessionLocal()), [expireSessionLocal]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isLoading,
      sessionReady,
      login,
      completeDeviceTransfer,
      register,
      logout,
      getValidAccessToken,
      reloadMe,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isLoading,
      sessionReady,
      login,
      completeDeviceTransfer,
      register,
      logout,
      getValidAccessToken,
      reloadMe,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

