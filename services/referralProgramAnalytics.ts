import { httpPostJson } from '@/services/http';

/** Enregistre une vue de la page fidélité / parrainage (auth requise). */
export async function recordReferralProgramPageView(accessToken: string): Promise<void> {
  try {
    await httpPostJson(
      '/api/referral-program-analytics/page-view',
      { viewport: 'mobile' },
      { Authorization: `Bearer ${accessToken}` },
    );
  } catch {
    /* analytics best-effort */
  }
}

/** Enregistre une copie du code parrain (auth requise). */
export async function recordReferralProgramCodeCopy(accessToken: string): Promise<void> {
  try {
    await httpPostJson(
      '/api/referral-program-analytics/code-copy',
      { viewport: 'mobile' },
      { Authorization: `Bearer ${accessToken}` },
    );
  } catch {
    /* analytics best-effort */
  }
}
