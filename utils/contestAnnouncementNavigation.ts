import { router } from 'expo-router';

function isCommercialClientFlag(value: unknown): boolean {
  if (value === false || value === 0) return false;
  if (value === 'false' || value === '0') return false;
  return true;
}

/**
 * Navigation annonce concours : détail pour les clients (service actif), liste pour les autres.
 */
export function navigateToContestAnnouncement(
  contestId: number,
  meta: Record<string, unknown> = {},
): void {
  const commercialClient = isCommercialClientFlag(meta.commercial_client);
  const route = typeof meta.route === 'string' ? meta.route.trim() : '';

  if (!commercialClient) {
    try {
      router.push({
        pathname: '/(tabs)/inscriptions',
        params: { tab: 'announcements' },
      } as never);
    } catch {
      router.push('/(tabs)/inscriptions' as never);
    }
    return;
  }

  if (route && !route.includes('/(tabs)/inscriptions')) {
    try {
      router.push(route as never);
      return;
    } catch {
      /* fallback */
    }
  }

  if (Number.isFinite(contestId) && contestId > 0) {
    router.push(`/inscriptions/${contestId}` as never);
  }
}
