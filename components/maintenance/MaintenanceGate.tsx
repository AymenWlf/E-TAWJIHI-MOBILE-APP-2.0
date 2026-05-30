import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { MaintenanceScreen } from '@/components/maintenance/MaintenanceScreen';
import {
  MAINTENANCE_POLL_MS,
  PUBLIC_STATUS_DEBOUNCE_MS,
} from '@/constants/backgroundPollIntervals';
import { useBackgroundPoll } from '@/hooks/useBackgroundPoll';
import {
  fetchPublicMaintenanceStatus,
  subscribeMaintenanceActive,
  type MaintenancePublicStatus,
} from '@/services/maintenanceMode';
import { brand, spacing } from '@/theme/tokens';

const LOGO_URI = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

type Props = {
  children: ReactNode;
};

export function MaintenanceGate({ children }: Props) {
  const [status, setStatus] = useState<MaintenancePublicStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const applyStatus = useCallback((next: MaintenancePublicStatus) => {
    setStatus(next);
    setChecking(false);
  }, []);

  const load = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      try {
        const next = await fetchPublicMaintenanceStatus({ force: manual });
        applyStatus(next);
      } catch {
        applyStatus({ enabled: false, message: '', retryAfterMinutes: 5 });
      } finally {
        setRefreshing(false);
      }
    },
    [applyStatus],
  );

  useBackgroundPoll(() => void load(false), {
    intervalMs: MAINTENANCE_POLL_MS,
    debounceMs: PUBLIC_STATUS_DEBOUNCE_MS,
  });

  /** Toute requête API en 503 maintenance bascule immédiatement l’app sur l’écran dédié. */
  useEffect(() => {
    return subscribeMaintenanceActive((next) => {
      applyStatus(next);
    });
  }, [applyStatus]);

  if (checking && !status) {
    return (
      <View style={styles.boot}>
        <View style={styles.blobTop} pointerEvents="none" />
        <View style={styles.blobBottom} pointerEvents="none" />
        <Image
          source={{ uri: LOGO_URI }}
          style={styles.bootLogo}
          resizeMode="contain"
          accessibilityLabel="E-TAWJIHI"
        />
        <ActivityIndicator size="large" color={brand.primary} accessibilityLabel="Chargement" />
      </View>
    );
  }

  if (status?.enabled) {
    return (
      <MaintenanceScreen
        message={status.message}
        retryAfterMinutes={status.retryAfterMinutes}
        onRefresh={() => void load(true)}
        refreshing={refreshing}
      />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  blobTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brand.primary,
    opacity: 0.1,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: brand.emerald,
    opacity: 0.1,
  },
  bootLogo: {
    width: '90%',
    maxWidth: 336,
    height: 76,
    opacity: 0.95,
  },
});
