import type { EstablishmentBrief } from '@/types/inscriptions';

/** Affiche la pastille TASSJIL dès qu’un établissement est rattaché à l’annonce. */
export function shouldShowTassjilServiceBadge(
  establishment: Pick<EstablishmentBrief, 'isServiceTassjil'> | null | undefined,
): boolean {
  return Boolean(establishment);
}
