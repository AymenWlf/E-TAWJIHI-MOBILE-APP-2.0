import { listCities, type CityRow } from '@/services/referenceData';
import { fetchSecteursCatalog, type SecteurCard } from '@/services/secteurs';
import establishmentService, { type Establishment } from '../services/establishmentService';
import metierService, { type Metier } from '../services/metierService';

let citiesPromise: Promise<CityRow[]> | null = null;
let sectorsPromise: Promise<SecteurCard[]> | null = null;
let schoolsPromise: Promise<Establishment[]> | null = null;
const metiersPromises = new Map<string, Promise<Metier[]>>();

export function prefetchOrientationCities(): Promise<CityRow[]> {
  if (!citiesPromise) {
    citiesPromise = listCities(1000).catch((err) => {
      citiesPromise = null;
      throw err;
    });
  }
  return citiesPromise;
}

export function prefetchOrientationSectors(token?: string | null): Promise<SecteurCard[]> {
  if (!sectorsPromise) {
    sectorsPromise = fetchSecteursCatalog({ token })
      .then((res) => res.items)
      .catch((err) => {
        sectorsPromise = null;
        throw err;
      });
  }
  return sectorsPromise;
}

export function prefetchOrientationMetiers(secteurId: string): Promise<Metier[]> {
  const key = String(secteurId);
  const num = Number(key);
  if (!Number.isFinite(num)) return Promise.resolve([]);
  let pending = metiersPromises.get(key);
  if (!pending) {
    pending = metierService
      .getAll({ secteur: num, limit: 100, afficherDansTest: true })
      .then((res) => (res.success && res.data ? [...res.data] : []))
      .catch((err) => {
        metiersPromises.delete(key);
        throw err;
      });
    metiersPromises.set(key, pending);
  }
  return pending;
}

export function prefetchOrientationSchools(): Promise<Establishment[]> {
  if (!schoolsPromise) {
    schoolsPromise = establishmentService.fetchAllPublicCatalog({ isActive: true }).catch((err) => {
      schoolsPromise = null;
      throw err;
    });
  }
  return schoolsPromise;
}

export function prefetchUpcomingOrientationSteps(
  steps: { kind?: string; secteurId?: string }[],
  stepIndex: number,
  selectedSectorIds: string[] = [],
  token?: string | null,
): void {
  const upcoming = steps.slice(stepIndex + 1, stepIndex + 3);
  for (const step of upcoming) {
    if (step.kind === 'cities' || step.kind === 'profile_identity') {
      void prefetchOrientationCities().catch(() => undefined);
    }
    if (step.kind === 'dynamic_sectors') {
      void prefetchOrientationSectors(token).catch(() => undefined);
    }
    if (step.kind === 'dynamic_metiers') {
      const ids = step.secteurId ? [step.secteurId] : selectedSectorIds;
      ids.forEach((id) => {
        void prefetchOrientationMetiers(id).catch(() => undefined);
      });
    }
    if (step.kind === 'dynamic_schools') {
      void prefetchOrientationSchools().catch(() => undefined);
    }
  }
}
