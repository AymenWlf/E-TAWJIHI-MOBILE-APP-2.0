import { buildApiUrl } from '@/constants/api';
import type {
  DiagnosticAnswers,
  DiagnosticStep,
  ModuleId,
  OrientationReport,
} from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import { httpGetJson, httpPostJson, httpPutJson } from '@/services/http';

export type OrientationTestModule = {
  code: ModuleId | string;
  position: number;
  active?: boolean;
  label: string;
  labelAr: string;
  short: string;
  shortAr: string;
  duration: string;
  durationAr: string;
  objective: string;
  objectiveAr: string;
};

export type OrientationTestDefinition = {
  version: number;
  updatedAt?: string;
  modules: OrientationTestModule[];
  questions: DiagnosticStep[];
  copies?: Array<{ code: string; category: string; textFr: string; textAr: string }>;
};

export type OrientationDiagnosticServerSession = {
  id: number;
  stepId: string;
  phase: 'quiz' | 'report';
  uiLocale: string;
  modelVersion?: '1.0' | '2.0';
  answers: DiagnosticAnswers;
  report: OrientationReport | null;
  steps: DiagnosticStep[];
  currentStep: DiagnosticStep | null;
  updatedAt: string;
  staleClient?: boolean;
};

type Envelope<T> = { success?: boolean; message?: string; data?: T };

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchOrientationTestDefinition(
  token: string,
): Promise<OrientationTestDefinition | null> {
  const res = await httpGetJson<Envelope<OrientationTestDefinition>>(
    buildApiUrl('/api/orientation-diagnostic/definition'),
    { headers: authHeaders(token) },
  );
  return res.data ?? null;
}

export async function fetchOrientationDiagnosticSession(
  token: string,
): Promise<OrientationDiagnosticServerSession | null> {
  const res = await httpGetJson<Envelope<OrientationDiagnosticServerSession>>(
    buildApiUrl('/api/orientation-diagnostic/session'),
    { headers: authHeaders(token) },
  );
  return res.data ?? null;
}

export async function saveOrientationDiagnosticStep(
  token: string,
  body: {
    stepId: string;
    phase: 'quiz' | 'report';
    uiLocale?: string;
    answers: DiagnosticAnswers;
    clientUpdatedAt: string;
  },
): Promise<OrientationDiagnosticServerSession | null> {
  const res = await httpPutJson<Envelope<OrientationDiagnosticServerSession>, typeof body>(
    buildApiUrl('/api/orientation-diagnostic/session/step'),
    body,
    { headers: authHeaders(token) },
  );
  return res.data ?? null;
}

export async function fetchOrientationDiagnosticServerReport(
  token: string,
): Promise<OrientationReport | null> {
  const res = await httpGetJson<Envelope<OrientationReport>>(
    buildApiUrl('/api/orientation-diagnostic/report'),
    { headers: authHeaders(token) },
  );
  return res.data ?? null;
}

export async function resetOrientationDiagnosticSession(
  token: string,
): Promise<OrientationDiagnosticServerSession | null> {
  const res = await httpPostJson<Envelope<OrientationDiagnosticServerSession>, Record<string, never>>(
    buildApiUrl('/api/orientation-diagnostic/session/reset'),
    {},
    { headers: authHeaders(token) },
  );
  return res.data ?? null;
}
