import type { TassjilSchool } from '@/types/tassjilSchoolChoices';
import {
  evaluateEligibilityByFiliere,
  type EligibilityProfile,
} from '@/utils/eligibility';

function resolveEstablishmentId(school: TassjilSchool): number {
  const raw = school.etablissementId ?? school.schoolId;
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function hasTassjilSchoolActivity(school: TassjilSchool): boolean {
  const inscription = (school.statut_inscription ?? '').trim();
  const suivi = (school.statut_suivi ?? '').trim();
  return inscription !== '' || suivi !== '';
}

/** Éligible à l'affichage : critères filière/spécialités OK ou établissement sans critère. */
export function isTassjilSchoolEligible(
  school: TassjilSchool,
  profile: EligibilityProfile | null | undefined,
): boolean {
  const filieres = school.filieresAcceptees ?? [];
  const specialites = school.specialitesBacMissionAcceptees ?? [];
  const hasCriteria = filieres.length > 0 || specialites.length > 0;

  if (!hasCriteria) {
    return true;
  }

  const verdict = evaluateEligibilityByFiliere(
    {
      filieresAcceptees: filieres,
      specialitesBacMissionAcceptees: specialites,
    },
    profile,
  );

  return verdict !== 'not_eligible';
}

function mergeSchoolRows(primary: TassjilSchool, secondary: TassjilSchool): TassjilSchool {
  const statutInscription =
    (primary.statut_inscription ?? '').trim() ||
    (secondary.statut_inscription ?? '').trim() ||
    null;
  const statutSuivi =
    (primary.statut_suivi ?? '').trim() || (secondary.statut_suivi ?? '').trim() || null;

  return {
    ...secondary,
    ...primary,
    isSelected: primary.isSelected || secondary.isSelected,
    statut_inscription: statutInscription,
    statut_suivi: statutSuivi,
    filieresAcceptees: primary.filieresAcceptees?.length
      ? primary.filieresAcceptees
      : secondary.filieresAcceptees,
    specialitesBacMissionAcceptees: primary.specialitesBacMissionAcceptees?.length
      ? primary.specialitesBacMissionAcceptees
      : secondary.specialitesBacMissionAcceptees,
  };
}

/**
 * Fusionne panier sélectionné + écoles disponibles (dédoublonnage par établissement).
 */
export function mergeAllTassjilSchools(
  selected: TassjilSchool[],
  available: TassjilSchool[] | undefined,
): TassjilSchool[] {
  const byId = new Map<number, TassjilSchool>();

  for (const school of selected) {
    const eid = resolveEstablishmentId(school);
    if (eid > 0) {
      byId.set(eid, school);
    }
  }

  for (const school of available ?? []) {
    const eid = resolveEstablishmentId(school);
    if (eid <= 0) {
      continue;
    }
    const existing = byId.get(eid);
    if (existing) {
      byId.set(eid, mergeSchoolRows(existing, school));
    } else {
      byId.set(eid, school);
    }
  }

  return Array.from(byId.values());
}

/** @deprecated Utiliser mergeAllTassjilSchools + filtre éligibilité côté UI. */
export function mergeTassjilDisplaySchools(
  selected: TassjilSchool[],
  available: TassjilSchool[] | undefined,
  profile?: EligibilityProfile | null,
): TassjilSchool[] {
  const all = mergeAllTassjilSchools(selected, available);
  if (!profile) {
    return all;
  }
  return all.filter((school) => isTassjilSchoolEligible(school, profile));
}

export function filterTassjilSchoolsByEligibility(
  schools: TassjilSchool[],
  eligibleOnly: boolean,
  profile: EligibilityProfile | null | undefined,
): TassjilSchool[] {
  if (!eligibleOnly) {
    return schools;
  }
  return schools.filter((school) => isTassjilSchoolEligible(school, profile));
}
