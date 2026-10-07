import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export interface Metier {
  id: number;
  nom: string;
  nomArabe?: string;
  slug: string;
  secteur?: {
    id: number;
    titre: string;
    code: string;
  };
  description?: string;
  descriptionAr?: string;
  niveauAccessibilite?: string;
  salaireMin?: string | null;
  salaireMax?: string | null;
  competences?: string[];
  formations?: string[];
  isActivate: boolean;
  afficherDansTest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetierListResponse {
  success: boolean;
  data: Metier[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MetierResponse {
  success: boolean;
  data: Metier;
  message?: string;
}

class MetierService {
  async getAll(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    secteur?: number;
    afficherDansTest?: boolean;
  }): Promise<MetierListResponse> {
    const url = buildApiUrl('/api/metiers', {
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search?.trim() || undefined,
      secteur: filters?.secteur,
      afficherDansTest:
        filters?.afficherDansTest !== undefined ? filters.afficherDansTest : undefined,
    });
    return httpGetJson<MetierListResponse>(url);
  }

  async getById(id: number): Promise<MetierResponse> {
    const url = buildApiUrl(`/api/metiers/${id}`);
    return httpGetJson<MetierResponse>(url);
  }

  async getBySlug(slug: string): Promise<MetierResponse> {
    const url = buildApiUrl(`/api/metiers/slug/${encodeURIComponent(slug)}`);
    return httpGetJson<MetierResponse>(url);
  }
}

export default new MetierService();
