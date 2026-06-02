import { NIVEAU_ETUDE_OPTIONS } from '@/constants/academicSetup';
export const CURRENT_BAC_SCHOOL_YEAR = '2025-2026';
export const FIRST_BAC_SCHOOL_YEAR = '2026-2027';

export const ANNEES_BAC_VALUES = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
  '2023-2024',
  '2022-2023',
  '2021-2022',
  '2020-2021',
  '2019-2020',
  'Autre',
] as const;

export function normalizeBacAnneeValue(stored: string | null | undefined): string {
  let s = (stored ?? '').trim();
  if (!s) return '';
  if (s.toLowerCase() === 'autre') return 'Autre';
  s = s.replace(/[\u2013\u2014–—]/g, '-').replace(/\//g, '-').replace(/\s*-\s*/g, '-');
  return s;
}

export function matchCanonicalBacAnneeValue(stored: string | null | undefined): string {
  const n = normalizeBacAnneeValue(stored);
  if (!n) return '';
  if (n === 'Autre') return 'Autre';
  const hit = ANNEES_BAC_VALUES.find((y) => y !== 'Autre' && y === n);
  return hit ?? n;
}

const STUDY_LEVEL_LEGACY_TO_FORM: Record<string, string> = {
  '1ère année du bac': '1ère année Baccalauréat',
  '2ème année du bac': '2ème année Baccalauréat',
  '1ere annee du bac': '1ère année Baccalauréat',
  '2eme annee du bac': '2ème année Baccalauréat',
  '1ère Bac': '1ère année Baccalauréat',
  '1ere Bac': '1ère année Baccalauréat',
  '2ème Bac': '2ème année Baccalauréat',
  '2eme Bac': '2ème année Baccalauréat',
  Première: '1ère année Baccalauréat',
  Premiere: '1ère année Baccalauréat',
  Terminale: '2ème année Baccalauréat',
  terminale: '2ème année Baccalauréat',
  '1ere_bac': '1ère année Baccalauréat',
  '2eme_bac': '2ème année Baccalauréat',
  '2eme_bac_s1': '2ème année Baccalauréat',
  '2eme_bac_s2': '2ème année Baccalauréat',
  deja_bac: 'BAC+1',
  autre: 'Autre',
  tronc_commun: '',
};

const FORM_STUDY_LEVEL_VALUES = new Set(
  NIVEAU_ETUDE_OPTIONS.map((o) => o.value).filter(Boolean),
);

function normalizeStudyLevelKey(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function normalizeStudyLevelForForm(stored: string | null | undefined): string {
  const s = normalizeStudyLevelKey(stored ?? '');
  if (!s) return '';
  const mapped = STUDY_LEVEL_LEGACY_TO_FORM[s] ?? STUDY_LEVEL_LEGACY_TO_FORM[s.toLowerCase()];
  if (mapped !== undefined) return mapped;
  if (FORM_STUDY_LEVEL_VALUES.has(s)) return s;
  const lower = s.toLowerCase();
  if (/^bac\+\s*\d/i.test(s)) {
    const compact = s.replace(/\s+/g, '').toUpperCase();
    const hit = [...FORM_STUDY_LEVEL_VALUES].find((v) => v.replace(/\s+/g, '').toUpperCase() === compact);
    return hit ?? s;
  }
  if (lower === 'doctorant' || lower === 'doctorat') return 'Doctorant';
  if (
    lower.includes('1') &&
    (lower.includes('baccalauréat') ||
      lower.includes('baccalaureat') ||
      lower.includes('première') ||
      lower.includes('premiere') ||
      lower.includes('1ere') ||
      lower.includes('1ère'))
  ) {
    return '1ère année Baccalauréat';
  }
  if (
    lower.includes('2') &&
    (lower.includes('baccalauréat') ||
      lower.includes('baccalaureat') ||
      lower.includes('terminale') ||
      lower.includes('2eme') ||
      lower.includes('2ème'))
  ) {
    return '2ème année Baccalauréat';
  }
  if (lower.includes('terminale') && !lower.includes('1')) {
    return '2ème année Baccalauréat';
  }
  const fuzzy = [...FORM_STUDY_LEVEL_VALUES].find(
    (v) => v !== 'Autre' && v.toLowerCase() === lower,
  );
  return fuzzy ?? '';
}

export function normalizeBacTypeForForm(stored: string | null | undefined): '' | 'normal' | 'mission' {
  if (!stored?.trim()) return '';
  const s = stored.trim().toLowerCase();
  if (s === 'mission' || s.includes('mission')) return 'mission';
  if (s === 'normal' || s.includes('marocain') || s.includes('normal')) return 'normal';
  return '';
}

export function inferBacAnneeFromNiveau(niveau: string | null | undefined): string {
  const n = normalizeStudyLevelForForm(niveau);
  if (n === '1ère année Baccalauréat') return FIRST_BAC_SCHOOL_YEAR;
  if (n === '2ème année Baccalauréat') return CURRENT_BAC_SCHOOL_YEAR;
  return '';
}

export function resolveBacAnneeForAdminForm(sources: {
  bacAnnee?: string | null;
  niveau?: string | null;
  crmAnnee?: string | null;
}): string {
  for (const raw of [sources.bacAnnee, sources.crmAnnee]) {
    const canonical = matchCanonicalBacAnneeValue(raw);
    if (canonical && ANNEES_BAC_VALUES.includes(canonical as (typeof ANNEES_BAC_VALUES)[number])) {
      return canonical;
    }
    if (canonical === 'Autre') return 'Autre';
  }
  const inferred = inferBacAnneeFromNiveau(sources.niveau);
  if (inferred) return inferred;
  return matchCanonicalBacAnneeValue(sources.bacAnnee) || matchCanonicalBacAnneeValue(sources.crmAnnee);
}

/**
 * Aligné sur le tunnel boutique mobile (`isBacStudyProfileLevel`) et le setup compte.
 */
export function isBacStudyProfileLevel(niveau: string): boolean {
  const n = niveau.trim();
  if (!n) return false;
  if (/^BAC\+\s*\d/i.test(n)) return false;
  return n.includes('bac') || n.includes('Bac') || n.includes('Baccalauréat');
}
