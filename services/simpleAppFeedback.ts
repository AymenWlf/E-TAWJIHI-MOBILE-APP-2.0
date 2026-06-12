import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

export type SimpleAppFeedbackPromptData = {
  shouldPrompt: boolean;
  alreadySubmitted: boolean;
  isCommercialClient: boolean;
  isSetupComplete?: boolean;
  setupCompletedAt: string | null;
  hoursSinceSetupCompletion: number | null;
  minHoursAfterSetup: number;
  /** @deprecated */
  accountCreatedAt?: string | null;
  /** @deprecated */
  hoursSinceAccountCreation?: number | null;
  /** @deprecated */
  minHoursAfterSignup?: number;
};

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

type PromptResponse = {
  success?: boolean;
  message?: string;
  data?: SimpleAppFeedbackPromptData;
};

function readAppVersion(): string | undefined {
  return (
    Constants.expoConfig?.version ??
    (typeof Constants.manifest2?.extra?.expoClient?.version === 'string'
      ? Constants.manifest2.extra.expoClient.version
      : undefined)
  );
}

export async function fetchSimpleAppFeedbackPrompt(accessToken: string): Promise<SimpleAppFeedbackPromptData> {
  const res = await httpGetJson<PromptResponse>(buildApiUrl('/api/mobile/app-feedback/simple/prompt'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success || !res.data) {
    throw new Error(res.message ?? 'Impossible de vérifier l’éligibilité');
  }
  return res.data;
}

export async function submitSimpleAppFeedback(
  accessToken: string,
  payload: {
    rating: number;
    comment: string;
    locale?: string;
    audience: 'client' | 'visitor';
  },
): Promise<void> {
  const res = await httpPostJson<
    SubmitResponse,
    {
      rating: number;
      comment: string;
      locale?: string;
      audience: 'client' | 'visitor';
      platform?: string;
      appVersion?: string;
    }
  >(
    buildApiUrl('/api/mobile/app-feedback/simple'),
    {
      rating: payload.rating,
      comment: payload.comment.trim(),
      locale: payload.locale,
      audience: payload.audience,
      platform: Platform.OS,
      appVersion: readAppVersion(),
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (res.success === false) {
    throw new Error(res.message ?? 'Envoi impossible');
  }
}
