import type { SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import type { Orientation1BacCurrentId } from '@/constants/orientation1bacRules';

export type Orientation1BacFiliereOption = {
  id: Orientation1BacCurrentId;
  labelFr: string;
  labelAr: string;
  subtitleFr?: string;
  subtitleAr?: string;
};

/** Filières 1ère bac (ids alignés sur `orientation1bacRules` / doc §1). */
export const ORIENTATION_1BAC_FILIERE_OPTIONS: readonly Orientation1BacFiliereOption[] = [
  {
    id: '1bac_sc_math',
    labelFr: 'Sciences Mathématiques',
    labelAr: 'علوم رياضية',
    subtitleFr: 'Profil scientifique avancé en mathématiques',
    subtitleAr: 'مسار علمي متقدم في الرياضيات',
  },
  {
    id: '1bac_sc_exp',
    labelFr: 'Sciences Expérimentales',
    labelAr: 'علوم تجريبية',
    subtitleFr: 'Physique, SVT, chimie…',
    subtitleAr: 'فيزياء، علوم الحياة والأرض، كيمياء…',
  },
  {
    id: '1bac_sc_eco_gestion',
    labelFr: 'Sciences Économiques et Gestion',
    labelAr: 'علوم اقتصادية وتدبير',
    subtitleFr: 'Économie, gestion, comptabilité',
    subtitleAr: 'اقتصاد، تدبير، محاسبة',
  },
  {
    id: '1bac_lettres_sc_hum',
    labelFr: 'Lettres et Sciences Humaines',
    labelAr: 'آداب وعلوم إنسانية',
    subtitleFr: 'Langues, histoire-géo, philosophie…',
    subtitleAr: 'لغات، تاريخ-جغرافيا، فلسفة…',
  },
  {
    id: '1bac_ste',
    labelFr: 'Sciences et Technologies Électriques',
    labelAr: 'علوم وتكنولوجيات كهربائية',
    subtitleFr: 'Filière technologique STE',
    subtitleAr: 'شعبة تكنولوجية كهربائية',
  },
  {
    id: '1bac_stm',
    labelFr: 'Sciences et Technologies Mécaniques',
    labelAr: 'علوم وتكنولوجيات ميكانيكية',
    subtitleFr: 'Filière technologique STM',
    subtitleAr: 'شعبة تكنولوجية ميكانيكية',
  },
] as const;

export function getOrientation1BacFiliereLabel(id: string, lang: 'fr' | 'ar'): string {
  const opt = ORIENTATION_1BAC_FILIERE_OPTIONS.find((o) => o.id === id);
  if (!opt) return '';
  return lang === 'ar' ? opt.labelAr : opt.labelFr;
}

export function orientation1BacFilierePickItems(lang: 'fr' | 'ar'): SearchablePickItem[] {
  return ORIENTATION_1BAC_FILIERE_OPTIONS.map((o) => ({
    id: o.id,
    value: o.id,
    label: lang === 'ar' ? o.labelAr : o.labelFr,
    subtitle: lang === 'ar' ? o.subtitleAr : o.subtitleFr,
    searchText: `${o.labelFr} ${o.labelAr} ${o.id}`,
  }));
}

export function isValidOrientation1BacFiliereId(id: string): id is Orientation1BacCurrentId {
  return ORIENTATION_1BAC_FILIERE_OPTIONS.some((o) => o.id === id);
}
