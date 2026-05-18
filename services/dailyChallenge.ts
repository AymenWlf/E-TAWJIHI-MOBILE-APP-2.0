import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

export type DailyChallengeQuestion = {
  id: number;
  prompt: string;
  choices: string[];
};

export type DailyChallengeZipPublic = {
  promptFr: string;
  promptAr: string;
  /** v1 : ordre des cartes */
  items?: Array<{ id: number; text: string }>;
  /** v2 : grille */
  version?: number;
  rows?: number;
  cols?: number;
  cells?: number[];
  wallsHorizontal?: number[];
  wallsVertical?: number[];
  /** Présent côté serveur pour l’indice « prochaine case » (non exposé au client pour tricher autrement). */
  solutionPath?: number[];
};

export type DailyChallengeGameEntry = {
  id: number;
  sortOrder: number;
  type: string;
  titleFr: string;
  titleAr: string;
  questions: DailyChallengeQuestion[];
  zip?: DailyChallengeZipPublic | null;
  microLearnHtml: string;
  played: boolean;
  myAttempt: {
    score: number;
    durationMs: number;
    rank: number | null;
    totalPlayers: number;
  } | null;
};

export type DailyChallengeTodayData = {
  available: boolean;
  message?: string;
  challengeDate?: string;
  type?: string;
  questions?: DailyChallengeQuestion[];
  microLearnHtml?: string;
  playedToday?: boolean;
  allGamesPlayed?: boolean;
  games?: DailyChallengeGameEntry[];
  streak?: {
    current: number;
    longestStreak?: number;
    lastCompletedDate?: string;
    freezesRemaining: number;
    /** Éphémère : ICE auto consommé au chargement du hub. */
    notices?: Array<{ type: string; date?: string; freezesRemaining?: number; streak?: number }>;
    year?: number;
    /** Premier jour représenté dans yearStates (1re participation sur l’année civile, ou « aujourd’hui » si aucune). */
    yearProgressFrom?: string;
    /** p=joué, m=manqué passé, i=ICE, n=futur ou aujourd’hui non joué */
    yearStates?: string;
    milestoneBadgesEarned?: number[];
  } | null;
  myAttempt?: {
    score: number;
    durationMs: number;
    rank: number | null;
    totalPlayers: number;
  } | null;
};

export type DailyChallengeTodayResponse = {
  success: boolean;
  data: DailyChallengeTodayData;
};

export type DailyChallengeSubmitResponse = {
  success: boolean;
  message?: string;
  data?: {
    score: number;
    rank: number | null;
    totalPlayers: number;
    streak: number;
    longestStreak?: number;
    freezesRemaining?: number;
    streakNotices?: Array<{ type: string; date?: string; freezesRemaining?: number; streak?: number }>;
    badgesEarned: Array<{ code: string; labelFr: string; labelAr: string | null; pointsEarned?: number }>;
  };
};

export type DailyChallengeLeaderboardRow = {
  rank: number;
  displayName: string;
  /** URL d’avatar (initiales / image générée côté API). */
  profileImageUrl?: string | null;
  score: number;
  durationMs: number;
  /** Présent sur les tranches « charger plus » : évite le doublon avec la ligne épinglée. */
  isMe?: boolean;
};

export type DailyChallengeLeaderboardData = {
  challengeDate: string;
  challengeId: number;
  totalPlayers: number;
  /** Tranche courante (page initiale : rangs 1–10). */
  entries: DailyChallengeLeaderboardRow[];
  /** Si le joueur connecté est hors du top 10 : sa ligne (rang réel, ex. 100) affichée après le top 10. */
  myPinned: {
    rank: number;
    displayName: string;
    profileImageUrl?: string | null;
    score: number;
    durationMs: number;
  } | null;
  myRank: number | null;
  hasMore: boolean;
  /** Offset à envoyer pour la prochaine requête « charger plus ». */
  nextOffset: number;
};

export type DailyChallengeLeaderboardResponse = {
  success: boolean;
  data: DailyChallengeLeaderboardData;
};

export async function fetchDailyChallengeToday(
  token: string | null,
  date?: string,
): Promise<DailyChallengeTodayResponse> {
  const params = new URLSearchParams();
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    params.set('date', date);
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  const url = buildApiUrl(`/api/daily-challenge/today${qs}`);
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return await httpGetJson<DailyChallengeTodayResponse>(url, { headers });
}

export async function submitDailyChallenge(
  token: string,
  challengeId: number,
  answers: number[],
  clientDurationMs: number,
): Promise<DailyChallengeSubmitResponse> {
  const url = buildApiUrl('/api/daily-challenge/submit');
  return await httpPostJson<
    DailyChallengeSubmitResponse,
    { challengeId: number; answers: number[]; clientDurationMs: number }
  >(url, { challengeId, answers, clientDurationMs }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function fetchDailyChallengeLeaderboard(
  token: string | null,
  date?: string,
  challengeId?: number,
  opts?: { offset?: number; limit?: number },
): Promise<DailyChallengeLeaderboardResponse> {
  const params = new URLSearchParams();
  if (date) {
    params.set('date', date);
  }
  if (challengeId != null && challengeId > 0) {
    params.set('challengeId', String(challengeId));
  }
  if (opts?.offset != null && opts.offset > 0) {
    params.set('offset', String(opts.offset));
  }
  if (opts?.limit != null && opts.limit > 0) {
    params.set('limit', String(opts.limit));
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  const url = buildApiUrl(`/api/daily-challenge/leaderboard${qs}`);
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return await httpGetJson<DailyChallengeLeaderboardResponse>(url, { headers });
}

export type DailyChallengeDevResetResponse = {
  success: boolean;
  message?: string;
  data?: { deleted: number };
};

/** Réservé au backend `APP_ENV=dev` : supprime les tentatives du jour pour l’utilisateur connecté. */
export async function resetDailyChallengeDevToday(token: string): Promise<DailyChallengeDevResetResponse> {
  const url = buildApiUrl('/api/daily-challenge/dev/reset-today');
  return await httpPostJson<DailyChallengeDevResetResponse, Record<string, never>>(url, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
