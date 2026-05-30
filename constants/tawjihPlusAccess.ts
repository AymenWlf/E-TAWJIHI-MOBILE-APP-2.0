import type { UserActiveCommercialService } from '@/services/userActiveServices';

/** Slug boutique / platform service TAWJIH PLUS. */
export const TAWJIH_PLUS_SERVICE_SLUG = 'tawjih-plus';

export const TAWJIH_PLUS_PRODUCT_PATH = `/boutique/service/${TAWJIH_PLUS_SERVICE_SLUG}` as const;

/**
 * Tous les packs TASSJIL incluent TAWJIH PLUS (règle produit).
 * Un client TASSJIL actif a donc accès aux inscriptions complètes.
 */
export function packIdGrantsTawjihPlusAccess(packId: string | null | undefined): boolean {
  const id = (packId ?? '').trim().toLowerCase();
  if (!id) return false;
  if (id === TAWJIH_PLUS_SERVICE_SLUG) return true;
  if (id.startsWith('tassjil-')) return true;
  return false;
}

export function serviceGrantsTawjihPlusAccess(service: UserActiveCommercialService): boolean {
  if (packIdGrantsTawjihPlusAccess(service.packId)) return true;
  const name = (service.serviceName ?? '').trim().toLowerCase();
  if (name.includes('tawjih plus') || name.includes('tawjih-plus')) return true;
  if (name.includes('tassjil')) return true;
  return false;
}

export function activeServicesGrantTawjihPlusAccess(
  services: UserActiveCommercialService[],
): boolean {
  return services.some(serviceGrantsTawjihPlusAccess);
}
