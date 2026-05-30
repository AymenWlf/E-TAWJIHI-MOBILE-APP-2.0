import type { SchoolDiagnosticFullResult } from '@/services/schoolRecommendationDiagnostic';

const DEFAULT_INTERVAL_MS = 4000;
const DEFAULT_MAX_ATTEMPTS = 45;

export type PollSchoolDiagnosticGrokOptions = {
  intervalMs?: number;
  maxAttempts?: number;
  onUpdate?: (data: SchoolDiagnosticFullResult) => void;
};

/** Recharge le diagnostic tant que grokPending est vrai. */
export async function pollSchoolDiagnosticGrokUntilReady(
  fetchDiagnostic: () => Promise<SchoolDiagnosticFullResult | null>,
  options: PollSchoolDiagnosticGrokOptions = {},
): Promise<SchoolDiagnosticFullResult | null> {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  let last: SchoolDiagnosticFullResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    last = await fetchDiagnostic();
    if (last === null) {
      return null;
    }
    options.onUpdate?.(last);
    if (!last.grokPending) {
      return last;
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return last;
}
