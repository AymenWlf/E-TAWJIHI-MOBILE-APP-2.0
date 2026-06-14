import { useRootNavigationState } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { processColdStartPushIfNeeded } from '@/services/pushNotifications';
import { resolveAppLaunchIntent } from '@/utils/appLaunchIntent';

type Props = {
  onBootstrapComplete: () => void;
};

/**
 * Prépare le lancement pendant le splash (push cold start, intent).
 * La redirection vers Annonces au lancement normal est gérée par `useSetupRedirectGate`
 * dans `app/_layout.tsx` (une seule fois) — pas de `router.replace` ici.
 */
export function AppLaunchBootstrap({ onBootstrapComplete }: Props) {
  const { user, isLoading, sessionReady, accessToken, refreshToken, getValidAccessToken } =
    useAuth();

  const navigationReady = Boolean(useRootNavigationState()?.key);
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    if (!navigationReady) return;
    if (isLoading) return;
    if (!sessionReady && (accessToken || refreshToken)) return;

    let cancelled = false;

    const finish = () => {
      if (cancelled || completedRef.current) return;
      completedRef.current = true;
      onBootstrapComplete();
    };

    void (async () => {
      const intent = await resolveAppLaunchIntent();
      if (cancelled) return;

      if (intent.kind === 'push') {
        await processColdStartPushIfNeeded(getValidAccessToken, intent.content);
        finish();
        return;
      }

      finish();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    navigationReady,
    isLoading,
    sessionReady,
    accessToken,
    refreshToken,
    user,
    getValidAccessToken,
    onBootstrapComplete,
  ]);

  return null;
}
