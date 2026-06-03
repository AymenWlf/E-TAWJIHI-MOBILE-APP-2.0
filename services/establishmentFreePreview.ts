import { FREE_ESTABLISHMENT_PREVIEW_COUNT } from '@/constants/tawjihPlusAccess';
import { listEstablishments } from '@/services/establishments';
import { fetchListingPlacementsByEstablishment, mergeEstablishmentsWithListingPlacements } from '@/services/referencingAds';
import { sortSponsoredFirst } from '@/utils/establishmentWebFilters';

let cachedDefaultFreeIds: number[] | null = null;
let loadPromise: Promise<number[]> | null = null;

/**
 * Les 3 premières écoles du catalogue par défaut (même tri que l’onglet Écoles sans filtre).
 * Sert à autoriser la fiche détail hors navigation depuis la liste (accueil, liens profonds).
 */
export async function loadDefaultFreePreviewEstablishmentIds(): Promise<number[]> {
  if (cachedDefaultFreeIds) return cachedDefaultFreeIds;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const [res, placements] = await Promise.all([
        listEstablishments({ page: 1, limit: 60 }),
        fetchListingPlacementsByEstablishment().catch(() => ({})),
      ]);
      const merged = sortSponsoredFirst(
        mergeEstablishmentsWithListingPlacements(res.data, placements),
      );
      cachedDefaultFreeIds = merged
        .map((e) => e.id)
        .filter((id) => Number.isFinite(id) && id > 0)
        .slice(0, FREE_ESTABLISHMENT_PREVIEW_COUNT);
      return cachedDefaultFreeIds;
    } catch {
      cachedDefaultFreeIds = [];
      return [];
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function isDefaultFreePreviewEstablishmentId(id: number, freeIds: number[]): boolean {
  return freeIds.includes(id);
}
