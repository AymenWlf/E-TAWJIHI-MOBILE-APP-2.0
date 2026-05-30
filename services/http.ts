import { reportMaintenanceIfPresent } from '@/services/maintenanceMode';
import { getDeviceRequestHeaders, initDeviceRequestContext } from '@/utils/deviceRequestContext';
import {
  notifySessionExpired,
  shouldExpireSessionForUnauthorized,
} from '@/utils/sessionExpired';

export type ApiError = Error & {
  status?: number;
  url?: string;
};

function networkHint(): string {
  const origin =
    typeof window !== 'undefined' && typeof window.location?.origin === 'string' ? window.location.origin : undefined;
  return origin
    ? ` (origin: ${origin}) — API démarrée ? CORS OK ? Sinon définir EXPO_PUBLIC_API_BASE_URL.`
    : ' — API locale sur :8001 ? iPhone physique : EXPO_PUBLIC_DEV_API_HOST=<IP du Mac> ou EXPO_PUBLIC_API_BASE_URL.';
}

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

/** En-têtes appareil requis par l’API (accès client mobile sans en-tête Origin). */
function mergeDeviceHeaders(init?: RequestInit): Record<string, string> {
  const base = headersToRecord(init?.headers);
  const device = getDeviceRequestHeaders();
  if (Object.keys(device).length === 0) {
    return base;
  }
  return { ...base, ...device };
}

async function buildRequestHeaders(init?: RequestInit): Promise<Record<string, string>> {
  await initDeviceRequestContext();
  return {
    Accept: 'application/json',
    ...mergeDeviceHeaders(init),
  };
}

function throwApiError(message: string, url: string, status?: number): never {
  const err = new Error(message) as ApiError;
  err.url = url;
  if (status !== undefined) err.status = status;
  throw err;
}

/** Extrait un message lisible depuis une réponse HTML Symfony ou JSON d’erreur. */
function humanizeApiErrorBody(text: string, status: number): string {
  const t = text.trim();
  if (!t) {
    return `Erreur HTTP ${status}`;
  }
  if (
    t.includes('unexpected EOF') ||
    t.includes('unable to fetch the response from the backend')
  ) {
    return (
      'Le serveur a interrompu la réponse (souvent un timeout pendant l’analyse du diagnostic). ' +
      'Réessayez dans un instant. En local : relancez `symfony serve` ou `php -S` sur le port 8001.'
    );
  }
  if (t.startsWith('<') || t.includes('<html') || t.includes('<code>')) {
    const m = t.match(/<code>#?\s*([^<]+)<\/code>/i);
    if (m?.[1]) {
      return m[1].trim();
    }
    return `Erreur serveur (HTTP ${status}).`;
  }
  try {
    const j = JSON.parse(t) as { message?: unknown; error?: unknown };
    if (typeof j.message === 'string' && j.message.trim()) {
      return j.message.trim();
    }
    if (typeof j.error === 'string' && j.error.trim()) {
      return j.error.trim();
    }
  } catch {
    /* corps non JSON */
  }
  return t.length > 320 ? `${t.slice(0, 320)}…` : t;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const headers = await buildRequestHeaders(init);
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
    });
  } catch (_e: unknown) {
    throwApiError(`Failed to fetch: ${url}${networkHint()}`, url);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (reportMaintenanceIfPresent(url, res.status, text)) {
      let maintenanceMsg = 'Plateforme en maintenance. Réessayez dans quelques minutes.';
      try {
        const j = JSON.parse(text) as { message?: string };
        if (typeof j.message === 'string' && j.message.trim() !== '') {
          maintenanceMsg = j.message.trim();
        }
      } catch {
        /* corps non JSON */
      }
      throwApiError(maintenanceMsg, url, res.status);
    }
    if (shouldExpireSessionForUnauthorized(url, init)) {
      if (res.status === 401) {
        notifySessionExpired();
      } else if (res.status === 403) {
        try {
          const j = JSON.parse(text) as { code?: string };
          if (j.code === 'SESSION_REVOKED') {
            notifySessionExpired();
          }
        } catch {
          /* corps non JSON */
        }
      }
    }
    throwApiError(humanizeApiErrorBody(text, res.status), url, res.status);
  }

  const raw = await res.text();
  if (!raw.trim()) {
    throwApiError(
      'Réponse vide du serveur (connexion coupée). Réessayez ou vérifiez que l’API tourne.',
      url,
      res.status,
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throwApiError(humanizeApiErrorBody(raw, res.status), url, res.status);
  }
}

/** Pour les rares `fetch` directs (upload, etc.) — inclut en-têtes client API. */
export async function apiFetchInit(init?: RequestInit): Promise<RequestInit> {
  const headers = await buildRequestHeaders(init);
  return { ...init, headers };
}

export async function httpGetJson<T>(url: string, init?: RequestInit): Promise<T> {
  return await requestJson<T>(url, { method: 'GET', ...(init ?? {}) });
}

export async function httpPostJson<TRes, TBody>(
  url: string,
  body: TBody,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TRes> {
  return await requestJson<TRes>(url, {
    method: 'POST',
    ...(init ?? {}),
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function httpPatchJson<TRes, TBody>(
  url: string,
  body: TBody,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TRes> {
  return await requestJson<TRes>(url, {
    method: 'PATCH',
    ...(init ?? {}),
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function httpPutJson<TRes, TBody>(
  url: string,
  body: TBody,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TRes> {
  return await requestJson<TRes>(url, {
    method: 'PUT',
    ...(init ?? {}),
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function httpDeleteJson<TRes>(url: string, init?: RequestInit): Promise<TRes> {
  return await requestJson<TRes>(url, { method: 'DELETE', ...(init ?? {}) });
}
