import type { HomeCopyKey } from '@/constants/i18n';

import {
  getUserFacingApiError,
  type ApiErrorContext,
} from '@/utils/apiError';

type Translator = (key: HomeCopyKey) => string;

/** @deprecated Préférez `getUserFacingApiError(e, t, { context })` pour les erreurs API. */
export function errorMessage(
  e: unknown,
  t?: Translator,
  context?: ApiErrorContext,
): string {
  if (t) {
    return getUserFacingApiError(e, t, { context: context ?? 'generic' });
  }
  if (e instanceof Error) {
    return e.message || e.name;
  }
  if (typeof e === 'string') return e;
  return 'Une erreur est survenue.';
}
