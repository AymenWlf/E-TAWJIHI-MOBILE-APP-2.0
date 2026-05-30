import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type UserActiveCommercialTransaction = {
  id: number;
  montant: string;
  date: string | null;
  moyen: string;
  statut: string | null;
};

export type UserActiveCommercialService = {
  id: number;
  serviceName: string;
  packId: string | null;
  numeroContrat: string | null;
  prix: string;
  totalPaye: string | null;
  montantTotal: string;
  montantPaye: string;
  resteAPayer: string;
  paymentComplete: boolean;
  agentRdv: string | null;
  agentConversion: string | null;
  promoCode: string | null;
  promoDiscount: string | null;
  dateFin: string | null;
  hasEndDate: boolean;
  daysRemaining: number | null;
  createdAt: string | null;
  transactions: UserActiveCommercialTransaction[];
};

type ActiveServicesResponse = {
  success: boolean;
  message?: string;
  data?: {
    services: UserActiveCommercialService[];
    count: number;
  };
};

export type FetchUserActiveServicesOptions = {
  /** Accueil : un seul libellé — le pack le plus haut dans la chaîne upgrade. */
  highestTierOnly?: boolean;
};

export async function fetchUserActiveServices(
  accessToken: string,
  options?: FetchUserActiveServicesOptions,
): Promise<UserActiveCommercialService[]> {
  const qs = options?.highestTierOnly ? '?highestTierOnly=1' : '';
  const url = buildApiUrl(`/api/user/active-services${qs}`);
  const res = await httpGetJson<ActiveServicesResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Impossible de charger vos services');
  }
  return res.data?.services ?? [];
}
