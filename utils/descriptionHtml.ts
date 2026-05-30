import { sanitizeRichHtml } from '@/utils/sanitizeRichHtml';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** HTML déjà présent ou texte plat → snippet HTML sécurisé pour le viewer. */
export function normalizeEstablishmentDescriptionHtml(description: string | null | undefined): string {
  const t = (description ?? '').trim();
  if (!t) return '';

  const looksHtml = /<[a-z][\s\S]*>/i.test(t);
  if (looksHtml) return sanitizeRichHtml(t);

  const escaped = escapeHtml(t).replace(/\r\n|\r|\n/g, '<br />');
  return `<p>${escaped}</p>`;
}
