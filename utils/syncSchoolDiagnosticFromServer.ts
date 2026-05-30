import {
  fetchPrimarySchoolDiagnosticForUser,
  type SchoolDiagnosticFullResult,
} from '@/services/schoolRecommendationDiagnostic';
import {
  persistSchoolDiagnosticResult,
  persistServerDraftDiagnosticId,
} from '@/utils/schoolDiagnosticStorage';

/** Applique le diagnostic serveur (web ou mobile) dans le stockage local. */
export async function syncSchoolDiagnosticFromServer(
  remote: SchoolDiagnosticFullResult,
  userId?: number | null,
): Promise<void> {
  await persistServerDraftDiagnosticId(remote.id, remote.publicCode);
  if (remote.status === 'completed' && remote.publicCode.length >= 32) {
    await persistSchoolDiagnosticResult(remote.id, remote.publicCode, userId ?? null);
  }
}

export async function loadAndSyncPrimarySchoolDiagnostic(
  token: string,
  options?: { uiLocale?: 'fr' | 'ar'; userId?: number | null },
): Promise<SchoolDiagnosticFullResult | null> {
  const remote = await fetchPrimarySchoolDiagnosticForUser(token, options);
  if (!remote) return null;
  await syncSchoolDiagnosticFromServer(remote, options?.userId ?? null);
  return remote;
}
