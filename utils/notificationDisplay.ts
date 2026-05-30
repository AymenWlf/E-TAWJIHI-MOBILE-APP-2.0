import type { AppLocale } from '@/constants/i18n';
import type { AppNotification } from '@/types/inscriptions';
import { referredNameFromNotificationMetadata } from '@/utils/referralDisplayName';

function referralNotificationMessage(n: AppNotification, locale: AppLocale): string | null {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const event = String(meta.referral_event ?? n.type ?? '');
  const referredName = referredNameFromNotificationMetadata(meta);
  if (!referredName) return null;

  if (event === 'referral_started') {
    return locale === 'ar'
      ? `انضم ${referredName} باستخدام رمز الإحالة الخاص بك.`
      : `${referredName} vient de s’inscrire avec votre code de parrainage.`;
  }
  if (event === 'referral_qualified') {
    return locale === 'ar'
      ? `أتم ${referredName} عملية شراء مؤهلة: تُحتسب هذه الإحالة ضمن مستويات المكافآت.`
      : `${referredName} a finalisé un achat éligible : ce parrainage compte pour vos paliers récompenses.`;
  }

  return null;
}

export function notificationTitle(n: AppNotification, locale: AppLocale): string {
  if (locale === 'ar') {
    const a = n.titleAr?.trim();
    if (a) return a;
  }
  return n.title;
}

export function notificationMessage(n: AppNotification, locale: AppLocale): string {
  const referralMsg = referralNotificationMessage(n, locale);
  if (referralMsg) return referralMsg;

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
