import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  LegacyLinkInitiateResponse,
  LegacyLinkStatus,
  LegacyLinkVerifyResponse,
  TassjilPanierEcolesResponse,
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

export async function fetchTassjilPanierEcoles(accessToken: string): Promise<TassjilPanierEcolesResponse> {
  return await httpGetJson<TassjilPanierEcolesResponse>(
    buildApiUrl('/api/user/tassjil/panier-ecoles'),
    { headers: authHeaders(accessToken) },
  );
}
