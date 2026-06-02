import type { HomeCopyKey } from '@/constants/i18n';

export const TASSJIL_PRACTICAL_LINK_ID = 'ecoles-inscription';

export type TassjilPracticalLinkLockState = {
  locked: boolean;
  reasonKey?: HomeCopyKey;
};

export type LegacyLinkFlags = {
  hasTassjilCandidate?: boolean;
  linked?: boolean;
};

/** Client avec dossier / service TASSJIL sur l’ancien backend (e-tawjihi). */
export function hasLegacyTassjilAccess(legacyLink?: LegacyLinkFlags | null): boolean {
  return Boolean(legacyLink?.hasTassjilCandidate || legacyLink?.linked);
}

export function getTassjilPracticalLinkLock(legacyLink?: LegacyLinkFlags | null): TassjilPracticalLinkLockState {
  if (hasLegacyTassjilAccess(legacyLink)) {
    return { locked: false };
  }

  return {
    locked: true,
    reasonKey: 'practical_ecolesInscription_locked',
  };
}

export function isTassjilPracticalLinkId(id: string): boolean {
  return id === TASSJIL_PRACTICAL_LINK_ID;
}
