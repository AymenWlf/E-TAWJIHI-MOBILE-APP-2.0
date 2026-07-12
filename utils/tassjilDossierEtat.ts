/** États de dossier (Mes étudiants) exposés côté suivi TASSJIL mobile. */
export type TassjilEtatDossierSuivi =
  | 'abandonne'
  | 'rembourse'
  | 'annule_etawjihi'
  | 'inscrit_finalise'
  | 'finalise_sans_acceptation'
  | 'redoublement';

const LABELS_FR: Record<TassjilEtatDossierSuivi, string> = {
  abandonne: 'Abandonné',
  rembourse: 'Remboursé',
  annule_etawjihi: 'Annulé par e-tawjihi',
  inscrit_finalise: 'Inscrit et finalisé',
  finalise_sans_acceptation: 'Finalisé mais sans acceptation',
  redoublement: 'Redoublement',
};

const LABELS_AR: Record<TassjilEtatDossierSuivi, string> = {
  abandonne: 'متخلى عنه',
  rembourse: 'مسترد',
  annule_etawjihi: 'ملغى من طرف e-tawjihi',
  inscrit_finalise: 'مسجّل ومُغلق',
  finalise_sans_acceptation: 'مُغلق بدون قبول',
  redoublement: 'إعادة السنة',
};

export function isTassjilEtatDossierSuivi(value: string | null | undefined): value is TassjilEtatDossierSuivi {
  return !!value && value in LABELS_FR;
}

/**
 * Libellé d’état dossier pour la page Mes TASSJIL.
 * Si un état est appliqué → son libellé ; sinon « Prestation en cours ».
 */
export function getTassjilDossierEtatDisplay(
  etat: string | null | undefined,
  etablissementFinalise: string | null | undefined,
  isArabic: boolean,
  fallbackPrestationEnCours: string,
): { label: string; hasEtat: boolean; tone: 'default' | 'success' | 'warning' | 'danger' } {
  if (!isTassjilEtatDossierSuivi(etat)) {
    return { label: fallbackPrestationEnCours, hasEtat: false, tone: 'default' };
  }

  const labels = isArabic ? LABELS_AR : LABELS_FR;
  let label = labels[etat];
  if (etat === 'inscrit_finalise' && etablissementFinalise?.trim()) {
    label = `${label} · ${etablissementFinalise.trim()}`;
  }

  const tone: 'default' | 'success' | 'warning' | 'danger' =
    etat === 'inscrit_finalise'
      ? 'success'
      : etat === 'redoublement' || etat === 'finalise_sans_acceptation'
        ? 'warning'
        : 'danger';

  return { label, hasEtat: true, tone };
}
