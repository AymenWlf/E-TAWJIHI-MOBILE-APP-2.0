import { Linking, Platform } from 'react-native';

/** Liens stores — alignés avec E-TAWJIHI-GLOBAL-FRONT */
export const MOBILE_APP_ANDROID_PACKAGE = 'com.educalogy.etawjihi';

export const MOBILE_APP_PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${MOBILE_APP_ANDROID_PACKAGE}`;

export const MOBILE_APP_APP_STORE_APP_ID = '6751511971';

export const MOBILE_APP_APP_STORE_URL =
  `https://apps.apple.com/ma/app/e-tawjihi/id${MOBILE_APP_APP_STORE_APP_ID}`;

/** Page d’écriture d’avis App Store (Safari / universal link). */
export const MOBILE_APP_APP_STORE_REVIEW_URL =
  `${MOBILE_APP_APP_STORE_URL}?action=write-review`;

/** Deep link App Store vers le formulaire d’avis. */
export const MOBILE_APP_APP_STORE_REVIEW_DEEP_LINK =
  `itms-apps://itunes.apple.com/app/id${MOBILE_APP_APP_STORE_APP_ID}?action=write-review`;

/** Page Play Store avec section avis (fallback web). */
export const MOBILE_APP_PLAY_STORE_REVIEW_URL =
  `${MOBILE_APP_PLAY_STORE_URL}&showAllReviews=true`;

/** Deep link Play Store (ouvre la fiche app). */
export const MOBILE_APP_PLAY_STORE_REVIEW_DEEP_LINK =
  `market://details?id=${MOBILE_APP_ANDROID_PACKAGE}`;

export function getStoreReviewUrl(): string {
  if (Platform.OS === 'ios') {
    return MOBILE_APP_APP_STORE_REVIEW_DEEP_LINK;
  }
  if (Platform.OS === 'android') {
    return MOBILE_APP_PLAY_STORE_REVIEW_DEEP_LINK;
  }
  return MOBILE_APP_PLAY_STORE_REVIEW_URL;
}

export function getStoreReviewWebFallbackUrl(): string {
  if (Platform.OS === 'ios') {
    return MOBILE_APP_APP_STORE_REVIEW_URL;
  }
  return MOBILE_APP_PLAY_STORE_REVIEW_URL;
}

export async function openStoreReviewPage(): Promise<void> {
  const primary = getStoreReviewUrl();
  try {
    await Linking.openURL(primary);
    return;
  } catch {
    /* fallback web */
  }
  await Linking.openURL(getStoreReviewWebFallbackUrl());
}
