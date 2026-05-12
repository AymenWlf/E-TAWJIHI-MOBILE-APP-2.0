import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPutJson } from '@/services/http';

export type UserProfile = {
  id?: number;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  dateNaissance?: string | null; // YYYY-MM-DD
  genre?: string | null;
  ville?: { id: number; titre: string } | null;
  userType?: string | null;
  niveau?: string | null;
  bacType?: string | null;
  filiere?: string | null;
  /** Année scolaire du baccalauréat (ex. "2025-2026"). */
  bacAnnee?: string | null;
  specialite1?: string | null;
  specialite2?: string | null;
  specialite3?: string | null;
  diplomeEnCours?: string | null;
  nomEtablissement?: string | null;
  typeLycee?: string | null;
  /** Bac national (Maroc) */
  massarCode?: string | null;
  /** Bac mission — code étudiant */
  studentCode?: string | null;
  typeEcolePrefere?: string[] | null;
  servicesPrefere?: string[] | null;
  tuteur?: string | null;
  nomTuteur?: string | null;
  prenomTuteur?: string | null;
  telTuteur?: string | null;
  professionTuteur?: string | null;
  adresseTuteur?: string | null;
  consentContact?: boolean | null;
};

export type GetUserProfileResponse = { success: boolean; data: UserProfile | null; message?: string };

export async function getUserProfile(accessToken: string): Promise<UserProfile | null> {
  const url = buildApiUrl('/api/user/profile');
  const res = await httpGetJson<GetUserProfileResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data ?? null;
}

export type UpdateUserProfilePayload = {
  nom?: string;
  prenom?: string;
  email?: string;
  dateNaissance?: string; // YYYY-MM-DD
  genre?: string;
  ville?: string; // city id as string (backend expects numeric-ish)

  /* ─── Infos académiques (setup wizard) ─── */
  userType?: string;
  niveau?: string;
  bacType?: string; // 'normal' | 'mission' | ''
  filiere?: string;
  /** Année scolaire du bac (ex. "2025-2026"). */
  bacAnnee?: string | null;
  specialite1?: string;
  specialite2?: string;
  specialite3?: string;
  diplomeEnCours?: string;
  nomEtablissement?: string;
  typeLycee?: string; // 'public' | 'prive' | ''
  massarCode?: string;
  studentCode?: string;

  /* ─── Tuteur (setup wizard) ─── */
  tuteur?: string;
  nomTuteur?: string;
  prenomTuteur?: string;
  telTuteur?: string;
  professionTuteur?: string;
  adresseTuteur?: string;
};

export type UpdateUserProfileResponse = { success: boolean; message?: string; data?: unknown };

export async function updateUserProfile(accessToken: string, payload: UpdateUserProfilePayload): Promise<UpdateUserProfileResponse> {
  const url = buildApiUrl('/api/user/profile');
  return await httpPutJson<UpdateUserProfileResponse, UpdateUserProfilePayload>(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

