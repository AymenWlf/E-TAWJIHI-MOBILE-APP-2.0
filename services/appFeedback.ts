import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { buildApiUrl } from '@/constants/api';
import type { AppFeedbackRatingKey, AppFeedbackTextKey } from '@/constants/appFeedback';
import { httpPostJson } from '@/services/http';

export type SubmitAppFeedbackPayload = {
  ratings: Record<AppFeedbackRatingKey, number>;
  texts: Record<AppFeedbackTextKey, string>;
  locale?: string;
};

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

export async function submitAppFeedback(
  accessToken: string,
  payload: SubmitAppFeedbackPayload,
): Promise<void> {
  const appVersion =
    Constants.expoConfig?.version ??
    (typeof Constants.manifest2?.extra?.expoClient?.version === 'string'
      ? Constants.manifest2.extra.expoClient.version
      : undefined);

  const res = await httpPostJson<
    SubmitResponse,
    SubmitAppFeedbackPayload & { platform?: string; appVersion?: string; comment?: string }
  >(
    buildApiUrl('/api/mobile/app-feedback'),
    {
      ...payload,
      comment: payload.texts.improve.trim(),
      platform: Platform.OS,
      appVersion,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (res.success === false) {
    throw new Error(res.message ?? 'Envoi impossible');
  }
}
