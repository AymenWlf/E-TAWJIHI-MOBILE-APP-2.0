import type { HomeCopyKey } from '@/constants/i18n';
import type { CandidacyStatusType } from '@/types/inscriptions';
import { formatShortDateInParis } from '@/utils/dateParis';

/**
 * Helpers de présentation pour le module Inscriptions.
 *
 * Refonte 2026-05 : les statuts ne sont plus codés en dur dans
 * `STATUS_VISUALS` / `STATUS_FLOW` ; ils proviennent du catalogue admin
 * (`CandidacyStatusType`) via `services/candidacyStatusTypes.ts` et sont
 * cachés en `AsyncStorage`. On garde uniquement les utilitaires de date,
 * de nom d'établissement et de copie i18n qui ne dépendent plus du
 * catalogue.
 */

/** Format dd/MM/yyyy à partir d'une date ISO ou y-m-d (calendrier Europe/Paris). */
export function formatShortDate(iso: string | null | undefined, locale: 'fr' | 'ar' = 'fr'): string {
  return formatShortDateInParis(iso, locale);
}

/** Renvoie le nom à afficher selon la locale (priorité à la langue choisie quand dispo). */
export function pickEstablishmentName(
  e: { nom?: string | null; nomArabe?: string | null } | null | undefined,
  locale: 'fr' | 'ar',
): string {
  if (!e) return '—';
  const ar = (e.nomArabe ?? '').trim();
  const fr = (e.nom ?? '').trim();
  if (locale === 'ar') return ar !== '' ? ar : fr || '—';
  return fr !== '' ? fr : ar || '—';
}

/**
 * Renvoie le **couple** (primary, secondary) des noms d'établissement à
 * afficher : la langue choisie en premier, l'autre langue en sous-titre.
 *
 * Cette présentation est volontaire pour les cards d'annonces et de
 * candidatures (FR + AR toujours visibles côté utilisateur), à condition
 * que l'établissement ait défini les deux versions et qu'elles soient
 * distinctes. Si un seul nom est disponible, `secondary` est vide ⇒ le
 * composant doit alors masquer la deuxième ligne.
 */
export function pickEstablishmentNamesPair(
  e: { nom?: string | null; nomArabe?: string | null } | null | undefined,
  locale: 'fr' | 'ar',
): { primary: string; secondary: string } {
  if (!e) return { primary: '—', secondary: '' };
  const ar = (e.nomArabe ?? '').trim();
  const fr = (e.nom ?? '').trim();
  if (locale === 'ar') {
    return {
      primary: ar !== '' ? ar : fr || '—',
      secondary: ar !== '' && fr !== '' && fr !== ar ? fr : '',
    };
  }
  return {
    primary: fr !== '' ? fr : ar || '—',
    secondary: fr !== '' && ar !== '' && fr !== ar ? ar : '',
  };
}

/**
 * Renvoie le titre d'annonce à afficher selon la locale.
 * Priorité à `titleAr` lorsque la langue choisie est l'arabe ; fallback au titre FR.
 */
export function pickAnnouncementTitle(
  a:
    | {
        title?: string | null;
        titleAr?: string | null;
      }
    | null
    | undefined,
  locale: 'fr' | 'ar',
): string {
  if (!a) return '';
  const ar = (a.titleAr ?? '').trim();
  const fr = (a.title ?? '').trim();
  if (locale === 'ar') return ar !== '' ? ar : fr;
  return fr !== '' ? fr : ar;
}

/**
 * Renvoie le libellé du bouton CTA "lien principal" :
 *  1. `customLabel` non vide ⇒ tel quel (saisie admin),
 *  2. sinon, libellé i18n par défaut selon le type d'annonce
 *     ("Voir le résultat", "Postuler à la bourse", "Lien d'inscription"…),
 *  3. fallback générique `inscOpenLinkBtn` ("Ouvrir le lien" / "فتح الرابط").
 */
export function pickRegistrationUrlLabelKey(
  announcementType: string | null | undefined,
): HomeCopyKey {
  const t = (announcementType ?? '').trim().toLowerCase();
  if (t === '') return 'inscOpenLinkBtn';
  if (t.includes('résultat') || t.includes('resultat') || t.includes('نتيجة')) {
    return 'inscOpenLinkBtnResult';
  }
  if (t.includes('bourse') || t.includes('منحة') || t.includes('منح')) {
    return 'inscOpenLinkBtnScholarship';
  }
  if (t.includes('offre') || t.includes('عرض')) {
    return 'inscOpenLinkBtnOffer';
  }
  if (t.includes('message') || t.includes('رسالة') || t.includes('important')) {
    return 'inscOpenLinkBtnInfo';
  }
  if (t.includes('inscription') || t.includes('ouverture') || t.includes('تسجيل')) {
    return 'inscOpenLinkBtnRegister';
  }
  return 'inscOpenLinkBtn';
}

export function pickRegistrationUrlLabel(
  customLabel: string | null | undefined,
  announcementType: string | null | undefined,
  t: (k: HomeCopyKey) => string,
): string {
  const c = (customLabel ?? '').trim();
  if (c !== '') return c;
  return t(pickRegistrationUrlLabelKey(announcementType));
}

/** Renvoie la description HTML à rendre selon la locale (FR par défaut, AR si dispo). */
export function pickAnnouncementDescriptionHtml(
  a:
    | {
        descriptionHtml?: string | null;
        descriptionHtmlAr?: string | null;
      }
    | null
    | undefined,
  locale: 'fr' | 'ar',
): string {
  if (!a) return '';
  const ar = (a.descriptionHtmlAr ?? '').trim();
  const fr = (a.descriptionHtml ?? '').trim();
  if (locale === 'ar') return ar !== '' ? ar : fr;
  return fr !== '' ? fr : ar;
}

/**
 * Formate "X jours / heures restants" ou "Clos depuis X jours" selon le signe.
 * Renvoie aussi un niveau de criticité pour la couleur.
 */
export type DeadlineKind = 'closed' | 'today' | 'soon' | 'normal';

export function formatDaysUntilClose(
  days: number | undefined | null,
  locale: 'fr' | 'ar' = 'fr',
): { label: string; kind: DeadlineKind } {
  if (days === null || days === undefined || Number.isNaN(days)) {
    return { label: '', kind: 'normal' };
  }
  if (days < 0) {
    if (locale === 'ar') return { label: `مغلق منذ ${Math.abs(days)} يومًا`, kind: 'closed' };
    return { label: `Fermé depuis ${Math.abs(days)} j`, kind: 'closed' };
  }
  if (days === 0) {
    return { label: locale === 'ar' ? 'يُغلق اليوم' : 'Clôture aujourd\'hui', kind: 'today' };
  }
  if (days === 1) {
    return { label: locale === 'ar' ? 'يبقى يوم واحد' : 'J-1', kind: 'today' };
  }
  if (days <= 7) {
    return {
      label: locale === 'ar' ? `يتبقى ${days} أيام` : `J-${days}`,
      kind: 'soon',
    };
  }
  return {
    label: locale === 'ar' ? `يتبقى ${days} يومًا` : `${days} jours restants`,
    kind: 'normal',
  };
}

/** "Il y a X jours / heures…" (FR/AR très simple). */
export function formatTimeAgo(iso: string | null | undefined, locale: 'fr' | 'ar' = 'fr'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const min = Math.round(diffMs / 60_000);
  const hr = Math.round(diffMs / 3_600_000);
  const day = Math.round(diffMs / 86_400_000);
  if (locale === 'ar') {
    if (min < 1) return 'الآن';
    if (min < 60) return `قبل ${min} دقيقة`;
    if (hr < 24) return `قبل ${hr} ساعة`;
    if (day < 30) return `قبل ${day} يومًا`;
    const months = Math.round(day / 30);
    return `قبل ${months} شهرًا`;
  }
  if (min < 1) return 'À l\'instant';
  if (min < 60) return `Il y a ${min} min`;
  if (hr < 24) return `Il y a ${hr} h`;
  if (day < 30) return `Il y a ${day} j`;
  const months = Math.round(day / 30);
  return `Il y a ${months} mois`;
}

/** Renvoie le libellé d'un statut selon la locale (sécurisé contre `null`). */
export function pickStatusLabel(
  status: CandidacyStatusType | null | undefined,
  locale: 'fr' | 'ar',
): string {
  if (!status) return '';
  if (locale === 'ar') {
    const ar = (status.labelAr ?? '').trim();
    return ar !== '' ? ar : status.labelFr;
  }
  return status.labelFr;
}
