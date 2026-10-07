import type { Establishment } from '../services/establishmentService';
import {
  resolveAdmissionDisplayLabel,
} from '../constants/establishmentAdmissionType';
import { normalizeOrientationPlan } from '../constants/establishmentOrientationPlan';
import type { OrientationSchoolMeta } from '../types/orientationDiagnosticPrototype';
import {
  establishmentDiplomesList,
  establishmentDisplayCities,
  establishmentDureeEtudesLabel,
} from './orientationDiagnosticSchoolReco';
import { isFacultePubliqueAccesOuvert } from './orientationFacultePubliqueGroup';

export {
  establishmentDiplomesLabel,
  establishmentDiplomesList,
  establishmentDureeEtudesLabel,
} from './orientationDiagnosticSchoolReco';

export function buildOrientationSchoolMeta(e: Establishment): OrientationSchoolMeta {
  const villes = establishmentDisplayCities(e);
  const diplomes = establishmentDiplomesList(e);
  return {
    orientationPlan: normalizeOrientationPlan(e.orientationPlan),
    admissionType: e.admissionType ?? null,
    admissionLabel: resolveAdmissionDisplayLabel(e),
    concours: Boolean(e.concours),
    afficherEtudeDossierPublic: Boolean(e.afficherEtudeDossierPublic),
    facultePubliqueAccesOuvert: isFacultePubliqueAccesOuvert(e),
    type: e.type || null,
    ville: villes[0] || e.ville || e.location?.ville || (Array.isArray(e.villes) && e.villes[0]) || null,
    villes,
    dureeEtudes: establishmentDureeEtudesLabel(e) || null,
    diplomes,
  };
}
