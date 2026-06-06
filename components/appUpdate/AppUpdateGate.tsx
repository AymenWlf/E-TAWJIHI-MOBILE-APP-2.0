import { useCallback, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { AppUpdateModal } from '@/components/appUpdate/AppUpdateModal';
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

type Props = {
  children: ReactNode;
};

export function AppUpdateGate({ children }: Props) {
  const [policy, setPolicy] = useState<AppUpdatePolicy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [required, setRequired] = useState(false);

  const evaluate = useCallback(async (next: AppUpdatePolicy) => {
    setPolicy(next);
    if (next.updateRequired) {
      setRequired(true);
      setShowModal(true);
      return;
    }
    if (next.updateRecommended) {
      const dismissed = await isRecommendedUpdateDismissed(next.latestVersion);
      setRequired(false);
      setShowModal(!dismissed);
      return;
    }
    setRequired(false);
    setShowModal(false);
  }, []);

  const load = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }
    const next = await fetchAppUpdatePolicy();
    if (!next) {
      setShowModal(false);
      return;
    }
    if (!next.updateRequired && !next.updateRecommended) {
      setShowModal(false);
      setPolicy(null);
      return;
    }
    await evaluate(next);
  }, [evaluate]);

  useBackgroundPoll(() => void load(), {
    intervalMs: APP_UPDATE_POLL_MS,
    debounceMs: PUBLIC_STATUS_DEBOUNCE_MS,
  });

  const handleLater = useCallback(() => {
    if (!policy || required) {
      return;
    }
    void dismissRecommendedUpdate(policy.latestVersion);
    setShowModal(false);
  }, [policy, required]);

  return (
    <>
      {children}
      {policy && showModal ? (
        <AppUpdateModal
          visible={showModal}
          required={required}
          policy={policy}
          onLater={required ? undefined : handleLater}
        />
      ) : null}
    </>
  );
}
