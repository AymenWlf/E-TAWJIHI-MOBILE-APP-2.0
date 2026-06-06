import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';

import { AppUpdateModal } from '@/components/appUpdate/AppUpdateModal';
import { AppUpdateRequiredScreen } from '@/components/appUpdate/AppUpdateRequiredScreen';
import {
  APP_UPDATE_POLL_MS,
  PUBLIC_STATUS_DEBOUNCE_MS,
} from '@/constants/backgroundPollIntervals';
import { useBackgroundPoll } from '@/hooks/useBackgroundPoll';
import {
  dismissRecommendedUpdate,
  fetchAppUpdatePolicy,
  isRecommendedUpdateDismissed,
  type AppUpdatePolicy,
} from '@/services/appUpdate';
import { brand, spacing } from '@/theme/tokens';

const LOGO_URI = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

type Props = {
  children: ReactNode;
};

export function AppUpdateGate({ children }: Props) {
  const [policy, setPolicy] = useState<AppUpdatePolicy | null>(null);
  const [checking, setChecking] = useState(true);
  const [showRecommendedModal, setShowRecommendedModal] = useState(false);

  const evaluate = useCallback(async (next: AppUpdatePolicy) => {
    setPolicy(next);
    if (next.updateRequired) {
      setShowRecommendedModal(false);
      return;
    }
    if (next.updateRecommended) {
      const dismissed = await isRecommendedUpdateDismissed(next.latestVersion);
      setShowRecommendedModal(!dismissed);
      return;
    }
    setShowRecommendedModal(false);
  }, []);

  const load = useCallback(async () => {
    if (Platform.OS === 'web') {
      setChecking(false);
      return;
    }
    try {
      const next = await fetchAppUpdatePolicy();
      if (!next) {
        setPolicy(null);
        setShowRecommendedModal(false);
        return;
      }
      if (!next.updateRequired && !next.updateRecommended) {
        setPolicy(null);
        setShowRecommendedModal(false);
        return;
      }
      await evaluate(next);
    } finally {
      setChecking(false);
    }
  }, [evaluate]);

  useBackgroundPoll(() => void load(), {
    intervalMs: APP_UPDATE_POLL_MS,
    debounceMs: PUBLIC_STATUS_DEBOUNCE_MS,
  });

  const handleLater = useCallback(() => {
    if (!policy || policy.updateRequired) {
      return;
    }
    void dismissRecommendedUpdate(policy.latestVersion);
    setShowRecommendedModal(false);
  }, [policy]);

  if (checking && Platform.OS !== 'web') {
    return (
      <View style={styles.boot}>
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

  if (policy?.updateRequired) {
    return <AppUpdateRequiredScreen policy={policy} />;
  }

  return (
    <>
      {children}
      {policy && showRecommendedModal ? (
        <AppUpdateModal
          visible={showRecommendedModal}
          required={false}
          policy={policy}
          onLater={handleLater}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  bootLogo: {
    width: '90%',
    maxWidth: 336,
    height: 76,
    opacity: 0.95,
  },
});
