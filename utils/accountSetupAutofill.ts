import type { AccountSetupPayload } from '@/services/accountSetup';
import type { UserProfile } from '@/services/userProfile';
import type { CityRow } from '@/services/referenceData';
import { SPECIALITES_MISSION } from '@/constants/academicSetup';
import { normalizeFiliereForSetupForm, sanitizeFiliereForNiveau } from '@/utils/academicFiliere';
import {
  matchCanonicalBacAnneeValue,
  normalizeBacTypeForForm,
  normalizeStudyLevelForForm,
  resolveBacAnneeForAdminForm,
} from '@/utils/academicProfileLevels';
import { sanitizeMoroccoMobileInput } from '@/utils/moroccoMobilePhone';

export type OldClientSetupSource = Record<string, unknown>;

function isEmptyString(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null && v !== '' ? String(v).trim() : '';
}

function crmPickStr(crm: OldClientSetupSource | null | undefined, keys: string[]): string {
  if (!crm) return '';
  for (const k of keys) {
    const v = crm[k];
    if (v != null && String(v).trim() !== '' && String(v).trim() !== '-') return String(v).trim();
  }
  return '';
}

function crmPickBool(crm: OldClientSetupSource | null | undefined, keys: string[]): boolean {
  if (!crm) return false;
  for (const k of keys) {
    const v = crm[k];
    if (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true') return true;
  }
  return false;
}

/** Email généré automatiquement à la création compte (sync admin) — ne pas préremplir. */
export function isSyntheticEtawEmail(email: string): boolean {
  return /^[\d+]+@e-tawjihi\.ma$/i.test(email.trim());
}

function pickEmail(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const e = str(c);
    if (e && !isSyntheticEtawEmail(e)) return e;
  }
  return '';
}

function normalizeGenre(raw: string): string {
  const g = raw.toLowerCase();
  if (g.includes('femme') || g === 'f') return 'Femme';
  if (g.includes('homme') || g === 'm' || g === 'h') return 'Homme';
  if (raw === 'Homme' || raw === 'Femme') return raw;
  return '';
}

function normalizeTypeLycee(raw: string): AccountSetupPayload['typeLycee'] {
  const t = raw.toLowerCase();
  if (t === 'public' || t.includes('publi')) return 'public';
  if (t === 'prive' || t === 'privé' || t.includes('priv')) return 'prive';
  return '';
}

function normalizeDateNaissance(raw: string): string {
  const s = str(raw);
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})\b/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return s;
}

function normalizeSpecialiteMission(raw: string): string {
  const v = str(raw);
  if (!v) return '';
  const exact = SPECIALITES_MISSION.find((s) => s === v);
  if (exact) return exact;
  const lower = v.toLowerCase();
  const fuzzy = SPECIALITES_MISSION.find(
    (s) => s.toLowerCase() === lower || lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower),
  );
  return fuzzy ?? v;
}

function resolveNiveauFromSources(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const canonical = normalizeStudyLevelForForm(c);
    if (canonical) return canonical;
  }
  return '';
}

function resolveCityId(profile: UserProfile, cities: CityRow[]): string {
  if (profile.ville?.id != null && Number.isFinite(Number(profile.ville.id))) {
    return String(Math.trunc(Number(profile.ville.id)));
  }
  const titre = str(profile.ville?.titre);
  if (!titre || cities.length === 0) return '';
  const low = titre.toLowerCase();
  const exact = cities.find(
    (c) => (c.titre ?? '').localeCompare(titre, 'fr', { sensitivity: 'base' }) === 0,
  );
  if (exact) return String(exact.id);
  const partial = cities.find((c) => {
    const t = (c.titre ?? '').trim().toLowerCase();
    return t.includes(low) || low.includes(t);
  });
  return partial ? String(partial.id) : '';
}

function resolveCityIdFromCrm(crm: OldClientSetupSource, cities: CityRow[]): string {
  const idPick = crmPickStr(crm, ['villeId', 'ville_id', 'idVille']);
  if (/^\d+$/.test(idPick)) return idPick;
  const titre = crmPickStr(crm, ['ville']);
  if (!titre || cities.length === 0) return '';
  const low = titre.toLowerCase();
  const exact = cities.find(
    (c) => (c.titre ?? '').localeCompare(titre, 'fr', { sensitivity: 'base' }) === 0,
  );
  if (exact) return String(exact.id);
  const partial = cities.find((c) => {
    const t = (c.titre ?? '').trim().toLowerCase();
    return t.includes(low) || low.includes(t);
  });
  return partial ? String(partial.id) : '';
}

/** Extrait nom / prénom / email depuis la réponse `/api/me` (formats variés). */
export function buildAccountSetupPatchFromAuthUser(input: {
  firstName?: string | null;
  lastName?: string | null;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
}): Partial<AccountSetupPayload> {
  const patch: Partial<AccountSetupPayload> = {};
  const prenom = str(input.prenom ?? input.firstName);
  const nom = str(input.nom ?? input.lastName);
  const email = pickEmail(input.email);
  if (prenom) patch.prenom = prenom;
  if (nom) patch.nom = nom;
  if (email) patch.email = email;
  return patch;
}

/** Ville uniquement — utile quand la liste des villes arrive après le profil / CRM. */
export function buildVillePatchFromProfile(
  profile: UserProfile,
  cities: CityRow[],
): Partial<AccountSetupPayload> {
  const villeId = resolveCityId(profile, cities);
  return villeId ? { ville: villeId } : {};
}

export function buildVillePatchFromOldClient(
  crm: OldClientSetupSource,
  cities: CityRow[],
): Partial<AccountSetupPayload> {
  const villeId = resolveCityIdFromCrm(crm, cities);
  return villeId ? { ville: villeId } : {};
}

/**
 * Fusionne des patches dans le formulaire setup en ne remplissant que les champs vides.
 */
export function mergeAccountSetupFillEmpty(
  base: AccountSetupPayload,
  ...patches: Array<Partial<AccountSetupPayload>>
): AccountSetupPayload {
  let out: AccountSetupPayload = { ...base };

  for (const patch of patches) {
    for (const key of Object.keys(patch) as (keyof AccountSetupPayload)[]) {
      const next = patch[key];
      if (next === undefined) continue;
      const cur = out[key];

      if (Array.isArray(next)) {
        const c = cur as unknown[];
        if ((!c || c.length === 0) && next.length > 0) {
          out = { ...out, [key]: [...next] as AccountSetupPayload[typeof key] };
        }
        continue;
      }

      if (typeof next === 'boolean') {
        if (next === true && cur === false) {
          out = { ...out, [key]: true };
        }
        continue;
      }

      if (typeof next === 'string') {
        if (isEmptyString(cur) && !isEmptyString(next)) {
          out = { ...out, [key]: next };
        }
      }
    }
  }

  return { ...out };
}

/** Préremplit depuis GET /api/user/profile (backend Dev2). userType volontairement exclu (choix utilisateur). */
export function buildAccountSetupPatchFromProfile(
  profile: UserProfile,
  cities: CityRow[],
): Partial<AccountSetupPayload> {
  const patch: Partial<AccountSetupPayload> = {};

  if (str(profile.prenom)) patch.prenom = str(profile.prenom);
  if (str(profile.nom)) patch.nom = str(profile.nom);

  const email = pickEmail(profile.email);
  if (email) patch.email = email;

  const dateNaissance = normalizeDateNaissance(str(profile.dateNaissance));
  if (dateNaissance) patch.dateNaissance = dateNaissance;

  const genre = normalizeGenre(str(profile.genre));
  if (genre) patch.genre = genre;

  const villeId = resolveCityId(profile, cities);
  if (villeId) patch.ville = villeId;

  const niveau = resolveNiveauFromSources(profile.niveau);
  if (niveau) patch.niveau = niveau;

  const bacType = normalizeBacTypeForForm(profile.bacType);
  if (bacType) patch.bacType = bacType;

  const filiereRaw = str(profile.filiere);
  if (filiereRaw) {
    patch.filiere = normalizeFiliereForSetupForm(filiereRaw, niveau);
  }

  const bacAnnee = resolveBacAnneeForAdminForm({
    bacAnnee: profile.bacAnnee,
    niveau: niveau || profile.niveau,
  });
  if (bacAnnee) patch.bacAnnee = matchCanonicalBacAnneeValue(bacAnnee) || bacAnnee;

  const s1 = normalizeSpecialiteMission(str(profile.specialite1));
  const s2 = normalizeSpecialiteMission(str(profile.specialite2));
  const s3 = normalizeSpecialiteMission(str(profile.specialite3));
  if (s1) patch.specialite1 = s1;
  if (s2) patch.specialite2 = s2;
  if (s3) patch.specialite3 = s3;

  if (str(profile.diplomeEnCours)) patch.diplomeEnCours = str(profile.diplomeEnCours);
  if (str(profile.nomEtablissement)) patch.nomEtablissement = str(profile.nomEtablissement);

  const typeLycee = normalizeTypeLycee(str(profile.typeLycee));
  if (typeLycee) patch.typeLycee = typeLycee;

  if (Array.isArray(profile.typeEcolePrefere) && profile.typeEcolePrefere.length > 0) {
    patch.typeEcolePrefere = profile.typeEcolePrefere.map((x) => str(x)).filter(Boolean);
  }
  if (Array.isArray(profile.servicesPrefere) && profile.servicesPrefere.length > 0) {
    patch.servicesPrefere = profile.servicesPrefere.map((x) => str(x)).filter(Boolean);
  }

  if (str(profile.tuteur)) patch.tuteur = str(profile.tuteur);
  if (str(profile.nomTuteur)) patch.nomTuteur = str(profile.nomTuteur);
  if (str(profile.prenomTuteur)) patch.prenomTuteur = str(profile.prenomTuteur);
  const telTuteur = sanitizeMoroccoMobileInput(str(profile.telTuteur));
  if (telTuteur) patch.telTuteur = telTuteur;
  if (str(profile.professionTuteur)) patch.professionTuteur = str(profile.professionTuteur);
  if (str(profile.adresseTuteur)) patch.adresseTuteur = str(profile.adresseTuteur);

  if (profile.consentContact === true) patch.consentContact = true;

  if (patch.filiere && patch.niveau) {
    patch.filiere = sanitizeFiliereForNiveau(patch.niveau, patch.filiere);
  }

  return patch;
}

/** Préremplit depuis GET /api/user/old-client (CRM legacy). */
export function buildAccountSetupPatchFromOldClient(
  crm: OldClientSetupSource,
  cities: CityRow[],
): Partial<AccountSetupPayload> {
  const patch: Partial<AccountSetupPayload> = {};

  if (str(crm.prenom)) patch.prenom = str(crm.prenom);
  if (str(crm.nom)) patch.nom = str(crm.nom);
  const email = pickEmail(crmPickStr(crm, ['email']));
  if (email) patch.email = email;

  const genre = normalizeGenre(crmPickStr(crm, ['genre', 'sexe']));
  if (genre) patch.genre = genre;

  const dateNaissance = normalizeDateNaissance(
    crmPickStr(crm, ['dateNaissance', 'date_naissance', 'naissance']),
  );
  if (dateNaissance) patch.dateNaissance = dateNaissance;

  const villeId = resolveCityIdFromCrm(crm, cities);
  if (villeId) patch.ville = villeId;

  const niveau = resolveNiveauFromSources(
    crmPickStr(crm, ['niveau', 'niveauEtude', 'niveau_etude', 'cycle']),
    crmPickStr(crm, ['niveauBac']),
    crmPickStr(crm, ['currentLevel']),
  );
  if (niveau) patch.niveau = niveau;

  const isMission = crmPickBool(crm, ['is_bac_mission', 'isBacMission', 'bacMission']);
  const bacTypeRaw = crmPickStr(crm, ['bacType', 'typeBac', 'type_bac']).toLowerCase();
  if (isMission || bacTypeRaw === 'mission') {
    patch.bacType = 'mission';
  } else if (bacTypeRaw === 'normal' || bacTypeRaw.includes('maroc')) {
    patch.bacType = 'normal';
  } else if (niveau && !isMission) {
    patch.bacType = 'normal';
  }

  const bacAnnee = resolveBacAnneeForAdminForm({
    bacAnnee: crmPickStr(crm, ['bacAnnee']),
    crmAnnee: crmPickStr(crm, ['anneeBac', 'annee_scolaire_bac', 'anneeScolaireBac']),
    niveau,
  });
  if (bacAnnee) patch.bacAnnee = matchCanonicalBacAnneeValue(bacAnnee) || bacAnnee;

  const filiereRaw = crmPickStr(crm, ['filiere']);
  if (filiereRaw) {
    patch.filiere = normalizeFiliereForSetupForm(filiereRaw, niveau);
  }

  const s1 = normalizeSpecialiteMission(
    crmPickStr(crm, ['specialite1', 'specialite_1', 'filiere_mission_un', 'filiereMissionUn']),
  );
  const s2 = normalizeSpecialiteMission(
    crmPickStr(crm, ['specialite2', 'specialite_2', 'filiere_mission_deux', 'filiereMissionDeux']),
  );
  const s3 = normalizeSpecialiteMission(
    crmPickStr(crm, ['specialite3', 'specialite_3', 'filiere_mission_trois', 'filiereMissionTrois']),
  );
  if (s1) patch.specialite1 = s1;
  if (s2) patch.specialite2 = s2;
  if (s3) patch.specialite3 = s3;

  const nomEtab = crmPickStr(crm, ['nomEtablissement', 'nom_etablissement', 'currentInstitution', 'etablissement']);
  if (nomEtab) patch.nomEtablissement = nomEtab;

  const diplome = crmPickStr(crm, ['diplomeEnCours', 'currentSpecialization', 'currentDegree']);
  if (diplome) patch.diplomeEnCours = diplome;

  const telTuteur = sanitizeMoroccoMobileInput(crmPickStr(crm, ['numeroTuteur', 'numero_tuteur', 'telTuteur']));
  if (telTuteur) patch.telTuteur = telTuteur;

  if (patch.filiere && patch.niveau) {
    patch.filiere = sanitizeFiliereForNiveau(patch.niveau, patch.filiere);
  }

  return patch;
}
