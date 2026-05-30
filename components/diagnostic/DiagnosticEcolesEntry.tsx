import { SchoolDiagnosticWizard } from '@/components/diagnostic/SchoolDiagnosticWizard';

/**
 * Entrée diagnostic écoles : toujours le wizard (étape 1).
 * Les recommandations s’ouvrent via /diagnostic-ecoles/resultats ou l’étape parcours « Recommandation ».
 */
export function DiagnosticEcolesEntry() {
  return <SchoolDiagnosticWizard />;
}
