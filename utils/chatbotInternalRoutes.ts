import type { Href } from 'expo-router';

import type { HomeCopyKey } from '@/constants/i18n';

const RESERVED_BOUTIQUE_SEGMENTS = new Set([
  'panier',
  'checkout',
  'cart',
  'thank-you',
  'commande',
]);

const ETAWJIHI_HOSTS = new Set(['e-tawjihi.ma', 'www.e-tawjihi.ma']);

export type ChatbotNavRecommendation = {
  url: string;
  webUrl: string;
  /** Destination dans l’app (prioritaire à l’affichage). */
  mobileHref: Href | null;
  /** Libellé court pour le bouton « dans l’app » */
  destLabelKey: HomeCopyKey;
};

function trimTrailingDots(s: string): string {
  return s.replace(/\.+$/u, '').trim();
}

function normalizeAppPath(p: string): string {
  const trimmed = trimTrailingDots(p.trim());
  if (!trimmed.startsWith('/')) return `/${trimmed}`;
  return trimmed;
}

function isEtawjihiHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (ETAWJIHI_HOSTS.has(h)) return true;
  return h.endsWith('.e-tawjihi.ma');
}

/**
 * Analyse une URL (site public ou liens dans les réponses du chatbot) et propose
 * une navigation interne Expo en priorité, avec le site en secours.
 */
export function resolveChatbotUrl(rawUrl: string): ChatbotNavRecommendation | null {
  // Support: liens internes mobile (paths Expo Router) fournis par le chatbot
  if (rawUrl.trim().startsWith('/')) {
    const path = normalizeAppPath(rawUrl);
    // Mapping minimal : on renvoie un "webUrl" factice pour clé stable
    if (path === '/' || path === '/(tabs)') {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/(tabs)' as Href, destLabelKey: 'tabHome' };
    }
    if (path.startsWith('/(tabs)/ecoles')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/(tabs)/ecoles' as Href, destLabelKey: 'tabEcoles' };
    }
    if (path.startsWith('/(tabs)/inscriptions')) {
      return {
        url: path,
        webUrl: `app:${path}`,
        mobileHref: '/(tabs)/inscriptions' as Href,
        destLabelKey: 'tabInscriptions',
      };
    }
    // Tab boutique avec slug produit : `/(tabs)/boutique/pack-xyz` → fiche `/boutique/pack-xyz`
    // (ne pas confondre avec l’onglet boutique seul).
    if (path.startsWith('/(tabs)/boutique/')) {
      const rest = path.slice('/(tabs)/boutique/'.length).split('/').filter(Boolean)[0];
      if (rest && !RESERVED_BOUTIQUE_SEGMENTS.has(rest.toLowerCase())) {
        return {
          url: path,
          webUrl: `app:${path}`,
          mobileHref: `/boutique/${rest}` as Href,
          destLabelKey: 'shareKindBoutiqueProduct',
        };
      }
    }
    if (path.startsWith('/(tabs)/boutique')) {
      return {
        url: path,
        webUrl: `app:${path}`,
        mobileHref: '/(tabs)/boutique' as Href,
        destLabelKey: 'tabBoutique',
      };
    }
    if (path.startsWith('/(tabs)/evenements')) {
      return {
        url: path,
        webUrl: `app:${path}`,
        mobileHref: '/(tabs)/evenements' as Href,
        destLabelKey: 'shareKindEvents',
      };
    }
    if (path.startsWith('/(tabs)/compte')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/(tabs)/compte' as Href, destLabelKey: 'tabCompte' };
    }
    if (path.startsWith('/communaute')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/communaute' as Href, destLabelKey: 'globalWallTitle' };
    }
    if (path.startsWith('/login')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/login' as Href, destLabelKey: 'accountLoginCta' };
    }
    if (path.startsWith('/register')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/register' as Href, destLabelKey: 'loginCreateAccount' };
    }
    if (path.startsWith('/boutique/cart')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/boutique/cart' as Href, destLabelKey: 'sidebarCart' };
    }
    if (path.startsWith('/boutique/checkout')) {
      return { url: path, webUrl: `app:${path}`, mobileHref: '/boutique/checkout' as Href, destLabelKey: 'shopBuyNow' };
    }
    if (/^\/boutique\/[^/]+$/i.test(path)) {
      return {
        url: path,
        webUrl: `app:${path}`,
        mobileHref: path as Href,
        destLabelKey: 'shareKindBoutiqueProduct',
      };
    }
    if (path === '/etablissements' || path === '/etablissements/') {
      return {
        url: path,
        webUrl: `app:${path}`,
        mobileHref: '/(tabs)/ecoles' as Href,
        destLabelKey: 'tabEcoles',
      };
    }
    if (/^\/etablissements\/\d+\/[^/]+/i.test(path)) {
      return { url: path, webUrl: `app:${path}`, mobileHref: path as Href, destLabelKey: 'shareKindSchool' };
    }
    if (/^\/evenements\/\d+/i.test(path)) {
      return { url: path, webUrl: `app:${path}`, mobileHref: path as Href, destLabelKey: 'eventsOpenDetail' };
    }
    if (/^\/inscriptions\/\d+/i.test(path)) {
      return { url: path, webUrl: `app:${path}`, mobileHref: path as Href, destLabelKey: 'shareKindAnnouncement' };
    }
    return { url: path, webUrl: `app:${path}`, mobileHref: path as Href, destLabelKey: 'chatbotDestWebPage' };
  }

  const cleaned = trimTrailingDots(rawUrl);
  let u: URL;
  try {
    u = new URL(cleaned);
  } catch {
    return null;
  }

  const webUrl = u.toString();

  if (!isEtawjihiHost(u.hostname)) {
    return {
      url: cleaned,
      webUrl,
      mobileHref: null,
      destLabelKey: 'chatbotDestExternal',
    };
  }

  const path =
    u.pathname.replace(/\/+$/u, '') === '' ? '/' : u.pathname.replace(/\/+$/u, '');
  const seg = path === '/' ? [] : path.split('/').filter(Boolean);

  if (path === '/' || seg.length === 0) {
    return { url: cleaned, webUrl, mobileHref: '/(tabs)' as Href, destLabelKey: 'tabHome' };
  }

  const a = seg[0]?.toLowerCase();

  if (a === 'login') {
    return { url: cleaned, webUrl, mobileHref: '/login' as Href, destLabelKey: 'accountLoginCta' };
  }
  if (a === 'register') {
    return { url: cleaned, webUrl, mobileHref: '/register' as Href, destLabelKey: 'loginCreateAccount' };
  }
  if (a === 'communaute' || a === 'communauté') {
    return { url: cleaned, webUrl, mobileHref: '/communaute' as Href, destLabelKey: 'globalWallTitle' };
  }

  if (a === 'etablissements') {
    if (seg.length >= 3) {
      const id = seg[1];
      const slug = seg[2];
      if (/^\d+$/.test(id) && slug) {
        return {
          url: cleaned,
          webUrl,
          mobileHref: `/etablissements/${id}/${slug}` as Href,
          destLabelKey: 'shareKindSchool',
        };
      }
    }
    return { url: cleaned, webUrl, mobileHref: '/(tabs)/ecoles' as Href, destLabelKey: 'tabEcoles' };
  }

  if (a === 'boutique') {
    if (seg.length === 1) {
      return { url: cleaned, webUrl, mobileHref: '/(tabs)/boutique' as Href, destLabelKey: 'tabBoutique' };
    }
    const rest = seg[1]?.toLowerCase() ?? '';
    if (rest === 'panier') {
      return { url: cleaned, webUrl, mobileHref: '/boutique/cart' as Href, destLabelKey: 'sidebarCart' };
    }
    if (rest === 'checkout' || rest === 'commande') {
      return { url: cleaned, webUrl, mobileHref: '/boutique/checkout' as Href, destLabelKey: 'shopBuyNow' };
    }
    if (!RESERVED_BOUTIQUE_SEGMENTS.has(rest) && seg[1]) {
      return {
        url: cleaned,
        webUrl,
        mobileHref: `/boutique/${seg[1]}` as Href,
        destLabelKey: 'shareKindBoutiqueProduct',
      };
    }
    return { url: cleaned, webUrl, mobileHref: '/(tabs)/boutique' as Href, destLabelKey: 'tabBoutique' };
  }

  if (a === 'inscriptions') {
    return {
      url: cleaned,
      webUrl,
      mobileHref: '/(tabs)/inscriptions' as Href,
      destLabelKey: 'tabInscriptions',
    };
  }

  if (a === 'evenements') {
    if (seg.length >= 2 && /^\d+$/.test(seg[1])) {
      return {
        url: cleaned,
        webUrl,
        mobileHref: `/evenements/${seg[1]}` as Href,
        destLabelKey: 'eventsOpenDetail',
      };
    }
    return {
      url: cleaned,
      webUrl,
      mobileHref: '/(tabs)/evenements' as Href,
      destLabelKey: 'shareKindEvents',
    };
  }

  if (a === 'annonces-concours') {
    const idMatch = seg[1]?.match(/^(\d+)/);
    const id = idMatch?.[1];
    if (id) {
      return {
        url: cleaned,
        webUrl,
        // Détail annonce concours = écran Inscriptions
        mobileHref: `/inscriptions/${id}` as Href,
        destLabelKey: 'shareKindAnnouncement',
      };
    }
    return {
      url: cleaned,
      webUrl,
      mobileHref: '/(tabs)/inscriptions' as Href,
      destLabelKey: 'shareKindAnnouncements',
    };
  }

  // Pages surtout web (services, blog, test, secteurs…) : pas d’écran dédié → lien site uniquement
  return {
    url: cleaned,
    webUrl,
    mobileHref: null,
    destLabelKey: 'chatbotDestWebPage',
  };
}

/**
 * Retire les chemins d’écran techniques (/..., `/(tabs)/...`) du texte affiché dans la bulle.
 * Les liens restent exploités via `extractChatbotLinksFromText` sur le contenu brut du message.
 */
export function stripChatbotInternalPathsFromDisplay(text: string): string {
  let s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Tout lien Markdown [libellé](URL ou /chemin) → libellé seul (évite d’afficher la syntaxe brute ; les cartes viennent du texte brut côté API).
  s = s.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => {
    const inner = /\[([^\]]+)\]/.exec(m);
    return inner ? inner[1].trim() : '';
  });

  const pathChunk =
    /\/?\(tabs\)(?:\/[a-z0-9/_-]+)*|\/inscriptions\/\d+|\/etablissements\/\d+\/[a-z0-9_-]+|\/boutique\/(?:cart|checkout|[a-z0-9_-]+)|\/evenements\/\d+|\/communaute(?:\/[^\s.,;:!?)'"\]]*)?|\/login(?:\/[^\s.,;:!?)'"\]]*)?|\/register(?:\/[^\s.,;:!?)'"\]]*)?/gi;
  s = s.replace(pathChunk, '');

  const phraseFixes: [RegExp, string][] = [
    [/Consultez-la\s+sur\s+ou\s+directement\s+dans\s+l['']app\s+mobile\.?/gi, 'Consultez-la depuis l’application.'],
    [/Consultez(?:ez)?(?:-la)?\s+sur\s+ou\s+directement\s+/gi, 'Consultez-la '],
    [/\bvous\s+pouvez\s+la\s+consulter\s+sur\s+ou\s+/gi, 'vous pouvez la consulter '],
    [/\bsur\s+ou\s+directement\s+/gi, ''],
    [/\s+ou\s+directement\s+/gi, ' '],
    [/\bsur\s+,/gi, ','],
    [/\bdans\s+l['']app\s+mobile\.?/gi, ''],
    // Espaces multiples sur une même ligne uniquement — ne pas avaler les \n (paragraphes).
    [/[ \t\f\v]{2,}/g, ' '],
    [/[ \t]+([.,;:!?])/g, '$1'],
    [/\(\s*\)/g, ''],
  ];
  for (const [re, rep] of phraseFixes) {
    s = s.replace(re, rep);
  }

  // Normaliser les multiples lignes vides (garder au plus un double saut = nouveau paragraphe).
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

/** Extrait les URLs https du texte des réponses assistant (comme sur le web). */
export function extractChatbotLinksFromText(text: string): string[] {
  const re = /https?:\/\/[^\s<>"')\]]+/gi;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const u = trimTrailingDots(m[0]);
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }

  // Paths internes app (recommandés en mode mobile) — début de ligne / espace / (
  const pathRe = /(?:^|[\s(])((?:\/\(tabs\)\/[a-z0-9/_-]+|\/communaute|\/login|\/register|\/boutique\/(?:cart|checkout|[a-z0-9_-]+)|\/etablissements\/\d+\/[a-z0-9_-]+|\/evenements\/\d+|\/inscriptions\/\d+))/gi;
  while ((m = pathRe.exec(text)) !== null) {
    const p = normalizeAppPath(m[1]);
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }

  // Markdown [libellé](/boutique/slug) — le `/` suit `]` pas un espace : regex ci‑dessus ne matche pas.
  const mdPathRe =
    /\]\(\/(boutique\/(?:cart|checkout|[a-z0-9_-]+)|\(tabs\)\/[a-z0-9/_-]+|communaute(?:\/[a-z0-9/_-]*)?|login|register|etablissements\/\d+\/[a-z0-9_-]+|evenements\/\d+|inscriptions\/\d+)\)/gi;
  while ((m = mdPathRe.exec(text)) !== null) {
    const p = normalizeAppPath(`/${m[1]}`);
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }

  // Liens Markdown [texte](https://…) — extraction explicite (redondant avec https mais évite tout trou).
  const mdHttpsRe = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/gi;
  while ((m = mdHttpsRe.exec(text)) !== null) {
    const u = trimTrailingDots(m[1]);
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }

  // URLs sans protocole : www.e-tawjihi.ma/...
  const bareHostRe = /(?:^|[\s(<])(www\.e-tawjihi\.ma\/[^\s<>"')\]]+)/gi;
  while ((m = bareHostRe.exec(text)) !== null) {
    const u = trimTrailingDots(`https://${m[1]}`);
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }

  // Liens protocol-relative //e-tawjihi.ma/boutique/...
  const protoRelRe = /(?:^|[\s(<])(\/\/(?:www\.)?e-tawjihi\.ma\/[^\s<>"')\]]+)/gi;
  while ((m = protoRelRe.exec(text)) !== null) {
    const u = trimTrailingDots(`https:${m[1]}`);
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }

  return out;
}

/**
 * IDs d'annonces concours (`/inscriptions/{id}` ou URL site) présents dans le texte.
 * Ordre de première occurrence, sans doublon — pour cartes dédiées dans le chat E‑MOWAJIH.
 */
export function extractInscriptionAnnouncementIdsFromText(text: string): number[] {
  const seen = new Set<number>();
  const out: number[] = [];

  const pushId = (raw: string) => {
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) return;
    if (seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };

  let m: RegExpExecArray | null;

  const pathRe = /\/inscriptions\/(\d+)/gi;
  while ((m = pathRe.exec(text)) !== null) {
    pushId(m[1]);
  }

  const httpsRe = /https?:\/\/(?:www\.)?e-tawjihi\.ma\/inscriptions\/(\d+)/gi;
  while ((m = httpsRe.exec(text)) !== null) {
    pushId(m[1]);
  }

  return out;
}

const RESERVED_BOUTIQUE_SLUG_LOWER = new Set([
  'panier',
  'checkout',
  'cart',
  'thank-you',
  'commande',
]);

/**
 * Slugs produits/packs boutique présents dans le texte (URLs complètes, chemins /boutique/…, markdown).
 * Utile en secours si les liens ne passent pas par `extractChatbotLinksFromText`.
 */
/**
 * Supprime les lignes qui ne sont qu’une URL / chemin fiche produit boutique
 * (le détail est dans la carte sous le message).
 */
export function stripStandaloneBoutiqueUrlLines(text: string): string {
  const lines = text.split('\n');
  const kept: string[] = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) {
      kept.push('');
      continue;
    }
    if (
      /^https?:\/\/(?:www\.)?e-tawjihi\.ma\/boutique\/[a-z0-9][a-z0-9_-]*\/?(?:[?#][^\s]*)?$/i.test(t)
    ) {
      continue;
    }
    if (/^\/boutique\/[a-z0-9][a-z0-9_-]*\/?$/i.test(t)) {
      continue;
    }
    kept.push(raw);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function extractBoutiqueProductSlugsFromText(text: string): string[] {
  const seenLower = new Set<string>();
  const out: string[] = [];

  const pushSlug = (slug: string) => {
    const s = slug.trim();
    if (!s) return;
    const lower = s.toLowerCase();
    if (RESERVED_BOUTIQUE_SLUG_LOWER.has(lower)) return;
    if (seenLower.has(lower)) return;
    seenLower.add(lower);
    out.push(s);
  };

  let m: RegExpExecArray | null;
  const urlRe =
    /https?:\/\/(?:www\.)?e-tawjihi\.ma\/boutique\/([a-z0-9][a-z0-9_-]*)(?:[/?#]|$)/gi;
  while ((m = urlRe.exec(text)) !== null) {
    pushSlug(m[1]);
  }

  const pathRe = /\/boutique\/([a-z0-9][a-z0-9_-]*)(?:[/?#]|(?=\s)|$)/gi;
  while ((m = pathRe.exec(text)) !== null) {
    pushSlug(m[1]);
  }

  const tabsBoutiqueRe = /\/\(tabs\)\/boutique\/([a-z0-9][a-z0-9_-]*)(?:[/?#]|(?=\s)|$)/gi;
  while ((m = tabsBoutiqueRe.exec(text)) !== null) {
    pushSlug(m[1]);
  }

  return out;
}

/**
 * Classe les recommandations : navigation interne d’abord, puis liens web uniquement.
 */
export function sortRecommendationsMobileFirst(list: ChatbotNavRecommendation[]): ChatbotNavRecommendation[] {
  const withApp = list.filter((x) => x.mobileHref != null);
  const webOnly = list.filter((x) => x.mobileHref == null);
  return [...withApp, ...webOnly];
}
