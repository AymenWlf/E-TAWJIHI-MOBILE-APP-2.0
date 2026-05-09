/**
 * Identifiant visiteur stable pour le tracking analytique mobile.
 *
 * Génère et persiste un UUID v4 unique au premier lancement de l'app
 * (stocké dans AsyncStorage sous `etawjihi:visitorId`). Cet identifiant est
 * envoyé avec chaque appel `recordContestImpression`/`recordContestClick`
 * pour que le backend puisse compter les visiteurs **uniques** par jour
 * (et non seulement les hits bruts).
 *
 * Caractéristiques :
 *   - Stable par installation (réinitialisé uniquement si l'app est désinstallée
 *     ou si AsyncStorage est purgé) — pas lié au compte utilisateur, donc reste
 *     fonctionnel pour les visiteurs anonymes.
 *   - Format : 36 caractères max (compatible avec la colonne VARCHAR(64) backend).
 *   - Mémoïsé en mémoire après la première lecture pour éviter les I/O
 *     répétés (les KPIs émettent fréquemment des requêtes lors du scroll).
 *   - Tolérant aux erreurs : si AsyncStorage échoue, on garde l'ID en mémoire
 *     pour la session courante (les compteurs restent cohérents).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'etawjihi:visitorId';

let cachedId: string | null = null;
let inflight: Promise<string> | null = null;

/**
 * Renvoie l'identifiant visiteur (le crée et le persiste si absent).
 *
 * Utilisable depuis n'importe quel contexte (best-effort, n'échoue jamais).
 */
export async function getMobileVisitorId(): Promise<string> {
  if (cachedId) return cachedId;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim() !== '') {
        cachedId = stored.trim();
        return cachedId;
      }
    } catch {
      /* ignore — on tombera sur la génération ci-dessous */
    }

    const fresh = generateUuidV4();
    cachedId = fresh;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, fresh);
    } catch {
      /* ignore : ID utilisable au moins pour la session en cours */
    }
    return fresh;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * Variante synchrone : renvoie l'ID s'il est déjà chargé en mémoire,
 * sinon `null`. Utile pour des call-sites qui ne peuvent pas être
 * `async` (ex: `useMemo` initial). Le caller est censé déclencher
 * `getMobileVisitorId()` en parallèle pour préchauffer le cache.
 */
export function peekMobileVisitorId(): string | null {
  return cachedId;
}

/**
 * UUID v4 simple (RFC 4122) — pas besoin d'une dépendance crypto dédiée
 * pour un identifiant analytique non sensible. `Math.random` est
 * suffisamment uniformément distribué pour notre cas (collision quasi
 * impossible à l'échelle des installations attendues).
 */
function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
