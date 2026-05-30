import { fetchPrimarySchoolDiagnosticForUser } from '@/services/schoolRecommendationDiagnostic';
import { readPersistedSchoolDiagnosticResult } from '@/utils/schoolDiagnosticStorage';
import { syncSchoolDiagnosticFromServer } from '@/utils/syncSchoolDiagnosticFromServer';

function isValidPublicCode(code: string): boolean {
  return /^[a-f0-9]{32}$/.test(code.trim().toLowerCase());
}

/**
 * Code public du diagnostic à afficher pour l’utilisateur courant.
 * Connecté : toujours le diagnostic principal du compte (API), jamais le cache d’un autre profil.
 */
export async function resolveUserDiagnosticPublicCode(
  getValidAccessToken: () => Promise<string | null>,
  userId?: number | null,
  options?: { uiLocale?: 'fr' | 'ar' },
): Promise<string | null> {
  const token = await getValidAccessToken();
  if (token) {
    try {
      const primary = await fetchPrimarySchoolDiagnosticForUser(token, options);
      if (primary?.status === 'completed') {
        const code = primary.publicCode?.trim().toLowerCase() ?? '';
        if (isValidPublicCode(code)) {
          await syncSchoolDiagnosticFromServer(primary, userId ?? null);
          return code;
        }
      }
      return null;
    } catch {
      /* réseau : repli local uniquement si le cache appartient au même compte */
    }
  }

  const last = await readPersistedSchoolDiagnosticResult(userId ?? null);
  const code = last?.publicCode?.trim().toLowerCase() ?? '';
  return isValidPublicCode(code) ? code : null;
}
