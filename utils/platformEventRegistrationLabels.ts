import type { HomeCopyKey } from '@/constants/i18n';

export function contactStatusLabelMobile(t: (key: HomeCopyKey) => string, s: string | undefined): string {
  switch (s) {
    case 'unreachable':
      return t('eventsContactUnreachable');
    case 'whatsapp_sent':
      return t('eventsContactWhatsapp');
    case 'confirmed':
      return t('eventsContactConfirmed');
    case 'cancelled':
      return t('eventsContactCancelled');
    case 'abandoned':
      return t('eventsContactAbandoned');
    case 'new':
    default:
      return t('eventsContactNew');
  }
}
