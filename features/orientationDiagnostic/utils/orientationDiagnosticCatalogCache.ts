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

function loadSectorMetiers(secteurId: string, afficherDansTest?: boolean): Promise<Metier[]> {
  const key = afficherDansTest == null ? `all:${secteurId}` : String(secteurId);
  const num = Number(secteurId);
  if (!Number.isFinite(num)) return Promise.resolve([]);
  let pending = metiersPromises.get(key);
  if (!pending) {
    pending = metierService
      .getAll({
        secteur: num,
        limit: 100,
        ...(afficherDansTest == null ? {} : { afficherDansTest }),
      })
      .then((res) => (res.success && res.data ? [...res.data] : []))
      .catch((err) => {
        metiersPromises.delete(key);
        throw err;
      });
    metiersPromises.set(key, pending);
  }
  return pending;
}

/** Métiers du secteur prévus pour le test. */
export function prefetchOrientationMetiers(secteurId: string): Promise<Metier[]> {
  return loadSectorMetiers(secteurId, true);
}

/** Tous les métiers actifs du secteur, pour compléter une liste trop courte. */
export function prefetchOrientationSectorMetiers(secteurId: string): Promise<Metier[]> {
  return loadSectorMetiers(secteurId);
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
