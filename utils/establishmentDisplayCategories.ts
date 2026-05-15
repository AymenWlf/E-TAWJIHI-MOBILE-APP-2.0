/** Valeurs du type d’établissement (admin / BDD), même libellés que le formulaire web. */
export type EstablishmentDisplayCategory = 'Public' | 'Militaire' | 'Semi-public' | 'Privé' | 'other';

export const ESTABLISHMENT_CATEGORY_ORDER: EstablishmentDisplayCategory[] = [
  'Public',
  'Militaire',
  'Semi-public',
  'Privé',
  'other',
];

export type EstablishmentForCategory = {
  id: number;
  type?: string | null;
  nom: string;
};

export function establishmentDisplayCategory(type: string | null | undefined): EstablishmentDisplayCategory {
  const raw = (type ?? '').trim();
  if (raw === 'Public' || raw === 'Militaire' || raw === 'Semi-public' || raw === 'Privé') {
    return raw;
  }
  return 'other';
}

export function splitEstablishmentsByDisplayCategory<T extends EstablishmentForCategory>(
  items: T[],
): { key: EstablishmentDisplayCategory; items: T[] }[] {
  const buckets = new Map<EstablishmentDisplayCategory, T[]>();
  for (const k of ESTABLISHMENT_CATEGORY_ORDER) {
    buckets.set(k, []);
  }
  for (const e of items) {
    buckets.get(establishmentDisplayCategory(e.type))!.push(e);
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  }
  return ESTABLISHMENT_CATEGORY_ORDER.map((key) => ({
    key,
    items: buckets.get(key)!,
  })).filter((s) => s.items.length > 0);
}

export function establishmentSectionTitleKey(
  cat: EstablishmentDisplayCategory,
):
  | 'shopEstCategoryPublic'
  | 'shopEstCategoryMilitary'
  | 'shopEstCategorySemiPublic'
  | 'shopEstCategoryPrivate'
  | 'shopEstCategoryOther' {
  switch (cat) {
    case 'Public':
      return 'shopEstCategoryPublic';
    case 'Militaire':
      return 'shopEstCategoryMilitary';
    case 'Semi-public':
      return 'shopEstCategorySemiPublic';
    case 'Privé':
      return 'shopEstCategoryPrivate';
    default:
      return 'shopEstCategoryOther';
  }
}
