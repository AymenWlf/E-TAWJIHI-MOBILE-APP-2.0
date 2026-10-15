/**
 * Fiches secteur / métier du diagnostic : uniquement les champs enregistrés.
 */

import { formatPricingText, formatSalaryRange } from '../utils/formatAmount';
import { pickLocalizedJobName } from '@/utils/secteurCatalogLocale';
import { formatBilingualName } from './orientationDiagnosticI18n';

export type SecteurDetailView = {
  titre: string;
  description: string;
  tendance: string;
  salaireLabel: string;
  softSkills: string[];
  avantages: string[];
  pointsAttention: string[];
  bacs: string[];
  exemplesMetiers: string[];
  nbMetiers?: number;
  nbEcoles?: number;
  source: 'api' | 'marche' | 'mixte';
};

export type MetierDetailView = {
  nom: string;
  secteurLabel?: string;
  description: string;
  missions: string[];
  competences: string[];
  formations: string[];
  debouches: string[];
  tendance: string;
  salaireLabel: string;
  niveauAccessibilite: string;
  source: 'api' | 'marche' | 'mixte';
};

function localizeAccessibilite(value: string | undefined | null, locale: 'fr' | 'ar'): string {
  const v = (value || '').trim();
  if (!v) return locale === 'ar' ? 'حسب المسار' : 'Selon parcours';
  if (locale !== 'ar') return v;
  const map: Record<string, string> = {
    'Sélectif': 'انتقائي',
    'Accessible': 'في المتناول',
    'Exigeant': 'صعب الولوج',
    'Variable': 'متغير',
    'Très sélectif': 'انتقائي جداً',
    'Selon parcours': 'حسب المسار',
  };
  return map[v] || v;
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const t = (x || '').trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

function salaryFrom(
  salaire?: string | null,
  min?: string | number | null,
  max?: string | number | null,
  locale: 'fr' | 'ar' = 'fr',
): string {
  if (salaire && String(salaire).trim()) {
    return formatPricingText(String(salaire).trim(), locale);
  }
  const label = formatSalaryRange(min ?? null, max ?? null, locale);
  return (
    label ||
    (locale === 'ar'
      ? 'حسب الملف والخبرة (سوق المغرب)'
      : 'Selon profil et expérience (marché Maroc)')
  );
}

export function buildSecteurDetailView(
  s: {
    titre: string;
    titreAr?: string | null;
    code?: string;
    description?: string;
    descriptionAr?: string | null;
    salaire?: string;
    salaireMin?: string | null;
    salaireMax?: string | null;
    softSkills?: string[];
    softSkillsAr?: string[] | null;
    avantages?: string[];
    avantagesAr?: string[] | null;
    inconvenients?: string[];
    inconvenientsAr?: string[] | null;
    bacs?: string[];
    bacsAr?: string[] | null;
    typeBacs?: string[];
    typeBacsAr?: string[] | null;
    tendance?: string | null;
    tendanceAr?: string | null;
    metiers?: string[];
    metiersLies?: Array<{ nom?: string | null; nomArabe?: string | null }>;
    nbMetiers?: number;
    nbEcoles?: number;
  },
  locale: 'fr' | 'ar' = 'fr',
): SecteurDetailView {
  const titre =
    locale === 'ar' && s.titreAr?.trim()
      ? s.titreAr.trim()
      : formatBilingualName(s.titre, s.titreAr);
  const hasSalary = Boolean(
    (s.salaire && String(s.salaire).trim()) || s.salaireMin || s.salaireMax,
  );
  return {
    titre,
    description: storedText(s.description, s.descriptionAr, locale),
    tendance: storedText(s.tendance, s.tendanceAr, locale),
    salaireLabel: hasSalary ? salaryFrom(s.salaire, s.salaireMin, s.salaireMax, locale) : '',
    softSkills: storedList(s.softSkills, s.softSkillsAr, locale),
    avantages: storedList(s.avantages, s.avantagesAr, locale),
    pointsAttention: storedList(s.inconvenients, s.inconvenientsAr, locale),
    bacs: uniq([
      ...storedList(s.typeBacs, s.typeBacsAr, locale),
      ...storedList(s.bacs, s.bacsAr, locale),
    ]),
    exemplesMetiers: s.metiersLies?.length
      ? uniq(s.metiersLies.map((job) => pickLocalizedJobName(job.nom || '', job.nomArabe, locale)).filter((name) => name.trim() !== ''))
      : uniq((s.metiers || []).map((name) => pickLocalizedJobName(name, null, locale))),
    nbMetiers: s.metiersLies?.length ? s.metiersLies.length : s.nbMetiers,
    nbEcoles: s.nbEcoles,
    source: 'api',
  };
}

function storedList(
  french: string[] | null | undefined,
  arabic: string[] | null | undefined,
  locale: 'fr' | 'ar',
): string[] {
  const source = locale === 'ar' && arabic && arabic.length > 0 ? arabic : french;
  return uniq((source || []).map((item) => String(item).trim()).filter(Boolean));
}

function isGeneratedMetierDescription(value: string | null | undefined): boolean {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (!text) return false;
  return (
    (/^Le métier de /i.test(text) &&
      /appartient au secteur/i.test(text) &&
      /missions spécialisées/i.test(text)) ||
    (/تندرج مهنة/.test(text) && /ضمن قطاع/.test(text) && /مهاماً متخصصة/.test(text))
  );
}

function storedText(
  french: string | null | undefined,
  arabic: string | null | undefined,
  locale: 'fr' | 'ar',
): string {
  const ar = (arabic || '').trim();
  const fr = (french || '').trim();
  return locale === 'ar' ? ar || fr : fr;
}

export function buildMetierDetailView(
  m: {
    nom: string;
    nomArabe?: string | null;
    description?: string;
    descriptionAr?: string | null;
    competences?: string[];
    competencesAr?: string[] | null;
    formations?: string[];
    formationsAr?: string[] | null;
    missions?: string[] | null;
    missionsAr?: string[] | null;
    debouches?: string[] | null;
    debouchesAr?: string[] | null;
    tendance?: string | null;
    tendanceAr?: string | null;
    salaireMin?: string | number | null;
    salaireMax?: string | number | null;
    niveauAccessibilite?: string;
    secteur?: { titre?: string; titreAr?: string | null; code?: string };
  },
  secteurTitre?: string,
  _secteurCode?: string,
  locale: 'fr' | 'ar' = 'fr',
): MetierDetailView {
  const rawSecteur = secteurTitre || m.secteur?.titre || '';
  const titreFr = rawSecteur.split(' · ')[0];
  const titreArFromLabel = rawSecteur.includes(' · ')
    ? rawSecteur.split(' · ').slice(1).join(' · ')
    : '';
  const titre = formatBilingualName(
    titreFr,
    m.secteur?.titreAr || titreArFromLabel,
  );
  const rawDescription = storedText(m.description, m.descriptionAr, locale);
  const description = isGeneratedMetierDescription(rawDescription) ? '' : rawDescription;

  return {
    nom: formatBilingualName(m.nom, m.nomArabe),
    secteurLabel: titre || undefined,
    description,
    missions: storedList(m.missions, m.missionsAr, locale),
    competences: storedList(m.competences, m.competencesAr, locale),
    formations: storedList(m.formations, m.formationsAr, locale),
    debouches: storedList(m.debouches, m.debouchesAr, locale),
    tendance: storedText(m.tendance, m.tendanceAr, locale),
    salaireLabel: salaryFrom(null, m.salaireMin, m.salaireMax, locale),
    niveauAccessibilite: localizeAccessibilite(m.niveauAccessibilite, locale),
    source: 'api',
  };
}
