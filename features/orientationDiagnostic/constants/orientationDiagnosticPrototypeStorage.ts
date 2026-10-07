/**
 * Brouillon du diagnostic d’orientation — lié au compte utilisateur quand possible.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  DiagnosticAnswers,
  ModuleId,
  OrientationReport,
} from '../types/orientationDiagnosticPrototype';
import type { OrientationUiLocale } from '../data/orientationDiagnosticI18n';
import { isOrientationUiLocale } from '../data/orientationDiagnosticI18n';

export const ORIENTATION_DIAGNOSTIC_PROTOTYPE_DRAFT_VERSION = 2 as const;

const LEGACY_KEY = 'orientationDiagnosticPrototypeDraft_v1';
const KEY_PREFIX = 'orientationDiagnosticDraft_v2';

export type OrientationDiagnosticPrototypeDraft = {
  version: 1 | typeof ORIENTATION_DIAGNOSTIC_PROTOTYPE_DRAFT_VERSION;
  savedAt: string;
  userId?: string | number | null;
  phase: 'intro' | 'quiz' | 'report';
  /** Ancre de reprise (les index bougent avec les secteurs / Versus). */
  stepId: string;
  /** Dernier module entièrement franchi (null si aucun encore). */
  lastCompletedModule: ModuleId | null;
  /** Modules franchis (pour le suivi UI). */
  completedModules?: ModuleId[];
  answers: DiagnosticAnswers;
  ui: {
    situationBriefDone: boolean;
    versusBriefDone: boolean;
    situationPhase: 'most' | 'least';
  };
  /** Langue d’interface du test (FR / AR) */
  uiLocale?: OrientationUiLocale;
  /** Rapport optionnel si phase === report */
  report?: OrientationReport | null;
  /** Rapport vu / CTA validé (complétion locale si pas de clé API `orientationReport`). */
  reportParcoursSynced?: boolean;
  /** Code public du diagnostic écoles généré depuis ce test (recommandations). */
  schoolRecoPublicCode?: string | null;
};

function storageKey(userId?: string | number | null): string {
  if (userId != null && String(userId).trim() !== '') {
    return `${KEY_PREFIX}_u${userId}`;
  }
  return `${KEY_PREFIX}_guest`;
}

function normalizeDraft(
  parsed: OrientationDiagnosticPrototypeDraft,
): OrientationDiagnosticPrototypeDraft | null {
  if (!parsed?.answers || typeof parsed.answers !== 'object') return null;
  if (!parsed.stepId && parsed.phase === 'quiz') return null;
  const completedModules =
    parsed.completedModules ||
    (parsed.lastCompletedModule
      ? ([parsed.lastCompletedModule] as ModuleId[])
      : []);
  return {
    ...parsed,
    version: ORIENTATION_DIAGNOSTIC_PROTOTYPE_DRAFT_VERSION,
    completedModules,
    uiLocale: isOrientationUiLocale(parsed.uiLocale) ? parsed.uiLocale : undefined,
    answers: {
      ...parsed.answers,
      schoolMeta: parsed.answers.schoolMeta || {},
      labels: parsed.answers.labels || {},
      versusPlan: parsed.answers.versusPlan || [],
      versusField: parsed.answers.versusField || { metiers: [], ecoles: [] },
      versusLog: parsed.answers.versusLog || [],
      versusRankings: parsed.answers.versusRankings || { metiers: [], ecoles: [] },
    },
  };
}

export async function readOrientationDiagnosticPrototypeDraft(
  userId?: string | number | null,
): Promise<OrientationDiagnosticPrototypeDraft | null> {
  try {
    const key = storageKey(userId);
    let raw = await AsyncStorage.getItem(key);
    let migratedFromLegacy = false;
    if (!raw && userId != null) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      migratedFromLegacy = Boolean(raw);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrientationDiagnosticPrototypeDraft;
    if (
      parsed?.version !== 1 &&
      parsed?.version !== ORIENTATION_DIAGNOSTIC_PROTOTYPE_DRAFT_VERSION
    ) {
      await clearOrientationDiagnosticPrototypeDraft(userId);
      return null;
    }
    const normalized = normalizeDraft(parsed);
    if (!normalized) return null;
    if (userId != null && migratedFromLegacy) {
      await persistOrientationDiagnosticPrototypeDraft({ ...normalized, userId });
    }
    return normalized;
  } catch {
    return null;
  }
}

export async function persistOrientationDiagnosticPrototypeDraft(
  draft: Omit<OrientationDiagnosticPrototypeDraft, 'version' | 'savedAt'> & {
    version?: number;
    savedAt?: string;
    userId?: string | number | null;
  },
): Promise<void> {
  try {
    const payload: OrientationDiagnosticPrototypeDraft = {
      version: ORIENTATION_DIAGNOSTIC_PROTOTYPE_DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      userId: draft.userId ?? null,
      phase: draft.phase,
      stepId: draft.stepId,
      lastCompletedModule: draft.lastCompletedModule,
      completedModules: draft.completedModules || [],
      answers: draft.answers,
      ui: draft.ui,
      uiLocale: isOrientationUiLocale(draft.uiLocale) ? draft.uiLocale : undefined,
      report: draft.report ?? null,
      reportParcoursSynced: draft.reportParcoursSynced === true,
      schoolRecoPublicCode:
        typeof draft.schoolRecoPublicCode === 'string' &&
        /^[a-f0-9]{32}$/i.test(draft.schoolRecoPublicCode.trim())
          ? draft.schoolRecoPublicCode.trim().toLowerCase()
          : draft.schoolRecoPublicCode === null
            ? null
            : undefined,
    };
    await AsyncStorage.setItem(storageKey(draft.userId), JSON.stringify(payload));
  } catch {
    /* quota / stockage indisponible */
  }
}

export async function clearOrientationDiagnosticPrototypeDraft(
  userId?: string | number | null,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
    if (userId != null) await AsyncStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export async function hasOrientationDiagnosticPrototypeDraft(
  userId?: string | number | null,
): Promise<boolean> {
  const d = await readOrientationDiagnosticPrototypeDraft(userId);
  return Boolean(d && (d.phase === 'quiz' || d.phase === 'report'));
}

export function formatDraftSavedAt(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** Modules dans l’ordre du parcours. */
export const ORIENTATION_MODULE_ORDER: ModuleId[] = [
  'profile',
  'context',
  'riasec',
  'situations',
  'functioning',
  'ambitions',
  'reality',
  'careers',
  'schools',
  'versus',
];

export function completedModulesUpTo(
  lastCompleted: ModuleId | null | undefined,
  completedList?: ModuleId[],
): ModuleId[] {
  if (completedList?.length) {
    const set = new Set(completedList);
    return ORIENTATION_MODULE_ORDER.filter((id) => set.has(id));
  }
  if (!lastCompleted) return [];
  const idx = ORIENTATION_MODULE_ORDER.indexOf(lastCompleted);
  if (idx < 0) return [];
  return ORIENTATION_MODULE_ORDER.slice(0, idx + 1);
}
