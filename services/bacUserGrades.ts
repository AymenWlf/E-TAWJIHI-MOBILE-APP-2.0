import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import { getAuthToken } from '@/services/auth';

export type BacUserGradesPayload = {
  regional: string | number | null;
  national: string | number | null;
  continuous: string | number | null;
  overall: string | number | null;
};

export type BacUserGradesDto = {
  regional: string | null;
  national: string | null;
  continuous: string | null;
  overall: string | null;
  calc75_25: string | null;
  calc50_50: string | null;
  updatedAt: string;
};

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

export async function fetchBacUserGrades(): Promise<BacUserGradesDto | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }
  const url = buildApiUrl('/api/bac-results/grades');
  const res = await httpGetJson<ApiResponse<BacUserGradesDto | null>>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.success) {
    return null;
  }
  return res.data ?? null;
}

export async function saveBacUserGrades(payload: BacUserGradesPayload): Promise<BacUserGradesDto> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Vous devez être connecté pour sauvegarder vos notes.');
  }
  const url = buildApiUrl('/api/bac-results/grades');
  const res = await httpPostJson<ApiResponse<BacUserGradesDto>, BacUserGradesPayload>(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Erreur lors de la sauvegarde des notes.');
  }
  return res.data;
}

