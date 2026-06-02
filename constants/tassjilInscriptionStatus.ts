import type { TassjilSchool, TassjilSchoolRegistrationStatus } from '@/types/tassjilSchoolChoices';

type StatutInscriptionValue = string;

export const STATUT_CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  refus: { bg: '#fee2e2', text: '#b91c1c' },
  annule: { bg: '#fecaca', text: '#991b1b' },
  ecole_fermee: { bg: '#fee2e2', text: '#b91c1c' },
  en_attente: { bg: '#dbeafe', text: '#1d4ed8' },
  en_cours_dossier: { bg: '#fef3c7', text: '#b45309' },
  inscrit_admis: { bg: '#d1fae5', text: '#047857' },
  default: { bg: '#f3f4f6', text: '#6b7280' },
};

export const STATUT_LABELS: Record<string, string> = {
  preselectionne: 'Préselectionné',
  selectionne: 'Sélectionné',
  ne_veux_pas: 'Ne veux pas',
  eligible: 'Eligible',
  non_eligible: 'Non éligible',
  annule_par_etudiant: "Annulé par l'étudiant",
  annule_par_etawjihi: 'Annulé par E-TAWJIHI',
  annule_manque_documents: 'Annulé pour manque de documents',
  pas_de_reponse_apres_relances: 'Pas de réponse (Après relances)',
  en_cours: 'En cours',
  attente_informations: "Attente d'informations",
  attente_versement: 'En attente du versement',
  attente_paiement_seule: 'En attente de paiement (seule)',
  attente_paiement_etawjihi: 'En attente de paiement (E-Tawjihi)',
  inscrit: 'Inscrit',
  rate_concours: 'Raté le concours',
  non_selectionne: 'Non sélectionné',
  liste_attente: "Liste d'attente",
  en_cours_depot_dossier: 'En cours de dépôt de dossier',
  dossier_depose: 'Dossier déposé',
  admission_provisoire: 'Admission provisoire',
  admis_concours: 'Admis au concours',
  admis_et_inscrit: 'Admis et inscrit',
  inscrit_tout_seul: 'Inscrit tout seul',
  admin_ecrit: "Admis à l'écrit",
  admin_oral: "Admis à l'oral",
  ecole_fermee: 'École fermée',
  cause_non_eligibilite: 'Cause de non éligibilité',
  attente_paiement: 'En attente du versement',
  paiement_par_etawjihi: 'En attente de paiement (E-Tawjihi)',
  paiement_seul: 'En attente de paiement (seule)',
};

const STATUT_LABELS_AR: Record<string, string> = {
  preselectionne: 'مختار مسبقاً',
  selectionne: 'مختار',
  ne_veux_pas: 'لا يريد',
  eligible: 'مؤهل',
  non_eligible: 'غير مؤهل',
  annule_par_etudiant: 'ملغى من طرف التلميذ',
  annule_par_etawjihi: 'ملغى من طرف E-TAWJIHI',
  annule_manque_documents: 'ملغى لعدم كفاية الوثائق',
  pas_de_reponse_apres_relances: 'لا رد (بعد التذكيرات)',
  en_cours: 'قيد الإنجاز',
  attente_informations: 'في انتظار المعلومات',
  attente_versement: 'في انتظار التحويل',
  attente_paiement_seule: 'في انتظار الدفع (لوحده)',
  attente_paiement_etawjihi: 'في انتظار الدفع (E-Tawjihi)',
  inscrit: 'مسجل',
  rate_concours: 'راسب في المباراة',
  non_selectionne: 'غير مختار',
  liste_attente: 'قائمة الانتظار',
  en_cours_depot_dossier: 'قيد إيداع الملف',
  dossier_depose: 'الملف مودع',
  admission_provisoire: 'قبول مؤقت',
  admis_concours: 'مقبول في المباراة',
  admis_et_inscrit: 'مقبول ومسجل',
  inscrit_tout_seul: 'مسجل بنفسه',
  admin_ecrit: 'مقبول في الكتابي',
  admin_oral: 'مقبول في الشفوي',
  ecole_fermee: 'المدرسة مغلقة',
};

export function getStatutCategory(value: StatutInscriptionValue | undefined): string {
  if (!value) return 'default';
  const refus = ['non_eligible', 'ne_veux_pas', 'rate_concours', 'non_selectionne', 'cause_non_eligibilite'];
  const annule = ['annule_par_etudiant', 'annule_par_etawjihi', 'annule_manque_documents', 'pas_de_reponse_apres_relances'];
  const ecole_fermee = ['ecole_fermee'];
  const en_attente = [
    'preselectionne', 'selectionne', 'eligible', 'en_cours', 'attente_informations', 'attente_versement',
    'attente_paiement_seule', 'attente_paiement_etawjihi', 'paiement_par_etawjihi', 'paiement_seul', 'liste_attente',
  ];
  const en_cours_dossier = ['en_cours_depot_dossier', 'dossier_depose', 'admission_provisoire', 'admin_ecrit', 'admin_oral'];
  const inscrit_admis = ['inscrit', 'admis_concours', 'admis_et_inscrit', 'inscrit_tout_seul'];
  if (refus.includes(value)) return 'refus';
  if (annule.includes(value)) return 'annule';
  if (ecole_fermee.includes(value)) return 'ecole_fermee';
  if (en_attente.includes(value)) return 'en_attente';
  if (en_cours_dossier.includes(value)) return 'en_cours_dossier';
  if (inscrit_admis.includes(value)) return 'inscrit_admis';
  return 'default';
}

export function getStatutDisplay(
  value: StatutInscriptionValue | undefined | null,
  isArabic: boolean,
): { label: string; color: string; bgColor: string } | null {
  if (value === undefined || value === null || value === '') return null;
  const category = getStatutCategory(value);
  const styles = STATUT_CATEGORY_STYLES[category] || STATUT_CATEGORY_STYLES.default;
  const labelFr = STATUT_LABELS[value] || value;
  const label = isArabic ? (STATUT_LABELS_AR[value] ?? labelFr) : labelFr;
  return { label, color: styles.text, bgColor: styles.bg };
}

export function getSchoolTypeInfo(type: string, isArabic: boolean) {
  switch (type) {
    case 'Public':
      return { text: isArabic ? 'عمومية' : 'Public', color: '#059669', bgColor: '#D1FAE5' };
    case 'Prive':
    case 'prive':
      return { text: isArabic ? 'خاصة' : 'Privé', color: '#7C3AED', bgColor: '#EDE9FE' };
    case 'Semi-Public':
    case 'semi-public':
      return { text: isArabic ? 'شبه عمومية' : 'Semi-Public', color: '#F59E0B', bgColor: '#FEF3C7' };
    case 'Militaire':
    case 'militaire':
      return { text: isArabic ? 'عسكرية' : 'Militaire', color: '#EF4444', bgColor: '#FEE2E2' };
    default:
      return { text: type, color: '#6B7280', bgColor: '#F3F4F6' };
  }
}

export function getEffectiveRegistrationStatus(school: TassjilSchool): TassjilSchoolRegistrationStatus {
  const debut = school.dateDebutInscription;
  const fin = school.dateFinInscription;
  if (!debut || !fin) {
    return school.registrationStatus || 'not-open';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(debut);
  d.setHours(0, 0, 0, 0);
  const f = new Date(fin);
  f.setHours(0, 0, 0, 0);
  if (today >= d && today <= f) return 'open';
  if (today > f) return 'closed';
  return 'not-open';
}

export function getRegistrationStatusInfo(status: string, isArabic: boolean) {
  switch (status) {
    case 'not-open':
      return { text: isArabic ? 'لم تفتح بعد' : 'Pas encore ouverte', color: '#6B7280', icon: 'clock-o' as const };
    case 'open':
      return { text: isArabic ? 'مفتوحة' : 'Ouvert', color: '#059669', icon: 'check-circle' as const };
    case 'closed':
      return { text: isArabic ? 'مغلقة' : 'Fermé', color: '#EF4444', icon: 'times-circle' as const };
    default:
      return { text: status, color: '#6B7280', icon: 'question-circle' as const };
  }
}

export function sortSchoolsByDateFin(schools: TassjilSchool[]): TassjilSchool[] {
  return schools.slice().sort((a, b) => {
    const da = a.dateFinInscription ? new Date(a.dateFinInscription).getTime() : 0;
    const db = b.dateFinInscription ? new Date(b.dateFinInscription).getTime() : 0;
    if (da === 0 && db === 0) return 0;
    if (da === 0) return 1;
    if (db === 0) return -1;
    return da - db;
  });
}

export const TASSJIL_STATUT_NONE = '__none__';

export type TassjilStatutFilterField = 'statut_inscription' | 'statut_suivi';

const STATUT_FILTER_CATEGORY_ORDER = [
  'en_attente',
  'en_cours_dossier',
  'inscrit_admis',
  'refus',
  'annule',
  'ecole_fermee',
  'default',
  'none',
] as const;

function statutFilterSortKey(value: string): number {
  if (value === TASSJIL_STATUT_NONE) {
    return STATUT_FILTER_CATEGORY_ORDER.indexOf('none');
  }
  const cat = getStatutCategory(value);
  const idx = STATUT_FILTER_CATEGORY_ORDER.indexOf(
    cat as (typeof STATUT_FILTER_CATEGORY_ORDER)[number],
  );
  return idx >= 0 ? idx : STATUT_FILTER_CATEGORY_ORDER.indexOf('default');
}

export function getSchoolStatutFilterValue(
  school: TassjilSchool,
  field: TassjilStatutFilterField,
): string {
  const raw = field === 'statut_inscription' ? school.statut_inscription : school.statut_suivi;
  const trimmed = (raw ?? '').trim();
  return trimmed || TASSJIL_STATUT_NONE;
}

export function buildTassjilStatutFilterOptions(
  schools: TassjilSchool[],
  field: TassjilStatutFilterField,
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const school of schools) {
    const key = getSchoolStatutFilterValue(school, field);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      const orderDiff = statutFilterSortKey(a.value) - statutFilterSortKey(b.value);
      if (orderDiff !== 0) return orderDiff;
      const labelA = a.value === TASSJIL_STATUT_NONE ? '' : STATUT_LABELS[a.value] ?? a.value;
      const labelB = b.value === TASSJIL_STATUT_NONE ? '' : STATUT_LABELS[b.value] ?? b.value;
      return labelA.localeCompare(labelB, 'fr');
    });
}

export function getTassjilStatutFilterLabel(value: string, isArabic: boolean): string {
  if (value === TASSJIL_STATUT_NONE) {
    return isArabic ? 'غير محدد' : 'Non renseigné';
  }
  const labelFr = STATUT_LABELS[value] ?? value;
  return isArabic ? (STATUT_LABELS_AR[value] ?? labelFr) : labelFr;
}

export function filterTassjilSchoolsByStatuts(
  schools: TassjilSchool[],
  inscriptionFilter: string,
  suiviFilter: string,
): TassjilSchool[] {
  return schools.filter((school) => {
    const inscriptionOk =
      !inscriptionFilter || getSchoolStatutFilterValue(school, 'statut_inscription') === inscriptionFilter;
    const suiviOk =
      !suiviFilter || getSchoolStatutFilterValue(school, 'statut_suivi') === suiviFilter;
    return inscriptionOk && suiviOk;
  });
}
