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

export function isFollowedSchoolNotification(n: AppNotification): boolean {
  if (n.type === 'follow_school_new_announcement') return true;
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  return meta.followed_school === true || meta.followed_school === 'true';
}

function isCommercialClientFlag(value: unknown): boolean {
  if (value === false || value === 0) return false;
  if (value === 'false' || value === '0') return false;
  return value === true || value === 1 || value === 'true' || value === '1';
}

/** Annonce concours sans TAWJIH PLUS / service actif : message d’incitation uniquement. */
export function isContestAnnouncementUpsellNotification(n: AppNotification): boolean {
  const type = String(n.type ?? '');
  if (
    type !== 'contest_announcement' &&
    type !== 'follow_school_new_announcement' &&
    type !== 'announcement'
  ) {
    return false;
  }
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  if (isCommercialClientFlag(meta.commercial_client)) return false;
  if (
    meta.commercial_client === false ||
    meta.commercial_client === 0 ||
    meta.commercial_client === 'false' ||
    meta.commercial_client === '0' ||
    meta.deep_link === 'tawjih_plus_upsell'
  ) {
    return true;
  }
  return false;
}

function contestAnnouncementUpsellMessage(locale: AppLocale): string {
  return locale === 'ar'
    ? 'اشترك في خدمة TAWJIH PLUS للحصول على مزيد من التفاصيل.'
    : 'Inscrivez-vous au service TAWJIH PLUS pour recevoir plus de détails.';
}

function withFollowedSchoolStar(title: string): string {
  const t = title.trim();
  if (!t || t.startsWith('⭐')) return t;
  return `⭐ ${t}`;
}

export function notificationTitle(n: AppNotification, locale: AppLocale): string {
  let title = n.title;
  if (locale === 'ar') {
    const a = n.titleAr?.trim();
    if (a) title = a;
  }
  if (isFollowedSchoolNotification(n)) {
    return withFollowedSchoolStar(title);
  }
  return title;
}

export function notificationMessage(n: AppNotification, locale: AppLocale): string {
  const referralMsg = referralNotificationMessage(n, locale);
  if (referralMsg) return referralMsg;

  if (isContestAnnouncementUpsellNotification(n)) {
    return contestAnnouncementUpsellMessage(locale);
  }

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
