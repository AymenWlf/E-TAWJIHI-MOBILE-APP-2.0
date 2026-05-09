import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';

type CompleteSetupResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export type AccountSetupPayload = {
  userType: 'student' | 'tutor' | '';
  niveau: string;
  bacType: 'normal' | 'mission' | '';
  filiere: string;
  /** Année scolaire du bac, ex. "2025-2026". */
  bacAnnee: string;
  specialite1: string;
  specialite2: string;
  specialite3: string;
  diplomeEnCours: string;
  nomEtablissement: string;
  typeLycee: 'public' | 'prive' | '';
  typeEcolePrefere: string[];
  servicesPrefere: string[];
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string; // ISO-ish string (yyyy-mm-dd)
  genre: string;
  ville: string; // city id as string to match web; backend casts numeric
  tuteur: string;
  nomTuteur: string;
  prenomTuteur: string;
  telTuteur: string;
  professionTuteur: string;
  adresseTuteur: string;
  consentContact: boolean;
};

export async function completeAccountSetup(payload: AccountSetupPayload, accessToken: string) {
  const url = buildApiUrl('/api/account/setup');
  return await httpPostJson<CompleteSetupResponse, AccountSetupPayload>(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

