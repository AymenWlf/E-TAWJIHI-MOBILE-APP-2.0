import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  normalizeSchoolQuickDiagnosticDraft,
  SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY,
  SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY,
  SCHOOL_QUICK_DIAGNOSTIC_STORAGE_KEY,
  type PersistedSchoolDiagnosticResult,
  type SchoolQuickDiagnosticForm,
  defaultSchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';

const LAST_RESULT_KEY = 'schoolDiagnosticLastResult_v1';

function isValidPublicCode(s: string): boolean {
  return /^[a-f0-9]{32}$/i.test(s.trim());
}

export async function loadDiagnosticDraft(): Promise<SchoolQuickDiagnosticForm | null> {
  try {
    const raw = await AsyncStorage.getItem(SCHOOL_QUICK_DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return { ...defaultSchoolQuickDiagnosticForm(), ...normalizeSchoolQuickDiagnosticDraft(parsed) };
  } catch {
    return null;
  }
}

export async function saveDiagnosticDraft(form: SchoolQuickDiagnosticForm): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHOOL_QUICK_DIAGNOSTIC_STORAGE_KEY, JSON.stringify(form));
  } catch {
    /* ignore */
  }
}

export async function clearDiagnosticDraft(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      SCHOOL_QUICK_DIAGNOSTIC_STORAGE_KEY,
      SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY,
      SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY,
      LAST_RESULT_KEY,
    ]);
  } catch {
    /* ignore */
  }
}

/** Purge le dernier résultat diagnostic (ex. déconnexion). */
export async function clearSchoolDiagnosticLastResult(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_RESULT_KEY);
  } catch {
    /* ignore */
  }
}

export async function readServerDraftDiagnosticId(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY);
    if (!raw || !/^\d+$/.test(raw)) return null;
    const id = parseInt(raw, 10);
    return Number.isFinite(id) && id >= 1 ? id : null;
  } catch {
    return null;
  }
}

export async function readServerDraftDiagnosticPublicCode(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY);
    if (!raw || !isValidPublicCode(raw)) return null;
    return raw.trim().toLowerCase();
  } catch {
    return null;
  }
}

export async function persistServerDraftDiagnosticId(
  id: number | null,
  publicCode?: string | null,
): Promise<void> {
  try {
    if (id == null || !Number.isFinite(id) || id < 1) {
      await AsyncStorage.multiRemove([
        SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY,
        SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY,
      ]);
      return;
    }
    await AsyncStorage.setItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY, String(id));
    if (publicCode != null && isValidPublicCode(publicCode)) {
      await AsyncStorage.setItem(
        SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY,
        publicCode.trim().toLowerCase(),
      );
    }
  } catch {
    /* ignore */
  }
}

export async function persistSchoolDiagnosticResult(
  id: number,
  publicCode: string,
  userId?: number | null,
): Promise<void> {
  const code = publicCode.trim().toLowerCase();
  const payload: PersistedSchoolDiagnosticResult = {
    id,
    publicCode: code,
    submittedAt: new Date().toISOString(),
    ...(userId != null && userId > 0 ? { userId } : {}),
  };
  try {
    await AsyncStorage.setItem(LAST_RESULT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export async function readPersistedSchoolDiagnosticResult(
  expectedUserId?: number | null,
): Promise<PersistedSchoolDiagnosticResult | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as PersistedSchoolDiagnosticResult;
    if (!o?.id || o.id < 1) return null;
    if (expectedUserId != null && expectedUserId > 0) {
      if (o.userId == null || o.userId !== expectedUserId) {
        return null;
      }
    }
    return o;
  } catch {
    return null;
  }
}
