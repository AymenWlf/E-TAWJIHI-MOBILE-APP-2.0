import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  LegacyLinkInitiateResponse,
  LegacyLinkStatus,
  LegacyLinkVerifyResponse,
  TassjilPanierEcolesResponse,
  TassjilSchool,
} from '@/types/tassjilSchoolChoices';

function authHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function fetchLegacyLinkStatus(accessToken: string): Promise<LegacyLinkStatus> {
  const res = await httpGetJson<{ success: boolean; data?: LegacyLinkStatus }>(
    buildApiUrl('/api/user/legacy-link/status'),
    { headers: authHeaders(accessToken) },
  );
  return res.data ?? { linked: false };
}

export async function initiateLegacyLink(accessToken: string): Promise<LegacyLinkInitiateResponse> {
  return await httpPostJson<LegacyLinkInitiateResponse, Record<string, never>>(
    buildApiUrl('/api/user/legacy-link/initiate'),
    {},
    { headers: authHeaders(accessToken) },
  );
}

export async function verifyLegacyLink(
  accessToken: string,
  linkToken: string,
  otp: string,
): Promise<LegacyLinkVerifyResponse> {
  return await httpPostJson<LegacyLinkVerifyResponse, { linkToken: string; otp: string }>(
    buildApiUrl('/api/user/legacy-link/verify'),
    { linkToken, otp },
    { headers: authHeaders(accessToken) },
  );
}

export async function resendLegacyLinkOtp(
  accessToken: string,
  linkToken: string,
): Promise<LegacyLinkVerifyResponse> {
  return await httpPostJson<LegacyLinkVerifyResponse, { linkToken: string }>(
    buildApiUrl('/api/user/legacy-link/resend'),
    { linkToken },
    { headers: authHeaders(accessToken) },
  );
}

function normalizeTassjilSchool(raw: Record<string, unknown>): TassjilSchool {
  const eid = raw.etablissementId ?? raw.schoolId ?? raw.establishmentId;
  const nom = String(raw.nom ?? raw.titre ?? '').trim();
  const nomArabe = String(raw.nomArabe ?? raw.schoolNameArabic ?? '').trim();
  const schoolName = String(raw.schoolName ?? nom).trim();
  const schoolNameArabic = String(raw.schoolNameArabic ?? nomArabe ?? nom).trim();

  return {
    id: String(raw.id ?? eid ?? ''),
    nom: nom || null,
    nomArabe: nomArabe || null,
    schoolName: schoolName || (typeof eid === 'number' || typeof eid === 'string' ? `École #${eid}` : 'École'),
    schoolNameArabic: schoolNameArabic || schoolName,
    sigle: typeof raw.sigle === 'string' ? raw.sigle : null,
    slug: typeof raw.slug === 'string' ? raw.slug : null,
    logo: typeof raw.logo === 'string' ? raw.logo : null,
    program: typeof raw.program === 'string' ? raw.program : null,
    programArabic: typeof raw.programArabic === 'string' ? raw.programArabic : null,
    city: String(raw.city ?? '').trim(),
    sector: typeof raw.sector === 'string' ? raw.sector : null,
    isSelected: raw.isSelected === true,
    websiteUrl: typeof raw.websiteUrl === 'string' ? raw.websiteUrl : null,
    description: typeof raw.description === 'string' ? raw.description : null,
    descriptionArabic: typeof raw.descriptionArabic === 'string' ? raw.descriptionArabic : null,
    schoolType: String(raw.schoolType ?? '').trim(),
    diplomasOffered: Array.isArray(raw.diplomasOffered)
      ? raw.diplomasOffered.filter((v): v is string => typeof v === 'string')
      : [],
    registrationStatus:
      raw.registrationStatus === 'open' || raw.registrationStatus === 'closed'
        ? raw.registrationStatus
        : 'not-open',
    applicationStatus: String(raw.applicationStatus ?? 'not-started'),
    acceptanceStatus: String(raw.acceptanceStatus ?? 'no-result'),
    acceptedCity: typeof raw.acceptedCity === 'string' ? raw.acceptedCity : null,
    acceptedProgram: typeof raw.acceptedProgram === 'string' ? raw.acceptedProgram : null,
    statut_inscription:
      typeof raw.statut_inscription === 'string'
        ? raw.statut_inscription
        : typeof raw.statutInscription === 'string'
          ? raw.statutInscription
          : null,
    statut_suivi:
      typeof raw.statut_suivi === 'string'
        ? raw.statut_suivi
        : typeof raw.statutSuivi === 'string'
          ? raw.statutSuivi
          : null,
    dateDebutInscription:
      typeof raw.dateDebutInscription === 'string' ? raw.dateDebutInscription : null,
    dateFinInscription: typeof raw.dateFinInscription === 'string' ? raw.dateFinInscription : null,
    schoolId: typeof eid === 'number' || typeof eid === 'string' ? eid : undefined,
    etablissementId: typeof eid === 'number' || typeof eid === 'string' ? eid : undefined,
    filieresAcceptees: Array.isArray(raw.filieresAcceptees)
      ? raw.filieresAcceptees.filter((v): v is string => typeof v === 'string')
      : null,
    specialitesBacMissionAcceptees: Array.isArray(raw.specialitesBacMissionAcceptees)
      ? raw.specialitesBacMissionAcceptees.filter((v): v is string => typeof v === 'string')
      : null,
  };
}

export async function fetchTassjilPanierEcoles(accessToken: string): Promise<TassjilPanierEcolesResponse> {
  const res = await httpGetJson<TassjilPanierEcolesResponse>(
    buildApiUrl('/api/user/tassjil/panier-ecoles'),
    { headers: authHeaders(accessToken) },
  );
  if (!res.success || !res.data) {
    return res;
  }

  const selected = Array.isArray(res.data.selectedSchools)
    ? res.data.selectedSchools.map((row) =>
        normalizeTassjilSchool((row ?? {}) as Record<string, unknown>),
      )
    : [];

  const available = Array.isArray(res.data.availableSchools)
    ? res.data.availableSchools.map((row) =>
        normalizeTassjilSchool((row ?? {}) as Record<string, unknown>),
      )
    : [];

  return {
    ...res,
    data: {
      ...res.data,
      selectedSchools: selected,
      availableSchools: available,
      etatDossierSuivi:
        typeof res.data.etatDossierSuivi === 'string' ? res.data.etatDossierSuivi : null,
      etablissementFinalise:
        typeof res.data.etablissementFinalise === 'string' ? res.data.etablissementFinalise : null,
    },
  };
}
