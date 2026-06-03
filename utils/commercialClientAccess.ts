import type { UserActiveCommercialService } from '@/services/userActiveServices';

/** Client payant = au moins un service commercial actif (aligné GET /api/user/active-services). */
export function userIsCommercialClient(services: UserActiveCommercialService[]): boolean {
  return services.length > 0;
}
