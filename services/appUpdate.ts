import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  MOBILE_APP_APP_STORE_URL,
  MOBILE_APP_PLAY_STORE_URL,
} from '@/constants/mobileAppStores';
import { PUBLIC_STATUS_DEBOUNCE_MS } from '@/constants/backgroundPollIntervals';
import { buildApiUrl } from '@/constants/api';
import { createCachedFetcher } from '@/utils/cachedFetch';
import { getAppVersion } from '@/utils/appVersion';

const DISMISS_STORAGE_KEY = 'etawjihi.appUpdate.dismissedLatest';

export type AppUpdatePolicy = {
  clientVersion: string;
  minRequiredVersion: string;
  latestVersion: string;
  updateRequired: boolean;
  updateRecommended: boolean;
  message: string;
  messageAr: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
};

export function getStoreUrlForPlatform(policy: AppUpdatePolicy): string {
  if (Platform.OS === 'ios') {
    return policy.iosStoreUrl || MOBILE_APP_APP_STORE_URL;
  }
  return policy.androidStoreUrl || MOBILE_APP_PLAY_STORE_URL;
}

async function fetchAppUpdatePolicyNetwork(): Promise<AppUpdatePolicy | null> {
  const version = getAppVersion();
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const url = buildApiUrl(
    `/api/public/mobile-app-version?version=${encodeURIComponent(version)}&platform=${platform}`,
  );

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as { success?: boolean; data?: Partial<AppUpdatePolicy> };
    if (!json.success || !json.data) {
      return null;
    }
    const d = json.data;
    return {
      clientVersion: typeof d.clientVersion === 'string' ? d.clientVersion : version,
      minRequiredVersion: typeof d.minRequiredVersion === 'string' ? d.minRequiredVersion : version,
      latestVersion: typeof d.latestVersion === 'string' ? d.latestVersion : version,
      updateRequired: Boolean(d.updateRequired),
      updateRecommended: Boolean(d.updateRecommended),
      message: typeof d.message === 'string' ? d.message : '',
      messageAr: typeof d.messageAr === 'string' ? d.messageAr : '',
      iosStoreUrl: typeof d.iosStoreUrl === 'string' ? d.iosStoreUrl : MOBILE_APP_APP_STORE_URL,
      androidStoreUrl:
        typeof d.androidStoreUrl === 'string' ? d.androidStoreUrl : MOBILE_APP_PLAY_STORE_URL,
    };
  } catch {
    return null;
  }
}

const appUpdatePolicyCached = createCachedFetcher({
  ttlMs: 180_000,
  minNetworkIntervalMs: PUBLIC_STATUS_DEBOUNCE_MS,
  fetcher: fetchAppUpdatePolicyNetwork,
});

export function fetchAppUpdatePolicy(options?: { force?: boolean }): Promise<AppUpdatePolicy | null> {
  if (Platform.OS === 'web') {
    return Promise.resolve(null);
  }
  return appUpdatePolicyCached(options);
}

export async function isRecommendedUpdateDismissed(latestVersion: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(DISMISS_STORAGE_KEY);
    return stored === latestVersion;
  } catch {
    return false;
  }
}

export async function dismissRecommendedUpdate(latestVersion: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_STORAGE_KEY, latestVersion);
  } catch {
    /* noop */
  }
}
