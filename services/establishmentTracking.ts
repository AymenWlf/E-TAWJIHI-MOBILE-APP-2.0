import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import { logAnalytics } from '@/utils/analyticsDebug';
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
): Promise<boolean> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return false;
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/establishments-tracking/record-impression');
    await httpPostJson<{ success: boolean }, RecordPayload>(url, {
      establishmentId,
      context,
      source: 'mobile',
      visitorId,
    });
    logAnalytics('establishments-tracking impression ok', { establishmentId, context });
    return true;
  } catch (e) {
    logAnalytics('establishments-tracking impression fail', {
      establishmentId,
      context,
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
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
 * Impression listing — dédupliquée par session, à appeler quand la carte
 * entre réellement dans le viewport (FlatList viewability).
 */
export function recordEstablishmentListingImpressionOnce(establishmentId: number): void {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return;
  if (sessionListingTracked.has(establishmentId)) return;
  sessionListingTracked.add(establishmentId);
  logAnalytics('establishments-tracking listing impression →', { establishmentId });
  void recordEstablishmentImpression(establishmentId, 'listing').then((ok) => {
    if (!ok) sessionListingTracked.delete(establishmentId);
  });
}

/**
 * @deprecated Préférer `recordEstablishmentListingImpressionOnce` au scroll visible.
 */
export function recordEstablishmentListingImpressionsBatch(items: { id: number }[]): void {
  if (!Array.isArray(items) || items.length === 0) return;
  for (const it of items) {
    if (Number.isFinite(it.id) && it.id > 0) {
      recordEstablishmentListingImpressionOnce(it.id);
    }
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
  void recordEstablishmentImpression(establishmentId, 'detail').then((ok) => {
    if (!ok) sessionDetailTracked.delete(establishmentId);
  });
}
