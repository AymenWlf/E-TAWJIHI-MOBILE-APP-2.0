import type { PlatformServiceItem } from '@/services/platformServices';
import type { EligibilityProfile } from '@/utils/eligibility';

/** Filières du bac marocain « mission » (SM, SPC, SVT, STE, STM) — aligné backend / web. */
export const MISSION_BAC_FILIERE_NAMES = [
  'Sciences Math A',
  'Sciences Math B',
  'Sciences Physique',
  'SVT',
  'Sciences et technologies électriques',
  'Sciences et technologies mécaniques',
] as const;

type BacKind = 'mission' | 'not_mission';

function bacKindFromProfile(profile: EligibilityProfile | null): BacKind {
  const raw = String(profile?.bacType ?? '')
    .trim()
    .toLowerCase();
  if (raw.includes('mission')) return 'mission';
  return 'not_mission';
}

function norm(v: string | null | undefined): string {
  if (v == null) return '';
  return String(v)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function isMissionBacFiliereName(label: string): boolean {
  const n = norm(label);
  return MISSION_BAC_FILIERE_NAMES.some((m) => norm(m) === n);
}

function filiereMatchesAccepted(userFiliere: string, acceptedName: string): boolean {
  const u = norm(userFiliere);
  const a = norm(acceptedName);
  if (!u || !a) return false;
  if (u === a) return true;
  if (u.replace(/\s+a$/i, '') === a || u === a.replace(/\s+a$/i, '')) return true;
  if (u.replace(/\s+b$/i, '') === a || u === a.replace(/\s+b$/i, '')) return true;
  return false;
}

function intersectsFiliere(userFiliere: string | null | undefined, acceptedNames: string[]): boolean {
  const u = userFiliere?.trim();
  if (!u || acceptedNames.length === 0) return false;
  return acceptedNames.some((a) => filiereMatchesAccepted(u, a));
}

function userFiliereForMatch(profile: EligibilityProfile | null): string | null {
  const f = profile?.filiere?.trim();
  return f || null;
}

function namedOnlyEntries(accepted: string[]): string[] {
  return accepted.filter((s) => {
    const n = norm(s);
    return n && n !== 'all' && n !== 'mission' && n !== 'reste';
  });
}

function parseAccepted(accepted: string[]) {
  const norms = accepted.map(norm).filter(Boolean);
  return {
    hasAll: norms.includes('all'),
    hasMission: norms.includes('mission'),
    hasReste: norms.includes('reste'),
    names: namedOnlyEntries(accepted),
  };
}

/**
 * Indique si un service plateforme doit être proposé à l’utilisateur selon
 * `filieresAccepted` (all / mission / reste / noms) et son profil (`bacType`, filière).
 *
 * Bac Mission : tous les packs `all` ou `mission` (sans filtre par spécialité).
 * Bac marocain : packs `all` / `reste` ou dont la filière figure dans la liste admin.
 */
export function platformServiceVisibleForProfile(
  service: Pick<PlatformServiceItem, 'filieresAccepted'>,
  profile: EligibilityProfile | null,
  opts?: { profileLoading?: boolean },
): boolean {
  if (opts?.profileLoading) return true;

  const accepted = service.filieresAccepted.length > 0 ? service.filieresAccepted : ['all'];
  const { hasAll, hasMission, hasReste, names } = parseAccepted(accepted);

  if (hasAll) return true;

  const kind = bacKindFromProfile(profile);
  const userFiliere = userFiliereForMatch(profile);
  const namedAreAllMission =
    names.length > 0 && names.every(isMissionBacFiliereName);
  const namedAreAllNonMission =
    names.length > 0 && names.every((n) => !isMissionBacFiliereName(n));

  if (kind === 'mission') {
    if (hasMission) return true;
    if (hasReste && !hasMission && names.length === 0) return false;
    if (namedAreAllMission || names.some(isMissionBacFiliereName)) return true;
    if (hasReste && namedAreAllNonMission) return false;
    return false;
  }

  if (hasMission && !hasReste && names.length === 0) return false;

  if (names.length > 0) {
    if (userFiliere && intersectsFiliere(userFiliere, names)) {
      return true;
    }
    if (!userFiliere) {
      if (hasReste && !hasMission) return true;
      if (hasMission && hasReste) return true;
      return false;
    }
    if (namedAreAllMission) return false;
    if (namedAreAllNonMission && hasReste) return false;
    if (hasMission && !hasReste) return false;
    return false;
  }

  if (hasReste && !hasMission) return true;
  if (hasMission && hasReste) return true;

  return false;
}

export type ShopServiceFiliereBadgeKey =
  | 'shopServicesEligibleYou'
  | 'shopServicesFiliereMission'
  | 'shopServicesFiliereReste';

export function shopServiceFiliereBadgeKey(filieresAccepted: string[]): ShopServiceFiliereBadgeKey {
  const list = filieresAccepted.length > 0 ? filieresAccepted : ['all'];
  const { hasAll, hasMission, hasReste, names } = parseAccepted(list);
  if (hasAll) return 'shopServicesEligibleYou';
  const namedAreAllMission = names.length > 0 && names.every(isMissionBacFiliereName);
  if (hasMission && !hasReste && names.length === 0) return 'shopServicesFiliereMission';
  if (hasReste && !hasMission && names.length === 0) return 'shopServicesFiliereReste';
  if (namedAreAllMission && !hasReste) return 'shopServicesFiliereMission';
  if (names.length > 0 && !hasMission && hasReste) return 'shopServicesFiliereReste';
  return 'shopServicesEligibleYou';
}
