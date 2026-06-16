import type { AppLocale } from '@/constants/i18n';
import { formatPromotionTimeRemaining } from '@/utils/platformServicePromotionDeadline';

export type ShopPromoCampaignDeadlineUi = {
  expired: boolean;
  untilLabel: string;
  dateText: string;
  timeRemaining: string;
};

export function formatShopPromoCampaignEndDate(target: Date, locale: AppLocale): string {
  const formatted = target.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (locale === 'fr') {
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  return formatted;
}

export function resolveShopPromoCampaignDeadline(
  endsAtIso: string,
  locale: AppLocale,
  now = new Date(),
): ShopPromoCampaignDeadlineUi | null {
  const target = new Date(endsAtIso);
  if (Number.isNaN(target.getTime())) return null;

  const dateText = formatShopPromoCampaignEndDate(target, locale);
  const ms = target.getTime() - now.getTime();

  if (ms <= 0) {
    return {
      expired: true,
      untilLabel: locale === 'ar' ? 'انتهى في' : 'Terminé le',
      dateText,
      timeRemaining: locale === 'ar' ? 'انتهى العرض' : 'Offre terminée',
    };
  }

  return {
    expired: false,
    untilLabel: locale === 'ar' ? 'حتى' : "Jusqu'au",
    dateText,
    timeRemaining: formatPromotionTimeRemaining(now, target, locale, false),
  };
}

export function shopPromoCampaignTickIntervalMs(endsAtIso: string, now = new Date()): number {
  const ms = new Date(endsAtIso).getTime() - now.getTime();
  return ms > 0 && ms < 86_400_000 ? 1000 : 60_000;
}
