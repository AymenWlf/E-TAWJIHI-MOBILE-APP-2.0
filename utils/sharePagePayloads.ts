import type { SharePreviewPayload } from '@/contexts/SharePreviewContext';
import type { HomeCopyKey } from '@/constants/i18n';
import {
  webPathBoutiqueProduct,
  webPathCommunity,
  webPathContestAnnouncement,
  webPathEstablishment,
  webPathEvent,
  webPathPlatformService,
} from '@/utils/sharePublicUrls';

type T = (key: HomeCopyKey) => string;

export function sharePayloadHome(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindHome',
    title: 'E‑TAWJIHI',
    subtitle: t('loginBrandSubtitle'),
    webPath: '/',
  };
}

export function sharePayloadSchoolsList(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindSchools',
    title: t('schoolsHeroTitle'),
    subtitle: t('schoolsHeroEyebrow'),
    webPath: '/etablissements',
  };
}

export function sharePayloadAnnouncementsList(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindAnnouncements',
    title: t('inscTitle'),
    subtitle: t('inscSubtitle'),
    webPath: '/annonces-concours',
  };
}

export function sharePayloadEventsList(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindEvents',
    title: t('eventsAgendaTitle'),
    webPath: '/evenements',
  };
}

export function sharePayloadBoutiqueList(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindBoutique',
    title: t('shopTitle'),
    subtitle: t('shopSubtitle'),
    webPath: '/boutique',
  };
}

export function sharePayloadCommunity(t: T): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindCommunity',
    title: t('globalWallTitle'),
    subtitle: t('globalWallIntro'),
    webPath: webPathCommunity(),
  };
}

export function sharePayloadEstablishmentDetail(params: {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  thumbUrl?: string | null;
}): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindSchool',
    title: params.title,
    subtitle: params.subtitle,
    webPath: webPathEstablishment(params.id, params.slug),
    thumbUrl: params.thumbUrl ?? undefined,
  };
}

export function sharePayloadContestAnnouncementDetail(params: {
  id: number;
  announcementTitle: string;
  establishmentName: string;
  subtitle?: string;
  thumbUrl?: string | null;
}): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindAnnouncement',
    title: params.announcementTitle,
    subtitle: params.subtitle ?? params.establishmentName,
    webPath: webPathContestAnnouncement(params.id, params.announcementTitle, params.establishmentName),
    thumbUrl: params.thumbUrl ?? undefined,
  };
}

export function sharePayloadPlatformEventDetail(params: {
  id: number;
  title: string;
  subtitle?: string;
  thumbUrl?: string | null;
}): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindEvent',
    title: params.title,
    subtitle: params.subtitle,
    webPath: webPathEvent(params.id),
    thumbUrl: params.thumbUrl ?? undefined,
  };
}

export function sharePayloadBoutiqueProductDetail(params: {
  slug: string;
  title: string;
  subtitle?: string;
  thumbUrl?: string | null;
}): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindBoutiqueProduct',
    title: params.title,
    subtitle: params.subtitle,
    webPath: webPathBoutiqueProduct(params.slug),
    thumbUrl: params.thumbUrl ?? undefined,
  };
}

export function sharePayloadBoutiquePlatformServiceDetail(params: {
  slug: string;
  title: string;
  subtitle?: string;
}): SharePreviewPayload {
  return {
    kindLabelKey: 'shareKindBoutique',
    title: params.title,
    subtitle: params.subtitle,
    webPath: webPathPlatformService(params.slug),
  };
}
