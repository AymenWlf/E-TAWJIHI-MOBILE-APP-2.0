import { buildApiUrl } from '@/constants/api';
import {
  SCHOOL_QUICK_DIAGNOSTIC_VERSION,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';
import { httpGetJson, httpPatchJson, httpPostJson } from '@/services/http';

export type SchoolDiagnosticReasonDetail = {
  text: string;
  diagnostic: string;
  establishment: string;
};

export type SchoolDiagnosticInscriptionConcours = {
  status: 'ouvert' | 'ferme' | 'pas_encore' | 'non_renseigne';
  label: string;
  dateOuverture: string | null;
  dateFermeture: string | null;
  announcementId: number | null;
  titre: string | null;
};

export type SchoolDiagnosticRecommendationItem = {
  establishmentId: number;
  sigle?: string;
  nom: string;
  /** Nom arabe si renseigné côté établissement. */
  nomArabe?: string | null;
  slug: string;
  ville: string;
  typeEcole?: string;
  anneesEtudes?: number | null;
  dureeEtudesMax?: number | null;
  diplomesDelivres?: string;
  logo: string | null;
  algorithmicScore: number;
  reasonsYes: string[];
  reasonsNo: string[];
  reasonsYesDetails?: SchoolDiagnosticReasonDetail[];
  reasonsNoDetails?: SchoolDiagnosticReasonDetail[];
  iaScore: number | null;
  iaWhyRecommended: string | null;
  iaWhyNot: string | null;
  combinedScore: number;
  filieresAcceptees?: string[];
  diagnosticBacStreamLabel?: string;
  bacFiliereCompatible?: boolean;
  seuilCompatible?: boolean;
  militaryCriteriaCompatible?: boolean;
  diagnosticBacType?: string;
  referenceSeuilPrevisionnel?: number | null;
  referenceSeuilLabel?: string;
  referenceSeuilMode?: string;
  inscriptionConcours?: SchoolDiagnosticInscriptionConcours;
};

export type SchoolDiagnosticSubmitResult = {
  id: number;
  publicCode: string;
  grokAvailable: boolean;
  grokPending?: boolean;
  recommendationsDeferred?: boolean;
  profileSummary?: string | null;
  globalComment?: string | null;
  academicYearLabel?: string | null;
  recommendations: SchoolDiagnosticRecommendationItem[];
};

export type SchoolDiagnosticFullResult = {
  id: number;
  publicCode: string;
  status: 'draft' | 'completed';
  formVersion: string;
  payload: Record<string, unknown>;
  grokAvailable: boolean;
  grokPending?: boolean;
  recommendationsDeferred?: boolean;
  profileSummary?: string | null;
  globalComment?: string | null;
  academicYearLabel?: string | null;
  recommendations: SchoolDiagnosticRecommendationItem[];
};

function authHeaders(token: string | null): HeadersInit | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function mapSubmit(d: SchoolDiagnosticSubmitResult): SchoolDiagnosticSubmitResult {
  return {
    id: d.id,
    publicCode: d.publicCode,
    grokAvailable: Boolean(d.grokAvailable),
    grokPending: Boolean(d.grokPending),
    recommendationsDeferred: Boolean(d.recommendationsDeferred),
    profileSummary: d.profileSummary ?? null,
    globalComment: d.globalComment ?? null,
    academicYearLabel: typeof d.academicYearLabel === 'string' ? d.academicYearLabel : null,
    recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
  };
}

export async function createSchoolDiagnosticDraft(
  payload: SchoolQuickDiagnosticForm,
  token: string | null,
): Promise<{ id: number; publicCode: string }> {
  const data = await httpPostJson<
    { success: boolean; message?: string; data?: { id: number; publicCode?: string } },
    { formVersion: string; payload: SchoolQuickDiagnosticForm }
  >(
    buildApiUrl('/api/school-recommendation-diagnostic/draft'),
    { formVersion: SCHOOL_QUICK_DIAGNOSTIC_VERSION, payload },
    { headers: authHeaders(token) },
  );
  const id = data.data?.id;
  const publicCode =
    typeof data.data?.publicCode === 'string' && data.data.publicCode.length >= 32
      ? data.data.publicCode.trim().toLowerCase()
      : '';
  if (!data.success || !id || !publicCode) {
    throw new Error(data.message || 'Enregistrement du brouillon impossible');
  }
  return { id, publicCode };
}

export async function updateSchoolDiagnosticDraft(
  diagnosticId: number,
  payload: SchoolQuickDiagnosticForm,
  token: string | null,
  publicCode?: string | null,
): Promise<void> {
  const body: Record<string, unknown> = {
    formVersion: SCHOOL_QUICK_DIAGNOSTIC_VERSION,
    payload,
  };
  const pc = typeof publicCode === 'string' ? publicCode.trim().toLowerCase() : '';
  if (pc.length >= 32) body.publicCode = pc;
  const data = await httpPatchJson<{ success: boolean; message?: string }, Record<string, unknown>>(
    buildApiUrl(`/api/school-recommendation-diagnostic/${diagnosticId}/draft`),
    body,
    { headers: authHeaders(token) },
  );
  if (!data.success) throw new Error(data.message || 'Mise à jour du brouillon impossible');
}

export async function finalizeSchoolDiagnosticDraft(
  diagnosticId: number,
  payload: SchoolQuickDiagnosticForm,
  token: string | null,
  publicCode?: string | null,
): Promise<SchoolDiagnosticSubmitResult> {
  const body: Record<string, unknown> = {
    formVersion: SCHOOL_QUICK_DIAGNOSTIC_VERSION,
    payload,
  };
  const pc = typeof publicCode === 'string' ? publicCode.trim().toLowerCase() : '';
  if (pc.length >= 32) body.publicCode = pc;
  const data = await httpPostJson<
    { success: boolean; message?: string; data?: SchoolDiagnosticSubmitResult },
    Record<string, unknown>
  >(
    buildApiUrl(`/api/school-recommendation-diagnostic/${diagnosticId}/finalize`),
    body,
    { headers: authHeaders(token) },
  );
  if (!data.success || !data.data?.id || typeof data.data.publicCode !== 'string') {
    throw new Error(data.message || 'Finalisation impossible');
  }
  return mapSubmit(data.data);
}

export async function submitSchoolRecommendationDiagnostic(
  payload: SchoolQuickDiagnosticForm,
  token: string | null,
): Promise<SchoolDiagnosticSubmitResult> {
  const data = await httpPostJson<
    { success: boolean; message?: string; data?: SchoolDiagnosticSubmitResult },
    { formVersion: string; payload: SchoolQuickDiagnosticForm }
  >(
    buildApiUrl('/api/school-recommendation-diagnostic'),
    { formVersion: SCHOOL_QUICK_DIAGNOSTIC_VERSION, payload },
    { headers: authHeaders(token) },
  );
  if (!data.success || !data.data?.id || typeof data.data.publicCode !== 'string') {
    throw new Error(data.message || 'Enregistrement impossible');
  }
  return mapSubmit(data.data);
}

function mapFullDiagnostic(
  d: SchoolDiagnosticFullResult & { status?: string },
  fallbackPublicCode?: string,
): SchoolDiagnosticFullResult {
  return {
    id: d.id,
    publicCode:
      typeof d.publicCode === 'string' && d.publicCode.length >= 32
        ? d.publicCode
        : (fallbackPublicCode ?? ''),
    status: d.status === 'draft' ? 'draft' : 'completed',
    formVersion: d.formVersion,
    payload: d.payload,
    grokAvailable: Boolean(d.grokAvailable),
    grokPending: Boolean(d.grokPending),
    recommendationsDeferred: Boolean(d.recommendationsDeferred),
    profileSummary: d.profileSummary ?? null,
    globalComment: d.globalComment ?? null,
    academicYearLabel: typeof d.academicYearLabel === 'string' ? d.academicYearLabel : null,
    recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
  };
}

/** Lance le calcul des recommandations pour un diagnostic finalisé sans reco (client TAWJIH PLUS). */
export async function generateSchoolDiagnosticRecommendations(
  diagnosticId: number,
  token: string | null,
): Promise<SchoolDiagnosticSubmitResult> {
  const data = await httpPostJson<
    { success: boolean; message?: string; data?: SchoolDiagnosticSubmitResult },
    Record<string, never>
  >(
    buildApiUrl(`/api/school-recommendation-diagnostic/${diagnosticId}/generate-recommendations`),
    {},
    { headers: authHeaders(token) },
  );
  if (!data.success || !data.data?.id || typeof data.data.publicCode !== 'string') {
    throw new Error(data.message || 'Génération des recommandations impossible');
  }
  return mapSubmit(data.data);
}

export async function fetchSchoolRecommendationDiagnostic(
  diagnosticId: number,
  token: string | null,
): Promise<SchoolDiagnosticFullResult> {
  const data = await httpGetJson<{
    success: boolean;
    message?: string;
    data?: SchoolDiagnosticFullResult & { status?: string };
  }>(buildApiUrl(`/api/school-recommendation-diagnostic/${diagnosticId}`), {
    headers: authHeaders(token),
  });
  if (!data.success || !data.data) throw new Error(data.message || 'Chargement impossible');
  return mapFullDiagnostic(data.data);
}

export type SchoolDiagnosticListItem = {
  id: number;
  publicCode: string;
  status: 'draft' | 'completed';
  createdAt?: string;
  updatedAt?: string;
  displayName?: string;
  cityLabel?: string;
};

export async function listSchoolRecommendationDiagnostics(
  token: string,
): Promise<SchoolDiagnosticListItem[]> {
  const data = await httpGetJson<{
    success: boolean;
    message?: string;
    data?: { items?: SchoolDiagnosticListItem[] };
  }>(buildApiUrl('/api/school-recommendation-diagnostic'), {
    headers: authHeaders(token),
  });
  if (!data.success) {
    throw new Error(data.message || 'Liste des diagnostics impossible');
  }
  return Array.isArray(data.data?.items) ? data.data!.items! : [];
}

/** Diagnostic principal du compte (un seul — aligné web). */
export async function fetchPrimarySchoolDiagnosticForUser(
  token: string,
  options?: { uiLocale?: 'fr' | 'ar' },
): Promise<SchoolDiagnosticFullResult | null> {
  const localeQ =
    options?.uiLocale === 'ar' ? '?uiLocale=ar' : options?.uiLocale === 'fr' ? '?uiLocale=fr' : '';
  const data = await httpGetJson<{
    success: boolean;
    message?: string;
    data?: (SchoolDiagnosticFullResult & { status?: string }) | null;
  }>(buildApiUrl(`/api/school-recommendation-diagnostic/me/latest${localeQ}`), {
    headers: authHeaders(token),
  });
  if (!data.success) {
    throw new Error(data.message || 'Chargement du diagnostic impossible');
  }
  if (!data.data) return null;
  return mapFullDiagnostic(data.data);
}

export async function fetchSchoolRecommendationDiagnosticByPublicCode(
  publicCode: string,
  token: string | null,
  options?: { uiLocale?: 'fr' | 'ar' },
): Promise<SchoolDiagnosticFullResult> {
  const c = encodeURIComponent(publicCode.trim().toLowerCase());
  const localeQ =
    options?.uiLocale === 'ar' ? '?uiLocale=ar' : options?.uiLocale === 'fr' ? '?uiLocale=fr' : '';
  const data = await httpGetJson<{
    success: boolean;
    message?: string;
    data?: SchoolDiagnosticFullResult & { status?: string };
  }>(buildApiUrl(`/api/school-recommendation-diagnostic/by-code/${c}${localeQ}`), {
    headers: authHeaders(token),
  });
  if (!data.success || !data.data) throw new Error(data.message || 'Chargement impossible');
  return mapFullDiagnostic(data.data, publicCode);
}
