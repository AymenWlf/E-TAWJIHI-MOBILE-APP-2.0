import { getAuthPlatform, getOrCreateDeviceId } from '@/utils/deviceId';
import { getDeviceLabel } from '@/utils/deviceLabel';

export const DEVICE_ID_HEADER = 'X-ETawjihi-Device-Id';
export const DEVICE_PLATFORM_HEADER = 'X-ETawjihi-Platform';
export const DEVICE_LABEL_HEADER = 'X-ETawjihi-Device-Label';

let cachedDeviceId: string | null = null;
let cachedPlatform: string | null = null;
let cachedDeviceLabel: string | null = null;
let initPromise: Promise<void> | null = null;

/** Charge deviceId / plateforme / libellé une fois (ou à chaque appel si pas encore fait). */
export function initDeviceRequestContext(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      cachedDeviceId = await getOrCreateDeviceId();
      cachedPlatform = getAuthPlatform();
      cachedDeviceLabel = await getDeviceLabel();
    })();
  }
  return initPromise;
}

export function getDeviceRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (cachedDeviceId) {
    headers[DEVICE_ID_HEADER] = cachedDeviceId;
  }
  if (cachedPlatform) {
    headers[DEVICE_PLATFORM_HEADER] = cachedPlatform;
  }
  if (cachedDeviceLabel) {
    headers[DEVICE_LABEL_HEADER] = cachedDeviceLabel;
  }
  return headers;
}
