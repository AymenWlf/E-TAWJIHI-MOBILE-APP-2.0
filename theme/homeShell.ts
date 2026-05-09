/**
 * Thème « shell » accueil — disque haut + cartes blanches.
 * Charte E-Tawjihi : bleu + vert + blanc (pas d’orange).
 */
export const homeShell = {
  /** Fond du disque hero (haut de page) — bleu marque rgb(126, 138, 222) */
  bg: '#333E8F',
  /** Variante plus soutenue (élévations / futures surfaces sombres) */
  bgElevated: '#2A3478',
  /** Texte sur fond sombre */
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.72)',
  textDim: 'rgba(255,255,255,0.55)',
  /** Accents — bleu = topbar web E-Tawjihi (#333e8f) */
  blue: '#333E8F',
  blueDeep: '#2A3478',
  /** Vert UI (timeline, stories, accents) — aligné produit #2fce94 */
  green: '#2fce94',
  /** Variante plus soutenue (bordures, texte/icône sur fond clair) */
  greenDark: '#158f65',
  /** Transparences pour halos / fonds de boutons */
  greenAlpha11: 'rgba(47, 206, 148, 0.11)',
  greenAlpha18: 'rgba(47, 206, 148, 0.18)',
  greenAlpha28: 'rgba(47, 206, 148, 0.28)',
  /** Surfaces carte */
  card: '#FFFFFF',
  cardText: '#0F172A',
  cardMuted: '#64748B',
  /** Bordures / séparations */
  hairline: 'rgba(255,255,255,0.08)',
  borderOnWhite: '#E2E8F0',
  /** Pastilles pagination inactive */
  dotInactive: 'rgba(255,255,255,0.35)',
  dotInactiveOnLight: '#CBD5E1',
  /** Pastille cloche (non lus) : rouge léger, lisible sur le bleu du header */
  notifBadgeBg: '#FECDD3',
  notifBadgeText: '#9F1239',
  notifBadgeBorder: 'rgba(255,255,255,0.55)',
} as const;
