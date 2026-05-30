type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();
let pendingNotify = false;

export function subscribeSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionExpired(): void {
  if (pendingNotify) return;
  pendingNotify = true;
  queueMicrotask(() => {
    pendingNotify = false;
    for (const fn of listeners) {
      try {
        fn();
      } catch {
        /* noop */
      }
    }
  });
}

function headerHasAuth(init?: RequestInit): boolean {
  const h = init?.headers;
  if (!h) return false;
  if (h instanceof Headers) {
    return h.has('Authorization') || h.has('authorization');
  }
  if (Array.isArray(h)) {
    return h.some(([k]) => k.toLowerCase() === 'authorization');
  }
  return Object.keys(h).some((k) => k.toLowerCase() === 'authorization');
}

/** 401 sur une route authentifiée (hors login / register / refresh). */
export function shouldExpireSessionForUnauthorized(url: string, init?: RequestInit): boolean {
  if (!headerHasAuth(init)) return false;
  const path = url.toLowerCase();
  if (path.includes('/api/login')) return false;
  if (path.includes('/api/register')) return false;
  if (path.includes('/auth/refresh')) return false;
  if (path.includes('/auth/logout')) return false;
  return true;
}
