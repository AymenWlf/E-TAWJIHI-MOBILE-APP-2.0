/** Intervalles polling global — éviter de saturer l’API. */

/** Maintenance : changement rare → 3 min. */
export const MAINTENANCE_POLL_MS = 180_000;

/** Version store : idem. */
export const APP_UPDATE_POLL_MS = 180_000;

/** Badge notifications + annonces (utilisateur connecté). */
export const NOTIFICATIONS_POLL_MS = 90_000;

/** Délai min entre deux refresh réseau (AppState, focus onglet accueil). */
export const PUBLIC_STATUS_DEBOUNCE_MS = 60_000;

export const NOTIFICATIONS_REFRESH_MIN_MS = 35_000;
