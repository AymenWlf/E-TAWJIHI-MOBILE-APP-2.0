/** Minus sign (U+2212) — stable in LTR discount labels. */
const DISCOUNT_MINUS = '−';

/** Formats e.g. `−10%` (affichage LTR géré par `writingDirection` sur le composant Text). */
export function formatReferralDiscountPercent(percent: number, _rtl?: boolean): string {
  return `${DISCOUNT_MINUS}${percent}%`;
}

/** Replaces `{{percent}}` in i18n templates with a bidi-safe discount label (texte arabe mélangé). */
export function fillReferralPercentPlaceholder(template: string, percent: number, rtl: boolean): string {
  const core = formatReferralDiscountPercent(percent, rtl);
  const embedded = rtl ? `\u2066${core}\u2069` : core;
  return template.replace(/\{\{percent\}\}/g, embedded);
}
