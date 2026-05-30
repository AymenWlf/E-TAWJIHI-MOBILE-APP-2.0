/**
 * Évaluation locale (côté client) de l'éligibilité d'un étudiant à une annonce
 * ou à une école, à partir des critères publiés (`filieresAcceptees`,
 * `specialitesBacMissionAcceptees`, `anneesBacAcceptees`) et du profil utilisateur
 * (`bacType`, `filiere`, `specialite1/2/3`, `bacAnnee`).
 *
 * Règles métier :
 *  - Si l'école/annonce ne définit AUCUN critère ⇒ statut « unknown » (ouvert à tous,
 *    on ne se prononce pas).
 *  - Si l'utilisateur n'a pas (encore) renseigné les infos correspondantes
 *    ⇒ statut « profileMissing ».
 *  - Sinon on calcule chaque critère présent (filière OU spécialité OU année).
 *    L'éligibilité globale est `true` UNIQUEMENT si l'utilisateur passe TOUS les
 *    critères évaluables. Un critère défini mais non couvert par le profil bloque.
 *  - **Cohérence Bac Normal vs Bac Mission** : selon le type de bac de
 *    l'utilisateur, on n'évalue (et on n'affiche) que le critère pertinent :
 *      • `bacType === 'normal'`  ⇒ uniquement le critère « filière », on ignore
 *        complètement les spécialités du bac mission (si l'école définit les 2,
 *        c'est la filière qui prime pour cet étudiant).
 *      • `bacType === 'mission'` ⇒ uniquement le critère « spécialités »,
 *        on ignore les filières du bac normal.
 *      • `bacType` non défini ⇒ on garde les 2 critères (l'étudiant verra un
 *        statut « profil incomplet » l'invitant à renseigner son type de bac).
 *
 * On ne fait PAS d'inférence sur les combinaisons bac mission (mode simple « OU »
 * uniquement, conformément à la décision produit).
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
export function evaluateEligibility(
  criteria: EligibilityCriteria,
  profile: EligibilityProfile | null | undefined,
): EligibilityResult {
  const filieres = nonEmpty(criteria.filieresAcceptees);
  const specialites = nonEmpty(criteria.specialitesBacMissionAcceptees);
  const annees = nonEmpty(criteria.anneesBacAcceptees);

  const hasAnyCriteria = filieres.length > 0 || specialites.length > 0 || annees.length > 0;
  if (!hasAnyCriteria) return { verdict: 'unknown', checks: [] };

  if (!profile) return { verdict: 'no_user', checks: [] };

  const bacType = norm(profile.bacType);
  const userFiliere = (profile.filiere ?? '').trim();
  const userSpecialites = [profile.specialite1, profile.specialite2, profile.specialite3]
    .map((s) => (s ?? '').trim())
    .filter((s) => s !== '');
  const userAnnee = (profile.bacAnnee ?? '').trim();

  const checks: EligibilityCheck[] = [];

  /**
   * Détermine quels critères "type de bac" sont pertinents pour l'utilisateur.
   * - bac normal  → filières uniquement (on ignore les spécialités).
   * - bac mission → spécialités uniquement (on ignore les filières).
   * - non renseigné → on garde les 2 critères (afficher "profil incomplet").
   */
  const evaluateFiliere = bacType !== 'mission';
  const evaluateSpecialite = bacType !== 'normal';

  // Filière (Bac Normal)
  if (filieres.length > 0 && evaluateFiliere) {
    if (bacType !== 'normal' || userFiliere === '') {
      checks.push({ key: 'filiere', ok: null, userValues: [], acceptedValues: filieres });
    } else {
      checks.push({
        key: 'filiere',
        ok: intersects([userFiliere], filieres),
        userValues: [userFiliere],
        acceptedValues: filieres,
      });
    }
  }

  // Spécialités Bac Mission (mode OU simple)
  if (specialites.length > 0 && evaluateSpecialite) {
    if (bacType !== 'mission' || userSpecialites.length === 0) {
      checks.push({
        key: 'specialiteBacMission',
        ok: null,
        userValues: [],
        acceptedValues: specialites,
      });
    } else {
      checks.push({
        key: 'specialiteBacMission',
        ok: intersects(userSpecialites, specialites),
        userValues: userSpecialites,
        acceptedValues: specialites,
      });
    }
  }

  /**
   * Cas particulier — l'école n'accepte QUE le type de bac opposé à celui de
   * l'utilisateur (ex. spécialités définies, pas de filières, étudiant en bac
   * normal). On ajoute un méta-check `bacTypeMismatch` pour signaler clairement
   * « cette annonce s'adresse aux Bac Mission/Normal » plutôt qu'un faux check
   * filière/spécialité.
   */
  if (bacType === 'normal' && filieres.length === 0 && specialites.length > 0) {
    checks.push({
      key: 'bacTypeMismatch',
      ok: false,
      userValues: [],
      acceptedValues: [],
      acceptedBacType: 'mission',
    });
  } else if (bacType === 'mission' && specialites.length === 0 && filieres.length > 0) {
    checks.push({
      key: 'bacTypeMismatch',
      ok: false,
      userValues: [],
      acceptedValues: [],
      acceptedBacType: 'normal',
    });
  }

  // Année du bac
  if (annees.length > 0) {
    if (userAnnee === '') {
      checks.push({ key: 'anneeBac', ok: null, userValues: [], acceptedValues: annees });
    } else {
      checks.push({
        key: 'anneeBac',
        ok: intersects([userAnnee], annees),
        userValues: [userAnnee],
        acceptedValues: annees,
      });
    }
  }

  // Si tous les critères sont non évaluables (profil incomplet) → profile_missing
  const evaluable = checks.filter((c) => c.ok !== null);
  if (evaluable.length === 0) {
    return { verdict: 'profile_missing', checks };
  }

  // Si AU MOINS un critère évaluable est faux → not_eligible.
  // Si AU MOINS un critère reste non évaluable mais les autres passent →
  // on reste 'profile_missing' (l'utilisateur peut compléter pour confirmer).
  const anyKo = evaluable.some((c) => c.ok === false);
  if (anyKo) return { verdict: 'not_eligible', checks };

  const anyMissing = checks.some((c) => c.ok === null);
  if (anyMissing) return { verdict: 'profile_missing', checks };

  return { verdict: 'eligible', checks };
}

/**
 * Variante simplifiée d'`evaluateEligibility` qui n'évalue **que** les
 * critères liés à la filière du Bac (filière Bac Normal + spécialités Bac
 * Mission), en ignorant volontairement le critère « année du bac ».
 *
 * Utilité : sur les listings où l'utilisateur applique un filtre rapide
 * « éligible / non éligible » (ex. liste écoles), on ne veut pas exclure
 * une école juste parce que l'année scolaire renseignée n'apparaît pas
 * dans les années acceptées (souvent un détail administratif et pas un
 * critère d'orientation).
 *
 * Retourne :
 *   - `'eligible'`     : tous les critères filière/spécialités pertinents
 *     pour le type de bac de l'utilisateur sont satisfaits.
 *   - `'not_eligible'` : au moins un critère évaluable échoue, ou le
 *     type de bac de l'utilisateur ne correspond pas aux critères
 *     proposés.
 *   - `'unknown'`      : pas de critère défini OU profil incomplet OU
 *     utilisateur non connecté → on ne peut pas trancher.
 */
export type FiliereEligibilityVerdict = 'eligible' | 'not_eligible' | 'unknown';

export function evaluateEligibilityByFiliere(
  criteria: EligibilityCriteria,
  profile: EligibilityProfile | null | undefined,
): FiliereEligibilityVerdict {
  const filieres = nonEmpty(criteria.filieresAcceptees);
  const specialites = nonEmpty(criteria.specialitesBacMissionAcceptees);

  // Aucun critère filière/spécialité défini ⇒ on ne se prononce pas.
  if (filieres.length === 0 && specialites.length === 0) return 'unknown';

  // Pas d'utilisateur ⇒ pas de verdict possible (même comportement que
  // `evaluateEligibility` qui retourne `no_user`).
  if (!profile) return 'unknown';

  const bacType = norm(profile.bacType);
  const userFiliere = (profile.filiere ?? '').trim();
  const userSpecialites = [profile.specialite1, profile.specialite2, profile.specialite3]
    .map((s) => (s ?? '').trim())
    .filter((s) => s !== '');

  // Bac normal : on regarde la filière. Si l'école n'accepte que des
  // spécialités Mission, c'est un mismatch (non éligible).
  if (bacType === 'normal') {
    if (filieres.length === 0) return 'not_eligible';
    if (userFiliere === '') return 'unknown';
    return intersects([userFiliere], filieres) ? 'eligible' : 'not_eligible';
  }

  // Bac mission : symétrique — on regarde les spécialités.
  if (bacType === 'mission') {
    if (specialites.length === 0) return 'not_eligible';
    if (userSpecialites.length === 0) return 'unknown';
    return intersects(userSpecialites, specialites) ? 'eligible' : 'not_eligible';
  }

  // Type de bac non renseigné : on ne peut pas trancher.
  return 'unknown';
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
