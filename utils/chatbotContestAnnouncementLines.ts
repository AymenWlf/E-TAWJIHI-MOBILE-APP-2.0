import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';

import {
  lineLooksLikeBoutiqueOrCommerceBullet,
  lineLooksLikeEstablishmentSchoolBullet,
} from '@/utils/chatbotEstablishmentLines';
import { extractInscriptionAnnouncementIdsFromText } from '@/utils/chatbotInternalRoutes';

export type ParsedContestAnnouncementLine = {
  /** Fragment titre / recherche (partie avant le premier « — »). */
  query: string;
};

/**
 * Sujet « annonces concours » (tolérant) — renforce le matching même sans puce liste.
 */
export function detectContestAnnouncementTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\bannonces?\s+concours\b/i.test(text) ||
    /\bannonces?\s+de\s+concours\b/i.test(lower) ||
    /\bconcours\s+d['']entrée\b/i.test(lower) ||
    /\bcalendrier\s+(des\s+)?concours\b/i.test(lower) ||
    (/\binscriptions?\s+ouvertes?\b/.test(lower) && /\bconcours\b/.test(lower))
  );
}

/**
 * Puces `- … — …` qui ne sont **pas** des lignes « école » (Public/Privé/…) ni boutique :
 * traitées comme pistes pour retrouver une annonce dans le catalogue API.
 */
export function parseContestAnnouncementQueriesFromChatReply(text: string): ParsedContestAnnouncementLine[] {
  const lines = text.split('\n');
  const out: ParsedContestAnnouncementLine[] = [];
  const seen = new Set<string>();

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('- ')) continue;
    if (!line.includes(' — ')) continue;
    if (lineLooksLikeBoutiqueOrCommerceBullet(line)) continue;
    if (lineLooksLikeEstablishmentSchoolBullet(line)) continue;
    if (line.includes('... et ') && /autres?\s+établissement/i.test(line)) continue;

    const rest = line.slice(2).trim();
    const beforeDash = rest.split(' — ')[0]?.trim();
    if (!beforeDash || beforeDash.length < 3) continue;

    const key = beforeDash.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ query: beforeDash });
  }

  return out.slice(0, 8);
}

/** Retire les puces « annonce » du texte lorsque les cartes sont affichées en dessous. */
export function stripContestAnnouncementBulletLines(text: string): string {
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
      if (lineLooksLikeEstablishmentSchoolBullet(line)) {
        kept.push(raw);
        continue;
      }
      if (line.includes('... et ') && /autres?\s+établissement/i.test(line)) {
        kept.push(raw);
        continue;
      }
      continue;
    }
    kept.push(raw);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Charger les cartes annonces si le message cite des `/inscriptions/id` ou des puces « annonce ». */
export function shouldAttemptContestAnnouncementCards(text: string): boolean {
  if (extractInscriptionAnnouncementIdsFromText(text).length > 0) return true;
  if (parseContestAnnouncementQueriesFromChatReply(text).length > 0) return true;
  return false;
}

/**
 * Associe une requête texte (titre / extrait de puce) à une carte du catalogue API.
 */
export function matchContestAnnouncementFromList(
  list: ContestAnnouncementCard[],
  query: string,
  excludeIds: Set<number>,
): ContestAnnouncementCard | null {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return null;

  const stopWords = new Set([
    'les',
    'des',
    'une',
    'pour',
    'avec',
    'dans',
    'sur',
    'concours',
    'concour',
    'annonce',
    'annonces',
  ]);
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

  const scoreCard = (c: ContestAnnouncementCard): number => {
    let s = 0;
    const title = (c.title ?? '').toLowerCase();
    const nom = (c.establishment?.nom ?? '').toLowerCase();
    const sigle = (c.establishment?.sigle ?? '').toLowerCase();
    if (title.includes(q)) s += 50;
    if (nom.includes(q)) s += 40;
    if (sigle && (q.includes(sigle) || sigle === q)) s += 38;
    for (const w of words) {
      if (title.includes(w)) s += 8;
      if (nom.includes(w)) s += 6;
    }
    return s;
  };

  let best: ContestAnnouncementCard | null = null;
  let bestScore = 0;
  for (const c of list) {
    if (excludeIds.has(c.id)) continue;
    const sc = scoreCard(c);
    if (sc > bestScore && sc >= 12) {
      bestScore = sc;
      best = c;
    }
  }
  return best;
}
