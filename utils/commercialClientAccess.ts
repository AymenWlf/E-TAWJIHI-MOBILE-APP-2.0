import type { UserActiveCommercialService } from '@/services/userActiveServices';

/** Client payant = au moins un service commercial actif (aligné backend PaidAccountGuard). */
export function userIsCommercialClient(services: UserActiveCommercialService[]): boolean {
  return services.length > 0;
}
