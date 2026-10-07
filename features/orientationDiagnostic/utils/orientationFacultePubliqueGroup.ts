import { normalizeAdmissionType } from '../constants/establishmentAdmissionType';

type SchoolLike = {
  facultePubliqueAccesOuvert?: boolean | null;
  type?: string | null;
  /** Alias rapport / reco (typeEcole). */
  typeEcole?: string | null;
  admissionType?: string | null;
  nom?: string | null;
  sigle?: string | null;
};

/** Heuristique quand `admissionType` / flag admin absents du payload reco. */
function looksLikeUniversiteOuFacultePublique(e: SchoolLike): boolean {
  const n = `${e.nom || ''} ${e.sigle || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return /\b(universit|faculte|fsjes|fmp|fmd|fst|flsh|fsr|fsjt|ufr)\b/.test(n);
}

/** Normalise le type établissement (Public / Semi-Public / …). */
function normalizeType(raw?: string | null): string {
  const t = (raw || '').trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  if (lower === 'semi-public' || lower === 'semi_public' || lower === 'semipublic') {
    return 'Semi-Public';
  }
  if (lower === 'public') return 'Public';
  if (lower === 'privé' || lower === 'prive') return 'Privé';
  if (lower === 'militaire') return 'Militaire';
  return t;
}

/**
 * Faculté / université publique à accès ouvert :
 * flag admin prioritaire, sinon Public + admission accès ouvert (données legacy).
 */
export function isFacultePubliqueAccesOuvert(e: SchoolLike): boolean {
  if (e.facultePubliqueAccesOuvert === true) return true;
  if (normalizeType(e.type || e.typeEcole) !== 'Public') return false;
  if (normalizeAdmissionType(e.admissionType) === 'acces_ouvert') return true;
  // Anciens payloads reco sans admissionType : regrouper univ. / facultés publiques par nom
  if (!e.admissionType && e.facultePubliqueAccesOuvert == null) {
    return looksLikeUniversiteOuFacultePublique(e);
  }
  return false;
}

export function partitionFacultePublique<T extends SchoolLike>(
  items: T[],
): { facultes: T[]; others: T[] } {
  const facultes: T[] = [];
  const others: T[] = [];
  for (const item of items) {
    if (isFacultePubliqueAccesOuvert(item)) facultes.push(item);
    else others.push(item);
  }
  return { facultes, others };
}
