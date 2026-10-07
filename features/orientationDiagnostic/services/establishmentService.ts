import {
  listAllEstablishments,
  listEstablishments,
  type EstablishmentListQuery,
} from '@/services/establishments';
import {
  toDiagnosticEstablishment,
  type Establishment,
  type PaginatedResponse,
} from '../adapters/establishmentAdapter';

export type { Establishment } from '../adapters/establishmentAdapter';

export type EstablishmentFilters = EstablishmentListQuery & {
  isActive?: boolean;
};

function toListQuery(filters: EstablishmentFilters): EstablishmentListQuery {
  const { isActive: _isActive, ...rest } = filters;
  return rest;
}

class EstablishmentService {
  async getAll(filters: EstablishmentFilters = {}): Promise<PaginatedResponse<Establishment>> {
    const res = await listEstablishments({
      ...toListQuery(filters),
      page: filters.page ?? 1,
      limit: filters.limit ?? 18,
    });
    let data = res.data.map(toDiagnosticEstablishment);
    if (filters.isActive === true) {
      data = data.filter((e) => e.isActive !== false && e.id != null);
    }
    return {
      success: res.success,
      data,
      pagination: res.pagination,
    };
  }

  /** Catalogue public paginé (100 / page max côté API). */
  async fetchAllPublicCatalog(
    extraFilters: Omit<EstablishmentFilters, 'page' | 'limit'> = {},
    _pageSize = 100,
  ): Promise<Establishment[]> {
    const all = await listAllEstablishments(toListQuery(extraFilters));
    let mapped = all.map(toDiagnosticEstablishment);
    if (extraFilters.isActive === true) {
      mapped = mapped.filter((e) => e.isActive !== false && e.id != null);
    }
    return mapped;
  }
}

export default new EstablishmentService();
