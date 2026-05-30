export type Orientation1BacTrackId =
  | '2bac_sc_math_a'
  | '2bac_sc_math_b'
  | '2bac_sc_phys'
  | '2bac_svt'
  | '2bac_sc_agro'
  | '2bac_sc_eco'
  | '2bac_gestion_comptable'
  | '2bac_lettres'
  | '2bac_sc_humaines'
  | '2bac_ste'
  | '2bac_stm';

export type Orientation1BacCurrentId =
  | '1bac_sc_math'
  | '1bac_sc_exp'
  | '1bac_sc_eco_gestion'
  | '1bac_lettres_sc_hum'
  | '1bac_ste'
  | '1bac_stm';

export type Orientation1BacFeasibilityBand =
  | 'recommended'
  | 'possible'
  | 'possible_under_conditions'
  | 'difficult'
  | 'very_difficult_rare'
  | 'strong_reorientation'
  | 'discouraged';

export type Orientation1BacRules = {
  version: 1;
  updatedAt: string;
  /** Matrice doc §9 : faisabilité administrative/pédagogique (sans prendre en compte les notes). */
  matrix: Record<
    Orientation1BacCurrentId,
    Partial<Record<Orientation1BacTrackId, { band: Orientation1BacFeasibilityBand }>>
  >;
};

/**
 * Règles de passerelles 1BAC → 2BAC, dérivées du document
 * `docs/Contexte orientation 1erebac.md` (§9 Matrice complète).
 */
export const ORIENTATION_1BAC_RULES: Orientation1BacRules = {
  version: 1,
  updatedAt: '2026-05-28',
  matrix: {
    // 1BAC Sciences Mathématiques
    '1bac_sc_math': {
      '2bac_sc_math_a': { band: 'recommended' },
      '2bac_sc_math_b': { band: 'recommended' },
      '2bac_sc_phys': { band: 'possible' },
      '2bac_svt': { band: 'possible_under_conditions' },
      '2bac_sc_eco': { band: 'strong_reorientation' },
      '2bac_gestion_comptable': { band: 'strong_reorientation' },
      '2bac_lettres': { band: 'strong_reorientation' },
      '2bac_sc_humaines': { band: 'strong_reorientation' },
    },

    // 1BAC Sciences Expérimentales
    '1bac_sc_exp': {
      '2bac_sc_phys': { band: 'recommended' },
      '2bac_svt': { band: 'recommended' },
      '2bac_sc_agro': { band: 'recommended' },
      '2bac_sc_math_a': { band: 'possible_under_conditions' },
      '2bac_sc_math_b': { band: 'possible_under_conditions' },
      '2bac_sc_eco': { band: 'possible' },
      '2bac_gestion_comptable': { band: 'possible' },
      '2bac_lettres': { band: 'possible' },
      '2bac_sc_humaines': { band: 'possible' },
    },

    // 1BAC Sciences Économiques et Gestion
    '1bac_sc_eco_gestion': {
      '2bac_sc_eco': { band: 'recommended' },
      '2bac_gestion_comptable': { band: 'recommended' },
      '2bac_lettres': { band: 'possible' },
      '2bac_sc_humaines': { band: 'possible' },
      '2bac_sc_phys': { band: 'very_difficult_rare' },
      '2bac_svt': { band: 'very_difficult_rare' },
      '2bac_sc_math_a': { band: 'very_difficult_rare' },
      '2bac_sc_math_b': { band: 'very_difficult_rare' },
      // Doc dit « sciences et technologies » très difficiles (générique)
      '2bac_ste': { band: 'very_difficult_rare' },
      '2bac_stm': { band: 'very_difficult_rare' },
    },

    // 1BAC Lettres et Sciences Humaines
    '1bac_lettres_sc_hum': {
      '2bac_lettres': { band: 'recommended' },
      '2bac_sc_humaines': { band: 'recommended' },
      '2bac_sc_eco': { band: 'possible_under_conditions' },
      '2bac_gestion_comptable': { band: 'difficult' },
      '2bac_sc_phys': { band: 'very_difficult_rare' },
      '2bac_svt': { band: 'very_difficult_rare' },
      // Doc dit « sciences mathématiques » très difficile (sans A/B)
      '2bac_sc_math_a': { band: 'very_difficult_rare' },
      '2bac_sc_math_b': { band: 'very_difficult_rare' },
      // Doc dit « sciences et technologies » très difficiles
      '2bac_ste': { band: 'very_difficult_rare' },
      '2bac_stm': { band: 'very_difficult_rare' },
    },

    // 1BAC Sciences et Technologies Électriques
    '1bac_ste': {
      '2bac_ste': { band: 'recommended' },
      '2bac_sc_phys': { band: 'possible_under_conditions' },
      '2bac_stm': { band: 'possible_under_conditions' },
      '2bac_sc_math_b': { band: 'very_difficult_rare' },
      '2bac_sc_eco': { band: 'strong_reorientation' },
      '2bac_gestion_comptable': { band: 'strong_reorientation' },
      '2bac_lettres': { band: 'strong_reorientation' },
      '2bac_sc_humaines': { band: 'strong_reorientation' },
    },

    // 1BAC Sciences et Technologies Mécaniques
    '1bac_stm': {
      '2bac_stm': { band: 'recommended' },
      '2bac_sc_phys': { band: 'possible_under_conditions' },
      '2bac_ste': { band: 'possible_under_conditions' },
      '2bac_sc_math_b': { band: 'very_difficult_rare' },
      '2bac_sc_eco': { band: 'strong_reorientation' },
      '2bac_gestion_comptable': { band: 'strong_reorientation' },
      '2bac_lettres': { band: 'strong_reorientation' },
      '2bac_sc_humaines': { band: 'strong_reorientation' },
    },
  },
};

