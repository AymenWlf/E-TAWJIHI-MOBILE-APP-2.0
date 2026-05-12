export type ParsedEstablishmentLine = {
  /** Texte à utiliser comme recherche API (nom / sigle). */
  query: string;
};

/**
 * Même motif `- … — …` sert pour les **packs boutique** (prix DH, lien /boutique/…).
 * Ces lignes ne doivent pas déclencher une recherche d'établissements.
 */
export function lineLooksLikeBoutiqueOrCommerceBullet(line: string): boolean {
  const t = line.trim();
  if (!t.startsWith('- ')) return false;
  if (!t.includes(' — ')) return false;
  if (/https?:\/\/[^\s]*\/boutique\//i.test(t)) return true;
  if (/\/boutique\/[a-z0-9][a-z0-9_-]*/i.test(t)) return true;
  if (/\(tabs\)\/boutique\//i.test(t)) return true;
  if (/www\.e-tawjihi\.ma\/boutique\//i.test(t)) return true;
  /** Prix catalogue — rare dans les puces « école » listées par le LLM. */
  if (/\d[\d\s,.]{0,14}\s*(DH|MAD|د\.م\.)\b/i.test(t)) return true;
  /** Souvent titré « Pack … » pour les offres boutique (pas une école). */
  if (/^-\s*pack\s+/i.test(t)) return true;
  return false;
}

/**
 * Liste d'écoles du chatbot : `- Nom — Type, Ville` avec Type = Public / Privé / Semi-public / Militaire.
 * Les puces sans ce motif peuvent servir aux annonces concours ou autres listes.
 */
export function lineLooksLikeEstablishmentSchoolBullet(line: string): boolean {
  const t = line.trim();
  if (!t.startsWith('- ') || !t.includes(' — ')) return false;
  const rest = t.slice(2).trim();
  const tail = rest.split(' — ').slice(1).join(' — ').trim();
  return /^(Public|Privé|Privée|Semi[-\s]?Public|Militaire)\b/i.test(tail);
}

/**
 * Détecte les lignes au format utilisé par le chatbot web :
 * `- Nom (SIGLE) — Type ... [TASSJIL] [Sponsorisé]`
 *
 * On renvoie des requêtes (nom ou sigle) pour charger les fiches via l'API mobile.
 */
export function parseEstablishmentQueriesFromChatReply(text: string): ParsedEstablishmentLine[] {
  const lines = text.split('\n');
  const out: ParsedEstablishmentLine[] = [];
  const seen = new Set<string>();

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('- ')) continue;
    if (!line.includes(' — ')) continue;
    if (!lineLooksLikeEstablishmentSchoolBullet(line)) continue;
    if (lineLooksLikeBoutiqueOrCommerceBullet(line)) continue;
    if (line.includes('... et ') && /autres?\s+établissement/i.test(line)) continue;

    // Nettoyer le début "- "
    const rest = line.slice(2).trim();
    const beforeDash = rest.split(' — ')[0]?.trim();
    if (!beforeDash) continue;

    // Cas "Name (English) (SIGLE)" → prendre le dernier (...) comme sigle
    const parenMatches = [...beforeDash.matchAll(/\(([^)]+)\)/g)].map((m) => (m[1] ?? '').trim());
    const sigle = parenMatches.length > 0 ? parenMatches[parenMatches.length - 1] : '';

    // Nom = enlever les tags (SIGLE) et espaces
    const name = beforeDash.replace(/\s*\([^)]+\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

    // On préfère la recherche par nom (plus fiable), et on garde le sigle si utile
    const candidates = [name, sigle].filter((s) => s && s.length >= 2);
    for (const c of candidates) {
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ query: c });
    }
  }

  return out.slice(0, 6); // garde-fou: pas de spam réseau
}

/**
 * Retire les lignes « liste école » (`- Nom — …`) du texte affiché lorsque les cartes
 * établissement sont déjà rendues en dessous (évite doublon texte + card).
 */
export function stripEstablishmentBulletLines(text: string): string {
  const lines = text.split('\n');
  const kept: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      kept.push('');
      continue;
    }
    if (line.startsWith('- ') && line.includes(' — ')) {
      if (lineLooksLikeBoutiqueOrCommerceBullet(line)) {
        kept.push(raw);
        continue;
      }
      if (line.includes('... et ') && /autres?\s+établissement/i.test(line)) {
        kept.push(raw);
        continue;
      }
      if (lineLooksLikeEstablishmentSchoolBullet(line)) {
        continue;
      }
      kept.push(raw);
      continue;
    }
    kept.push(raw);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
