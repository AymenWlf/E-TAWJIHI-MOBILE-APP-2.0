import {
  TOUR_DEMO_FGSES_ANNOUNCEMENT,
  TOUR_DEMO_STATUSES,
  TOUR_FGSES_ESTABLISHMENT_SLUG,
  TOUR_FGSES_ESTABLISHMENT_SLUG_LEGACY,
  TOUR_CANDIDACY_CARD_STEP_CODES,
  TOUR_CANDIDACY_CARD_STEP_STATUSES,
  TOUR_STATUS_ACTION_STEP_CODES,
  TOUR_STATUS_ACTION_STEP_STATUSES,
} from '@/constants/applyToSchoolsTour';
import {
  fetchContestAnnouncementsByEstablishment,
  fetchContestAnnouncementsCached,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import type {
  AnnouncementBrief,
  AppNotification,
  CandidacyStatusType,
  EstablishmentBrief,
  EstablishmentFollow,
} from '@/types/inscriptions';
import { pickEstablishmentName } from '@/utils/candidacyStatus';
import { formatArabicParagraph } from '@/utils/bidiText';

export function isTourFgsesEstablishment(est: EstablishmentBrief | null | undefined): boolean {
  if (!est) return false;
  const slug = est.slug?.trim().toLowerCase();
  if (
    slug === TOUR_FGSES_ESTABLISHMENT_SLUG ||
    slug === TOUR_FGSES_ESTABLISHMENT_SLUG_LEGACY
  ) {
    return true;
  }
  const sigle = est.sigle?.trim().toUpperCase();
  return sigle.includes('FGSES');
}

/** Libellé court école pour titres du tutoriel (sigle prioritaire). */
export function tourSchoolShortLabel(
  est: EstablishmentBrief | null | undefined,
  locale: 'fr' | 'ar',
): string {
  const sigle = est?.sigle?.trim();
  if (sigle) return sigle;
  return pickEstablishmentName(est, locale);
}

/** Remplace `{school}` et l’ancien placeholder « FGSES » dans les chaînes i18n. */
export function formatApplyTourCopy(
  text: string,
  schoolLabel: string,
  options?: { rtl?: boolean },
): string {
  let out = text.replace(/\{school\}/g, schoolLabel).replace(/FGSES/g, schoolLabel);
  if (options?.rtl) {
    out = formatArabicParagraph(out);
  }
  return out;
}

function compareTourAnnouncements(a: ContestAnnouncementCard, b: ContestAnnouncementCard): number {
  if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
  if (a.daysUntilClose !== b.daysUntilClose) {
    return a.daysUntilClose - b.daysUntilClose;
  }
  return b.id - a.id;
}

export function pickTourFgsesAnnouncement(
  items: ContestAnnouncementCard[],
): ContestAnnouncementCard | null {
  const fgses = items.filter((a) => isTourFgsesEstablishment(a.establishment));
  if (fgses.length === 0) return null;
  return [...fgses].sort(compareTourAnnouncements)[0] ?? null;
}

export async function resolveTourFgsesAnnouncement(): Promise<ContestAnnouncementCard> {
  const { items: list } = await fetchContestAnnouncementsCached();
  const fromList = pickTourFgsesAnnouncement(list);
  const estId = fromList?.establishment?.id;
  if (estId && estId > 0) {
    const { items: byEst } = await fetchContestAnnouncementsByEstablishment(estId);
    const fromEst = pickTourFgsesAnnouncement(byEst);
    if (fromEst) return enrichTourAnnouncement(fromEst);
  }
  if (fromList) return enrichTourAnnouncement(fromList);
  return TOUR_DEMO_FGSES_ANNOUNCEMENT;
}

/** Complète logo / nom arabe si l’API les omet encore. */
function enrichTourAnnouncement(announcement: ContestAnnouncementCard): ContestAnnouncementCard {
  const fallbackEst = TOUR_DEMO_FGSES_ANNOUNCEMENT.establishment;
  const est = announcement.establishment;
  if (!est || !fallbackEst) return announcement;
  return {
    ...announcement,
    establishment: {
      ...est,
      logo: est.logo?.trim() || fallbackEst.logo || null,
      nomArabe: est.nomArabe?.trim() || fallbackEst.nomArabe || null,
    },
    registrationUrlLabelAr:
      announcement.registrationUrlLabelAr?.trim() ||
      TOUR_DEMO_FGSES_ANNOUNCEMENT.registrationUrlLabelAr ||
      null,
  };
}

/** Notification in-app alignée sur `EstablishmentFollowAnnouncementNotifier`. */
export function buildTourPushNotification(announcement: ContestAnnouncementCard): AppNotification {
  const est = announcement.establishment;
  let school = est?.nom?.trim() ?? '';
  if (!school) school = est?.sigle?.trim() ?? '';
  if (!school) school = 'Une école que vous suivez';

  let schoolAr = est?.nomArabe?.trim() ?? '';
  if (!schoolAr) schoolAr = school;

  const title = 'Action requise — nouvelle annonce';
  const titleAr = 'إجراء مطلوب — إعلان جديد';

  let annTitle = announcement.title?.trim() ?? '';
  if (!annTitle) annTitle = 'Nouvelle annonce';
  let annTitleAr = announcement.titleAr?.trim() ?? '';
  if (!annTitleAr) annTitleAr = annTitle;

  const message = `${school} a publié une nouvelle annonce : « ${annTitle} ». Mettez à jour votre suivi si besoin.`;
  const messageAr = `نشر ${schoolAr} إعلانًا جديدًا: « ${annTitleAr} ». حدّث متابعتك عند الحاجة.`;

  const establishmentId = est?.id ?? 0;

  return {
    id: 0,
    title,
    message,
    titleAr,
    messageAr,
    type: 'follow_school_new_announcement',
    isRead: false,
    createdAt: new Date().toISOString(),
    timeAgo: "À l'instant",
    timeAgoAr: 'الآن',
    metadata: {
      contestAnnouncementId: announcement.id,
      establishmentId,
    },
  };
}

function toAnnouncementBrief(announcement: ContestAnnouncementCard): AnnouncementBrief {
  return {
    id: announcement.id,
    title: announcement.title,
    titleAr: announcement.titleAr,
    announcementType: announcement.announcementType,
    badgeType: announcement.announcementType,
    dateStart: announcement.dateStart,
    dateEnd: announcement.dateEnd,
    isOpen: announcement.isOpen,
    isExpire: announcement.isExpire,
    daysUntilClose: announcement.daysUntilClose,
    registrationUrl: announcement.registrationUrl,
    registrationUrlLabel: announcement.registrationUrlLabel,
    preRegistrationFee: null,
    feesMin: null,
    feesMax: null,
    ogImage: announcement.ogImage,
    availableStatuses: announcement.availableStatuses,
    establishment: announcement.establishment,
    communityQnaMessageCount: announcement.communityQnaMessageCount,
  };
}

/**
 * Follow de démo pour le tutoriel — données réelles de l’annonce FGSES,
 * mais `id` follow = 0 (aucune persistance / API).
 */
export function buildTourDemoFollow(
  announcement: ContestAnnouncementCard,
  status: CandidacyStatusType | null,
): EstablishmentFollow {
  const est = announcement.establishment;
  const statuses = mergeTourAvailableStatuses(announcement.availableStatuses);

  return {
    id: 0,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    establishment: est,
    status,
    availableStatuses: statuses,
    stats: {
      totalAnnouncements: 2,
      openAnnouncements: announcement.isOpen ? 1 : 0,
      candidaciesCount: 1,
    },
    latestAnnouncement: toAnnouncementBrief(announcement),
    latestEvent: null,
  };
}

export function tourDefaultStatus(
  announcement: ContestAnnouncementCard,
): CandidacyStatusType | null {
  const statuses = mergeTourAvailableStatuses(announcement.availableStatuses);
  return statuses.find((s) => s.code === 'interested') ?? statuses[0] ?? null;
}

/**
 * Union des statuts API + repli tutoriel (dont « Admis définitivement »)
 * pour que la sheet de mise à jour reste réaliste sur toutes les étapes.
 */
export function mergeTourAvailableStatuses(
  fromAnnouncement: CandidacyStatusType[],
): CandidacyStatusType[] {
  const byCode = new Map<string, CandidacyStatusType>();
  for (const s of fromAnnouncement) {
    byCode.set(s.code, s);
  }
  for (const fallback of TOUR_DEMO_STATUSES) {
    if (!byCode.has(fallback.code)) {
      byCode.set(fallback.code, fallback);
      continue;
    }
    if (fallback.code === 'admitted') {
      const cur = byCode.get('admitted')!;
      byCode.set('admitted', {
        ...cur,
        labelFr: 'Admis définitivement',
        labelAr: cur.labelAr?.trim() ? cur.labelAr : fallback.labelAr,
        icon: cur.icon || fallback.icon,
        colorFg: cur.colorFg || fallback.colorFg,
        colorBg: cur.colorBg || fallback.colorBg,
        colorBorder: cur.colorBorder || fallback.colorBorder,
        sortOrder: Math.max(cur.sortOrder, fallback.sortOrder),
      });
    }
  }
  return [...byCode.values()].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}

const STATUS_ACTION_LABEL_MATCHERS: Record<
  (typeof TOUR_STATUS_ACTION_STEP_CODES)[number],
  (label: string) => boolean
> = {
  applied: (label) => /\binscrit\b/i.test(label) && !/non/i.test(label),
  not_interested: (label) => /non\s*int[ée]ress[ée]/i.test(label),
};

const CANDIDACY_CARD_LABEL_MATCHERS: Record<
  (typeof TOUR_CANDIDACY_CARD_STEP_CODES)[number],
  (label: string) => boolean
> = {
  admitted_contest: (label) =>
    /admis\s+au\s+concours/i.test(label) ||
    (/admis/i.test(label) && /concours/i.test(label) && !/non/i.test(label)),
  not_admitted_contest: (label) =>
    /non\s+admis\s+au\s+concours/i.test(label) ||
    /rat[ée]\s+le\s+concours/i.test(label) ||
    (/non/i.test(label) && /concours/i.test(label)),
};

const CANDIDACY_CARD_API_CODE_ALIASES: Record<
  (typeof TOUR_CANDIDACY_CARD_STEP_CODES)[number],
  string[]
> = {
  admitted_contest: ['admitted_contest', 'admitted', 'admitted_written', 'admitted_oral'],
  not_admitted_contest: ['not_admitted_contest', 'failed_exam', 'not_selected', 'rejected'],
};

function pickTourSheetStatusesForStep(
  catalog: CandidacyStatusType[],
  stepCodes: readonly string[],
  fallbacks: CandidacyStatusType[],
  labelMatchers: Record<string, (label: string) => boolean>,
  apiCodeAliases?: Record<string, string[]>,
): CandidacyStatusType[] {
  const pool = mergeTourAvailableStatuses(catalog);
  const byCode = new Map(pool.map((s) => [s.code, s]));

  const resolved: CandidacyStatusType[] = [];
  for (const code of stepCodes) {
    let match: CandidacyStatusType | undefined;
    const aliases = apiCodeAliases?.[code] ?? [code];
    for (const alias of aliases) {
      if (byCode.has(alias)) {
        match = byCode.get(alias);
        break;
      }
    }
    if (!match) {
      match = pool.find((s) => labelMatchers[code]?.(s.labelFr));
    }
    const fallback = fallbacks.find((s) => s.code === code);
    if (!match) {
      match = fallback;
    }
    if (match) {
      resolved.push(
        fallback
          ? {
              ...match,
              labelFr: fallback.labelFr,
              labelAr: match.labelAr?.trim() ? match.labelAr : fallback.labelAr,
            }
          : match,
      );
    }
  }
  return resolved;
}

/** Étape 6 : « Inscrit » et « Non intéressé ». */
export function pickTourStatusActionSheetStatuses(
  catalog: CandidacyStatusType[],
): CandidacyStatusType[] {
  return pickTourSheetStatusesForStep(
    catalog,
    TOUR_STATUS_ACTION_STEP_CODES,
    TOUR_STATUS_ACTION_STEP_STATUSES,
    STATUS_ACTION_LABEL_MATCHERS,
  );
}

/** Étape 9 : « Admis au concours » et « Non admis au concours ». */
export function pickTourCandidacyCardSheetStatuses(
  catalog: CandidacyStatusType[],
): CandidacyStatusType[] {
  return pickTourSheetStatusesForStep(
    catalog,
    TOUR_CANDIDACY_CARD_STEP_CODES,
    TOUR_CANDIDACY_CARD_STEP_STATUSES,
    CANDIDACY_CARD_LABEL_MATCHERS,
    CANDIDACY_CARD_API_CODE_ALIASES,
  );
}
