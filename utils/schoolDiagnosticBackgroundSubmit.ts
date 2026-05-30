import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SchoolDiagnosticSubmitResult } from '@/services/schoolRecommendationDiagnostic';
import { notifySchoolDiagnosticRecommendationsRefresh } from '@/utils/schoolDiagnosticRecommendationsNotify';
import { persistSchoolDiagnosticResult } from '@/utils/schoolDiagnosticStorage';

const PENDING_NAV_KEY = 'schoolDiagnosticBgPendingNav_v1';

export type SchoolDiagnosticBgSubmitPhase = 'idle' | 'running' | 'success' | 'error';

export type SchoolDiagnosticBgSubmitSnapshot = {
  phase: SchoolDiagnosticBgSubmitPhase;
  detached: boolean;
  publicCode?: string;
  errorMessage?: string;
};

type Listener = () => void;

let snapshot: SchoolDiagnosticBgSubmitSnapshot = { phase: 'idle', detached: false };
const listeners = new Set<Listener>();
let runGeneration = 0;

function isValidPublicCode(s: string): boolean {
  return /^[a-f0-9]{32}$/i.test(s.trim());
}

function emit(): void {
  for (const fn of listeners) fn();
}

export function getSchoolDiagnosticBgSubmitSnapshot(): SchoolDiagnosticBgSubmitSnapshot {
  return snapshot;
}

export function subscribeSchoolDiagnosticBgSubmit(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** L’utilisateur a quitté l’écran d’analyse : ne pas forcer la navigation automatique. */
export function markSchoolDiagnosticSubmitDetached(): void {
  if (snapshot.phase !== 'running') return;
  snapshot = { ...snapshot, detached: true };
  emit();
}

export function resetSchoolDiagnosticBgSubmitIdle(): void {
  if (snapshot.phase === 'running') return;
  snapshot = { phase: 'idle', detached: false };
  emit();
}

export async function clearPendingDiagnosticNavigation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_NAV_KEY);
  } catch {
    /* ignore */
  }
}

export async function consumePendingDiagnosticNavigation(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_NAV_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(PENDING_NAV_KEY);
    const o = JSON.parse(raw) as { publicCode?: string };
    const code = typeof o.publicCode === 'string' ? o.publicCode.trim().toLowerCase() : '';
    return isValidPublicCode(code) ? code : null;
  } catch {
    return null;
  }
}

async function storePendingNavigation(publicCode: string): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PENDING_NAV_KEY,
      JSON.stringify({ publicCode: publicCode.trim().toLowerCase(), at: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Lance l’analyse côté API sans être annulée si le wizard se démonte.
 * `execute` doit contenir l’appel finalize/submit.
 */
export function runSchoolDiagnosticBackgroundSubmit(options: {
  execute: () => Promise<SchoolDiagnosticSubmitResult>;
  afterSuccess?: (result: SchoolDiagnosticSubmitResult) => Promise<void>;
  userId?: number | null;
}): boolean {
  if (snapshot.phase === 'running') return false;

  const gen = ++runGeneration;
  snapshot = { phase: 'running', detached: false };
  emit();

  void (async () => {
    try {
      const result = await options.execute();
      if (gen !== runGeneration) return;

      await persistSchoolDiagnosticResult(result.id, result.publicCode, options.userId ?? null);
      notifySchoolDiagnosticRecommendationsRefresh();
      if (options.afterSuccess) {
        await options.afterSuccess(result);
      }

      const detached = snapshot.detached;
      snapshot = {
        phase: 'success',
        detached,
        publicCode: result.publicCode.trim().toLowerCase(),
      };
      emit();

      if (detached && snapshot.publicCode) {
        await storePendingNavigation(snapshot.publicCode);
      }
    } catch (e) {
      if (gen !== runGeneration) return;
      snapshot = {
        phase: 'error',
        detached: snapshot.detached,
        errorMessage: e instanceof Error ? e.message : 'Envoi impossible',
      };
      emit();
    }
  })();

  return true;
}
