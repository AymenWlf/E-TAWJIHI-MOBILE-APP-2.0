import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import type { LoginResponse } from '@/services/auth';

export type DeviceTransferSession = {
  sessionId: string;
  deviceId: string;
  platform: string;
  deviceLabel: string;
  platformLabel: string;
  lastSeenAt: string;
};

export type DeviceTransferConfirmResponse = LoginResponse;

export async function verifyDeviceTransferOtp(
  transferToken: string,
  otp: string,
): Promise<{
  success: boolean;
  message?: string;
  data?: { activeSessions?: DeviceTransferSession[] };
}> {
  const url = buildApiUrl('/api/device-transfer/verify-otp');
  return await httpPostJson(url, {
    transferToken: transferToken.trim(),
    otp: otp.trim(),
  });
}

export async function confirmDeviceTransfer(
  transferToken: string,
  revokeSessionId?: string,
): Promise<DeviceTransferConfirmResponse> {
  const url = buildApiUrl('/api/device-transfer/confirm');
  const body: { transferToken: string; revokeSessionId?: string } = {
    transferToken: transferToken.trim(),
  };
  if (revokeSessionId?.trim()) {
    body.revokeSessionId = revokeSessionId.trim();
  }
  return await httpPostJson<DeviceTransferConfirmResponse, typeof body>(url, body);
}

export async function resendDeviceTransferOtp(transferToken: string): Promise<{
  success: boolean;
  message?: string;
  data?: {
    transferToken?: string;
    whatsappSent?: boolean;
    supportPhone?: string;
    activeSessions?: DeviceTransferSession[];
    maxDevices?: number;
  };
}> {
  const url = buildApiUrl('/api/device-transfer/resend-otp');
  return await httpPostJson(url, { transferToken: transferToken.trim() });
}
