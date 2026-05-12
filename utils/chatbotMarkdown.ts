function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function linkifyHtml(s: string): string {
  return s.replace(/(https?:\/\/[^\s<>"')\]]+)/g, (m) => {
    const clean = m.replace(/\.+$/, '');
    return `<a href="${clean}">${clean}</a>`;
  });
}

/** Placeholders pour traiter les liens Markdown avant linkify (évite de matcher les URL dans href). */
const MD_LINK_TOKEN = '%%CHATBOT_MD_LINK_';

/**
 * Remplace `[libellé](https://… ou /chemin)` par des placeholders, puis restaure en `<a href>`.
 * Doit tourner **avant** `linkifyHtml` sur le même flux.
 */
function extractMarkdownLinksToPlaceholders(s: string): { text: string; links: string[] } {
  const links: string[] = [];
  const text = s.replace(/\[[^\]]+\]\(([^)]+)\)/g, (full) => {
    const inner = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(full);
    if (!inner) return full;
    const hrefRaw = inner[2].trim();
    if (!/^https?:\/\//i.test(hrefRaw) && !hrefRaw.startsWith('/')) return full;
    const i = links.length;
    links.push(full);
    return `${MD_LINK_TOKEN}${i}%%`;
  });
  return { text, links };
}

function restoreMarkdownLinksFromPlaceholders(s: string, rawLinks: string[]): string {
  return s.replace(new RegExp(`${MD_LINK_TOKEN}(\\d+)%%`, 'g'), (_, n: string) => {
    const full = rawLinks[Number(n)];
    const inner = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(full ?? '');
    if (!inner) return '';
    const label = inner[1];
    const hrefRaw = inner[2].trim();
    const hrefEsc = escapeHtml(hrefRaw);
    const labelEsc = escapeHtml(label);
    return `<a href="${hrefEsc}">${labelEsc}</a>`;
  });
}

function preserveCodeBlocks(s: string): { text: string; blocks: string[] } {
  const blocks: string[] = [];
  // ```multi\nline```
  const out = s.replace(/```([\s\S]*?)```/g, (_m, code: string) => {
    const idx = blocks.length;
    blocks.push(code);
    return `%%CODE_BLOCK_${idx}%%`;
  });
  return { text: out, blocks };
}

function restoreCodeBlocks(s: string, blocks: string[]): string {
  return s.replace(/%%CODE_BLOCK_(\d+)%%/g, (_m, n: string) => {
    const i = Number(n);
    const code = blocks[i] ?? '';
    // Code déjà échappé en amont, donc on l'insère tel quel.
    return `<pre><code>${code}</code></pre>`;
  });
}

function preserveInlineCode(s: string): { text: string; inlines: string[] } {
  const inlines: string[] = [];
  const out = s.replace(/`([^`\n]+)`/g, (_m, code: string) => {
    const idx = inlines.length;
    inlines.push(code);
    return `%%INLINE_CODE_${idx}%%`;
  });
  return { text: out, inlines };
}

function restoreInlineCode(s: string, inlines: string[]): string {
  return s.replace(/%%INLINE_CODE_(\d+)%%/g, (_m, n: string) => {
    const i = Number(n);
    const code = inlines[i] ?? '';
    return `<code>${code}</code>`;
  });
}

/**
 * Double saut de ligne → `<p>` distincts ; les blocs `<pre>` restent hors découpage.
 */
function wrapParagraphBlocks(html: string): string {
  const pres: string[] = [];
  const masked = html.replace(/<pre[\s\S]*?<\/pre>/gi, (m) => {
    const i = pres.length;
    pres.push(m);
    return `§§PREBLOCK${i}§§`;
  });

  const chunks = masked.split(/(?:<br\s*\/?>\s*){2,}/i);
  const parts: string[] = [];

  for (const chunk of chunks) {
    const t = chunk.trim();
    if (!t) continue;
    const preOnly = /^§§PREBLOCK(\d+)§§$/.exec(t);
    if (preOnly) {
      const idx = Number(preOnly[1]);
      const block = pres[idx];
      if (block) parts.push(block);
      continue;
    }
    parts.push(`<p>${t}</p>`);
  }

  return parts.length > 0 ? parts.join('') : `<p>${html.trim()}</p>`;
}

/**
 * Formatage "WhatsApp-like" pour le chatbot :
 * - `*gras*` et `**gras**`
 * - `_italique_`
 * - `~barré~` et `~~barré~~`
 * - `` `code` `` et blocs ``` ```
 * - URLs → liens
 * - retours à la ligne → `<br/>`
 */
export function chatbotMarkdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // 1) Échapper tout (sécurité), puis préserver les blocs / inline code pour éviter
  //    d'appliquer gras/italique à l'intérieur du code.
  const esc = escapeHtml(normalized);
  const codeBlocks = preserveCodeBlocks(esc);
  const inlineCode = preserveInlineCode(codeBlocks.text);

  // 2) Liens Markdown [libellé](URL) → placeholders, puis URLs nues → linkify, puis restauration <a>.
  const md = extractMarkdownLinksToPlaceholders(inlineCode.text);
  let s = linkifyHtml(md.text);
  s = restoreMarkdownLinksFromPlaceholders(s, md.links);

  // 3) Styles WhatsApp-like (simples).
  // Barré : ~text~ ou ~~text~~
  // Exclut les cas avec espaces aux bords (ex: "~ texte ~" n'est pas du style WhatsApp).
  s = s.replace(/~~([^\s~][^~\n]*[^\s~])~~/g, '<del>$1</del>');
  s = s.replace(/~([^\s~][^~\n]*[^\s~])~/g, '<del>$1</del>');
  // Italique : _text_
  s = s.replace(/_([^\s_][^_\n]*[^\s_])_/g, '<em>$1</em>');
  // Gras : **text** puis *text*
  // Ne pas interpréter les puces de listes (ex: "* item") : on exige pas d'espace après l'ouverture
  // et pas d'espace avant la fermeture.
  s = s.replace(/\*\*([^\s*][^*\n]*[^\s*])\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(?!\s)([^\n*]*?[^\s*])\*/g, '<strong>$1</strong>');

  // 4) Restaurer code, puis sauts de ligne.
  s = restoreInlineCode(s, inlineCode.inlines);
  s = restoreCodeBlocks(s, codeBlocks.blocks);
  s = s.replace(/\n/g, '<br/>');
  return wrapParagraphBlocks(s);
}

