import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

/**
 * Tracking d'audience des établissements depuis l'app mobile native.
 *
 * Les KPIs sont ventilés côté backend par `context` (listing|detail) et par
 * `source` (web|mobile) — l'app envoie systématiquement `mobile`. Toutes les
 * fonctions sont **best-effort** : aucune ne doit propager d'erreur ni
 * bloquer le rendu — l'analytics est une source secondaire.
 */
type RecordPayload = {
  establishmentId: number;
  context: 'listing' | 'detail';
  source: 'mobile';
  visitorId: string;
};

/**
 * Cache module-level des IDs déjà comptabilisés en impression « listing »
 * pour la session en cours. Évite d'envoyer N fois la même mesure si la
 * liste est rechargée (pull-to-refresh, retour sur l'onglet, etc.).
 *
 * On accepte une légère sous-comptabilisation côté liste (quelques
 * impressions perdues si l'app est tuée) au profit d'un trafic réseau
 * minimal — les KPIs restent largement représentatifs sur la durée.
 */
const sessionListingTracked = new Set<number>();

/**
 * Cache module-level pour les impressions « detail » : on n'incrémente
 * qu'une fois par session pour le même établissement, peu importe le nombre
 * de re-rendus du composant détail (navigation back/forward).
 */
const sessionDetailTracked = new Set<number>();

export async function recordEstablishmentImpression(
  establishmentId: number,
  context: 'listing' | 'detail' = 'listing',
): Promise<void> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return;
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/establishments-tracking/record-impression');
    await httpPostJson<{ success: boolean }, RecordPayload>(url, {
      establishmentId,
      context,
      source: 'mobile',
      visitorId,
    });
  } catch {
    /* noop */
  }
}

export async function recordEstablishmentClick(
  establishmentId: number,
  context: 'listing' | 'detail' = 'listing',
): Promise<void> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return;
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/establishments-tracking/record-click');
    await httpPostJson<{ success: boolean }, RecordPayload>(url, {
      establishmentId,
      context,
      source: 'mobile',
      visitorId,
    });
  } catch {
    /* noop */
  }
}

/**
 * Enregistre les impressions « listing » pour un lot d'écoles visibles,
 * en évitant les doublons sur la même session d'app.
 */
export function recordEstablishmentListingImpressionsBatch(items: { id: number }[]): void {
  if (!Array.isArray(items) || items.length === 0) return;
  const fresh = items.filter(
    (i) => Number.isFinite(i.id) && i.id > 0 && !sessionListingTracked.has(i.id),
  );
  for (const it of fresh) {
    sessionListingTracked.add(it.id);
    void recordEstablishmentImpression(it.id, 'listing');
  }
}

/**
 * Enregistre une impression « detail » pour un établissement (dédupliquée
 * sur la session). Idéalement appelé une fois quand la fiche s'ouvre.
 */
export function recordEstablishmentDetailImpressionOnce(establishmentId: number): void {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return;
  if (sessionDetailTracked.has(establishmentId)) return;
  sessionDetailTracked.add(establishmentId);
  void recordEstablishmentImpression(establishmentId, 'detail');
}
