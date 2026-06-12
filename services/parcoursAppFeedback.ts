import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { buildApiUrl } from '@/constants/api';
import type { AppFeedbackRatingKey, AppFeedbackTextKey } from '@/constants/appFeedback';
import { httpPostJson } from '@/services/http';

export type SubmitParcoursAppFeedbackPayload = {
  ratings: Record<AppFeedbackRatingKey, number>;
  texts: Record<AppFeedbackTextKey, string>;
  locale?: string;
};

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

function readAppVersion(): string | undefined {
  return (
    Constants.expoConfig?.version ??
    (typeof Constants.manifest2?.extra?.expoClient?.version === 'string'
      ? Constants.manifest2.extra.expoClient.version
      : undefined)
  );
}

/** Questionnaire détaillé — étape feedback du parcours orientation (clients payants). */
export async function submitParcoursAppFeedback(
  accessToken: string,
  payload: SubmitParcoursAppFeedbackPayload,
): Promise<void> {
  const res = await httpPostJson<
    SubmitResponse,
    SubmitParcoursAppFeedbackPayload & { platform?: string; appVersion?: string; comment?: string }
  >(
    buildApiUrl('/api/mobile/app-feedback/parcours'),
    {
      ...payload,
      comment: payload.texts.improve.trim(),
      platform: Platform.OS,
      appVersion: readAppVersion(),
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (res.success === false) {
    throw new Error(res.message ?? 'Envoi impossible');
  }
}
