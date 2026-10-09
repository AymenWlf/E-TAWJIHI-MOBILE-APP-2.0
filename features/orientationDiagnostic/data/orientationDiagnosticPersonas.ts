import { EMPTY_DIAGNOSTIC_PROFILE } from './orientationDiagnosticProfile';
import type { DiagnosticAnswers, Likert5 } from '../types/orientationDiagnosticPrototype';

export type DemoPersona = {
  id: string;
  title: string;
  codeHint: string;
  tagline: string;
  /** Couleur d’accent UI (charte) */
  accent: 'brand' | 'emerald' | 'cyan' | 'indigo' | 'slate';
  build: () => DiagnosticAnswers;
};

function emptyLocal(): DiagnosticAnswers {
  return {
    single: {},
    likert: {},
    situations: {},
    multi: {},
    sliders: {},
    cities: [],
    cityOther: [],
    labels: {},
    schoolMeta: {},
    versusPlan: [],
    profile: { ...EMPTY_DIAGNOSTIC_PROFILE, bacSpecialites: [] },
  };
}

function base(patch: {
  profile: DiagnosticAnswers['profile'];
  single: DiagnosticAnswers['single'];
  likert: Record<string, Likert5>;
  situations: DiagnosticAnswers['situations'];
  multi: DiagnosticAnswers['multi'];
  sliders: DiagnosticAnswers['sliders'];
  cities: string[];
  cityOther?: string[];
  labels?: Record<string, string>;
}): DiagnosticAnswers {
  const a = emptyLocal();
  a.profile = {
    ...EMPTY_DIAGNOSTIC_PROFILE,
    ...patch.profile,
    bacSpecialites: patch.profile.bacSpecialites ?? [],
  };
  a.single = { ...patch.single };
  a.likert = { ...patch.likert };
  a.situations = { ...patch.situations };
  a.multi = { ...patch.multi };
  a.sliders = { ...patch.sliders };
  a.cities = [...patch.cities];
  a.cityOther = [...(patch.cityOther ?? [])];
  a.labels = { ...(patch.labels ?? {}) };
  return a;
}

/** 1 — Investigateur / Entreprenant (tech & stratégie) */
function personaExplorateur(): DiagnosticAnswers {
  return base({
    profile: {
      ...EMPTY_DIAGNOSTIC_PROFILE,
      firstName: 'Sara',
      lastName: 'Benali',
      phoneNumber: '0612345678',
      city: 'Casablanca',
      studyLevel: '2ème année Baccalauréat en cours',
      bacType: 'marocain',
      bacFiliere: 'Sciences Math A',
      bacSpecialites: [],
      bacYear: '2026-2027',
      noteAvailability: 'estimation',
      noteGenerale1ereBac: '14.5',
      noteControleContinu: '15.0',
      noteNational: '13.8',
      noteGeneralePremiere: '',
      noteGeneraleTerminale: '',
      noteGeneraleBac: '',
    },
    single: {
      ctx_maturite: 'hesite',
      ctx_connaissance_metiers: '2',
      ctx_connaissance_formations: '2',
      fn_structure: 'b',
      fn_collectif: '3',
      fn_theorie: '4',
      fn_reflexion: '2',
      fn_leadership: '4',
      amb_priorite: 'apprentissage',
      amb_niveau_etudes: 'bac5',
      real_etranger: '3',
      real_budget: '30_60',
      car_salaire: '18_25',
    },
    likert: {
      r1: 3, r2: 3, r3: 2,
      i1: 5, i2: 5, i3: 4,
      a1: 3, a2: 4, a3: 3,
      s1: 4, s2: 4, s3: 3,
      e1: 4, e2: 4, e3: 4,
      c1: 3, c2: 3, c3: 2,
      fn_incertitude: 4,
      fn_contact: 3,
      amb_entreprise: 4,
      amb_etranger: 4,
      amb_confiance: 3,
    },
    situations: {
      sit_lycee: { most: 'I', least: 'R' },
      sit_app: { most: 'E', least: 'C' },
      sit_probleme: { most: 'I', least: 'A' },
      sit_asso: { most: 'E', least: 'R' },
      sit_libre: { most: 'I', least: 'C' },
      sit_mission: { most: 'I', least: 'R' },
    },
    multi: {
      amb_top3: ['apprentissage', 'progression', 'entrepreneuriat'],
      car_secteurs: ['sec_tech', 'sec_data', 'sec_conseil'],
      car_metiers: ['ing_ia', 'dev', 'product'],
      sch_types: ['public', 'prive'],
      sch_ecoles: ['ensias', 'um6p', 'emi'],
    },
    sliders: { fn_nouveaute: 80, dil_stabilite: 80, dil_passion: 50, dil_rythme: 80 },
    cities: ['casa', 'rabat'],
  });
}

/** 2 — Artistique / Créatif */
function personaCreateur(): DiagnosticAnswers {
  return base({
    profile: {
      ...EMPTY_DIAGNOSTIC_PROFILE,
      firstName: 'Yassine',
      lastName: 'El Amrani',
      phoneNumber: '0699887766',
      city: 'Rabat',
      studyLevel: '2ème année Baccalauréat terminé',
      bacType: 'mission',
      bacFiliere: '',
      bacSpecialites: ['Arts', 'HLP'],
      bacYear: '2024-2025',
      noteAvailability: 'disponible',
      noteGenerale1ereBac: '',
      noteControleContinu: '',
      noteNational: '',
      noteGeneralePremiere: '13.2',
      noteGeneraleTerminale: '14.0',
      noteGeneraleBac: '13.6',
    },
    single: {
      ctx_maturite: 'idee',
      ctx_connaissance_metiers: '1',
      ctx_connaissance_formations: '1',
      fn_structure: 'b',
      fn_collectif: '2',
      fn_theorie: '5',
      fn_reflexion: '4',
      fn_leadership: '3',
      amb_priorite: 'equilibre',
      amb_niveau_etudes: 'bac3',
      real_etranger: '4',
      real_budget: 'lt30',
      car_salaire: '12_18',
    },
    likert: {
      r1: 2, r2: 2, r3: 2,
      i1: 3, i2: 3, i3: 3,
      a1: 5, a2: 5, a3: 5,
      s1: 3, s2: 4, s3: 3,
      e1: 3, e2: 3, e3: 4,
      c1: 2, c2: 2, c3: 2,
      fn_incertitude: 5,
      fn_contact: 3,
      amb_entreprise: 4,
      amb_etranger: 5,
      amb_confiance: 3,
    },
    situations: {
      sit_lycee: { most: 'A', least: 'C' },
      sit_app: { most: 'A', least: 'R' },
      sit_probleme: { most: 'A', least: 'C' },
      sit_asso: { most: 'A', least: 'R' },
      sit_libre: { most: 'A', least: 'C' },
      sit_mission: { most: 'A', least: 'C' },
    },
    multi: {
      amb_top3: ['equilibre', 'apprentissage', 'international'],
      car_secteurs: ['sec_design', 'sec_mkt', 'sec_entre'],
      car_metiers: ['ux', 'mkt', 'founder'],
      sch_types: ['prive', 'semi_public'],
      sch_ecoles: ['emlyon', 'um6p', 'iscae'],
    },
    sliders: { fn_nouveaute: 80, dil_stabilite: 80, dil_passion: 20, dil_rythme: 50 },
    cities: ['rabat', 'casa', 'autres'],
    cityOther: ['Agadir', 'Meknès'],
  });
}

/** 3 — Réaliste / Technique */
function personaPraticien(): DiagnosticAnswers {
  return base({
    profile: {
      ...EMPTY_DIAGNOSTIC_PROFILE,
      firstName: 'Amine',
      lastName: 'Tazi',
      phoneNumber: '0622113344',
      city: 'Tanger',
      studyLevel: '2ème année Baccalauréat en cours',
      bacType: 'marocain',
      bacFiliere: 'Sciences et technologies électriques',
      bacSpecialites: [],
      bacYear: '2026-2027',
      noteAvailability: 'disponible',
      noteGenerale1ereBac: '13.0',
      noteControleContinu: '14.2',
      noteNational: '12.5',
      noteGeneralePremiere: '',
      noteGeneraleTerminale: '',
      noteGeneraleBac: '',
    },
    single: {
      ctx_maturite: 'exact',
      ctx_connaissance_metiers: '3',
      ctx_connaissance_formations: '2',
      fn_structure: 'a',
      fn_collectif: '2',
      fn_theorie: '5',
      fn_reflexion: '4',
      fn_leadership: '2',
      amb_priorite: 'stabilite',
      amb_niveau_etudes: 'bac3',
      real_etranger: '2',
      real_budget: 'public',
      car_salaire: '12_18',
    },
    likert: {
      r1: 5, r2: 5, r3: 5,
      i1: 4, i2: 4, i3: 3,
      a1: 2, a2: 2, a3: 2,
      s1: 2, s2: 3, s3: 2,
      e1: 2, e2: 3, e3: 2,
      c1: 4, c2: 4, c3: 4,
      fn_incertitude: 2,
      fn_contact: 2,
      amb_entreprise: 2,
      amb_etranger: 2,
      amb_confiance: 4,
    },
    situations: {
      sit_lycee: { most: 'R', least: 'A' },
      sit_app: { most: 'R', least: 'E' },
      sit_probleme: { most: 'R', least: 'A' },
      sit_asso: { most: 'R', least: 'E' },
      sit_libre: { most: 'R', least: 'A' },
      sit_mission: { most: 'R', least: 'E' },
    },
    multi: {
      amb_top3: ['stabilite', 'remuneration', 'apprentissage'],
      car_secteurs: ['sec_inge', 'sec_tech', 'sec_data'],
      car_metiers: ['inge_indus', 'dev', 'ing_ia'],
      sch_types: ['public', 'semi_public'],
      sch_ecoles: ['ensias', 'ensa', 'fst'],
    },
    sliders: { fn_nouveaute: 20, dil_stabilite: 20, dil_passion: 50, dil_rythme: 50 },
    cities: ['tanger', 'casa'],
  });
}

/** 4 — Social / Impact */
function personaFacilitateur(): DiagnosticAnswers {
  return base({
    profile: {
      ...EMPTY_DIAGNOSTIC_PROFILE,
      firstName: 'Imane',
      lastName: 'Cherkaoui',
      phoneNumber: '0677001122',
      city: 'Marrakech',
      studyLevel: '1ère année Baccalauréat',
      bacType: 'marocain',
      bacFiliere: 'SVT',
      bacSpecialites: [],
      bacYear: '2026-2027',
      noteAvailability: '',
      noteGenerale1ereBac: '',
      noteControleContinu: '',
      noteNational: '',
      noteGeneralePremiere: '',
      noteGeneraleTerminale: '',
      noteGeneraleBac: '',
    },
    single: {
      ctx_maturite: 'indecis',
      ctx_connaissance_metiers: '1',
      ctx_connaissance_formations: '0',
      fn_structure: 'a',
      fn_collectif: '5',
      fn_theorie: '3',
      fn_reflexion: '3',
      fn_leadership: '4',
      amb_priorite: 'impact',
      amb_niveau_etudes: 'bac5',
      real_etranger: '3',
      real_budget: 'nsp',
      car_salaire: '8_12',
    },
    likert: {
      r1: 2, r2: 2, r3: 2,
      i1: 3, i2: 3, i3: 4,
      a1: 3, a2: 3, a3: 3,
      s1: 5, s2: 5, s3: 5,
      e1: 3, e2: 4, e3: 3,
      c1: 3, c2: 2, c3: 3,
      fn_incertitude: 3,
      fn_contact: 5,
      amb_entreprise: 2,
      amb_etranger: 3,
      amb_confiance: 2,
    },
    situations: {
      sit_lycee: { most: 'S', least: 'R' },
      sit_app: { most: 'S', least: 'R' },
      sit_probleme: { most: 'S', least: 'R' },
      sit_asso: { most: 'S', least: 'C' },
      sit_libre: { most: 'S', least: 'R' },
      sit_mission: { most: 'S', least: 'R' },
    },
    multi: {
      amb_top3: ['impact', 'apprentissage', 'equilibre'],
      car_secteurs: ['sec_sante', 'sec_edu', 'sec_conseil'],
      car_metiers: ['med', 'enseignant', 'consultant'],
      sch_types: ['public', 'militaire'],
      sch_ecoles: ['medecine', 'fsjes', 'cpge'],
    },
    sliders: { fn_nouveaute: 50, dil_stabilite: 50, dil_passion: 20, dil_rythme: 50 },
    cities: ['marrakech', 'peuimporte'],
  });
}

/** 5 — Conventionnel / Finance & organisation */
function personaOrganisateur(): DiagnosticAnswers {
  return base({
    profile: {
      ...EMPTY_DIAGNOSTIC_PROFILE,
      firstName: 'Nadia',
      lastName: 'Alaoui',
      phoneNumber: '0655443322',
      city: 'Fès',
      studyLevel: 'BAC+1',
      bacType: 'marocain',
      bacFiliere: 'Sciences économique',
      bacSpecialites: [],
      bacYear: '2023-2024',
      noteAvailability: 'disponible',
      noteGenerale1ereBac: '15.2',
      noteControleContinu: '16.0',
      noteNational: '14.8',
      noteGeneralePremiere: '',
      noteGeneraleTerminale: '',
      noteGeneraleBac: '',
    },
    single: {
      ctx_maturite: 'hesite',
      ctx_connaissance_metiers: '3',
      ctx_connaissance_formations: '3',
      fn_structure: 'a',
      fn_collectif: '3',
      fn_theorie: '2',
      fn_reflexion: '2',
      fn_leadership: '4',
      amb_priorite: 'remuneration',
      amb_niveau_etudes: 'bac5',
      real_etranger: '4',
      real_budget: '60_100',
      car_salaire: 'gt25',
    },
    likert: {
      r1: 2, r2: 3, r3: 2,
      i1: 4, i2: 4, i3: 3,
      a1: 2, a2: 2, a3: 2,
      s1: 3, s2: 3, s3: 3,
      e1: 4, e2: 4, e3: 4,
      c1: 5, c2: 5, c3: 5,
      fn_incertitude: 2,
      fn_contact: 3,
      amb_entreprise: 3,
      amb_etranger: 4,
      amb_confiance: 4,
    },
    situations: {
      sit_lycee: { most: 'C', least: 'A' },
      sit_app: { most: 'C', least: 'A' },
      sit_probleme: { most: 'C', least: 'A' },
      sit_asso: { most: 'C', least: 'R' },
      sit_libre: { most: 'C', least: 'A' },
      sit_mission: { most: 'C', least: 'A' },
    },
    multi: {
      amb_top3: ['remuneration', 'stabilite', 'progression'],
      car_secteurs: ['sec_finance', 'sec_conseil', 'sec_data'],
      car_metiers: ['finance_ana', 'consultant', 'product'],
      sch_types: ['prive', 'semi_public'],
      sch_ecoles: ['iscae', 'emlyon', 'hec_m'],
    },
    sliders: { fn_nouveaute: 20, dil_stabilite: 20, dil_passion: 80, dil_rythme: 50 },
    cities: ['fes', 'rabat', 'casa'],
  });
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'explorateur',
    title: 'L’Explorateur Stratège',
    codeHint: 'I · E · S',
    tagline: 'Analyse, projets tech, ambitions Bac+5 — Sara, 2ème Bac SMA.',
    accent: 'brand',
    build: personaExplorateur,
  },
  {
    id: 'createur',
    title: 'Le Créateur Libre',
    codeHint: 'A · E · S',
    tagline: 'Design & expression, mission française Arts/HLP — Yassine.',
    accent: 'indigo',
    build: personaCreateur,
  },
  {
    id: 'praticien',
    title: 'Le Praticien Concret',
    codeHint: 'R · I · C',
    tagline: 'Terrain & technique, bac techno, budget public — Amine.',
    accent: 'emerald',
    build: personaPraticien,
  },
  {
    id: 'facilitateur',
    title: 'Le Facilitateur Engagé',
    codeHint: 'S · E · I',
    tagline: 'Impact humain, 1ère Bac SVT, encore indécise — Imane.',
    accent: 'cyan',
    build: personaFacilitateur,
  },
  {
    id: 'organisateur',
    title: 'L’Organisateur Fiable',
    codeHint: 'C · E · I',
    tagline: 'Finance & structure, Bac+1 éco, stabilité — Nadia.',
    accent: 'slate',
    build: personaOrganisateur,
  },
];

export function getPersonaById(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}
