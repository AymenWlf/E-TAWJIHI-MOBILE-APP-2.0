/** Catalogue prototype — secteurs, métiers, écoles pour les modules choix & versus. */

export type CatalogSector = {
  id: string;
  label: string;
  familyId: string;
};

export type CatalogMetier = {
  id: string;
  label: string;
  familyId: string;
  salaryHint: string;
};

export type CatalogEcole = {
  id: string;
  label: string;
  city: string;
  type: 'publique' | 'privee' | 'cpge' | 'business' | 'ingenieur';
};

export const CATALOG_SECTORS: CatalogSector[] = [
  { id: 'sec_tech', label: 'Tech & numérique', familyId: 'tech' },
  { id: 'sec_inge', label: 'Ingénierie & industrie', familyId: 'inge' },
  { id: 'sec_data', label: 'Data & analyse', familyId: 'data' },
  { id: 'sec_conseil', label: 'Conseil & stratégie', familyId: 'conseil' },
  { id: 'sec_finance', label: 'Finance & gestion', familyId: 'finance' },
  { id: 'sec_mkt', label: 'Marketing & communication', familyId: 'marketing' },
  { id: 'sec_design', label: 'Design & création', familyId: 'design' },
  { id: 'sec_sante', label: 'Santé & soin', familyId: 'sante' },
  { id: 'sec_edu', label: 'Éducation & formation', familyId: 'edu' },
  { id: 'sec_entre', label: 'Entrepreneuriat', familyId: 'entre' },
];

export const CATALOG_METIERS: CatalogMetier[] = [
  { id: 'ing_ia', label: 'Ingénieur IA / Data', familyId: 'tech', salaryHint: '18–35k DH' },
  { id: 'dev', label: 'Développeur logiciel', familyId: 'tech', salaryHint: '12–28k DH' },
  { id: 'data_sci', label: 'Data scientist', familyId: 'data', salaryHint: '16–32k DH' },
  { id: 'product', label: 'Product Manager', familyId: 'conseil', salaryHint: '15–30k DH' },
  { id: 'consultant', label: 'Consultant stratégie', familyId: 'conseil', salaryHint: '14–30k DH' },
  { id: 'inge_indus', label: 'Ingénieur industriel', familyId: 'inge', salaryHint: '12–25k DH' },
  { id: 'finance_ana', label: 'Analyste financier', familyId: 'finance', salaryHint: '12–26k DH' },
  { id: 'mkt', label: 'Responsable marketing', familyId: 'marketing', salaryHint: '10–22k DH' },
  { id: 'ux', label: 'Designer UX / UI', familyId: 'design', salaryHint: '10–22k DH' },
  { id: 'founder', label: 'Entrepreneur / fondateur', familyId: 'entre', salaryHint: 'Variable' },
  { id: 'med', label: 'Métiers de la santé', familyId: 'sante', salaryHint: 'Selon spécialité' },
  { id: 'enseignant', label: 'Enseignant / formateur', familyId: 'edu', salaryHint: '8–18k DH' },
];

export const CATALOG_ECOLES: CatalogEcole[] = [
  { id: 'ensias', label: 'ENSIAS', city: 'Rabat', type: 'ingenieur' },
  { id: 'emi', label: 'EMI', city: 'Rabat', type: 'ingenieur' },
  { id: 'insa', label: 'INSA Euro-Méditerranée', city: 'Fès', type: 'ingenieur' },
  { id: 'um6p', label: 'UM6P', city: 'Benguerir', type: 'privee' },
  { id: 'emlyon', label: 'emlyon Business School', city: 'Casablanca', type: 'business' },
  { id: 'hec_m', label: 'HEC Maroc / équivalent business', city: 'Casablanca', type: 'business' },
  { id: 'fsjes', label: 'FSJES (université publique)', city: 'Multi-villes', type: 'publique' },
  { id: 'fst', label: 'FST (sciences & tech)', city: 'Multi-villes', type: 'publique' },
  { id: 'cpge', label: 'CPGE (classes prépas)', city: 'Multi-villes', type: 'cpge' },
  { id: 'medecine', label: 'Faculté de Médecine', city: 'Multi-villes', type: 'publique' },
  { id: 'ensa', label: 'ENSA', city: 'Multi-villes', type: 'ingenieur' },
  { id: 'iscae', label: 'ISCAE', city: 'Casablanca', type: 'business' },
];

export const SALARY_OPTIONS = [
  { id: 'lt8', label: 'Moins de 8.000 DH / mois en début de carrière' },
  { id: '8_12', label: '8.000 – 12.000 DH / mois' },
  { id: '12_18', label: '12.000 – 18.000 DH / mois' },
  { id: '18_25', label: '18.000 – 25.000 DH / mois' },
  { id: 'gt25', label: 'Plus de 25.000 DH / mois' },
  { id: 'nsp', label: 'Je ne sais pas encore — je veux surtout un métier qui me plaît' },
] as const;

export function metierLabel(id: string): string {
  return CATALOG_METIERS.find((m) => m.id === id)?.label ?? id;
}

export function ecoleLabel(id: string): string {
  return CATALOG_ECOLES.find((e) => e.id === id)?.label ?? id;
}

export function sectorLabel(id: string): string {
  return CATALOG_SECTORS.find((s) => s.id === id)?.label ?? id;
}

export function salaryLabel(id: string): string {
  return SALARY_OPTIONS.find((s) => s.id === id)?.label ?? id;
}
