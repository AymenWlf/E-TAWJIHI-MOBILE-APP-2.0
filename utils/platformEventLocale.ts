import type { AppLocale, HomeCopyKey } from '@/constants/i18n';
import type { PlatformEventKind } from '@/services/platformEvents';

import { platformEventKindLabel } from '@/utils/platformEventKindLabel';

/** Titre affiché selon la langue UI (AR → `titleAr` si renseigné). */
export function platformEventDisplayTitle(
  ev: { title: string; titleAr?: string | null },
  locale: AppLocale,
): string {
  if (locale === 'ar') {
    const ar = typeof ev.titleAr === 'string' ? ev.titleAr.trim() : '';
    if (ar.length > 0) return ar;
  }
  return (ev.title ?? '').trim();
}

/** Libellé type d’événement : pas de `uppercase` en arabe (casse inadaptée). */
export function platformEventKindBadgeText(
  t: (k: HomeCopyKey) => string,
  kind: PlatformEventKind,
  locale: AppLocale,
): string {
  const base = platformEventKindLabel(t, kind);
  return locale === 'ar' ? base : base.toUpperCase();
}
