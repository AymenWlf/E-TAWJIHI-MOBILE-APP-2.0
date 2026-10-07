/** Type d’admission établissement (aligné web — sans classes Tailwind). */
export type EstablishmentAdmissionType =
  | 'concours'
  | 'acces_ouvert'
  | 'etude_dossier'
  | 'ordre_merite';

export const ESTABLISHMENT_ADMISSION_TYPES: {
  id: EstablishmentAdmissionType;
  short: string;
  label: string;
}[] = [
  { id: 'concours', short: 'Concours', label: 'Concours' },
  { id: 'acces_ouvert', short: 'Ouvert', label: 'Accès ouvert' },
  { id: 'etude_dossier', short: 'Dossier', label: 'Étude de dossier' },
  { id: 'ordre_merite', short: 'Mérite', label: 'Ordre de mérite' },
];

export function normalizeAdmissionType(
  value?: string | null,
): EstablishmentAdmissionType | null {
  if (!value) return null;
  const v = String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  if (v === 'concours') return 'concours';
  if (v === 'acces_ouvert' || v === 'acces-ouvert' || v === 'ouvert') return 'acces_ouvert';
  if (
    v === 'etude_dossier' ||
    v === 'etude-de-dossier' ||
    v === 'etude_de_dossier' ||
    v === 'dossier'
  ) {
    return 'etude_dossier';
  }
  if (
    v === 'ordre_merite' ||
    v === 'ordre-de-merite' ||
    v === 'ordre_de_merite' ||
    v === 'merite'
  ) {
    return 'ordre_merite';
  }
  return null;
}

export function admissionTypeLabel(value?: string | null): string | null {
  const t = normalizeAdmissionType(value);
  if (!t) return null;
  return ESTABLISHMENT_ADMISSION_TYPES.find((x) => x.id === t)?.label || t;
}

function isConcoursLegacy(concours?: boolean | number | string | null): boolean {
  return (
    concours === true ||
    concours === 1 ||
    concours === '1' ||
    String(concours ?? '').toLowerCase() === 'true'
  );
}

export function resolveAdmissionDisplayLabel(input: {
  admissionType?: string | null;
  concours?: boolean | number | string | null;
  afficherEtudeDossierPublic?: boolean | null;
}): string {
  const fromType = admissionTypeLabel(input.admissionType);
  if (fromType) return fromType;

  const concoursOn = isConcoursLegacy(input.concours);
  if (input.afficherEtudeDossierPublic && !concoursOn) return 'Étude de dossier';
  if (concoursOn) return 'Concours';
  return 'Étude de dossier';
}

export function admissionImpliesConcours(value?: string | null): boolean {
  return normalizeAdmissionType(value) === 'concours';
}
