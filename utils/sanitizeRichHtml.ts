import sanitizeHtml from 'sanitize-html';

const CMS_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const CMS_ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  '*': ['class', 'style'],
};

/** Sanitise le HTML CMS avant RenderHTML. */
export function sanitizeRichHtml(html: string | null | undefined): string {
  const t = (html ?? '').trim();
  if (!t) return '';

  return sanitizeHtml(t, {
    allowedTags: CMS_ALLOWED_TAGS,
    allowedAttributes: CMS_ALLOWED_ATTR,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}

/** Texte brut pour aperçus (cartes). */
export function stripHtmlToText(html: string | null | undefined, maxLength?: number): string {
  const text = sanitizeHtml((html ?? '').trim(), { allowedTags: [], allowedAttributes: {} }).trim();
  if (maxLength != null && text.length > maxLength) {
    return text.slice(0, maxLength) + '…';
  }
  return text;
}
