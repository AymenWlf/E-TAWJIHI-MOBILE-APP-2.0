export type ApiError = {
  message: string;
  status?: number;
  url?: string;
};

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch (_e: unknown) {
    const origin =
      typeof window !== 'undefined' && typeof window.location?.origin === 'string' ? window.location.origin : undefined;
    const hint = origin
      ? ` (origin: ${origin}) — API démarrée ? CORS OK ? Sinon définir EXPO_PUBLIC_API_BASE_URL.`
      : ` — API locale sur :8001 ? iPhone physique : EXPO_PUBLIC_DEV_API_HOST=<IP du Mac> ou EXPO_PUBLIC_API_BASE_URL.`;
    const err: ApiError = { message: `Failed to fetch: ${url}${hint}`, url };
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: ApiError = { message: text || `HTTP ${res.status}`, status: res.status, url };
    throw err;
  }
  return (await res.json()) as T;
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
