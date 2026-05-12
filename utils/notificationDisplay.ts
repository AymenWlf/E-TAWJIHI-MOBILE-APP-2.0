import type { AppLocale } from '@/constants/i18n';
import type { AppNotification } from '@/types/inscriptions';

export function notificationTitle(n: AppNotification, locale: AppLocale): string {
  if (locale === 'ar') {
    const a = n.titleAr?.trim();
    if (a) return a;
  }
  return n.title;
}

export function notificationMessage(n: AppNotification, locale: AppLocale): string {
  if (locale === 'ar') {
    const a = n.messageAr?.trim();
    if (a) return a;
  }
  return n.message;
}

export function notificationTimeAgo(n: AppNotification, locale: AppLocale): string {
  if (locale === 'ar') {
    const a = n.timeAgoAr?.trim();
    if (a) return a;
  }
  return n.timeAgo;
}
