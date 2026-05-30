import type { AppLocale } from '@/constants/i18n';
import type { LabeledOption } from '@/constants/academicSetup';
import { FILIERE_BAC_OPTIONS } from '@/constants/academicSetup';
import {
  getOrientation1BacFiliereLabel,
  ORIENTATION_1BAC_FILIERE_OPTIONS,
} from '@/constants/orientation1bacFilieres';

export const NIVEAU_PREMIERE_BAC = '1ère année Baccalauréat';
export const NIVEAU_DEUXIEME_BAC = '2ème année Baccalauréat';

export function isPremiereBacNiveau(niveau: string): boolean {
  return niveau.trim() === NIVEAU_PREMIERE_BAC;
}

export function isDeuxiemeBacNiveau(niveau: string): boolean {
  return niveau.trim() === NIVEAU_DEUXIEME_BAC;
}

export function isFiliere1BacId(value: string): boolean {
  return value.trim().startsWith('1bac_');
}

export function filiere1BacLabeledOptions(): LabeledOption[] {
  return [
    { value: '', label: 'Sélectionnez une filière…', labelAr: 'اختر الشعبة…' },
    ...ORIENTATION_1BAC_FILIERE_OPTIONS.map((o) => ({
      value: o.id,
      label: o.labelFr,
      labelAr: o.labelAr,
    })),
  ];
}

/** Options filière selon niveau : 1ère bac → filières 1BAC ; 2ème bac → filières classiques. */
export function filiereOptionsForNiveau(niveau: string): readonly LabeledOption[] {
  if (isPremiereBacNiveau(niveau)) return filiere1BacLabeledOptions();
  return FILIERE_BAC_OPTIONS;
}

export function resolveFiliereDisplayLabel(value: string, locale: AppLocale): string {
  const v = value.trim();
  if (!v) return '';
  if (isFiliere1BacId(v)) {
    return getOrientation1BacFiliereLabel(v, locale === 'ar' ? 'ar' : 'fr');
  }
  const opt = FILIERE_BAC_OPTIONS.find((o) => o.value === v);
  if (!opt) return v;
  return locale === 'ar' ? (opt.labelAr ?? opt.label) : opt.label;
}

/** Nettoie la filière si elle ne correspond plus au niveau choisi. */
export function sanitizeFiliereForNiveau(niveau: string, filiere: string): string {
  const f = filiere.trim();
  if (!f) return '';
  if (isPremiereBacNiveau(niveau)) return isFiliere1BacId(f) ? f : '';
  if (isDeuxiemeBacNiveau(niveau) || niveau.includes('Baccalauréat')) {
    return isFiliere1BacId(f) ? '' : f;
  }
  return f;
}
