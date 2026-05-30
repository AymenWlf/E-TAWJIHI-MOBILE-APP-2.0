type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeSchoolDiagnosticRecommendationsRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySchoolDiagnosticRecommendationsRefresh(): void {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
}
