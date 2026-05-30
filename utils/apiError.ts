import { Alert } from 'react-native';

import type { HomeCopyKey } from '@/constants/i18n';
import type { ApiError } from '@/services/http';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'rateLimit'
  | 'unknown';

export type ApiErrorContext =
  | 'auth'
  | 'account'
  | 'checkout'
  | 'shop'
  | 'globalWall'
  | 'events'
  | 'inscriptions'
  | 'qna'
  | 'diagnostic'
  | 'dailyChallenge'
  | 'upload'
  | 'feedback'
  | 'generic';

type Translator = (key: HomeCopyKey) => string;

type UserFacingOptions = {
  context?: ApiErrorContext;
  /** Message métier si le type d’erreur n’est pas identifiable. */
  fallbackKey?: HomeCopyKey;
};

const KIND_I18N: Record<Exclude<ApiErrorKind, 'unknown'>, HomeCopyKey> = {
  network: 'apiErrNetwork',
  timeout: 'apiErrTimeout',
  unauthorized: 'apiErrUnauthorized',
  forbidden: 'apiErrForbidden',
  notFound: 'apiErrNotFound',
  validation: 'apiErrValidation',
  conflict: 'apiErrConflict',
  server: 'apiErrServer',
  rateLimit: 'apiErrRateLimit',
};

const CONTEXT_FALLBACK: Partial<Record<ApiErrorContext, HomeCopyKey>> = {
  auth: 'apiErrAuth',
  account: 'apiErrGeneric',
  checkout: 'shopCheckoutErrGeneric',
  shop: 'shopErrorLoad',
  globalWall: 'globalWallError',
  events: 'eventsLoadError',
  inscriptions: 'inscErrorLoad',
  qna: 'qnaErrorGeneric',
  diagnostic: 'apiErrDiagnostic',
  dailyChallenge: 'apiErrDailyChallenge',
  upload: 'shopThankBankUploadErr',
  feedback: 'appFeedbackError',
  generic: 'apiErrGeneric',
};

function extractErrorInfo(error: unknown): { status?: number; rawMessage?: string; code?: string } {
  if (error && typeof error === 'object') {
    const e = error as ApiError & { code?: string };
    return {
      status: typeof e.status === 'number' ? e.status : undefined,
      rawMessage: typeof e.message === 'string' ? e.message : undefined,
      code: typeof e.code === 'string' ? e.code : undefined,
    };
  }
  if (typeof error === 'string') return { rawMessage: error };
  return {};
}

function isJsonBlob(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

/** Messages techniques ou bruts renvoyés par le backend — ne jamais les afficher tels quels. */
export function isTechnicalApiMessage(message: string): boolean {
  const m = message.trim();
  if (!m) return true;
  if (isJsonBlob(m)) return true;
  if (m.includes('Failed to fetch')) return true;
  if (m.includes('EXPO_PUBLIC_')) return true;
  if (m.includes('origin:')) return true;
  if (m.includes('CORS OK')) return true;
  if (/Erreur HTTP \d+/i.test(m)) return true;
  if (/^HTTP \d{3}$/.test(m)) return true;
  if (m.includes('<html') || m.includes('<code>')) return true;
  if (m.length > 240) return true;
  return false;
}

export function classifyApiError(error: unknown): ApiErrorKind {
  const { status, rawMessage } = extractErrorInfo(error);
  const msg = rawMessage?.toLowerCase() ?? '';

  if (msg.includes('failed to fetch') || msg.includes('network request failed')) return 'network';
  if (
    msg.includes('unexpected eof') ||
    msg.includes('timeout') ||
    msg.includes('interrompu') ||
    msg.includes('réponse vide') ||
    msg.includes('connexion coupée')
  ) {
    return 'timeout';
  }

  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 422 || status === 400) return 'validation';
  if (status === 429) return 'rateLimit';
  if (status != null && status >= 500) return 'server';

  if (rawMessage && isTechnicalApiMessage(rawMessage)) {
    if (msg.includes('non authentifié') || msg.includes('unauthorized')) return 'unauthorized';
    if (msg.includes('interdit') || msg.includes('forbidden')) return 'forbidden';
    if (msg.includes('introuvable') || msg.includes('not found')) return 'notFound';
    return 'unknown';
  }

  return 'unknown';
}

/** Message utilisateur pour une réponse API `success: false` (sans corps d’erreur exploitable). */
export function getUserFacingApiFailureMessage(
  t: Translator,
  options?: UserFacingOptions,
): string {
  const context = options?.context ?? 'generic';
  if (options?.fallbackKey) return t(options.fallbackKey);
  return t(CONTEXT_FALLBACK[context] ?? 'apiErrGeneric');
}

/** Convertit une erreur API / réseau en message lisible par type, sans JSON brut backend. */
export function getUserFacingApiError(
  error: unknown,
  t: Translator,
  options?: UserFacingOptions,
): string {
  const context = options?.context ?? 'generic';
  const { code } = extractErrorInfo(error);

  if (code === 'already_redeemed') return t('loyaltyRedeemAlreadyUsed');
  if (code === 'insufficient_points') return t('loyaltyRedeemInsufficient');
  if (code === 'network') return t('apiErrNetwork');
  if (code === 'claim_failed') return t('referralTierPromoError');

  const kind = classifyApiError(error);
  if (context === 'auth' && (kind === 'unauthorized' || kind === 'forbidden' || kind === 'validation')) {
    return t('apiErrAuth');
  }

  if (kind !== 'unknown') {
    return t(KIND_I18N[kind]);
  }

  if (options?.fallbackKey) return t(options.fallbackKey);
  return t(CONTEXT_FALLBACK[context] ?? 'apiErrGeneric');
}

/** Message générique pour échec de chargement (réseau / serveur) — jamais de détail technique. */
export function getUserFacingLoadError(
  error: unknown,
  t: Translator,
  options?: UserFacingOptions,
): string {
  const kind = classifyApiError(error);
  if (kind === 'network' || kind === 'timeout' || kind === 'server' || kind === 'unknown') {
    return t('commonLoadError');
  }
  const { rawMessage } = extractErrorInfo(error);
  if (rawMessage && isTechnicalApiMessage(rawMessage)) {
    return t('commonLoadError');
  }
  return getUserFacingApiError(error, t, options);
}

export function showApiErrorAlert(
  t: Translator,
  error: unknown,
  options?: UserFacingOptions & { title?: string; titleKey?: HomeCopyKey },
): void {
  const title = options?.title ?? (options?.titleKey ? t(options.titleKey) : t('commonErrorTitle'));
  Alert.alert(title, getUserFacingApiError(error, t, options));
}
