/**
 * Données personnelles / scolaires / académiques du diagnostic.
 * Filières & année du bac : mêmes sources que le setup compte
 * (`academicSetup` + `filiereFormOptionsForNiveau` + `anneesBacFormOptionsForSetup`).
 */

import { sanitizeFiliereForNiveau } from '@/utils/academicFiliere';
import { ANNEES_BAC_VALUES, SPECIALITES_MISSION } from '../constants/academicSetup';
import { isFiliere1BacId } from '../constants/orientation1bacFilieres';
import { resolveFiliereDisplayLabel } from '../utils/academicFiliere';

export type DiagnosticProfile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  cityId: string;
  studyLevel: string;
  bacType: string;
  bacFiliere: string;
  bacSpecialites: string[];
  bacYear: string;
  noteAvailability: string;
  /** Notes Bac Marocain (réelles ou estimation selon noteAvailability) */
  noteGenerale1ereBac: string;
  noteControleContinu: string;
  noteNational: string;
  /** Notes Bac Mission */
  noteGeneralePremiere: string;
  noteGeneraleTerminale: string;
  noteGeneraleBac: string;
};

export const EMPTY_DIAGNOSTIC_PROFILE: DiagnosticProfile = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  city: '',
  cityId: '',
  studyLevel: '',
  bacType: '',
  bacFiliere: '',
  bacSpecialites: [],
  bacYear: '',
  noteAvailability: '',
  noteGenerale1ereBac: '',
  noteControleContinu: '',
  noteNational: '',
  noteGeneralePremiere: '',
  noteGeneraleTerminale: '',
  noteGeneraleBac: '',
};

export const STUDY_LEVELS = [
  { value: '1ère année Baccalauréat', label: '1ère année Baccalauréat' },
  { value: '2ème année Baccalauréat en cours', label: '2ème année Baccalauréat (en cours)' },
  { value: '2ème année Baccalauréat terminé', label: '2ème année Baccalauréat (bac obtenu)' },
  { value: 'Bachelier', label: 'Bachelier (années antérieures)' },
  { value: 'BAC+1', label: 'BAC+1' },
  { value: 'BAC+2', label: 'BAC+2' },
  { value: 'BAC+3', label: 'BAC+3' },
  { value: 'BAC+4', label: 'BAC+4' },
  { value: 'BAC+5', label: 'BAC+5' },
  { value: 'BAC+6', label: 'BAC+6' },
  { value: 'BAC+8', label: 'BAC+8 (Doctorat)' },
] as const;

export const BAC_TYPES = [
  { value: 'marocain', label: 'Baccalauréat Marocain' },
  { value: 'mission', label: 'Baccalauréat Mission Française' },
] as const;

/** @deprecated Utiliser `filiereFormOptionsForNiveau` (setup compte). */
export const BAC_MAROCAIN_FILIERES = [
  'Sciences Math A',
  'Sciences Math B',
  'Sciences Physique',
  'SVT',
  'Sciences et technologies électriques',
  'Sciences et technologies mécaniques',
  'Sciences économique',
  'Sciences gestion comptable',
  'Sciences agronomiques',
  'Lettres',
  'Sciences humaines',
  'Sciences de la chariaa',
  'Arts Appliqués',
  'Autre',
] as const;

/** Spécialités Mission — mêmes ids que le setup compte (`SPECIALITES_MISSION`). */
export const BAC_MISSION_SPECIALITES = SPECIALITES_MISSION;

/** Années du bac — générées comme le setup compte (`ANNEES_BAC_VALUES`). */
export const ANNEE_BAC = ANNEES_BAC_VALUES;

export type AccountOrientationPrefill = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  studyLevel?: string | null;
  bacType?: string | null;
  filiere?: string | null;
};

function mapAccountBacType(raw: string | null | undefined): string {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'mission') return 'mission';
  if (value === 'marocain' || value === 'normal' || value === 'maroc') return 'marocain';
  return '';
}

/** Complète les champs vides du test avec le compte connecté, sans écraser une saisie. */
export function withAccountOrientationPrefill(
  profile: DiagnosticProfile | null | undefined,
  account: AccountOrientationPrefill,
): DiagnosticProfile {
  const current: DiagnosticProfile = {
    ...EMPTY_DIAGNOSTIC_PROFILE,
    ...(profile ?? {}),
    bacSpecialites: profile?.bacSpecialites ?? [],
  };
  const firstName = current.firstName.trim() ? current.firstName : (account.firstName ?? '').trim();
  const lastName = current.lastName.trim() ? current.lastName : (account.lastName ?? '').trim();
  const phoneNumber = current.phoneNumber.trim() ? current.phoneNumber : (account.phone ?? '').trim();
  let studyLevel = current.studyLevel.trim() ? current.studyLevel : '';
  let bacType = current.bacType.trim() ? current.bacType : '';
  let bacFiliere = current.bacFiliere.trim() ? current.bacFiliere : '';

  const accountLevel = (account.studyLevel ?? '').trim();
  if (!studyLevel && accountLevel && STUDY_LEVELS.some((level) => level.value === accountLevel)) {
    studyLevel = accountLevel;
  }
  const accountBac = mapAccountBacType(account.bacType);
  if (!bacType && accountBac) bacType = accountBac;

  const accountFiliere = (account.filiere ?? '').trim();
  if (!bacFiliere && accountFiliere) {
    const sanitized = studyLevel
      ? sanitizeFiliereForNiveau(studyLevel, accountFiliere)
      : accountFiliere;
    bacFiliere = sanitized || accountFiliere;
    if (!bacType) bacType = 'marocain';
  }

  if (
    firstName === current.firstName &&
    lastName === current.lastName &&
    phoneNumber === current.phoneNumber &&
    studyLevel === current.studyLevel &&
    bacType === current.bacType &&
    bacFiliere === current.bacFiliere &&
    profile
  ) {
    return profile.bacSpecialites ? profile : current;
  }

  return {
    ...current,
    firstName,
    lastName,
    phoneNumber,
    studyLevel,
    bacType,
    bacFiliere,
  };
}

export function isBacStudyLevel(level: string): boolean {
  return (
    level.includes('Baccalauréat') ||
    level === 'Bachelier'
  );
}

export function needsNotes(level: string): boolean {
  return (
    level === '2ème année Baccalauréat en cours' ||
    level === '2ème année Baccalauréat terminé' ||
    level === 'Bachelier'
  );
}

/** Mappe le niveau ancien test → id simplifié moteur (ctx_niveau). */
export function mapStudyLevelToCtx(level: string): string {
  if (level === '1ère année Baccalauréat') return '1bac';
  if (level.includes('2ème année') || level === 'Bachelier') {
    return level.includes('terminé') || level === 'Bachelier' ? 'bac' : '2bac';
  }
  if (level === 'BAC+1' || level === 'BAC+2') return 'bac12';
  if (['BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'BAC+8'].includes(level)) return 'bac3p';
  return '2bac';
}

export function mapFiliereToCtx(bacType: string, filiere: string, specialites: string[]): string {
  if (bacType !== 'mission' && isFiliere1BacId(filiere)) {
    if (filiere === '1bac_sc_math') return 'sm';
    if (filiere === '1bac_sc_exp') return 'svt';
    if (filiere === '1bac_sc_eco_gestion') return 'eco';
    if (filiere === '1bac_lettres_sc_hum') return 'lettres';
    if (filiere === '1bac_ste' || filiere === '1bac_stm') return 'tech';
    return 'autre';
  }
  const display = bacType === 'mission' ? specialites.join(' ') : resolveFiliereDisplayLabel(filiere) || filiere;
  const src = display.toLowerCase();
  if (src.includes('math')) return 'sm';
  if (src.includes('svt') || src.includes('physique') || src.includes('vie') || src.includes('expériment')) {
    return 'svt';
  }
  if (src.includes('éco') || src.includes('eco') || src.includes('gestion') || src.includes('ses')) return 'eco';
  if (src.includes('lettre') || src.includes('humain') || src.includes('hlp') || src.includes('llce')) {
    return 'lettres';
  }
  if (src.includes('tech') || src.includes('nsi') || src.includes('élect') || src.includes('mécan')) {
    return 'tech';
  }
  return 'autre';
}

/** Libellé filière pour le rapport (ids `1bac_*` → libellé FR). */
export function formatProfileBacFiliereLabel(filiere: string): string {
  return resolveFiliereDisplayLabel(filiere) || filiere || '—';
}

export function validateProfileIdentity(p: DiagnosticProfile): string | null {
  if (!p.firstName.trim() || !p.lastName.trim()) return 'Indique ton prénom et ton nom.';
  if (!p.city.trim() && !p.cityId) return 'Indique ta ville.';
  return null;
}

export function validateProfileSchool(p: DiagnosticProfile): string | null {
  if (!p.studyLevel) return 'Sélectionne ton niveau d’études.';
  if (isBacStudyLevel(p.studyLevel)) {
    if (!p.bacType) return 'Sélectionne le type de baccalauréat.';
    if (p.bacType === 'marocain' && !p.bacFiliere) return 'Sélectionne ta filière.';
    if (p.bacType === 'mission' && p.bacSpecialites.length === 0) {
      return 'Sélectionne au moins une spécialité.';
    }
    if (!p.bacYear) return 'Sélectionne l’année du bac.';
  }
  return null;
}

function hasNote(value: string | undefined): boolean {
  return Boolean(value && value.trim());
}

export function validateProfileGrades(p: DiagnosticProfile): string | null {
  if (!needsNotes(p.studyLevel)) return null;
  if (!p.noteAvailability) return 'Indique si tes notes sont disponibles ou estimées.';
  if (p.bacType === 'marocain') {
    const definitive = p.noteAvailability === 'real' || p.noteAvailability === 'disponible';
    if (definitive && !hasNote(p.noteGenerale1ereBac)) {
      return 'Renseigne ta note définitive.';
    }
  }
  if (p.bacType === 'mission') {
    if (!p.noteGeneralePremiere || !p.noteGeneraleTerminale) {
      return 'Renseigne au minimum Première et Terminale.';
    }
  }
  return null;
}

export function maxMissionSpecialites(studyLevel: string): number {
  return studyLevel === '1ère année Baccalauréat' ? 3 : 2;
}
