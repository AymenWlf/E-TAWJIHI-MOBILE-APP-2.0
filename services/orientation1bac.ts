import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

export type Orientation1BacStepName =
  | 'schoolInfo'
  | 'grades'
  | 'subjectPrefs'
  | 'workStyle'
  | 'interests'
  | 'postBacGoals'
  | 'constraints';

export type Orientation1BacProgress = {
  currentStep: Orientation1BacStepName;
  completedSteps: Orientation1BacStepName[];
  progress: number;
};

export type Orientation1BacAnalyzeReport = {
  recommendedTracks: Array<{
    trackId: string;
    score: number;
    band: string;
    reasons: string[];
  }>;
  strengths: string[];
  subjectsToImprove: string[];
  riskLevel: string;
  riskNotes: string[];
  disclaimer: string;
};

export async function startOrientation1BacTest(opts?: { selectedLanguage?: 'fr' | 'ar'; restart?: boolean }) {
  const url = buildApiUrl('/api/orientation-test-1bac/start');
  return await httpPostJson(url, {
    selectedLanguage: opts?.selectedLanguage ?? 'fr',
    restart: opts?.restart === true,
  });
}

export async function getOrientation1BacProgress(): Promise<{ success: boolean; hasTest?: boolean; data?: Orientation1BacProgress }> {
  const url = buildApiUrl('/api/orientation-test-1bac/get-progress');
  return await httpGetJson(url);
}

export async function getOrientation1BacStep(stepName: Orientation1BacStepName): Promise<{ success: boolean; data?: { stepData?: unknown } }> {
  const url = buildApiUrl(`/api/orientation-test-1bac/get-step?stepName=${encodeURIComponent(stepName)}`);
  return await httpGetJson(url);
}

export async function saveOrientation1BacStep(opts: {
  stepName: Orientation1BacStepName;
  stepNumber: number;
  stepData: Record<string, unknown>;
  duration?: number;
  language?: 'fr' | 'ar';
}) {
  const url = buildApiUrl('/api/orientation-test-1bac/save-step');
  return await httpPostJson(url, {
    stepName: opts.stepName,
    stepNumber: opts.stepNumber,
    stepData: opts.stepData,
    duration: opts.duration ?? 0,
    language: opts.language ?? 'fr',
  });
}

export async function analyzeOrientation1Bac(): Promise<{ success: boolean; data?: { report?: Orientation1BacAnalyzeReport } }> {
  const url = buildApiUrl('/api/orientation-test-1bac/analyze');
  return await httpGetJson(url);
}

export async function completeOrientation1Bac(opts: { report?: Orientation1BacAnalyzeReport }) {
  const url = buildApiUrl('/api/orientation-test-1bac/complete');
  return await httpPostJson(url, { report: opts.report ?? null });
}

export async function fetchSupFilieresForTracks(trackIds: string[]) {
  const url = buildApiUrl(`/api/orientation-test-1bac/sup-filieres?tracks=${encodeURIComponent(trackIds.join(','))}`);
  return await httpGetJson(url);
}

