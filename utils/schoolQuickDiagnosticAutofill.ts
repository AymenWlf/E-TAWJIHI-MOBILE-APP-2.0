import {
  normalizeSchoolQuickDiagnosticDraft,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';
import type { UserProfile } from '@/services/userProfile';

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Remplit uniquement les champs encore vides (profil compte → test orientation → ancien diagnostic).
 */
export function mergeSchoolQuickDiagnosticFillEmpty(
  base: SchoolQuickDiagnosticForm,
  ...patches: Array<Partial<SchoolQuickDiagnosticForm>>
): SchoolQuickDiagnosticForm {
  let out: SchoolQuickDiagnosticForm = { ...base };
  let changed = false;
  for (const p of patches) {
    for (const key of Object.keys(p) as (keyof SchoolQuickDiagnosticForm)[]) {
      const next = p[key];
      if (next === undefined) continue;
      const cur = out[key];

      if (Array.isArray(next)) {
        const c = cur as unknown[];
        if ((!c || c.length === 0) && next.length > 0) {
          out = { ...out, [key]: next } as SchoolQuickDiagnosticForm;
          changed = true;
        }
        continue;
      }

      if (typeof next === 'boolean') {
        if (next === true && cur === false) {
          out = { ...out, [key]: true } as SchoolQuickDiagnosticForm;
          changed = true;
        }
        continue;
      }

      if (typeof next === 'string') {
        if (isEmptyString(cur) && !isEmptyString(next)) {
          out = { ...out, [key]: next } as SchoolQuickDiagnosticForm;
          changed = true;
        }
      }
    }
  }
  return changed ? out : base;
}

export function buildAutofillPatchFromProfile(profile: UserProfile): Partial<SchoolQuickDiagnosticForm> {
  const o: Partial<SchoolQuickDiagnosticForm> = {};

  if (str(profile.prenom)) o.firstName = str(profile.prenom);
  if (str(profile.nom)) o.lastName = str(profile.nom);
  if (str(profile.telephone)) o.phone = str(profile.telephone);

  if (profile.ville?.id != null && Number.isFinite(Number(profile.ville.id))) {
    o.cityId = String(Math.trunc(Number(profile.ville.id)));
  }
  if (str(profile.ville?.titre)) o.city = str(profile.ville.titre);

  const g = str(profile.genre).toLowerCase();
  if (g.includes('femme') || g === 'f') o.gender = 'femme';
  else if (g.includes('homme') || g === 'm' || g === 'h') o.gender = 'homme';

  if (str(profile.niveau)) o.studyLevel = str(profile.niveau);

  const bt = str(profile.bacType).toLowerCase();
  if (bt === 'mission') o.bacType = 'mission';
  else if (bt === 'normal' || bt === 'national') o.bacType = 'normal';

  if (str(profile.filiere)) o.bacStream = str(profile.filiere);

  const tly = str(profile.typeLycee).toLowerCase();
  if (tly === 'public') o.lyceePublicPrive = 'Public';
  else if (tly === 'prive' || tly === 'privé') o.lyceePublicPrive = 'Privé';

  if (str(profile.specialite1)) o.missionSpecialite1 = str(profile.specialite1);
  if (str(profile.specialite2)) o.missionSpecialite2 = str(profile.specialite2);
  if (str(profile.specialite3)) o.missionSpecialite3 = str(profile.specialite3);

  if (str(profile.massarCode)) o.massarCode = str(profile.massarCode);
  if (str(profile.studentCode)) o.studentCode = str(profile.studentCode);

  const ut = str(profile.userType).toLowerCase();
  if (ut === 'student' || ut === 'eleve' || ut === 'élève') o.profileRole = 'student';
  else if (ut === 'tutor' || ut === 'parent' || ut === 'tuteur') o.profileRole = 'tutor';

  const te = profile.typeEcolePrefere;
  if (Array.isArray(te)) {
    if (te.some((x) => str(x).toLowerCase().includes('public'))) o.prefPublic = true;
    if (te.some((x) => str(x).toLowerCase().includes('priv'))) o.prefPrivate = true;
    if (te.some((x) => str(x).toLowerCase().includes('semi'))) o.prefSemiPublic = true;
    if (te.some((x) => str(x).toLowerCase().includes('milit'))) o.prefMilitary = true;
  }

  const langs = profile.langueEtudes;
  if (Array.isArray(langs) && langs.length > 0) {
    const allowed = new Set([
      'french',
      'arabic',
      'english',
      'bilingual_fr_en',
      'mixed_ar_fr',
      'no_preference',
    ]);
    const mapped = langs
      .map((x) => str(x).toLowerCase())
      .map((x) => {
        if (x === 'français' || x === 'francais' || x === 'french') return 'french';
        if (x === 'arabe' || x === 'arabic') return 'arabic';
        if (x === 'anglais' || x === 'english') return 'english';
        return x;
      })
      .filter((x) => allowed.has(x));
    if (mapped.length > 0) {
      o.acceptedHigherEdLanguages = [...new Set(mapped)];
    }
  }

  return o;
}

/** Champs issus de /api/me (AuthUser). */
export function buildAutofillPatchFromAuthUser(user: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}): Partial<SchoolQuickDiagnosticForm> {
  const o: Partial<SchoolQuickDiagnosticForm> = {};
  if (str(user.firstName)) o.firstName = str(user.firstName);
  if (str(user.lastName)) o.lastName = str(user.lastName);
  if (str(user.phone)) o.phone = str(user.phone);
  if (!o.profileRole) o.profileRole = 'student';
  return o;
}

export function schoolDiagnosticPayloadToFormPatch(
  payload: Record<string, unknown>,
): Partial<SchoolQuickDiagnosticForm> {
  return normalizeSchoolQuickDiagnosticDraft(payload);
}
