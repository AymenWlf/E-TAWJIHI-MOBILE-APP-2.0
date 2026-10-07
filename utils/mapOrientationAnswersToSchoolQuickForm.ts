/**
 * Mappe les réponses du diagnostic d’orientation (nouveau test)
 * vers le payload API des recommandations d’écoles (ex-questionnaire 7 étapes).
 */

import {
  defaultSchoolQuickDiagnosticForm,
  TARGET_LEVEL_MASTER_INGENIEUR_ID,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';
import type { DiagnosticAnswers } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import { answersToSchoolMatchPayload } from '@/features/orientationDiagnostic/utils/orientationDiagnosticSchoolReco';
import { resolveFiliereDisplayLabel } from '@/features/orientationDiagnostic/utils/academicFiliere';
import type { CityRow } from '@/services/referenceData';

function normalizeLabel(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function mapStudyLevel(level: string): string {
  if (level === '2ème année Baccalauréat en cours' || level === '2ème année Baccalauréat terminé') {
    return '2ème année Baccalauréat';
  }
  return level;
}

function mapTargetStudyLevelIds(niveau?: string): string[] {
  switch (niveau) {
    case 'bac2':
      return ['dip_prof_2'];
    case 'bac3':
      return ['licence_3'];
    case 'bac5':
    case 'bac8':
      return [TARGET_LEVEL_MASTER_INGENIEUR_ID];
    default:
      return [];
  }
}

function notesAreDefinitive(noteAvailability: string): boolean {
  return noteAvailability === 'real' || noteAvailability === 'disponible';
}

function resolvePreferredStudyCityIds(
  preferredCityNames: string[],
  cities: CityRow[],
): string[] {
  if (!preferredCityNames.length || !cities.length) return [];
  const byNorm = new Map<string, string>();
  for (const c of cities) {
    const title = typeof c.titre === 'string' ? c.titre.trim() : '';
    if (!title || c.id == null) continue;
    byNorm.set(normalizeLabel(title), String(c.id));
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const name of preferredCityNames) {
    const id = byNorm.get(normalizeLabel(name));
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function resolveCityIdAndLabel(
  profile: DiagnosticAnswers['profile'],
  cities: CityRow[],
): { cityId: string; city: string } {
  const idRaw = String(profile.cityId || '').trim();
  if (idRaw && /^\d+$/.test(idRaw)) {
    const match = cities.find((c) => String(c.id) === idRaw);
    return {
      cityId: idRaw,
      city: match?.titre?.trim() || profile.city.trim() || '',
    };
  }
  const label = profile.city.trim();
  if (label) {
    const norm = normalizeLabel(label);
    const match = cities.find((c) => normalizeLabel(c.titre || '') === norm);
    if (match) {
      return { cityId: String(match.id), city: match.titre.trim() };
    }
  }
  return { cityId: idRaw, city: label };
}

function applyFillEmptyPatch(
  form: SchoolQuickDiagnosticForm,
  patch: Partial<SchoolQuickDiagnosticForm>,
): SchoolQuickDiagnosticForm {
  let out = form;
  for (const key of Object.keys(patch) as (keyof SchoolQuickDiagnosticForm)[]) {
    const next = patch[key];
    if (next === undefined) continue;
    const cur = out[key];
    if (Array.isArray(next)) {
      if ((!cur || (cur as unknown[]).length === 0) && next.length > 0) {
        out = { ...out, [key]: next } as SchoolQuickDiagnosticForm;
      }
      continue;
    }
    if (typeof next === 'boolean') {
      if (next === true && cur === false) {
        out = { ...out, [key]: true } as SchoolQuickDiagnosticForm;
      }
      continue;
    }
    if (typeof next === 'string' && (!cur || (typeof cur === 'string' && !cur.trim())) && next.trim()) {
      out = { ...out, [key]: next } as SchoolQuickDiagnosticForm;
    }
  }
  return out;
}

/**
 * Construit un `SchoolQuickDiagnosticForm` à partir des réponses du nouveau diagnostic d’orientation.
 * Les champs absents du nouveau test restent aux défauts (ou sont complétés via `fillEmptyPatch`).
 */
export function mapOrientationAnswersToSchoolQuickForm(
  answers: DiagnosticAnswers,
  options?: {
    cities?: CityRow[];
    /** Complète uniquement les champs encore vides (profil compte, etc.). */
    fillEmptyPatch?: Partial<SchoolQuickDiagnosticForm>;
  },
): SchoolQuickDiagnosticForm {
  const cities = options?.cities ?? [];
  const match = answersToSchoolMatchPayload(answers);
  const p = answers.profile;
  const { cityId, city } = resolveCityIdAndLabel(p, cities);
  const preferredStudyCityIds =
    match.studyCityScope === 'specific'
      ? resolvePreferredStudyCityIds(match.preferredCityNames, cities)
      : [];

  const attractedSectors = match.attractedSectors.filter((id) => /^\d+$/.test(id));
  const definitive = notesAreDefinitive(p.noteAvailability);
  const bacType = match.bacType === 'mission' || match.bacType === 'normal' ? match.bacType : '';

  let noteBacFinaleSur20 = '';
  let bacGradeReceived: '' | 'yes' | 'no' = '';
  if (bacType === 'normal' && p.noteNational.trim()) {
    bacGradeReceived = definitive ? 'yes' : 'no';
    if (definitive) noteBacFinaleSur20 = p.noteNational.trim();
  } else if (bacType === 'mission' && p.noteGeneraleBac.trim()) {
    bacGradeReceived = definitive ? 'yes' : 'no';
    if (definitive) noteBacFinaleSur20 = p.noteGeneraleBac.trim();
  }

  let form: SchoolQuickDiagnosticForm = {
    ...defaultSchoolQuickDiagnosticForm(),
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    profileRole: 'student',
    phone: p.phoneNumber.trim(),
    cityId,
    city,
    studyCityScope: match.studyCityScope === 'specific' ? 'specific' : 'any',
    preferredStudyCityIds,
    studyLevel: mapStudyLevel(p.studyLevel),
    bacType,
    lyceePublicPrive: bacType === 'normal' ? 'Public' : '',
    bacStream:
      bacType === 'normal' ? resolveFiliereDisplayLabel(p.bacFiliere) || p.bacFiliere || '' : '',
    missionSpecialite1: match.missionSpecialite1,
    missionSpecialite2: match.missionSpecialite2,
    missionSpecialite3: match.missionSpecialite3,

    noteGeneralePremiereBacSur20: bacType === 'normal' ? p.noteGenerale1ereBac.trim() : '',
    regionalGradeReceived:
      bacType === 'normal' && p.noteGenerale1ereBac.trim() ? (definitive ? 'yes' : 'no') : '',
    noteGeneraleSemestre1SecondBacSur20: bacType === 'normal' ? p.noteControleContinu.trim() : '',
    semestre1BacGradeReceived:
      bacType === 'normal' && p.noteControleContinu.trim() ? (definitive ? 'yes' : 'no') : '',
    noteBacFinaleSur20,
    bacGradeReceived,
    previsionnelBacNationalMinSur20:
      bacType === 'normal' && !definitive ? p.noteNational.trim() : '',
    previsionnelBacNationalMaxSur20:
      bacType === 'normal' && !definitive ? p.noteNational.trim() : '',

    noteMissionPremiereSur20: bacType === 'mission' ? p.noteGeneralePremiere.trim() : '',
    premiereMissionGradeReceived:
      bacType === 'mission' && p.noteGeneralePremiere.trim() ? (definitive ? 'yes' : 'no') : '',
    noteMissionSemestre1TerminaleSur20: bacType === 'mission' ? p.noteGeneraleTerminale.trim() : '',
    semestre1MissionGradeReceived:
      bacType === 'mission' && p.noteGeneraleTerminale.trim() ? (definitive ? 'yes' : 'no') : '',
    previsionnelBacMissionMinSur20:
      bacType === 'mission' && !definitive
        ? (p.noteGeneraleBac || p.noteGeneraleTerminale).trim()
        : '',
    previsionnelBacMissionMaxSur20:
      bacType === 'mission' && !definitive
        ? (p.noteGeneraleBac || p.noteGeneraleTerminale).trim()
        : '',

    prefPublic: match.prefPublic,
    prefPrivate: match.prefPrivate,
    prefSemiPublic: match.prefSemiPublic,
    prefMilitary: match.prefMilitary,
    privateMonthlyBudgetBracket: match.privateMonthlyBudgetBracket,
    considersContests:
      match.considersContests === 'yes' || match.considersContests === 'no'
        ? match.considersContests
        : match.considersContests === 'unsure'
          ? 'maybe'
          : '',
    willingOtherCity:
      match.studyCityScope === 'any' ? 'yes' : preferredStudyCityIds.length ? 'depends' : '',
    targetStudyLevelIds: mapTargetStudyLevelIds(answers.single.amb_niveau_etudes),
    ingenieurMasterPathPreference:
      answers.single.amb_niveau_etudes === 'bac5' || answers.single.amb_niveau_etudes === 'bac8'
        ? 'unsure'
        : '',
    diplomesSouhaites: match.diplomesSouhaites,
    attractedSectors,
    excludedSectors: [],
    freeComment: 'Généré automatiquement depuis le diagnostic d’orientation.',
    consentProcessing: true,
  };

  if (options?.fillEmptyPatch) {
    form = applyFillEmptyPatch(form, options.fillEmptyPatch);
  }

  if (!form.prefPublic && !form.prefPrivate && !form.prefSemiPublic && !form.prefMilitary) {
    form = { ...form, prefPublic: true, prefPrivate: true };
  }

  return form;
}
