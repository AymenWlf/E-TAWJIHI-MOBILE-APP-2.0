import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';

type CheckReferralCodeResponse = {
  success: boolean;
  data?: {
    allowed: boolean;
    reason: string;
    message: string;
  };
  message?: string;
};

export async function checkReferralCode(
  code: string,
  accessToken?: string | null,
): Promise<{ allowed: boolean; message: string }> {
  const normalized = code.trim().toUpperCase();
  if ('' === normalized) {
    return { allowed: true, message: '' };
  }

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await httpPostJson<CheckReferralCodeResponse, { code: string }>(
    buildApiUrl('/api/referral/check-code'),
    { code: normalized },
    { headers },
  );

  if (!res.success || !res.data) {
    return { allowed: false, message: res.message ?? 'Code parrain invalide.' };
  }

  return {
    allowed: res.data.allowed,
    message: res.data.message,
  };
}
