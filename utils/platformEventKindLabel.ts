import type { HomeCopyKey } from '@/constants/i18n';
import type { PlatformEventKind } from '@/services/platformEvents';

export function platformEventKindLabel(
  t: (k: HomeCopyKey) => string,
  kind: PlatformEventKind,
): string {
  switch (kind) {
    case 'webinar':
      return t('eventsKindWebinar');
    case 'live':
      return t('eventsKindLive');
    default:
      return t('eventsKindEvent');
  }
}
