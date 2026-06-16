import type { AppLocale } from '@/constants/i18n';

export type ShopProductLocalizedFields = {
  title: string;
  titleAr?: string | null;
  shortDescription?: string | null;
  shortDescriptionAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
};

function pickLocalized(fr: string, ar: string, locale: AppLocale): string {
  if (locale === 'ar') return ar || fr;
  return fr || ar;
}

/** Titre produit selon la langue (secours : autre langue). */
export function shopProductLocalizedTitle(p: ShopProductLocalizedFields, locale: AppLocale): string {
  return pickLocalized((p.title ?? '').trim(), (p.titleAr ?? '').trim(), locale);
}

/** Description courte selon la langue (secours : autre langue). */
export function shopProductLocalizedShortDescription(
  p: ShopProductLocalizedFields,
  locale: AppLocale,
): string | null {
  const value = pickLocalized(
    (p.shortDescription ?? '').trim(),
    (p.shortDescriptionAr ?? '').trim(),
    locale,
  );
  return value || null;
}

/** Description HTML selon la langue (secours : autre langue). */
export function shopProductLocalizedDescription(
  p: ShopProductLocalizedFields,
  locale: AppLocale,
): string | null {
  const value = pickLocalized((p.description ?? '').trim(), (p.descriptionAr ?? '').trim(), locale);
  return value || null;
}
