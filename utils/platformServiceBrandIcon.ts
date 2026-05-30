import type { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DEFAULT_ICON = 'briefcase';
const DEFAULT_COLOR = '#333E8F';

/** Clé icône FA4 normalisée (alignée admin / API Symfony). */
export function parsePlatformServiceBrandIconKey(raw: string | null | undefined): string {
  let s = String(raw ?? '').trim().toLowerCase();
  if (!s) return DEFAULT_ICON;
  if (s.startsWith('fa-')) s = s.slice(3);
  if (s.startsWith('fa ')) s = s.slice(3).trim();
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(s)) return DEFAULT_ICON;
  return s.slice(0, 48);
}

/** Étend #RGB, #RRGGBB ou RRGGBB sans #. */
export function expandPlatformServiceBrandHex(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let c = String(raw).trim();
  if (!c) return null;
  if (!c.startsWith('#')) c = `#${c}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(c)) {
    const r = c[1]!;
    const g = c[2]!;
    const b = c[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c.toUpperCase();
  return null;
}

export function withAlpha(hex: string, alpha: number): string {
  const expanded = expandPlatformServiceBrandHex(hex) ?? DEFAULT_COLOR;
  const h = expanded.replace('#', '');
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(51,62,143,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function normalizePlatformServiceBrandColor(
  hex: string | null | undefined,
  inactive = false,
): string {
  if (inactive) return '#94A3B8';
  return expandPlatformServiceBrandHex(hex) ?? DEFAULT_COLOR;
}

/** Nom Font Awesome 4 tel que configuré en admin (pas de liste blanche restrictive). */
export function platformServiceFaIcon(
  name: string | null | undefined,
): ComponentProps<typeof FontAwesome>['name'] {
  return parsePlatformServiceBrandIconKey(name) as ComponentProps<typeof FontAwesome>['name'];
}

/** Largeur carte carrousel services (aperçu boutique « Tous »). */
export function platformServiceCarouselCardWidth(screenWidth: number, horizontalPad = 16): number {
  const inner = Math.max(260, screenWidth - horizontalPad * 2);
  return Math.min(380, Math.round(inner * 0.92));
}

/** @deprecated Préférer `serviceCarouselContentInset` (évite la coupure de la 1ʳᵉ carte au scroll). */
export function shouldCenterServiceCarousel(
  cardCount: number,
  cardWidth: number,
  gap: number,
  screenWidth: number,
  horizontalPad = 16,
): boolean {
  if (cardCount <= 0) return false;
  const contentW = cardCount * cardWidth + Math.max(0, cardCount - 1) * gap;
  return contentW < screenWidth - horizontalPad * 2;
}

/**
 * Padding horizontal du carrousel : centrage visuel quand tout tient à l’écran,
 * sans `justifyContent: 'center'` (qui masque le bord gauche de la 1ʳᵉ carte en scroll).
 */
export function serviceCarouselContentInset(
  cardCount: number,
  cardWidth: number,
  gap: number,
  viewportWidth: number,
  minPad = 16,
): number {
  if (cardCount <= 0) return minPad;
  const contentW = cardCount * cardWidth + Math.max(0, cardCount - 1) * gap;
  if (contentW >= viewportWidth) return minPad;
  return Math.max(minPad, Math.floor((viewportWidth - contentW) / 2));
}
