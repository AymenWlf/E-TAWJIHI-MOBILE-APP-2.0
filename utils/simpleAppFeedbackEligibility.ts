/** Aligné sur MobileAppFeedbackKeys::SIMPLE_MIN_HOURS_AFTER_SETUP */
export const SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP = 24;

function parseDateMs(iso: string | null | undefined): number | null {
  if (!iso?.trim()) return null;
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T');
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Éligibilité auto-prompt : setup terminé + 24 h écoulées depuis setupCompletedAt.
 */
export function isEligibleBySetupAge(
  isSetupComplete: boolean | undefined,
  setupCompletedAt: string | null | undefined,
): boolean {
  if (!isSetupComplete) return false;

  const setupMs = parseDateMs(setupCompletedAt);
  if (setupMs === null) return true;

  const hours = (Date.now() - setupMs) / 3_600_000;
  return hours >= SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP;
}

export function hoursSinceSetupCompletion(setupCompletedAt: string | null | undefined): number | null {
  const setupMs = parseDateMs(setupCompletedAt);
  if (setupMs === null) return null;
  return (Date.now() - setupMs) / 3_600_000;
}

/** @deprecated Utiliser isEligibleBySetupAge */
export function isEligibleByAccountAge(_createdAt: string | null | undefined): boolean {
  return false;
}

/** @deprecated Utiliser hoursSinceSetupCompletion */
export function hoursSinceAccountCreation(_createdAt: string | null | undefined): number | null {
  return null;
}

/** @deprecated */
export const SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SIGNUP = SIMPLE_FEEDBACK_MIN_HOURS_AFTER_SETUP;
