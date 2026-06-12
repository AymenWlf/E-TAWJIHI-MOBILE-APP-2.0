import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { buildApiUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { httpGetJson, type ApiError } from '@/services/http';
import {
  fetchSimpleAppFeedbackPrompt,
  type SimpleAppFeedbackPromptData,
} from '@/services/simpleAppFeedback';
import { fetchUserActiveServices } from '@/services/userActiveServices';
import { userIsCommercialClient } from '@/utils/commercialClientAccess';
import {
  hoursSinceSetupCompletion,
  isEligibleBySetupAge,
  SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP,
} from '@/utils/simpleAppFeedbackEligibility';
import {
  isSimpleFeedbackDismissed,
  isSimpleFeedbackSubmitted,
  markSimpleFeedbackDismissed,
} from '@/utils/simpleAppFeedbackStorage';

const AUTO_PROMPT_DELAY_MS = 2500;

type OpenSimpleFeedback = (options: { isCommercialClient: boolean }) => void;

type PromptDecision = {
  shouldPrompt: boolean;
  isCommercialClient: boolean;
  alreadySubmitted: boolean;
  waitForSetupDelay: boolean;
};

function isPromptEndpointUnavailable(status: number | undefined): boolean {
  return status === 404 || status === 405;
}

type PromptResponse = {
  success?: boolean;
  message?: string;
  data?: SimpleAppFeedbackPromptData;
};

async function fetchPromptWithLegacyFallback(token: string): Promise<SimpleAppFeedbackPromptData> {
  try {
    return await fetchSimpleAppFeedbackPrompt(token);
  } catch (error) {
    const status = (error as ApiError)?.status;
    if (!isPromptEndpointUnavailable(status)) {
      throw error;
    }
    const res = await httpGetJson<PromptResponse>(buildApiUrl('/api/mobile/app-feedback/prompt'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.success || !res.data) {
      throw new Error(res.message ?? 'Impossible de vérifier l’éligibilité');
    }
    return res.data;
  }
}

async function resolveClientSideFallback(
  token: string,
  isSetupComplete: boolean | undefined,
  setupCompletedAt: string | null | undefined,
): Promise<PromptDecision> {
  const hours = hoursSinceSetupCompletion(setupCompletedAt);
  const eligible = isEligibleBySetupAge(isSetupComplete, setupCompletedAt);
  let isCommercialClient = false;
  try {
    const services = await fetchUserActiveServices(token);
    isCommercialClient = userIsCommercialClient(services);
  } catch {
    /* services optionnels pour le repli */
  }

  const waitForSetupDelay =
    isSetupComplete === true &&
    !eligible &&
    hours != null &&
    hours < SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP;

  return {
    shouldPrompt: eligible,
    isCommercialClient,
    alreadySubmitted: false,
    waitForSetupDelay,
  };
}

async function resolvePromptDecision(
  token: string,
  isSetupComplete: boolean | undefined,
  setupCompletedAt: string | null | undefined,
): Promise<PromptDecision> {
  try {
    const prompt = await fetchPromptWithLegacyFallback(token);
    const minHours = prompt.minHoursAfterSetup ?? prompt.minHoursAfterSignup ?? SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP;
    const hoursSinceSetup =
      prompt.hoursSinceSetupCompletion ?? prompt.hoursSinceAccountCreation ?? null;
    const setupDone = prompt.isSetupComplete ?? isSetupComplete ?? false;

    const waitForSetupDelay =
      setupDone &&
      !prompt.shouldPrompt &&
      !prompt.alreadySubmitted &&
      hoursSinceSetup != null &&
      hoursSinceSetup < minHours;

    return {
      shouldPrompt: prompt.shouldPrompt,
      isCommercialClient: prompt.isCommercialClient,
      alreadySubmitted: prompt.alreadySubmitted,
      waitForSetupDelay,
    };
  } catch {
    return resolveClientSideFallback(token, isSetupComplete, setupCompletedAt);
  }
}

/**
 * Modal avis rapide : app native iOS/Android uniquement, 24 h après fin du setup.
 */
export function useSimpleAppFeedbackAutoPrompt(openSimpleFeedback: OpenSimpleFeedback): void {
  const { user, sessionReady, getValidAccessToken } = useAuth();
  const skipUserIdRef = useRef<number | null>(null);
  const promptedUserIdRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimer = useCallback(() => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const tryPrompt = useCallback(async () => {
    if (Platform.OS === 'web') return;

    const userId = user?.id;
    if (!sessionReady || !userId) return;
    if (!user?.is_setup) return;
    if (skipUserIdRef.current === userId || promptedUserIdRef.current === userId) return;
    if (pendingTimerRef.current) return;

    try {
      if (await isSimpleFeedbackDismissed(userId) || (await isSimpleFeedbackSubmitted(userId))) {
        skipUserIdRef.current = userId;
        return;
      }

      const token = await getValidAccessToken();
      if (!token) return;

      const decision = await resolvePromptDecision(token, user.is_setup, user.setupCompletedAt);

      if (decision.alreadySubmitted) {
        skipUserIdRef.current = userId;
        return;
      }

      if (!decision.shouldPrompt) {
        if (!decision.waitForSetupDelay) {
          skipUserIdRef.current = userId;
        }
        return;
      }

      promptedUserIdRef.current = userId;
      pendingTimerRef.current = setTimeout(() => {
        pendingTimerRef.current = null;
        openSimpleFeedback({ isCommercialClient: decision.isCommercialClient });
      }, AUTO_PROMPT_DELAY_MS);
    } catch {
      /* Erreur réseau / serveur : réessayer au prochain focus session */
    }
  }, [
    sessionReady,
    user?.id,
    user?.is_setup,
    user?.setupCompletedAt,
    getValidAccessToken,
    openSimpleFeedback,
  ]);

  useEffect(() => {
    skipUserIdRef.current = null;
    promptedUserIdRef.current = null;
  }, [user?.id]);

  useEffect(() => {
    void tryPrompt();
    return clearPendingTimer;
  }, [tryPrompt, clearPendingTimer]);

  useEffect(() => {
    if (!user?.id || Platform.OS === 'web') return;

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void tryPrompt();
      }
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [user?.id, tryPrompt]);
}

export async function dismissSimpleFeedbackForUser(userId: number): Promise<void> {
  await markSimpleFeedbackDismissed(userId);
}
