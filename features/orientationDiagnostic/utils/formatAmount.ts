/**
 * Formate montants / salaires (aligné web — Dhs / درهم).
 */

function normalizeNumericString(raw: string): string {
  const cleaned = raw
    .replace(/[^\d.,]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  return cleaned;
}

export function withThousandDots(value: string | number): string {
  const str = String(value);
  const negative = str.startsWith('-');
  const body = negative ? str.slice(1) : str;
  const [intPart, decPart] = body.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const out = decPart != null && decPart !== '' ? `${grouped},${decPart}` : grouped;
  return negative ? `-${out}` : out;
}

export function formatPricingText(
  text: string,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const currency = locale === 'ar' ? 'درهم' : 'Dhs';
  let out = text.replace(/\b(Dhs|DH|MAD)\b/gi, currency);
  out = out.replace(/\d[\d\s.,]*/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed) return match;
    const n = parseFloat(normalizeNumericString(trimmed));
    if (isNaN(n)) return match;
    return withThousandDots(
      Number.isInteger(n) ? Math.round(n) : n.toString().replace(/\.?0+$/, ''),
    );
  });
  return out;
}

export function formatAmount(
  amount: number | string | null | undefined,
  showCurrency: boolean = true,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const currency = locale === 'ar' ? 'درهم' : 'Dhs';
  if (amount === null || amount === undefined) {
    return showCurrency ? `0 ${currency}` : '0';
  }

  const numAmount =
    typeof amount === 'string' ? parseFloat(normalizeNumericString(amount)) : amount;

  if (isNaN(numAmount)) {
    return showCurrency ? `0 ${currency}` : '0';
  }

  const isInteger = numAmount % 1 === 0;
  const formatted = isInteger
    ? String(Math.round(numAmount))
    : numAmount.toString().replace(/\.?0+$/, '');

  const withSeparators = withThousandDots(formatted);

  return showCurrency ? `${withSeparators} ${currency}` : withSeparators;
}

export function formatSalaryRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const currency = locale === 'ar' ? 'درهم' : 'Dhs';
  const minFormatted = formatAmount(min, false, locale);
  const maxFormatted = formatAmount(max, false, locale);

  if (min && max) {
    return `${minFormatted} - ${maxFormatted} ${currency}`;
  }
  if (min) {
    return locale === 'ar'
      ? `ابتداءً من ${minFormatted} ${currency}`
      : `À partir de ${minFormatted} ${currency}`;
  }
  if (max) {
    return locale === 'ar'
      ? `حتى ${maxFormatted} ${currency}`
      : `Jusqu'à ${maxFormatted} ${currency}`;
  }

  return '';
}
