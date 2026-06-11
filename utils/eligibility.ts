/**
 * Évaluation locale (côté client) de l'éligibilité d'un étudiant à une annonce
 * ou à une école, à partir des filières acceptées publiées (`filieresAcceptees`)
 * et de la filière du bac renseignée dans le profil (`filiere`).
 *
 * Règles métier :
 *  - Seule la **filière du bac** est prise en compte (spécialités mission, année
 *    du bac et type de bac sont ignorés).
 *  - Si l'école/annonce ne définit aucune filière acceptée ⇒ « unknown ».
 *  - Si l'utilisateur n'a pas renseigné sa filière ⇒ « profile_missing ».
 */

export type EligibilityVerdict =
  /** Au moins un critère défini ne correspond pas au profil. */
  | 'not_eligible'
  /** Tous les critères évaluables correspondent. */
  | 'eligible'
  /** Aucun critère défini par l'école/annonce. */
  | 'unknown'
  /** Critères définis mais profil incomplet (utilisateur n'a pas terminé son setup). */
  | 'profile_missing'
  /** Utilisateur non connecté ⇒ on n'affiche rien. */
  | 'no_user';

export type EligibilityCheck = {
  /**
   * Clé courte stable (utile pour i18n / tests).
   * - `filiere`              : critère « filière » du bac normal.
   * - `specialiteBacMission` : critère « spécialités » du bac mission.
   * - `anneeBac`             : critère « année scolaire » du bac.
   * - `bacTypeMismatch`      : l'école n'accepte que le type de bac opposé à
   *   celui de l'étudiant — non pas un critère réel mais un méta-signal pour
   *   l'UI ("cette annonce s'adresse aux Bac Mission/Normal").
   */
  key: 'filiere' | 'specialiteBacMission' | 'anneeBac' | 'bacTypeMismatch';
  /** Le critère est-il satisfait ? `null` si pas évaluable (info utilisateur manquante). */
  ok: boolean | null;
  /** Valeur(s) du profil prise(s) en compte (peut être une seule pour la filière/année, plusieurs pour les spécialités). */
  userValues: string[];
  /** Liste des valeurs acceptées par l'école/annonce. */
  acceptedValues: string[];
  /**
   * Pour `bacTypeMismatch` uniquement : le type de bac que l'école accepte.
   * Sert à choisir le libellé d'affichage ("destinée au Bac Normal" / "Mission").
   */
  acceptedBacType?: 'normal' | 'mission';
};

export type EligibilityResult = {
  verdict: EligibilityVerdict;
  /**
   * Détails par critère. Vide si `verdict` = 'unknown' / 'no_user'.
   * Ordre stable : filière → spécialité bac mission → année du bac.
   */
  checks: EligibilityCheck[];
};

export type EligibilityCriteria = {
  filieresAcceptees?: string[] | null;
  specialitesBacMissionAcceptees?: string[] | null;
  anneesBacAcceptees?: string[] | null;
};

export type EligibilityProfile = {
  /** 'normal' ou 'mission'. */
  bacType?: string | null;
  filiere?: string | null;
  specialite1?: string | null;
  specialite2?: string | null;
  specialite3?: string | null;
  bacAnnee?: string | null;
  /** Niveau d’études (ex. 2ème année Baccalauréat, BAC+1). */
  niveau?: string | null;
};

/**
 * Normalise une chaîne pour comparaison robuste : trim + lower + retire les
 * accents/espaces multiples (équivalent simple, sans Intl.Collator).
 */
function norm(v: string | null | undefined): string {
  if (v == null) return '';
  return String(v)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function intersects(userValues: string[], accepted: string[]): boolean {
  if (userValues.length === 0 || accepted.length === 0) return false;
  const set = new Set(accepted.map(norm));
  return userValues.some((v) => set.has(norm(v)));
}

function nonEmpty(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
}

/**
 * Évalue l'éligibilité d'un utilisateur (`profile`) face à des critères (`criteria`).
 * Si `profile` est `null`/`undefined`, le verdict est 'no_user' (pas affichable).
 */
/** Profil utilisable pour l'éligibilité filière (filière du bac renseignée). */
export function hasEligibilityFiliereProfile(
  profile: EligibilityProfile | null | undefined,
): boolean {
  return Boolean((profile?.filiere ?? '').trim());
}

export function evaluateEligibility(
  criteria: EligibilityCriteria,
  profile: EligibilityProfile | null | undefined,
): EligibilityResult {
  const filieres = nonEmpty(criteria.filieresAcceptees);
  if (filieres.length === 0) return { verdict: 'unknown', checks: [] };

  if (!profile) return { verdict: 'no_user', checks: [] };

  const userFiliere = (profile.filiere ?? '').trim();
  if (userFiliere === '') {
    return {
      verdict: 'profile_missing',
      checks: [{ key: 'filiere', ok: null, userValues: [], acceptedValues: filieres }],
    };
  }

  const ok = intersects([userFiliere], filieres);
  return {
    verdict: ok ? 'eligible' : 'not_eligible',
    checks: [
      {
        key: 'filiere',
        ok,
        userValues: [userFiliere],
        acceptedValues: filieres,
      },
    ],
  };
}

/**
 * Verdict filière pour les filtres listing (écoles sup, annonces, TASSJIL).
 * Compare uniquement `profile.filiere` aux `filieresAcceptees`.
 */
export type FiliereEligibilityVerdict = 'eligible' | 'not_eligible' | 'unknown';

export function evaluateEligibilityByFiliere(
  criteria: EligibilityCriteria,
  profile: EligibilityProfile | null | undefined,
): FiliereEligibilityVerdict {
  const filieres = nonEmpty(criteria.filieresAcceptees);
  if (filieres.length === 0) return 'unknown';
  if (!hasEligibilityFiliereProfile(profile)) return 'unknown';
  const userFiliere = (profile!.filiere ?? '').trim();
  return intersects([userFiliere], filieres) ? 'eligible' : 'not_eligible';
}

/** Critères annonce + repli établissement si l’annonce ne précise pas la filière / spécialités. */
export function mergeEligibilityCriteria(
  primary: EligibilityCriteria,
  fallback?: EligibilityCriteria | null,
): EligibilityCriteria {
  const filieresP = nonEmpty(primary.filieresAcceptees);
  const specsP = nonEmpty(primary.specialitesBacMissionAcceptees);
  const filieresF = nonEmpty(fallback?.filieresAcceptees);
  const specsF = nonEmpty(fallback?.specialitesBacMissionAcceptees);
  return {
    filieresAcceptees: filieresP.length > 0 ? filieresP : filieresF,
    specialitesBacMissionAcceptees: specsP.length > 0 ? specsP : specsF,
    anneesBacAcceptees: nonEmpty(primary.anneesBacAcceptees).length
      ? nonEmpty(primary.anneesBacAcceptees)
      : nonEmpty(fallback?.anneesBacAcceptees),
  };
}

export type AcceptedStudyPathFilter = {
  bacType: 'normal' | 'mission';
  value: string;
};

/**
 * Filtre listing : l’établissement / l’annonce accepte explicitement la filière
 * (bac marocain) ou la spécialité (bac Mission) choisie.
 */
export function matchesAcceptedStudyPathFilter(
  criteria: EligibilityCriteria,
  filter: AcceptedStudyPathFilter,
): boolean {
  const v = filter.value.trim();
  if (!v) return true;

  if (filter.bacType === 'normal') {
    const filieres = nonEmpty(criteria.filieresAcceptees);
    return filieres.length > 0 && intersects([v], filieres);
  }

  const specs = nonEmpty(criteria.specialitesBacMissionAcceptees);
  return specs.length > 0 && intersects([v], specs);
}
