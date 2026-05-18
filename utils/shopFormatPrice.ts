/**
 * Formats prix boutique alignés sur le front web.
 * RN n'expose pas toujours `Intl.NumberFormat` complet : on combine un fallback
 * manuel (séparateur d'espace + suffixe devise) avec `Intl` quand disponible.
 */

export type ShopPriceIntlOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/** Pack en « réduction % sur la somme » : prix arrondi entier (sans centimes). */
export function shopPriceFormatOptsPackPercentDiscount(): ShopPriceIntlOptions {
  return { minimumFractionDigits: 0, maximumFractionDigits: 0 };
}

export function shopPriceFormatOptsForCatalogOrCartLine(
  ctx: { type?: string; packPricingMode?: string | null } | null | undefined,
): ShopPriceIntlOptions | undefined {
  if (ctx?.type === 'pack' && ctx?.packPricingMode === 'discount_from_sum') {
    return shopPriceFormatOptsPackPercentDiscount();
  }
  return undefined;
}

function shopParseAmountString(raw: string): number {
  const t = String(raw).trim().replace(/\s/g, '');
  if (t === '') return Number.NaN;
  if (t.includes(',') && !t.includes('.')) return Number.parseFloat(t.replace(',', '.'));
  return Number.parseFloat(t);
}

const DHS_CURRENCY_ALIASES = new Set(['MAD', 'DHS', 'DH', '']);

/** Libellé devise affiché dans l’app (charte : Dhs, pas MAD). */
export function shopDisplayCurrency(currency?: string): string {
  const c = String(currency ?? 'MAD')
    .trim()
    .toUpperCase();
  if (DHS_CURRENCY_ALIASES.has(c)) return 'Dhs';
  return String(currency ?? 'MAD').trim() || 'Dhs';
}

/** Code ISO pour Intl.NumberFormat (MAD = dirham marocain). */
export function shopIntlCurrencyCode(currency?: string): string {
  const c = String(currency ?? 'MAD')
    .trim()
    .toUpperCase();
  if (DHS_CURRENCY_ALIASES.has(c)) return 'MAD';
  return c || 'MAD';
}

function manualFormat(n: number, currency: string, intl?: ShopPriceIntlOptions): string {
  const min = intl?.minimumFractionDigits ?? 2;
  const max = intl?.maximumFractionDigits ?? 2;
  const fixed = n.toFixed(Math.max(min, max));
  // Sépare la partie entière par un espace insécable tous les 3 chiffres (style fr-FR).
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  const body = decPart && max > 0 ? `${grouped},${decPart.slice(0, max)}` : grouped;
  return `${body}\u00A0${currency}`;
}

export function formatShopPrice(amount: string | number, currency = 'MAD', intl?: ShopPriceIntlOptions): string {
  const n = typeof amount === 'number' ? amount : shopParseAmountString(amount);
  const displayCur = shopDisplayCurrency(currency);
  const intlCode = shopIntlCurrencyCode(currency);
  if (Number.isNaN(n)) return `${amount} ${displayCur}`;
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: intlCode,
        minimumFractionDigits: intl?.minimumFractionDigits ?? 2,
        maximumFractionDigits: intl?.maximumFractionDigits ?? 2,
      }).format(n);
      return formatted.replace(/\s*MAD\s*$/i, `\u00A0${displayCur}`);
    }
  } catch {
    /* fallback manuel ci-dessous */
  }
  return manualFormat(n, displayCur, intl);
}

export function shopHasPromotionalPrice(price: string, compareAtPrice: string | null | undefined): boolean {
  if (compareAtPrice == null || compareAtPrice === '') return false;
  const hi = shopParseAmountString(compareAtPrice);
  const lo = shopParseAmountString(price);
  if (Number.isNaN(hi) || Number.isNaN(lo)) return false;
  return hi > lo;
}

export function shopPromoDiscountPercent(price: string, compareAtPrice: string | null | undefined): number | null {
  if (compareAtPrice == null || compareAtPrice === '') return null;
  const p = shopParseAmountString(price);
  const c = shopParseAmountString(compareAtPrice);
  if (!Number.isFinite(p) || !Number.isFinite(c) || c <= 0 || p >= c) return null;
  return (100 * (c - p)) / c;
}

export function shopFormatPromoDiscountPercentLabel(pct: number): string {
  const rounded = Math.round(pct * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return String(Math.round(rounded));
  return rounded.toFixed(1).replace('.', ',');
}

export function shopParsePriceString(amount: string): number {
  return shopParseAmountString(amount);
}
