import * as Linking from 'expo-linking';

import { buildPublicPageUrl } from '@/constants/publicWeb';

/** Diagnostic d’orientation du parcours mobile (`/diagnostic-ecoles`, ≠ test web `/test-diagnostic`). */
export function openPlanOrientationDiagnostic(): void {
  void Linking.openURL(buildPublicPageUrl('/diagnostic-ecoles')).catch(() => undefined);
}

/** @deprecated Test de personnalité web — ne pas utiliser pour le parcours mobile. */
export function openOrientationParcours(): void {
  void Linking.openURL(buildPublicPageUrl('/test-diagnostic')).catch(() => undefined);
}
