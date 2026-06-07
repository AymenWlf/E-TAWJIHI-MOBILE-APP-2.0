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

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wparam']);

/** Échange margin/padding left ↔ right dans une déclaration CSS inline. */
function swapHorizontalBoxSides(css: string): string {
  return css
    .replace(/\bpadding-left\b/gi, 'padding-right-tmp')
    .replace(/\bpadding-right\b/gi, 'padding-left')
    .replace(/\bpadding-right-tmp\b/gi, 'padding-right')
    .replace(/\bmargin-left\b/gi, 'margin-right-tmp')
    .replace(/\bmargin-right\b/gi, 'margin-left')
    .replace(/\bmargin-right-tmp\b/gi, 'margin-right');
}

export function normalizeRtlInlineStyle(style: string): string {
  let s = style
    .replace(/\btext-align\s*:\s*(left|start|justify|center)\b/gi, 'text-align:right')
    .replace(/\bdirection\s*:\s*ltr\b/gi, 'direction:rtl')
    .replace(/\bunicode-bidi\s*:\s*[^;]+/gi, 'unicode-bidi:embed')
    .replace(/\bfloat\s*:\s*left\b/gi, 'float:right')
    .replace(/\bfloat\s*:\s*right\b/gi, 'float:left');
  s = swapHorizontalBoxSides(s);
  if (!/\bdirection\s*:/i.test(s)) s = `direction:rtl;${s}`;
  if (!/\btext-align\s*:/i.test(s)) s = `text-align:right;${s}`;
  if (!/\bunicode-bidi\s*:/i.test(s)) s = `unicode-bidi:embed;${s}`;
  return s.replace(/;;+/g, ';').replace(/^;|;$/g, '');
}

function upsertStyle(attrs: string, extra: string): string {
  const re = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/i;
  const m = re.exec(attrs);
  if (m) {
    const merged = normalizeRtlInlineStyle(`${m[2]};${extra}`);
    return attrs.replace(re, `style="${merged}"`);
  }
  return `${attrs} style="${normalizeRtlInlineStyle(extra)}"`;
}

/** Force dir/style RTL sur chaque balise ouvrante (Quill, Word, styles legacy). */
function forceRtlOnAllTags(html: string): string {
  return html.replace(/<([a-z][a-z0-9]*)\b([^>]*)(\/?)>/gi, (full, tagName: string, rawAttrs: string, selfClose: string) => {
    const tag = tagName.toLowerCase();
    if (VOID_TAGS.has(tag)) return full;

    let attrs = rawAttrs ?? '';
    attrs = attrs.replace(/\bdir\s*=\s*["']ltr["']/gi, 'dir="rtl"');
    if (!/\bdir\s*=/i.test(attrs)) {
      attrs = `${attrs} dir="rtl"`;
    }

    attrs = attrs.replace(/\salign\s*=\s*["']left["']/gi, ' align="right"');

    if (/\bstyle\s*=/i.test(attrs)) {
      attrs = attrs.replace(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i, (_, q, style) => {
        return `style="${normalizeRtlInlineStyle(style)}"`;
      });
    } else {
      attrs = upsertStyle(attrs, 'direction:rtl;text-align:right');
    }

    attrs = attrs
      .replace(/\bql-align-left\b/g, 'ql-align-right')
      .replace(/\bql-align-center\b/g, 'ql-align-right')
      .replace(/\bql-direction-ltr\b/g, 'ql-direction-rtl')
      .replace(/\bql-direction-rtl\b/g, 'ql-direction-rtl');

    return `<${tagName}${attrs}${selfClose}>`;
  });
}

/** Force l’affichage RTL du HTML CMS (styles inline, Quill, attributs legacy). */
function applyRtlToDescriptionHtml(html: string): string {
  let out = html
    .replace(/\bdir\s*=\s*["']ltr["']/gi, 'dir="rtl"')
    .replace(/\salign\s*=\s*["'](left|center)["']/gi, ' align="right"')
    .replace(/text-align\s*:\s*(left|start|justify|center)/gi, 'text-align:right')
    .replace(/direction\s*:\s*ltr/gi, 'direction:rtl')
    .replace(/\bql-align-left\b/g, 'ql-align-right')
    .replace(/\bql-align-center\b/g, 'ql-align-right')
    .replace(/\bql-direction-ltr\b/g, 'ql-direction-rtl');

  out = forceRtlOnAllTags(out);

  return `<div dir="rtl" style="direction:rtl;text-align:right;unicode-bidi:embed;width:100%"><div dir="rtl" style="direction:rtl;text-align:right;unicode-bidi:embed;width:100%">${out}</div></div>`;
}

/** Prépare le HTML description pour l’affichage (RTL notamment). */
export function prepareDescriptionHtmlForDisplay(
  description: string | null | undefined,
  options?: { rtl?: boolean },
): string {
  const html = normalizeEstablishmentDescriptionHtml(description);
  if (!html || !options?.rtl) return html;
  return applyRtlToDescriptionHtml(html);
}
