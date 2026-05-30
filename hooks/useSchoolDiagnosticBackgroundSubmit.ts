import { useSyncExternalStore } from 'react';

import {
  getSchoolDiagnosticBgSubmitSnapshot,
  subscribeSchoolDiagnosticBgSubmit,
  type SchoolDiagnosticBgSubmitSnapshot,
} from '@/utils/schoolDiagnosticBackgroundSubmit';

export function useSchoolDiagnosticBackgroundSubmit(): SchoolDiagnosticBgSubmitSnapshot {
  return useSyncExternalStore(
    subscribeSchoolDiagnosticBgSubmit,
    getSchoolDiagnosticBgSubmitSnapshot,
    getSchoolDiagnosticBgSubmitSnapshot,
  );
}
