import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Easing,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { QuestMilestoneIcon } from '@/components/daily-challenge/QuestMilestoneIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  fetchDailyChallengeLeaderboard,
  fetchDailyChallengeToday,
  resetDailyChallengeDevToday,
  submitDailyChallenge,
  type DailyChallengeGameEntry,
  type DailyChallengeLeaderboardData,
  type DailyChallengeLeaderboardRow,
  type DailyChallengeQuestion,
  type DailyChallengeTodayData,
} from '@/services/dailyChallenge';
import { getZipGridPrefixIssue, getZipSnakeNextHintCellIndex, scoreZipGridPath } from '@/constants/zipPuzzleVariants';
import { isDevApiBaseUrl } from '@/constants/api';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

/** Largeur disponible pour la grille SNAKE (marges scroll + carte quiz à padding horizontal réduit). */
function zipQuizGridInnerWidth(screenWidth: number): number {
  return screenWidth - spacing.lg * 2 - spacing.sm * 2;
}

/** Plafond taille case (px) — au-delà, limité par la largeur / hauteur utiles. */
const ZIP_GRID_MAX_CELL = 92;

function maxScoreForGame(g: DailyChallengeGameEntry): number {
  if (g.type === 'zip' && g.zip) {
    const { rows, cols, items } = g.zip;
    if ((g.zip.version ?? 0) >= 2 && rows != null && cols != null && rows > 0 && cols > 0) {
      return rows * cols;
    }
    if (items?.length) return items.length;
  }
  return g.questions.length;
}

function isZipGridV2(zip: NonNullable<DailyChallengeGameEntry['zip']>): boolean {
  const v = Number(zip.version ?? 0);
  const rows = Number(zip.rows);
  const cols = Number(zip.cols);
  if (v < 2 || !Number.isFinite(rows) || !Number.isFinite(cols) || rows < 1 || cols < 1 || !zip.cells) {
    return false;
  }
  return zip.cells.length === rows * cols;
}

function formatZipDurationMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function beatPlayersPercentile(rank: number | null, totalPlayers: number): number | null {
  if (rank == null || totalPlayers <= 1) return null;
  const pct = Math.round(((totalPlayers - rank) / Math.max(1, totalPlayers - 1)) * 100);
  return Math.max(0, Math.min(100, pct));
}

function leaderboardRowAvatarUri(row: { displayName: string; profileImageUrl?: string | null }): string {
  const u = row.profileImageUrl?.trim();
  if (u) return u;
  const q = new URLSearchParams({
    name: row.displayName.trim() || 'Joueur',
    background: '333E8F',
    color: 'ffffff',
    size: '128',
    bold: 'true',
  });
  return `https://ui-avatars.com/api/?${q.toString()}`;
}

const CONFETTI_SPECS: Array<{ x: number; y: number; w: number; c: string; rot: number }> = [
  { x: 0.06, y: 0.1, w: 7, c: brand.emerald, rot: -22 },
  { x: 0.82, y: 0.08, w: 6, c: brand.warning, rot: 18 },
  { x: 0.45, y: 0.05, w: 5, c: 'rgba(255,255,255,0.35)', rot: 8 },
  { x: 0.2, y: 0.22, w: 6, c: brand.primaryInteractive, rot: -12 },
  { x: 0.72, y: 0.2, w: 7, c: brand.emerald, rot: 25 },
  { x: 0.12, y: 0.38, w: 5, c: brand.warning, rot: -8 },
  { x: 0.9, y: 0.35, w: 6, c: 'rgba(255,255,255,0.3)', rot: 14 },
  { x: 0.38, y: 0.32, w: 5, c: brand.emerald, rot: -30 },
  { x: 0.58, y: 0.42, w: 6, c: brand.warning, rot: 20 },
  { x: 0.25, y: 0.55, w: 5, c: 'rgba(255,255,255,0.28)', rot: -15 },
  { x: 0.75, y: 0.52, w: 7, c: brand.primaryInteractive, rot: 10 },
  { x: 0.5, y: 0.65, w: 6, c: brand.emerald, rot: -5 },
  { x: 0.08, y: 0.68, w: 5, c: brand.warning, rot: 28 },
  { x: 0.88, y: 0.72, w: 6, c: 'rgba(255,255,255,0.25)', rot: -18 },
];

const STRK_MILESTONES = [7, 14, 30, 60, 100, 180, 365] as const;

function ConfettiPiece({ p, index }: { p: (typeof CONFETTI_SPECS)[number]; index: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dur = 1400 + (index % 5) * 140;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: dur,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(120 + (index % 4) * 35),
      ]),
    );
    const startDelay = setTimeout(() => anim.start(), index * 70);
    return () => {
      clearTimeout(startDelay);
      anim.stop();
    };
  }, [index, t]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, 26 + (index % 4) * 5] });
  const translateX = t.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, index % 2 === 0 ? 10 : -8, 0] });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: [`${p.rot}deg`, `${p.rot + (index % 2 === 0 ? 85 : -70)}deg`],
  });
  const opacity = t.interpolate({ inputRange: [0, 0.12, 0.55, 1], outputRange: [0.38, 0.88, 0.78, 0.42] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        width: p.w,
        height: p.w * 1.35,
        backgroundColor: p.c,
        borderRadius: 2,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

function CelebrationConfetti() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {CONFETTI_SPECS.map((p, i) => (
        <ConfettiPiece key={i} p={p} index={i} />
      ))}
    </View>
  );
}

function rc(idx: number, cols: number): { r: number; c: number } {
  return { r: Math.floor(idx / cols), c: idx % cols };
}

function zipGridAdjacent(
  a: number,
  b: number,
  cols: number,
  wallsHorizontal: number[],
  wallsVertical: number[],
): boolean {
  const { r: ra, c: ca } = rc(a, cols);
  const { r: rb, c: cb } = rc(b, cols);
  if (Math.abs(ra - rb) + Math.abs(ca - cb) !== 1) return false;
  if (ra === rb) {
    const c = Math.min(ca, cb);
    const idx = ra * Math.max(0, cols - 1) + c;
    return (wallsVertical[idx] ?? 0) === 0;
  }
  const r = Math.min(ra, rb);
  const idx = r * cols + ca;
  return (wallsHorizontal[idx] ?? 0) === 0;
}

function onTapZipGridCell(
  zip: NonNullable<DailyChallengeGameEntry['zip']>,
  path: number[],
  cellIdx: number,
): number[] {
  if (!isZipGridV2(zip) || zip.rows == null || zip.cols == null || !zip.cells) return path;
  const cols = zip.cols;
  const rows = zip.rows;
  const n = rows * cols;
  const wh = zip.wallsHorizontal ?? [];
  const wv = zip.wallsVertical ?? [];
  const cells = zip.cells;

  if (path.length === 0) {
    if (cells[cellIdx] === 1) return [cellIdx];
    return path;
  }
  const last = path[path.length - 1]!;
  /** Dernière case : ne pas annuler, on continue depuis là. */
  if (last === cellIdx) {
    return path;
  }
  const pos = path.indexOf(cellIdx);
  if (pos !== -1) {
    /** Case déjà visitée (pas la fin) : couper tout ce qui suit pour reprendre depuis celle-ci. */
    return path.slice(0, pos + 1);
  }
  if (!zipGridAdjacent(last, cellIdx, cols, wh, wv)) return path;
  return [...path, cellIdx];
}

/** Pendant un glisser continu : pas de retour vers une case déjà visitée si la tête est ≥ 2 pas plus loin (doigt levé → tap pour raccourcir). */
const ZIP_DRAG_MIN_STEPS_AHEAD_TO_BLOCK_REVISIT = 2;

/** Pendant le glisser : raccourcir d’au plus une case en arrière ; sinon ignorer jusqu’au relâchement. */
function onDragZipGridCell(
  zip: NonNullable<DailyChallengeGameEntry['zip']>,
  path: number[],
  cellIdx: number,
): number[] {
  if (!isZipGridV2(zip) || zip.rows == null || zip.cols == null || !zip.cells) return path;
  const cols = zip.cols;
  const wh = zip.wallsHorizontal ?? [];
  const wv = zip.wallsVertical ?? [];
  const cells = zip.cells;

  if (path.length === 0) {
    if (cells[cellIdx] === 1) return [cellIdx];
    return path;
  }
  const last = path[path.length - 1]!;
  if (last === cellIdx) {
    return path;
  }
  const pos = path.indexOf(cellIdx);
  if (pos !== -1) {
    const stepsFromTouchedToHead = path.length - 1 - pos;
    if (stepsFromTouchedToHead >= ZIP_DRAG_MIN_STEPS_AHEAD_TO_BLOCK_REVISIT) {
      return path;
    }
    return path.slice(0, pos + 1);
  }
  if (!zipGridAdjacent(last, cellIdx, cols, wh, wv)) return path;
  return [...path, cellIdx];
}

function shuffleZipItems<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** Couleur du serpent SNAKE (corps + tête). */
const ZIP_SNAKE_BODY = '#1d4ed8';
const ZIP_SNAKE_HEAD = '#2563eb';
const ZIP_SNAKE_ERR = 'rgba(220, 38, 38, 0.9)';

type ZipSnakeSegment = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  angleDeg: number;
};

function buildZipSnakeSegments(order: readonly number[], cols: number, cellSize: number): ZipSnakeSegment[] {
  const th = Math.max(5, Math.round(cellSize * 0.14));
  const out: ZipSnakeSegment[] = [];
  for (let i = 0; i < order.length - 1; i++) {
    const a = order[i]!;
    const b = order[i + 1]!;
    const ra = Math.floor(a / cols);
    const ca = a % cols;
    const rb = Math.floor(b / cols);
    const cb = b % cols;
    const cxA = ca * cellSize + cellSize / 2;
    const cyA = ra * cellSize + cellSize / 2;
    const cxB = cb * cellSize + cellSize / 2;
    const cyB = rb * cellSize + cellSize / 2;
    const dx = cxB - cxA;
    const dy = cyB - cyA;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const midX = (cxA + cxB) / 2;
    const midY = (cyA + cyB) / 2;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    out.push({
      key: `zip-snake-${i}-${a}-${b}`,
      left: midX - len / 2,
      top: midY - th / 2,
      width: len,
      height: th,
      angleDeg,
    });
  }
  return out;
}

type Step = 'load' | 'hub' | 'quiz' | 'result';

type LeaderboardVm = {
  challengeDate: string;
  challengeId: number;
  totalPlayers: number;
  myRank: number | null;
  topEntries: DailyChallengeLeaderboardRow[];
  myPinned: DailyChallengeLeaderboardData['myPinned'];
  moreEntries: DailyChallengeLeaderboardRow[];
  hasMore: boolean;
  nextOffset: number;
};

function leaderboardDataToVm(d: DailyChallengeLeaderboardData): LeaderboardVm {
  return {
    challengeDate: d.challengeDate,
    challengeId: d.challengeId,
    totalPlayers: d.totalPlayers,
    myRank: d.myRank,
    topEntries: d.entries,
    myPinned: d.myPinned,
    moreEntries: [],
    hasMore: d.hasMore,
    nextOffset: d.nextOffset,
  };
}

export default function DailyChallengeScreen() {
  const params = useLocalSearchParams<{ openInfo?: string }>();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { getValidAccessToken, user } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerPadTop = insets.top + spacing.sm;
  const [step, setStep] = useState<Step>('load');
  const [today, setToday] = useState<DailyChallengeTodayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<DailyChallengeGameEntry | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [lbVm, setLbVm] = useState<LeaderboardVm | null>(null);
  const [lbLoadMoreBusy, setLbLoadMoreBusy] = useState(false);
  const lbVmRef = useRef<LeaderboardVm | null>(null);
  const lbLoadMoreBusyRef = useRef(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [microLearnRead, setMicroLearnRead] = useState(false);
  const [zipRulesOpen, setZipRulesOpen] = useState(false);
  const [iceExplainOpen, setIceExplainOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<DailyChallengeTodayData['myAttempt'] | null>(null);
  const [badgesEarned, setBadgesEarned] = useState<
    Array<{ code: string; labelFr: string; labelAr: string | null; pointsEarned?: number }>
  >(
    [],
  );
  const startedAt = useRef<number>(0);
  const [zipOrder, setZipOrder] = useState<number[]>([]);
  const [zipHintHighlightIdx, setZipHintHighlightIdx] = useState<number | null>(null);
  const [zipHelpCooldownLeftSec, setZipHelpCooldownLeftSec] = useState(0);
  const [zipHelpNoHintVisible, setZipHelpNoHintVisible] = useState(false);
  const zipHelpNextAllowedAtRef = useRef(0);
  const zipHintClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shuffledZipItems, setShuffledZipItems] = useState<Array<{ id: number; text: string }>>([]);
  const lastDragZipCell = useRef<number | null>(null);
  const zipAutoSubmittedRef = useRef(false);
  const finishQuizRef = useRef<(finalAnswers: number[]) => Promise<void>>(async () => {});
  const [zipTick, setZipTick] = useState(0);
  const [devResetBusy, setDevResetBusy] = useState(false);
  const zipTimerAccumRef = useRef(0);
  const zipTimerRunStartRef = useRef<number | null>(null);
  const zipTimerGameIdRef = useRef<number | null>(null);
  const isScreenFocusedRef = useRef(true);
  const stepRef = useRef(step);
  const activeGameRef = useRef(activeGame);
  const zipSnakePulse = useRef(new Animated.Value(1)).current;
  const zipSnakeHeadScale = useRef(new Animated.Value(1)).current;
  const iceUsedNoticeShownForDateRef = useRef<string>('');

  const games = useMemo(() => (today?.games?.length ? today.games : []), [today?.games]);

  const playedAnyGameToday = useMemo(() => games.some((g) => g.played), [games]);

  useEffect(() => {
    lbVmRef.current = lbVm;
  }, [lbVm]);

  const pauseZipTimer = useCallback(() => {
    const rs = zipTimerRunStartRef.current;
    if (rs != null) {
      zipTimerAccumRef.current += Date.now() - rs;
      zipTimerRunStartRef.current = null;
    }
  }, []);

  const syncZipTimerRunning = useCallback(() => {
    const st = stepRef.current;
    const ag = activeGameRef.current;
    const inZipQuiz = st === 'quiz' && ag?.type === 'zip';
    const appUp = AppState.currentState === 'active';
    const shouldRun = inZipQuiz && appUp && isScreenFocusedRef.current;
    if (shouldRun) {
      if (zipTimerRunStartRef.current === null) {
        zipTimerRunStartRef.current = Date.now();
      }
    } else {
      pauseZipTimer();
    }
  }, [pauseZipTimer]);

  const initZipTimerForGame = useCallback(
    (gameId: number, hardReset: boolean) => {
      pauseZipTimer();
      if (hardReset || zipTimerGameIdRef.current !== gameId) {
        zipTimerAccumRef.current = 0;
        zipTimerGameIdRef.current = gameId;
      }
      zipTimerRunStartRef.current = null;
    },
    [pauseZipTimer],
  );

  useEffect(() => {
    stepRef.current = step;
    activeGameRef.current = activeGame;
  }, [step, activeGame]);

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      syncZipTimerRunning();
      return () => {
        isScreenFocusedRef.current = false;
        syncZipTimerRunning();
      };
    }, [syncZipTimerRunning]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', () => {
      syncZipTimerRunning();
    });
    return () => sub.remove();
  }, [syncZipTimerRunning]);

  useEffect(() => {
    syncZipTimerRunning();
  }, [step, activeGame?.type, activeGame?.id, syncZipTimerRunning]);

  useEffect(() => {
    if (step !== 'quiz' || activeGame?.type !== 'zip') return;
    const id = setInterval(() => setZipTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [step, activeGame?.type]);

  useEffect(() => {
    const inZipQuiz = step === 'quiz' && activeGame?.type === 'zip';
    if (!inZipQuiz) {
      zipSnakePulse.stopAnimation();
      zipSnakeHeadScale.stopAnimation();
      zipSnakePulse.setValue(1);
      zipSnakeHeadScale.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(zipSnakePulse, {
          toValue: 0.76,
          duration: 680,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(zipSnakePulse, {
          toValue: 1,
          duration: 680,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const head = Animated.loop(
      Animated.sequence([
        Animated.timing(zipSnakeHeadScale, {
          toValue: 1.14,
          duration: 550,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(zipSnakeHeadScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    head.start();
    return () => {
      pulse.stop();
      head.stop();
    };
  }, [step, activeGame?.type, zipSnakePulse, zipSnakeHeadScale]);

  const mainMicroLearnHtml = useMemo(() => {
    const zipG = games.find((g) => g.type === 'zip');
    return (zipG?.microLearnHtml || today?.microLearnHtml || '').trim();
  }, [games, today?.microLearnHtml]);

  const primaryLeaderboardGameId = games.find((g) => g.type === 'zip')?.id ?? games[0]?.id ?? 0;

  const showHubLeaderboardCta =
    primaryLeaderboardGameId > 0 && games.length > 0 && playedAnyGameToday;

  const questions = activeGame?.questions ?? [];

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    setError(null);
    if (!silent) {
      setStep('load');
    }
    try {
      const token = await getValidAccessToken();
      const res = await fetchDailyChallengeToday(token);
      if (!res.success) {
        setError('Erreur API');
        if (!silent) {
          setStep('hub');
        }
        return;
      }
      setToday(res.data);
      const micro = (() => {
        const gs = res.data.games ?? [];
        const z = gs.find((g) => g.type === 'zip');
        return (z?.microLearnHtml || res.data.microLearnHtml || '').trim();
      })();
      if (params.openInfo === '1' && micro) {
        setInfoOpen(true);
      }
      if (!res.data.available) {
        if (!silent) {
          setStep('hub');
        }
        return;
      }
      if (!silent) {
        setStep('hub');
      }
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Erreur';
      setError(msg);
      if (!silent) {
        setStep('hub');
      }
    }
  }, [getValidAccessToken, params.openInfo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let alive = true;
    const date = today?.challengeDate;
    if (!date) {
      setMicroLearnRead(false);
      return;
    }
    void (async () => {
      try {
        const v = await AsyncStorage.getItem(`daily_info_read_${date}`);
        if (alive) setMicroLearnRead(v === '1');
      } catch {
        if (alive) setMicroLearnRead(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [today?.challengeDate]);

  useEffect(() => {
    if (step !== 'hub' || !user) return;
    const notices = today?.streak?.notices;
    if (!notices?.length) return;
    for (const n of notices) {
      if (n.type === 'ice_used' && n.date) {
        if (iceUsedNoticeShownForDateRef.current === n.date) continue;
        iceUsedNoticeShownForDateRef.current = n.date;
        Alert.alert(
          t('dailyChallengeIceUsedTitle'),
          t('dailyChallengeIceUsedBody').replace('{{date}}', n.date),
        );
      }
    }
  }, [step, user, today?.streak?.notices, t]);

  const gameTitle = useCallback(
    (g: DailyChallengeGameEntry) => (locale === 'ar' && g.titleAr.trim() !== '' ? g.titleAr : g.titleFr),
    [locale],
  );

  const canPlayGame = useCallback((g: DailyChallengeGameEntry) => {
    if (g.type === 'zip' && g.zip) {
      if (isZipGridV2(g.zip)) return (g.zip.rows ?? 0) * (g.zip.cols ?? 0) > 0;
      return Boolean(g.zip.items?.length);
    }
    return g.type === 'quiz' && g.questions.length > 0;
  }, []);

  const firstPlayableGame = useMemo(() => {
    if (!user) return null;
    return games.find((g) => !g.played && canPlayGame(g)) ?? null;
  }, [user, games, canPlayGame]);

  const startQuizFor = (g: DailyChallengeGameEntry) => {
    if (g.played) return;
    if (g.type === 'zip' && g.zip) {
      if (isZipGridV2(g.zip)) {
        initZipTimerForGame(g.id, false);
        setActiveGame(g);
        setZipOrder([]);
        setShuffledZipItems([]);
        setQIndex(0);
        setSelectedChoice(null);
        startedAt.current = Date.now();
        setStep('quiz');
        return;
      }
      if (g.zip.items?.length) {
        initZipTimerForGame(g.id, false);
        setActiveGame(g);
        setZipOrder([]);
        setShuffledZipItems(shuffleZipItems(g.zip.items));
        setQIndex(0);
        setSelectedChoice(null);
        startedAt.current = Date.now();
        setStep('quiz');
      }
      return;
    }
    if (g.type === 'quiz' && g.questions.length > 0) {
      setActiveGame(g);
      const n = g.questions.length;
      setAnswers(Array.from({ length: n }, () => -1));
      setQIndex(0);
      setSelectedChoice(null);
      startedAt.current = Date.now();
      setStep('quiz');
    }
  };

  const goNext = () => {
    if (activeGame?.type === 'zip') return;
    if (selectedChoice === null) return;
    const next = [...answers];
    next[qIndex] = selectedChoice;
    setAnswers(next);
    if (qIndex + 1 >= questions.length) {
      void finishQuiz(next);
      return;
    }
    setQIndex(qIndex + 1);
    setSelectedChoice(next[qIndex + 1] >= 0 ? next[qIndex + 1] : null);
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const token = await getValidAccessToken();
    if (!token || !user || !activeGame) {
      setError(t('dailyChallengeLoginHint'));
      zipAutoSubmittedRef.current = false;
      setStep('hub');
      return;
    }
    if (activeGame.type === 'zip') {
      pauseZipTimer();
    }
    const duration =
      activeGame.type === 'zip'
        ? zipTimerAccumRef.current
        : Math.max(0, Date.now() - startedAt.current);
    setSubmitting(true);
    try {
      const res = await submitDailyChallenge(token, activeGame.id, finalAnswers, duration);
      if (!res.success || !res.data) {
        setError(res.message ?? 'Soumission impossible');
        setStep('quiz');
        zipAutoSubmittedRef.current = false;
        return;
      }
      setSubmitResult({
        score: res.data.score,
        durationMs: duration,
        rank: res.data.rank,
        totalPlayers: res.data.totalPlayers,
      });
      setBadgesEarned(res.data.badgesEarned ?? []);
      const sns = res.data.streakNotices;
      if (sns?.length) {
        for (const n of sns) {
          if (n.type === 'ice_unlocked') {
            Alert.alert(
              t('dailyChallengeIceUnlockedTitle'),
              t('dailyChallengeIceUnlockedBody')
                .replace('{{streak}}', String(n.streak ?? ''))
                .replace('{{freezes}}', String(n.freezesRemaining ?? '')),
            );
          }
        }
      }
      setStep('result');
      void load({ silent: true });
      void openLeaderboard(activeGame.id);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Erreur';
      setError(msg);
      setStep('quiz');
      zipAutoSubmittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  finishQuizRef.current = finishQuiz;

  const zipGridV2PrefixIssue = useMemo(() => {
    if (step !== 'quiz' || activeGame?.type !== 'zip' || !activeGame.zip || !isZipGridV2(activeGame.zip)) {
      return null;
    }
    const z = activeGame.zip;
    if (z.rows == null || z.cols == null || !z.cells) return null;
    return getZipGridPrefixIssue(
      {
        rows: z.rows,
        cols: z.cols,
        cells: z.cells,
        wallsHorizontal: z.wallsHorizontal ?? [],
        wallsVertical: z.wallsVertical ?? [],
      },
      zipOrder,
    );
  }, [step, activeGame?.type, activeGame?.zip, zipOrder]);

  useEffect(() => {
    setZipHintHighlightIdx(null);
  }, [zipOrder]);

  useEffect(() => {
    return () => {
      if (zipHintClearTimerRef.current) {
        clearTimeout(zipHintClearTimerRef.current);
        zipHintClearTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (step !== 'quiz' || activeGame?.type !== 'zip') {
      setZipHelpCooldownLeftSec(0);
      return;
    }
    const id = setInterval(() => {
      const left = Math.ceil((zipHelpNextAllowedAtRef.current - Date.now()) / 1000);
      setZipHelpCooldownLeftSec(left > 0 ? left : 0);
    }, 200);
    return () => clearInterval(id);
  }, [step, activeGame?.type]);

  useEffect(() => {
    zipHelpNextAllowedAtRef.current = 0;
    setZipHelpCooldownLeftSec(0);
    setZipHintHighlightIdx(null);
    if (zipHintClearTimerRef.current) {
      clearTimeout(zipHintClearTimerRef.current);
      zipHintClearTimerRef.current = null;
    }
  }, [zipTick]);

  useEffect(() => {
    if (zipOrder.length === 0) zipAutoSubmittedRef.current = false;
  }, [zipOrder.length]);

  useEffect(() => {
    if (step !== 'quiz' || activeGame?.type !== 'zip' || !activeGame.zip || !isZipGridV2(activeGame.zip)) return;
    if (submitting || zipAutoSubmittedRef.current) return;
    const z = activeGame.zip;
    const rows = z.rows!;
    const cols = z.cols!;
    const n = rows * cols;
    if (zipOrder.length !== n) return;
    const sc = scoreZipGridPath(
      {
        rows,
        cols,
        cells: z.cells!,
        wallsHorizontal: z.wallsHorizontal ?? [],
        wallsVertical: z.wallsVertical ?? [],
      },
      zipOrder,
    );
    if (sc !== n) return;
    zipAutoSubmittedRef.current = true;
    void finishQuizRef.current(zipOrder);
  }, [zipOrder, step, activeGame?.type, activeGame?.zip, submitting]);

  const openLeaderboard = async (challengeId: number) => {
    try {
      lbLoadMoreBusyRef.current = false;
      setLbLoadMoreBusy(false);
      const token = await getValidAccessToken();
      const res = await fetchDailyChallengeLeaderboard(token, today?.challengeDate, challengeId);
      if (res.success && res.data) {
        setLbVm(leaderboardDataToVm(res.data));
        setLbOpen(true);
      }
    } catch {
      /* noop */
    }
  };

  const loadMoreLeaderboard = useCallback(async () => {
    if (lbLoadMoreBusyRef.current) return;
    const v = lbVmRef.current;
    if (!v?.hasMore) return;
    lbLoadMoreBusyRef.current = true;
    setLbLoadMoreBusy(true);
    try {
      const token = await getValidAccessToken();
      const res = await fetchDailyChallengeLeaderboard(token, v.challengeDate, v.challengeId, {
        offset: v.nextOffset,
        limit: 10,
      });
      if (!res.success || !res.data) return;
      setLbVm((prev) => {
        if (!prev) return null;
        const chunk = res.data!.entries.filter((r) => !(r.isMe && prev.myPinned != null));
        return {
          ...prev,
          moreEntries: [...prev.moreEntries, ...chunk],
          hasMore: res.data!.hasMore,
          nextOffset: res.data!.nextOffset,
        };
      });
    } catch {
      /* noop */
    } finally {
      lbLoadMoreBusyRef.current = false;
      setLbLoadMoreBusy(false);
    }
  }, [getValidAccessToken]);

  const devResetToday = useCallback(async () => {
    if (!__DEV__ || !isDevApiBaseUrl() || !user) return;
    setDevResetBusy(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(t('dailyChallengeLoginHint'));
        return;
      }
      const res = await resetDailyChallengeDevToday(token);
      if (!res.success) {
        setError(res.message ?? 'Reset impossible');
        return;
      }
      setLbOpen(false);
      setSubmitResult(null);
      setActiveGame(null);
      setZipOrder([]);
      setShuffledZipItems([]);
      setStep('hub');
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Erreur';
      setError(msg);
    } finally {
      setDevResetBusy(false);
    }
  }, [user, getValidAccessToken, load, t]);

  const closeInfoModal = useCallback(async () => {
    if (today?.challengeDate) {
      try {
        await AsyncStorage.setItem(`daily_info_read_${today.challengeDate}`, '1');
      } catch {
        /* noop */
      }
    }
    setMicroLearnRead(true);
    setInfoOpen(false);
  }, [today?.challengeDate]);

  const zipPrompt = useCallback(
    (z: NonNullable<DailyChallengeGameEntry['zip']>) =>
      locale === 'ar' && z.promptAr.trim() !== '' ? z.promptAr : z.promptFr,
    [locale],
  );

  const applyZipGridCellTap = useCallback((cellIdx: number) => {
    if (!activeGame?.zip || !isZipGridV2(activeGame.zip)) return;
    setZipOrder((prev) => onTapZipGridCell(activeGame.zip!, prev, cellIdx));
  }, [activeGame]);

  const applyZipGridCellDrag = useCallback((cellIdx: number) => {
    if (!activeGame?.zip || !isZipGridV2(activeGame.zip)) return;
    setZipOrder((prev) => onDragZipGridCell(activeGame.zip!, prev, cellIdx));
  }, [activeGame]);

  const onZipHelpPress = useCallback(() => {
    if (!activeGame?.zip || !isZipGridV2(activeGame.zip) || submitting) return;
    const z = activeGame.zip;
    const rows = z.rows ?? 0;
    const cols = z.cols ?? 0;
    const n = rows * cols;
    if (n < 1 || zipOrder.length >= n) return;
    const now = Date.now();
    if (now < zipHelpNextAllowedAtRef.current) return;
    const hint = getZipSnakeNextHintCellIndex(
      {
        rows,
        cols,
        cells: z.cells!,
        wallsHorizontal: z.wallsHorizontal ?? [],
        wallsVertical: z.wallsVertical ?? [],
        solutionPath: z.solutionPath,
      },
      zipOrder,
    );
    if (hint == null) {
      setZipHelpNoHintVisible(true);
      setTimeout(() => setZipHelpNoHintVisible(false), 2600);
      return;
    }
    setZipHintHighlightIdx(hint);
    zipHelpNextAllowedAtRef.current = now + 5000;
    setZipHelpCooldownLeftSec(5);
    if (zipHintClearTimerRef.current) clearTimeout(zipHintClearTimerRef.current);
    zipHintClearTimerRef.current = setTimeout(() => {
      setZipHintHighlightIdx(null);
      zipHintClearTimerRef.current = null;
    }, 3500);
  }, [activeGame, zipOrder, submitting]);

  const zipGridLayout = useMemo(() => {
    if (step !== 'quiz' || activeGame?.type !== 'zip' || !activeGame.zip || !isZipGridV2(activeGame.zip)) {
      return null;
    }
    const zip = activeGame.zip;
    if (zip.rows == null || zip.cols == null) return null;
    const rows = zip.rows;
    const cols = zip.cols;
    const innerW = zipQuizGridInnerWidth(width);
    const cellW = Math.max(16, Math.floor(innerW / cols) - 2);
    const topBarH = headerPadTop + 40 + spacing.sm;
    /** Espace hors grille : paddings écran + carte + barre d’outils + consigne + pied + marge. */
    const zipQuizChrome =
      spacing.lg * 5 +
      spacing.md * 4 +
      120 +
      56 +
      72 +
      48;
    const availForGrid = height - topBarH - zipQuizChrome - insets.bottom;
    const maxByHeight = rows > 0 ? Math.max(16, Math.floor(availForGrid / rows) - 2) : ZIP_GRID_MAX_CELL;
    const cellSize = Math.min(ZIP_GRID_MAX_CELL, cellW, maxByHeight);
    return { zip, rows, cols, cellSize };
  }, [step, activeGame, width, height, headerPadTop, insets.bottom]);

  const zipGridPanResponder = useMemo(() => {
    if (!zipGridLayout) return null;
    const { rows, cols, cellSize } = zipGridLayout;
    const pick = (lx: number, ly: number): number | null => {
      const col = Math.floor(lx / cellSize);
      const row = Math.floor(ly / cellSize);
      if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
      return row * cols + col;
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (e) => {
        lastDragZipCell.current = null;
        const idx = pick(e.nativeEvent.locationX, e.nativeEvent.locationY);
        if (idx != null) {
          lastDragZipCell.current = idx;
          applyZipGridCellTap(idx);
        }
      },
      onPanResponderMove: (e) => {
        const idx = pick(e.nativeEvent.locationX, e.nativeEvent.locationY);
        if (idx != null && idx !== lastDragZipCell.current) {
          lastDragZipCell.current = idx;
          applyZipGridCellDrag(idx);
        }
      },
      onPanResponderRelease: () => {
        lastDragZipCell.current = null;
      },
      onPanResponderTerminate: () => {
        lastDragZipCell.current = null;
      },
    });
  }, [zipGridLayout, applyZipGridCellTap, applyZipGridCellDrag]);

  const onTapZipItem = (id: number) => {
    if (!activeGame?.zip || isZipGridV2(activeGame.zip)) return;
    const n = activeGame.zip.items?.length ?? 0;
    if (n === 0 || zipOrder.includes(id) || zipOrder.length >= n) return;
    setZipOrder((prev) => [...prev, id]);
  };

  const currentQ: DailyChallengeQuestion | undefined = activeGame?.type === 'quiz' ? questions[qIndex] : undefined;
  const activeMaxPoints = activeGame ? maxScoreForGame(activeGame) : 0;

  const tagsStyles = useMemo(
    () => ({
      body: {
        color: brand.text,
        fontSize: fontSize.sm,
        lineHeight: 22,
        textAlign: isRTL ? ('right' as const) : ('left' as const),
      },
      p: { marginBottom: spacing.sm },
      h1: { fontSize: fontSize.lg, fontWeight: '800' as const, color: brand.text, marginBottom: spacing.sm },
      h2: { fontSize: fontSize.md, fontWeight: '800' as const, color: brand.text, marginBottom: spacing.xs },
      h3: { fontSize: fontSize.md, fontWeight: '700' as const, color: brand.text, marginBottom: spacing.xs },
      ul: { marginBottom: spacing.sm, paddingLeft: isRTL ? 0 : spacing.md, paddingRight: isRTL ? spacing.md : 0 },
      ol: { marginBottom: spacing.sm, paddingLeft: isRTL ? 0 : spacing.md, paddingRight: isRTL ? spacing.md : 0 },
      li: { marginBottom: 4, color: brand.text, fontSize: fontSize.sm },
      strong: { fontWeight: '800' as const, color: brand.text },
      a: { color: brand.primary, textDecorationLine: 'underline' as const },
    }),
    [isRTL],
  );

  const renderLbRow = useCallback(
    (
      row: {
        rank: number;
        displayName: string;
        profileImageUrl?: string | null;
        score: number;
        durationMs: number;
      },
      rowKey: string,
      isYou: boolean,
    ) => {
      const toneStyle =
        row.rank === 1
          ? styles.lbRowToneGold
          : row.rank === 2
            ? styles.lbRowToneSilver
            : row.rank === 3
              ? styles.lbRowToneBronze
              : undefined;
      const avatarUri = leaderboardRowAvatarUri(row);
      return (
        <View key={rowKey} style={[styles.lbCardRow, toneStyle, isYou ? styles.lbCardRowYou : null]}>
          <View style={styles.lbRankCircle}>
            <Text style={styles.lbRankCircleTxt}>{row.rank}</Text>
          </View>
          <View style={styles.lbAvatarWrap} accessibilityIgnoresInvertColors>
            <Image
              source={{ uri: avatarUri }}
              style={styles.lbAvatarImg}
              accessibilityLabel={row.displayName}
            />
          </View>
          <View style={styles.lbCardMid}>
            <Text style={[styles.lbCardName, isRTL && styles.rtl]} numberOfLines={1}>
              {row.displayName}
            </Text>
            {isYou ? <Text style={[styles.lbYouTag, isRTL && styles.rtl]}>{t('dailyChallengeYouLabel')}</Text> : null}
          </View>
          <View style={styles.lbRightCol}>
            <View style={[styles.lbTimeRow, isRTL && styles.rowReverse]}>
              <FontAwesome name="clock-o" size={12} color={brand.primary} />
              <Text style={styles.lbTimeTxt}>{formatZipDurationMs(row.durationMs)}</Text>
            </View>
            <Text style={[styles.lbScoreSmall, isRTL && styles.rtl]}>{row.score}</Text>
          </View>
        </View>
      );
    },
    [t, isRTL],
  );

  const hubFooterHubPad =
    step === 'hub' && today?.available && user && (firstPlayableGame != null || showHubLeaderboardCta)
      ? Math.max(insets.bottom, spacing.sm) + (firstPlayableGame != null && showHubLeaderboardCta ? 64 : 56)
      : 0;
  const scrollBottomPad = insets.bottom + spacing.xl + hubFooterHubPad;
  const backIcon = isRTL ? 'chevron-right' : 'chevron-left';

  const streakVal = today?.streak?.current ?? 0;

  const streakGamifyMeta = useMemo(() => {
    const s = today?.streak?.current ?? 0;
    const earned = today?.streak?.milestoneBadgesEarned ?? [];
    const earnedSet = new Set(earned);
    const totalMs = STRK_MILESTONES.length;
    const earnedCount = STRK_MILESTONES.filter((m) => earnedSet.has(m)).length;
    const nextTarget = STRK_MILESTONES.find((m) => !earnedSet.has(m)) ?? null;
    let barPct = 100;
    if (nextTarget != null && nextTarget > 0) {
      barPct = Math.min(100, Math.round((s / nextTarget) * 100));
    }
    return { streak: s, earnedCount, totalMs, nextTarget, barPct };
  }, [today?.streak?.current, today?.streak?.milestoneBadgesEarned]);

  const hubDateLabel = useMemo(() => {
    if (!today?.challengeDate) return '';
    const parts = today.challengeDate.split('-').map((x) => parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return today.challengeDate;
    const [y, m, d] = parts as [number, number, number];
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [today?.challengeDate, locale]);

  const yearProgressStripTitle = useMemo(() => {
    const st = today?.streak;
    if (!st?.yearStates) return '';
    const year = st.year ?? new Date().getFullYear();
    const from = st.yearProgressFrom;
    if (from) {
      const parts = from.split('-').map((x) => parseInt(x, 10));
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        const [y, m, d] = parts as [number, number, number];
        const dt = new Date(y, m - 1, d);
        const dateStr = dt.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
          day: 'numeric',
          month: 'short',
        });
        return t('dailyChallengeYearProgressFromTitle').replace('{{year}}', String(year)).replace('{{date}}', dateStr);
      }
    }
    return t('dailyChallengeYearProgressTitle').replace('{{year}}', String(year));
  }, [today?.streak?.yearStates, today?.streak?.year, today?.streak?.yearProgressFrom, locale, t]);

  const showRetry = Boolean(error) || (today != null && !today.available);
  const allDone = Boolean(today?.allGamesPlayed ?? today?.playedToday);

  void zipTick;
  const zipElapsedMsLive =
    step === 'quiz' && activeGame?.type === 'zip'
      ? zipTimerAccumRef.current +
        (zipTimerRunStartRef.current != null ? Date.now() - zipTimerRunStartRef.current : 0)
      : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.topBar, { paddingTop: headerPadTop }, isRTL && styles.rowReverse]}>
        <Pressable
          onPress={() =>
            step === 'quiz'
              ? (setStep('hub'),
                setActiveGame(null),
                setZipOrder([]),
                setShuffledZipItems([]))
              : router.back()
          }
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('dailyChallengeClose')}
        >
          <FontAwesome name={backIcon} size={16} color={brand.white} />
        </Pressable>
        <Text style={[styles.topBarTitle, isRTL && styles.rtl]} numberOfLines={1}>
          {t('dailyChallengeTitle')}
        </Text>
        <View
          style={[styles.langSwitch, isRTL && styles.rowReverse]}
          accessibilityRole="tablist"
          accessibilityLabel={t('languageSwitcher')}
        >
          <Pressable
            onPress={() => setLocale('fr')}
            style={({ pressed }) => [
              styles.langPill,
              locale === 'fr' && styles.langPillActive,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: locale === 'fr' }}
            hitSlop={4}
          >
            <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive, isRTL && styles.langPillFrLbl]}>
              {t('langFr')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('ar')}
            style={({ pressed }) => [
              styles.langPill,
              locale === 'ar' && styles.langPillActive,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: locale === 'ar' }}
            hitSlop={4}
          >
            <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive, isRTL && styles.rtl]}>
              {t('langAr')}
            </Text>
          </Pressable>
        </View>
      </View>

      {step === 'load' ? (
        <View style={styles.center}>
          <ActivityIndicator color={brand.primary} size="large" />
          <Text style={[styles.loadingHint, isRTL && styles.rtl]}>{t('setupLoading')}</Text>
        </View>
      ) : (
        <View style={styles.mainFlex}>
          <ScrollView
            style={styles.scrollFlex}
            scrollEnabled={step !== 'quiz'}
            scrollsToTop={false}
            bounces={step !== 'result'}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'never' as const } : {})}
            {...(Platform.OS === 'android' && step === 'result' ? { overScrollMode: 'never' as const } : {})}
            contentContainerStyle={[
              styles.scroll,
              step === 'quiz' && styles.scrollContentQuiz,
              step === 'result' && styles.scrollContentResult,
              { paddingBottom: step === 'quiz' ? insets.bottom + spacing.sm : scrollBottomPad },
            ]}
            showsVerticalScrollIndicator={false}
          >
          {error ? (
            <Text style={[styles.err, isRTL && styles.rtl]}>{error}</Text>
          ) : null}

          {!today?.available ? (
            <Text style={[styles.body, isRTL && styles.rtl]}>{today?.message ?? t('dailyChallengeNoChallenge')}</Text>
          ) : null}

          {showRetry ? (
            <Pressable style={styles.btnOutline} onPress={() => void load()}>
              <Text style={styles.btnOutlineTxt}>{t('dailyChallengeRetry')}</Text>
            </Pressable>
          ) : null}

          {today?.available && step === 'hub' ? (
            <>
              <View style={styles.hubHero}>
                <View style={[styles.hubHeroTopRow, isRTL && styles.rowReverse]}>
                  <View style={styles.hubHeroBrandMark}>
                    <FontAwesome name="bolt" size={18} color={brand.white} />
                  </View>
                  <View style={styles.hubHeroTitles}>
                    {hubDateLabel ? (
                      <Text style={[styles.hubHeroDate, isRTL && styles.rtl]}>{hubDateLabel}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.streakHero, isRTL && styles.rowReverse]}>
                  <View style={styles.streakHeroIcon}>
                    <FontAwesome name="fire" size={20} color={brand.white} />
                  </View>
                  <View style={styles.streakHeroTextWrap}>
                    <Text style={[styles.streakHeroLabel, isRTL && styles.rtl]}>{t('dailyChallengeStreak')}</Text>
                    <Text style={[styles.streakHeroValue, isRTL && styles.rtl]}>{streakVal}</Text>
                  </View>
                </View>
              </View>

              {user && today.streak ? (
                <View style={[styles.card, styles.hubProgressCard]}>
                  <View style={[styles.progressGamifyBanner, isRTL && styles.rowReverse]}>
                    <View style={styles.progressGamifyBannerLeft}>
                      <View style={styles.progressGamifyBannerIconWrap}>
                        <FontAwesome name="trophy" size={20} color={brand.warning} />
                      </View>
                      <View style={styles.progressGamifyBannerTitles}>
                        <Text style={[styles.progressGamifyBannerKicker, isRTL && styles.rtl]}>
                          {t('dailyChallengeProgressBannerKicker')}
                        </Text>
                        <Text style={[styles.progressGamifyBannerTitle, isRTL && styles.rtl]}>
                          {t('dailyChallengeProgressSectionTitle')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressGamifyLevelPill}>
                      <Text style={styles.progressGamifyLevelPillTxt} numberOfLines={1}>
                        {t('dailyChallengeProgressLevelShort')
                          .replace('{{n}}', String(streakGamifyMeta.earnedCount))
                          .replace('{{total}}', String(streakGamifyMeta.totalMs))}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressXpBlock}>
                    <View style={[styles.progressXpLabels, isRTL && styles.rowReverse]}>
                      <View style={[styles.progressXpFireRow, isRTL && styles.rowReverse]}>
                        <FontAwesome name="fire" size={14} color={brand.warning} />
                        <Text style={[styles.progressXpFireNum, isRTL && styles.rtl]}>{streakGamifyMeta.streak}</Text>
                      </View>
                      {streakGamifyMeta.nextTarget != null ? (
                        <Text
                          style={[styles.progressXpCaption, isRTL ? styles.progressXpCaptionRtl : null]}
                          numberOfLines={1}
                        >
                          {t('dailyChallengeProgressXpCaption')
                            .replace('{{pct}}', String(streakGamifyMeta.barPct))
                            .replace('{{next}}', String(streakGamifyMeta.nextTarget))}
                        </Text>
                      ) : (
                        <Text style={[styles.progressXpCaption, isRTL ? styles.progressXpCaptionRtl : null]} numberOfLines={2}>
                          {t('dailyChallengeProgressXpMaxed')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.progressXpTrack} accessibilityRole="progressbar">
                      <View
                        style={[
                          styles.progressXpFill,
                          {
                            width: `${streakGamifyMeta.nextTarget != null ? streakGamifyMeta.barPct : 100}%`,
                          },
                        ]}
                      />
                      <View style={styles.progressXpGloss} pointerEvents="none" />
                    </View>
                  </View>

                  <View style={[styles.progressStatDeck, isRTL && styles.rowReverse]}>
                    <View style={[styles.progressStatCard, styles.progressStatCardGold]}>
                      <FontAwesome name="trophy" size={18} color={brand.primary} />
                      <Text style={[styles.progressStatValue, isRTL && styles.rtl]}>
                        {today.streak.longestStreak ?? 0}
                      </Text>
                      <Text style={[styles.progressStatLabel, isRTL && styles.rtl]}>
                        {t('dailyChallengeProgressRecordShort')}
                      </Text>
                    </View>
                    <Pressable
                      style={[styles.progressStatCard, styles.progressStatCardIce]}
                      onPress={() => setIceExplainOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel={t('dailyChallengeIceExplainTitle')}
                    >
                      <FontAwesome name="cube" size={16} color={brand.primaryInteractive} />
                      <Text style={[styles.progressStatValue, isRTL && styles.rtl]}>
                        {today.streak.freezesRemaining ?? 0}
                      </Text>
                      <Text style={[styles.progressStatLabel, isRTL && styles.rtl]}>
                        {t('dailyChallengeProgressIceShort')}
                      </Text>
                    </Pressable>
                  </View>

                  {today.streak.yearStates && today.streak.yearStates.length > 0 ? (
                    <View style={styles.progressRetroFrame}>
                      <View style={[styles.progressRetroFrameHead, isRTL && styles.rowReverse]}>
                        <FontAwesome name="calendar" size={12} color={brand.primary} />
                        <Text style={[styles.progressYearTitleGamify, isRTL && styles.rtl]}>{yearProgressStripTitle}</Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.yearStripContentGamify}
                        style={styles.yearStripGamify}
                      >
                        {today.streak.yearStates.split('').map((ch, idx) => (
                          <View
                            key={`yd-${idx}`}
                            style={[
                              styles.yearPixel,
                              ch === 'p' && styles.yearPixelP,
                              ch === 'm' && styles.yearPixelM,
                              ch === 'i' && styles.yearPixelI,
                              ch === 'n' && styles.yearPixelN,
                            ]}
                          />
                        ))}
                      </ScrollView>
                      <View style={[styles.legendRowGamify, isRTL && styles.rowReverse]}>
                        <View style={styles.legendPill}>
                          <View style={[styles.legendDot, styles.yearPixelP]} />
                          <Text style={[styles.legendPillTxt, isRTL && styles.rtl]}>{t('dailyChallengeLegendPlayed')}</Text>
                        </View>
                        <View style={styles.legendPill}>
                          <View style={[styles.legendDot, styles.yearPixelM]} />
                          <Text style={[styles.legendPillTxt, isRTL && styles.rtl]}>{t('dailyChallengeLegendMissed')}</Text>
                        </View>
                        <Pressable
                          style={styles.legendPill}
                          onPress={() => setIceExplainOpen(true)}
                          accessibilityRole="button"
                          accessibilityLabel={t('dailyChallengeIceExplainTitle')}
                        >
                          <View style={[styles.legendDot, styles.yearPixelI]} />
                          <Text style={[styles.legendPillTxt, isRTL && styles.rtl]}>{t('dailyChallengeLegendIce')}</Text>
                        </Pressable>
                        <View style={styles.legendPill}>
                          <View style={[styles.legendDot, styles.yearPixelN]} />
                          <Text style={[styles.legendPillTxt, isRTL && styles.rtl]}>{t('dailyChallengeLegendFuture')}</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  <View style={[styles.progressQuestHead, isRTL && styles.rowReverse]}>
                    <FontAwesome name="road" size={13} color={brand.primary} />
                    <Text style={[styles.progressQuestHeadTxt, isRTL && styles.rtl]}>
                      {t('dailyChallengeProgressBadgeQuest')}
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.progressQuestScroll}
                    style={styles.progressQuestScrollView}
                  >
                    {STRK_MILESTONES.map((m, i) => {
                      const got = today.streak?.milestoneBadgesEarned?.includes(m) === true;
                      const prevM = i > 0 ? STRK_MILESTONES[i - 1]! : null;
                      const dashLit =
                        prevM != null && today.streak?.milestoneBadgesEarned?.includes(prevM) === true;
                      return (
                        <View key={m} style={styles.progressQuestCluster}>
                          {i > 0 ? (
                            <View
                              style={[
                                styles.progressQuestDash,
                                dashLit && styles.progressQuestDashLit,
                              ]}
                            />
                          ) : null}
                          <View
                            style={[
                              styles.progressQuestOrb,
                              got ? styles.progressQuestOrbGold : styles.progressQuestOrbGrey,
                            ]}
                          >
                            <QuestMilestoneIcon days={m} earned={got} />
                            <Text style={[styles.progressQuestOrbTxt, got && styles.progressQuestOrbTxtOn]}>{m}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={[styles.missionsTitle, isRTL && styles.rtl]}>{t('dailyChallengeMissionsTitle')}</Text>
                <Text style={[styles.hubIntro, isRTL && styles.rtl]}>{t('dailyChallengePickGames')}</Text>
                {allDone ? (
                  <Text style={[styles.allDone, isRTL && styles.rtl]}>{t('dailyChallengeAllDone')}</Text>
                ) : null}
                {!user ? (
                  <Text style={[styles.hint, isRTL && styles.rtl]}>{t('dailyChallengeLoginHint')}</Text>
                ) : null}
                {!user ? (
                  <Pressable style={styles.btn} onPress={() => router.push('/login')}>
                    <Text style={styles.btnTxt}>{t('dailyChallengeLoginCta')}</Text>
                  </Pressable>
                ) : null}
                {mainMicroLearnHtml ? (
                  microLearnRead ? (
                    <Pressable
                      onPress={() => setInfoOpen(true)}
                      style={[styles.microLearnSubtleRow, isRTL && styles.rowReverse]}
                      accessibilityRole="button"
                      accessibilityLabel={t('dailyChallengeMicroLearnReopen')}
                    >
                      <FontAwesome name="lightbulb-o" size={14} color={brand.textMuted} />
                      <Text style={[styles.microLearnSubtleTxt, isRTL && styles.rtl]}>
                        {t('dailyChallengeMicroLearnReopen')}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => setInfoOpen(true)}
                      style={({ pressed }) => [styles.microLearnBanner, pressed && styles.microLearnBannerPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('dailyChallengeMicroLearn')}. ${t('dailyChallengeMicroLearnTeaser')}`}
                    >
                      <View style={[styles.microLearnBannerInner, isRTL && styles.rowReverse]}>
                        <View style={styles.microLearnBannerIconWrap}>
                          <FontAwesome name="lightbulb-o" size={22} color={brand.primary} />
                        </View>
                        <View style={styles.microLearnBannerTextCol}>
                          <Text style={[styles.microLearnBannerKicker, isRTL && styles.rtl]}>
                            {t('dailyChallengeMicroLearn')}
                          </Text>
                          <Text style={[styles.microLearnBannerTeaser, isRTL && styles.rtl]} numberOfLines={3}>
                            {t('dailyChallengeMicroLearnTeaser')}
                          </Text>
                        </View>
                        <FontAwesome
                          name={isRTL ? 'chevron-left' : 'chevron-right'}
                          size={16}
                          color={brand.primary}
                          style={styles.microLearnBannerChevron}
                        />
                      </View>
                    </Pressable>
                  )
                ) : null}
                {games.length === 0 ? (
                  <Text style={[styles.body, isRTL && styles.rtl]}>{t('dailyChallengeNoChallenge')}</Text>
                ) : (
                  games.map((g) => (
                    <View key={g.id} style={[styles.missionCard, isRTL && styles.rowReverse]}>
                      <View style={styles.missionAccentBar} />
                      <View style={styles.missionCardInner}>
                        <View style={[styles.missionCardTop, isRTL && styles.rowReverse]}>
                          <View style={styles.missionIconWrap}>
                            <FontAwesome
                              name={g.type === 'zip' ? 'th' : 'question'}
                              size={16}
                              color={brand.primary}
                            />
                          </View>
                          <Text style={[styles.gameTitle, isRTL && styles.rtl]} numberOfLines={2}>
                            {gameTitle(g)}
                          </Text>
                          {g.played ? (
                            <View style={styles.donePill}>
                              <Text style={styles.donePillTxt}>{t('dailyChallengeGameDone')}</Text>
                            </View>
                          ) : null}
                        </View>
                        {g.played && g.myAttempt ? (
                          <Text style={[styles.gameScore, isRTL && styles.rtl]}>
                            {g.myAttempt.score}/{maxScoreForGame(g)} — {t('dailyChallengeRank')}{' '}
                            {g.myAttempt.rank ?? '—'} / {g.myAttempt.totalPlayers}
                          </Text>
                        ) : null}
                        {user && g.played && games.length > 1 ? (
                          <Pressable style={styles.btnSecMission} onPress={() => void openLeaderboard(g.id)}>
                            <Text style={styles.btnSecTxt}>{t('dailyChallengeSeeScore')}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}

          {__DEV__ && isDevApiBaseUrl() && user && today?.available && step === 'hub' ? (
            <Pressable
              style={[styles.devResetTodayBtn, devResetBusy && styles.btnDis]}
              disabled={devResetBusy}
              onPress={() => void devResetToday()}
            >
              {devResetBusy ? (
                <ActivityIndicator color={brand.white} />
              ) : (
                <View style={[styles.devResetTodayInner, isRTL && styles.rowReverse]}>
                  <FontAwesome name="trash" size={14} color={brand.white} />
                  <Text style={styles.devResetTodayBtnTxt}>Reset défi jour (dev)</Text>
                </View>
              )}
            </Pressable>
          ) : null}

          {step === 'quiz' && activeGame?.type === 'zip' && activeGame.zip ? (
            <View style={[styles.card, styles.quizGameCard, styles.zipQuizCardWide]}>
              <View style={styles.zipPlayToolbar}>
                <View style={[styles.zipPlayToolbarTop, isRTL && styles.rowReverse]}>
                  <View style={[styles.zipTimerPill, isRTL && styles.rowReverse]}>
                    <FontAwesome name="clock-o" size={16} color={brand.primary} />
                    <Text style={styles.zipTimerTxt}>{formatZipDurationMs(zipElapsedMsLive)}</Text>
                  </View>
                  <Text style={[styles.zipPlayTitle, isRTL && styles.rtl]} numberOfLines={1}>
                    {gameTitle(activeGame)}
                  </Text>
                </View>
                <View style={[styles.zipPlayActionsRow, isRTL && styles.rowReverse]}>
                  <View style={[styles.zipPlayActionsLeft, isRTL && styles.rowReverse]}>
                    <Pressable
                      style={[styles.zipCompactBtn, zipOrder.length === 0 && styles.btnDis]}
                      disabled={zipOrder.length === 0}
                      onPress={() => setZipOrder((prev) => (prev.length ? prev.slice(0, -1) : prev))}
                      accessibilityLabel={t('dailyChallengeZipUndo')}
                    >
                      <FontAwesome name="undo" size={14} color={brand.primary} />
                      <Text style={styles.zipCompactBtnTxt}>{t('dailyChallengeZipUndo')}</Text>
                    </Pressable>
                    {isZipGridV2(activeGame.zip) ? (
                      <Pressable
                        style={[
                          styles.zipCompactBtn,
                          styles.zipHelpBtn,
                          (submitting ||
                            zipOrder.length >= (activeGame.zip.rows ?? 0) * (activeGame.zip.cols ?? 0) ||
                            zipHelpCooldownLeftSec > 0) &&
                            styles.btnDis,
                        ]}
                        disabled={
                          submitting ||
                          zipOrder.length >= (activeGame.zip.rows ?? 0) * (activeGame.zip.cols ?? 0) ||
                          zipHelpCooldownLeftSec > 0
                        }
                        onPress={onZipHelpPress}
                        accessibilityLabel={
                          zipHelpCooldownLeftSec > 0
                            ? t('dailyChallengeZipHelpCooldown').replace('{{s}}', String(zipHelpCooldownLeftSec))
                            : t('dailyChallengeZipHelpBtn')
                        }
                      >
                        <FontAwesome name="lightbulb-o" size={14} color="#b45309" />
                        <Text style={styles.zipHelpBtnTxt}>
                          {zipHelpCooldownLeftSec > 0
                            ? t('dailyChallengeZipHelpCooldown').replace('{{s}}', String(zipHelpCooldownLeftSec))
                            : t('dailyChallengeZipHelpBtn')}
                        </Text>
                      </Pressable>
                    ) : null}
                    {__DEV__ ? (
                      <Pressable
                        style={[styles.zipCompactBtn, styles.zipDevResetBtn]}
                        onPress={() => {
                          zipAutoSubmittedRef.current = false;
                          initZipTimerForGame(activeGame.id, true);
                          setZipOrder([]);
                          if (activeGame.zip && !isZipGridV2(activeGame.zip) && activeGame.zip.items?.length) {
                            setShuffledZipItems(shuffleZipItems(activeGame.zip.items));
                          }
                          setZipTick((x) => x + 1);
                          syncZipTimerRunning();
                        }}
                      >
                        <FontAwesome name="refresh" size={14} color={brand.white} />
                        <Text style={styles.zipDevResetBtnTxt}>Reset (dev)</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                {zipHelpNoHintVisible && isZipGridV2(activeGame.zip) ? (
                  <Text style={[styles.zipHelpNoHintTxt, isRTL && styles.rtl]}>{t('dailyChallengeZipHelpNoHint')}</Text>
                ) : null}
              </View>
              {(() => {
                const zip = activeGame.zip;
                if (!zip) return null;
                if (isZipGridV2(zip) && zip.rows != null && zip.cols != null && zip.cells) {
                  const rows = zip.rows;
                  const cols = zip.cols;
                  const n = rows * cols;
                  const wh = zip.wallsHorizontal ?? [];
                  const wv = zip.wallsVertical ?? [];
                  const pathPos = new Map<number, number>();
                  zipOrder.forEach((idx, step) => pathPos.set(idx, step + 1));
                  const zipPathError = zipGridV2PrefixIssue != null && zipOrder.length > 0;
                  const cellSize =
                    zipGridLayout?.cellSize ??
                    Math.min(
                      ZIP_GRID_MAX_CELL,
                      Math.max(16, Math.floor(zipQuizGridInnerWidth(width) / cols) - 2),
                    );
                  const snakeSegs = buildZipSnakeSegments(zipOrder, cols, cellSize);
                  const snakeColor = zipPathError ? ZIP_SNAKE_ERR : ZIP_SNAKE_BODY;
                  const lastIdx = zipOrder.length > 0 ? zipOrder[zipOrder.length - 1]! : null;
                  const lastRow = lastIdx != null ? Math.floor(lastIdx / cols) : 0;
                  const lastCol = lastIdx != null ? lastIdx % cols : 0;
                  const headSz = Math.max(11, Math.round(cellSize * 0.28));
                  const headLeft = lastIdx != null ? lastCol * cellSize + cellSize / 2 - headSz / 2 : 0;
                  const headTop = lastIdx != null ? lastRow * cellSize + cellSize / 2 - headSz / 2 : 0;
                  return (
                    <View style={step === 'quiz' ? styles.zipQuizColumn : undefined}>
                      <View style={step === 'quiz' ? styles.zipQuizFlexMiddle : undefined}>
                      <ZipObjectivePrompt text={zipPrompt(zip)} isRTL={isRTL} />
                      <View
                        style={[
                          styles.zipGridFrame,
                          { width: cols * cellSize, height: rows * cellSize },
                          zipPathError && styles.zipGridFrameErr,
                        ]}
                        {...(zipGridPanResponder?.panHandlers ?? {})}
                      >
                        <View style={styles.zipSnakeUnderlay} pointerEvents="none">
                          <Animated.View style={[styles.zipSnakePulseWrap, { opacity: zipSnakePulse }]}>
                            {snakeSegs.map((s) => (
                              <View
                                key={s.key}
                                style={[
                                  styles.zipSnakeSegment,
                                  {
                                    left: s.left,
                                    top: s.top,
                                    width: s.width,
                                    height: s.height,
                                    borderRadius: s.height / 2,
                                    backgroundColor: snakeColor,
                                    transform: [{ rotate: `${s.angleDeg}deg` }],
                                  },
                                ]}
                              />
                            ))}
                          </Animated.View>
                        </View>
                        <View style={styles.zipGridCellsLayer}>
                        {Array.from({ length: rows }, (_, r) => (
                          <View key={`zip-row-${r}`} style={styles.zipGridRow} pointerEvents="none">
                            {Array.from({ length: cols }, (_, c) => {
                              const idx = r * cols + c;
                              const v = zip.cells![idx] ?? 0;
                              const wallR = c < cols - 1 && (wv[r * (cols - 1) + c] ?? 0) === 1;
                              const wallB = r < rows - 1 && (wh[r * cols + c] ?? 0) === 1;
                              const onP = pathPos.has(idx);
                              const stepLabel = pathPos.get(idx);
                              return (
                                <View
                                  key={`zip-cell-${idx}`}
                                  style={[
                                    styles.zipGridCell,
                                    { width: cellSize, height: cellSize },
                                    onP && (zipPathError ? styles.zipGridCellPathErr : styles.zipGridCellPath),
                                    zipHintHighlightIdx === idx && styles.zipGridCellHint,
                                    wallR && styles.zipGridWallR,
                                    wallB && styles.zipGridWallB,
                                  ]}
                                >
                                  {v > 0 ? (
                                    <Text style={[styles.zipGridNum, onP && styles.zipGridGlyphOnSnake]}>{v}</Text>
                                  ) : (
                                    <Text style={[styles.zipGridDot, onP && styles.zipGridGlyphOnSnake]}>·</Text>
                                  )}
                                  {stepLabel != null ? (
                                    <Text
                                      style={[
                                        styles.zipGridStep,
                                        zipPathError && styles.zipGridStepErr,
                                        onP && styles.zipGridGlyphOnSnake,
                                      ]}
                                    >
                                      {stepLabel}
                                    </Text>
                                  ) : null}
                                </View>
                              );
                            })}
                          </View>
                        ))}
                        </View>
                        {lastIdx != null ? (
                          <View style={styles.zipSnakeHeadLayer} pointerEvents="none">
                            <Animated.View
                              style={[
                                styles.zipSnakeHead,
                                {
                                  left: headLeft,
                                  top: headTop,
                                  width: headSz,
                                  height: headSz,
                                  borderRadius: headSz / 2,
                                  backgroundColor: zipPathError ? '#fecaca' : ZIP_SNAKE_HEAD,
                                  borderWidth: 2,
                                  borderColor: zipPathError ? ZIP_SNAKE_ERR : '#eff6ff',
                                  transform: [{ scale: zipSnakeHeadScale }],
                                },
                              ]}
                            />
                          </View>
                        ) : null}
                      </View>
                      {zipPathError ? (
                        <Text style={[styles.zipGridErrorBanner, isRTL && styles.rtl]}>
                          {zipGridV2PrefixIssue === 'order'
                            ? t('dailyChallengeZipOrderError')
                            : t('dailyChallengeZipPathError')}
                        </Text>
                      ) : null}
                      {submitting && zipOrder.length === n ? (
                        <ActivityIndicator style={{ marginTop: spacing.md }} color={brand.primary} />
                      ) : null}
                      </View>
                      <View style={styles.zipPlayFooterBottom}>
                        <Text style={[styles.zipOrderLabel, styles.zipFooterStat, isRTL && styles.rtl]}>
                          {zipOrder.length}/{n}
                        </Text>
                        <Pressable
                          style={styles.zipRulesLink}
                          onPress={() => setZipRulesOpen(true)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={t('dailyChallengeZipRulesCta')}
                        >
                          <FontAwesome name="question-circle" size={16} color={brand.primary} />
                          <Text style={styles.zipRulesLinkTxt}>{t('dailyChallengeZipRulesCta')}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }
                const items = zip.items ?? [];
                return (
                  <View style={step === 'quiz' ? styles.zipQuizColumn : undefined}>
                    <View style={step === 'quiz' ? styles.zipQuizFlexMiddle : undefined}>
                      <ZipObjectivePrompt text={zipPrompt(zip)} isRTL={isRTL} />
                      <View style={[styles.zipGrid, step === 'quiz' && styles.zipGridQuizShrink]}>
                        {shuffledZipItems.map((it) => {
                          const used = zipOrder.includes(it.id);
                          return (
                            <Pressable
                              key={it.id}
                              style={[styles.zipTile, used && styles.zipTileUsed]}
                              onPress={() => onTapZipItem(it.id)}
                              disabled={used || zipOrder.length >= items.length}
                            >
                              <Text style={[styles.zipTileTxt, isRTL && styles.rtl]}>{it.text}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                    <Pressable
                      style={[
                        styles.btn,
                        (zipOrder.length !== items.length || submitting) && styles.btnDis,
                      ]}
                      disabled={zipOrder.length !== items.length || submitting}
                      onPress={() => void finishQuiz(zipOrder)}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.btnTxt}>{t('dailyChallengeZipValidate')}</Text>
                      )}
                    </Pressable>
                    <View style={styles.zipPlayFooterBottom}>
                      <Text style={[styles.zipOrderLabel, styles.zipFooterStat, isRTL && styles.rtl]}>
                        {zipOrder.length}/{items.length}
                      </Text>
                      <Pressable
                        style={styles.zipRulesLink}
                        onPress={() => setZipRulesOpen(true)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('dailyChallengeZipRulesCta')}
                      >
                        <FontAwesome name="question-circle" size={16} color={brand.primary} />
                        <Text style={styles.zipRulesLinkTxt}>{t('dailyChallengeZipRulesCta')}</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })()}
            </View>
          ) : null}

          {step === 'quiz' && activeGame?.type === 'quiz' && currentQ ? (
            <View style={[styles.card, styles.quizGameCard]}>
              <View style={styles.quizMcHeader}>
                <Text style={[styles.miniTitle, isRTL && styles.rtl]} numberOfLines={2}>
                  {gameTitle(activeGame)}
                </Text>
                <Text style={[styles.progress, isRTL && styles.rtl]}>
                  {qIndex + 1}/{questions.length}
                </Text>
                <Text style={[styles.qPrompt, isRTL && styles.rtl]} numberOfLines={4}>
                  {currentQ.prompt}
                </Text>
              </View>
              <View style={styles.quizMcChoicesFit}>
                {currentQ.choices.map((c, i) => {
                  const sel = selectedChoice === i;
                  return (
                    <Pressable
                      key={i}
                      style={[styles.choice, styles.choiceQuizFit, sel && styles.choiceSel]}
                      onPress={() => setSelectedChoice(i)}
                    >
                      <Text style={[styles.choiceTxt, isRTL && styles.rtl]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.quizMcFooter}>
                <Pressable
                  style={[styles.btn, (selectedChoice === null || submitting) && styles.btnDis]}
                  onPress={goNext}
                  disabled={selectedChoice === null || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnTxt}>
                      {qIndex + 1 >= questions.length ? t('dailyChallengeSubmit') : t('dailyChallengeNext')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === 'result' && submitResult && activeGame ? (
            <View style={styles.resultCelebrationRoot}>
              <View style={styles.resultHero}>
                <CelebrationConfetti />
                <View style={styles.resultHeroContent}>
                  {submitResult.score >= activeMaxPoints && activeMaxPoints > 0 ? (
                    <View style={[styles.flawlessPill, isRTL && styles.rowReverse]}>
                      <FontAwesome name="star" size={12} color={brand.warning} />
                      <Text style={styles.flawlessPillTxt}>{t('dailyChallengeFlawlessBadge')}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.resultCongratsTitle, isRTL && styles.rtl]}>
                    {t('dailyChallengeCongratsTitle')}
                  </Text>
                  <Text style={[styles.resultSolvedIn, isRTL && styles.rtl]}>{t('dailyChallengeSolvedIn')}</Text>
                  <Text style={styles.resultHeroTimer}>{formatZipDurationMs(submitResult.durationMs)}</Text>
                  <Text style={[styles.resultHeroGameTitle, isRTL && styles.rtl]} numberOfLines={2}>
                    {gameTitle(activeGame)}
                  </Text>
                </View>
              </View>

              <View style={styles.resultSummaryCard}>
                <Text style={[styles.resultSummaryCardTitle, isRTL && styles.rtl]}>
                  {t('dailyChallengeResultCardTitle')}
                </Text>
                <View style={[styles.resultStatRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.resultStatLabel, isRTL && styles.rtl]}>{t('dailyChallengeScoreLabel')}</Text>
                  <Text style={styles.resultStatValue}>
                    {submitResult.score}/{activeMaxPoints}
                  </Text>
                </View>
                <View style={[styles.resultStatRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.resultStatLabel, isRTL && styles.rtl]}>{t('dailyChallengeRank')}</Text>
                  <Text style={styles.resultStatValue}>
                    {submitResult.rank ?? '—'} / {submitResult.totalPlayers}
                  </Text>
                </View>
                {beatPlayersPercentile(submitResult.rank, submitResult.totalPlayers) != null ? (
                  <View style={[styles.resultBeatBanner, isRTL && styles.rowReverse]}>
                    <FontAwesome name="globe" size={15} color={brand.primary} />
                    <Text style={[styles.resultBeatBannerTxt, isRTL && styles.rtl]}>
                      {t('dailyChallengeBeatPlayersPrefix')}{' '}
                      {beatPlayersPercentile(submitResult.rank, submitResult.totalPlayers)}
                      {t('dailyChallengeBeatPlayersSuffix')}
                    </Text>
                  </View>
                ) : null}
                {badgesEarned.length > 0 ? (
                  <View style={styles.resultBadgesWrap}>
                    <Text style={[styles.resultBadgesTitle, isRTL && styles.rtl]}>{t('dailyChallengeBadges')}</Text>
                    <View style={[styles.resultBadgesRow, isRTL && styles.rowReverse]}>
                      {badgesEarned.map((b) => (
                        <View key={b.code} style={styles.resultBadgeChip}>
                          <Text style={[styles.resultBadgeChipTxt, isRTL && styles.rtl]} numberOfLines={1}>
                            {locale === 'ar' && (b.labelAr?.trim() ?? '') !== '' ? b.labelAr! : b.labelFr}
                            {(b.pointsEarned ?? 0) > 0 ? ` · +${b.pointsEarned} pts` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => void openLeaderboard(activeGame.id)}
                  style={styles.resultPrimaryCta}
                >
                  <FontAwesome name="list-ol" size={16} color={brand.white} />
                  <Text style={styles.resultPrimaryCtaTxt}>{t('dailyChallengeSeeScore')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setStep('hub');
                    setActiveGame(null);
                    void load();
                  }}
                  style={styles.resultSecondaryCta}
                >
                  <Text style={styles.resultSecondaryCtaTxt}>{t('dailyChallengeBackToGames')}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
        {step === 'hub' && today?.available && user && (firstPlayableGame != null || showHubLeaderboardCta) ? (
          <View
            style={[
              styles.hubFooterFixed,
              {
                paddingBottom: Math.max(insets.bottom, spacing.sm),
                paddingTop: spacing.sm,
              },
            ]}
          >
            <View style={[styles.hubFooterRow, isRTL && styles.rowReverse]}>
              {firstPlayableGame != null ? (
                <Pressable
                  style={[
                    styles.hubFooterBtnPrimary,
                    showHubLeaderboardCta ? styles.hubFooterBtnHalf : styles.hubFooterBtnFull,
                  ]}
                  onPress={() => startQuizFor(firstPlayableGame)}
                >
                  <Text style={styles.hubFooterBtnPrimaryTxt}>{t('dailyChallengePlayThis')}</Text>
                </Pressable>
              ) : null}
              {showHubLeaderboardCta ? (
                <Pressable
                  style={[
                    styles.hubFooterBtnSecondary,
                    firstPlayableGame != null ? styles.hubFooterBtnHalf : styles.hubFooterBtnFull,
                  ]}
                  onPress={() => void openLeaderboard(primaryLeaderboardGameId)}
                >
                  <Text style={styles.hubFooterBtnSecondaryTxt}>{t('dailyChallengeLeaderboard')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
        </View>
      )}

      <Modal
        visible={lbOpen}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setLbOpen(false)}
      >
        <View style={styles.lbModalRoot}>
          <View style={[styles.lbModalHeader, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              onPress={() => setLbOpen(false)}
              style={styles.lbModalIconBtn}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('dailyChallengeClose')}
            >
              <FontAwesome name="times" size={20} color={brand.white} />
            </Pressable>
            <Text style={[styles.lbModalTitle, isRTL && styles.rtl]} numberOfLines={1}>
              {t('dailyChallengeLeaderboardModalTitle')}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.lbHeroStrip}>
            <Text style={[styles.lbHeroStripLabel, isRTL && styles.rtl]}>
              {t('dailyChallengeLeaderboardTopToday')}
            </Text>
            {lbVm ? (
              <Text style={[styles.lbHeroStripStat, isRTL && styles.rtl]}>
                {lbVm.totalPlayers} {t('dailyChallengePlayers')}
              </Text>
            ) : null}
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.lbScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {lbVm
              ? lbVm.topEntries.map((row) =>
                  renderLbRow(
                    row,
                    `t-${row.rank}-${row.displayName}`,
                    row.isMe === true || (lbVm.myRank != null && row.rank === lbVm.myRank),
                  ),
                )
              : null}
            {lbVm?.myPinned
              ? renderLbRow(lbVm.myPinned, 'pinned-me', true)
              : null}
            {lbVm
              ? lbVm.moreEntries.map((row, i) =>
                  renderLbRow(
                    row,
                    `m-${i}-${row.rank}-${row.displayName}`,
                    row.isMe === true || (lbVm.myRank != null && row.rank === lbVm.myRank),
                  ),
                )
              : null}
            {lbVm?.hasMore ? (
              <Pressable
                style={[styles.lbLoadMoreBtn, lbLoadMoreBusy && styles.lbLoadMoreBtnDis]}
                onPress={() => void loadMoreLeaderboard()}
                disabled={lbLoadMoreBusy}
                accessibilityRole="button"
                accessibilityLabel={t('dailyChallengeLeaderboardLoadMore')}
              >
                {lbLoadMoreBusy ? (
                  <ActivityIndicator color={brand.primary} />
                ) : (
                  <Text style={[styles.lbLoadMoreBtnTxt, isRTL && styles.rtl]}>
                    {t('dailyChallengeLeaderboardLoadMore')}
                  </Text>
                )}
              </Pressable>
            ) : null}
            {lbVm?.myRank != null ? (
              <View style={styles.lbMyRankFooter}>
                <Text style={[styles.lbMyRankFooterTxt, isRTL && styles.rtl]}>
                  {t('dailyChallengeRank')}: {lbVm.myRank} / {lbVm.totalPlayers}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          <View style={[styles.lbModalFooter, { paddingBottom: insets.bottom + spacing.md }]}>
            <Pressable style={styles.lbModalCloseBtn} onPress={() => setLbOpen(false)}>
              <Text style={styles.lbModalCloseBtnTxt}>{t('dailyChallengeClose')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={infoOpen}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => void closeInfoModal()}
      >
        <View style={styles.modalRoot}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.md }]}>
            <View style={[styles.microModalHeaderRow, isRTL && styles.rowReverse]}>
              <View style={[styles.microModalHeaderLead, isRTL && styles.rowReverse]}>
                <View style={styles.microModalIconCircle}>
                  <FontAwesome name="lightbulb-o" size={22} color={brand.white} />
                </View>
                <View style={styles.microModalTitleCol}>
                  <Text style={[styles.modalTitle, isRTL && styles.rtl]}>{t('dailyChallengeMicroLearn')}</Text>
                  <Text style={[styles.modalMicroSubtitle, isRTL && styles.rtl]}>
                    {t('dailyChallengeMicroLearnModalSubtitle')}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => void closeInfoModal()}
                hitSlop={12}
                style={styles.microModalCloseHit}
                accessibilityRole="button"
                accessibilityLabel={t('dailyChallengeClose')}
              >
                <FontAwesome name="times" size={22} color="rgba(255,255,255,0.92)" />
              </Pressable>
            </View>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.infoScrollContent}>
            <View style={styles.microModalIntroBox}>
              <Text style={[styles.microModalIntroTxt, isRTL && styles.rtl]}>
                {t('dailyChallengeMicroLearnModalIntro')}
              </Text>
            </View>
            {mainMicroLearnHtml ? (
              <RenderHtml
                contentWidth={width - spacing.lg * 2}
                source={{ html: mainMicroLearnHtml }}
                tagsStyles={tagsStyles}
              />
            ) : null}
          </ScrollView>
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + spacing.md }]}>
            <Pressable style={styles.modalClosePill} onPress={() => void closeInfoModal()}>
              <Text style={styles.modalClosePillTxt}>{t('dailyChallengeMicroLearnGotIt')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={iceExplainOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIceExplainOpen(false)}
      >
        <View style={styles.iceExplainModalRoot}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setIceExplainOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t('dailyChallengeClose')}
          />
          <View style={styles.rulesModalCard}>
            <Text style={[styles.rulesModalTitle, isRTL && styles.rtl]}>{t('dailyChallengeIceExplainTitle')}</Text>
            <ScrollView style={styles.rulesModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.rulesModalBody, isRTL && styles.rtl]}>{t('dailyChallengeIceExplainBody')}</Text>
            </ScrollView>
            <Pressable style={styles.rulesModalClose} onPress={() => setIceExplainOpen(false)}>
              <Text style={styles.rulesModalCloseTxt}>{t('dailyChallengeIceExplainCta')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={zipRulesOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setZipRulesOpen(false)}
      >
        <Pressable style={styles.rulesModalBackdrop} onPress={() => setZipRulesOpen(false)}>
          <View style={styles.rulesModalCard}>
            <Text style={[styles.rulesModalTitle, isRTL && styles.rtl]}>{t('dailyChallengeZipRulesTitle')}</Text>
            <ScrollView style={styles.rulesModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.rulesModalBody, isRTL && styles.rtl]}>{t('dailyChallengeZipHowToPlay')}</Text>
              <Text style={[styles.rulesModalBodyMuted, isRTL && styles.rtl]}>{t('dailyChallengeZipHint')}</Text>
            </ScrollView>
            <Pressable style={styles.rulesModalClose} onPress={() => setZipRulesOpen(false)}>
              <Text style={styles.rulesModalCloseTxt}>{t('dailyChallengeClose')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.chatSurface },
  mainFlex: { flex: 1 },
  scrollFlex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: brand.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.white,
    textAlign: 'center',
    minWidth: 0,
  },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.full,
    padding: 3,
    flexShrink: 0,
  },
  langPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  langPillActive: { backgroundColor: brand.white },
  langPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },
  langPillTxtActive: { color: brand.primary },
  /** Libellé « FR » toujours en lecture gauche-droite sous interface arabe. */
  langPillFrLbl: { writingDirection: 'ltr' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  loadingHint: { fontSize: fontSize.sm, color: brand.textMuted, fontWeight: '600', textAlign: 'center' },
  scroll: { padding: spacing.lg },
  scrollContentQuiz: { flexGrow: 1 },
  /** Résultat : pas de padding hérité du hub (évite bande claire au-dessus des confettis). */
  scrollContentResult: { flexGrow: 1, padding: 0 },
  quizGameCard: { flexGrow: 1, minHeight: 0 },
  /** Carte SNAKE quiz : plus de place horizontale pour la grille. */
  zipQuizCardWide: { paddingHorizontal: spacing.sm },
  zipQuizColumn: { flex: 1, minHeight: 0 },
  zipQuizFlexMiddle: { flex: 1, minHeight: 0, justifyContent: 'center' },
  zipGridQuizShrink: { flexShrink: 1 },
  quizMcHeader: { flexShrink: 0 },
  quizMcChoicesFit: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quizMcFooter: { flexShrink: 0, marginTop: spacing.sm },
  choiceQuizFit: { paddingVertical: spacing.sm },
  err: { color: brand.error, marginBottom: spacing.md, fontSize: fontSize.sm },
  body: { fontSize: fontSize.md, color: brand.textMuted, marginBottom: spacing.md },
  hubIntro: { fontSize: fontSize.sm, color: brand.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  allDone: { fontSize: fontSize.md, fontWeight: '700', color: brand.primary, marginBottom: spacing.md },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: brand.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  rowReverse: { flexDirection: 'row-reverse' },
  hubHero: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: brand.primary,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
    }),
  },
  hubHeroTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hubHeroBrandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubHeroTitles: { flex: 1, minWidth: 0 },
  hubHeroEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hubHeroDate: { fontSize: fontSize.lg, fontWeight: '800', color: brand.white, marginTop: 0 },
  hubHeroTagline: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.94)',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  streakHero: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  streakHeroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakHeroTextWrap: { flex: 1, minWidth: 0 },
  streakHeroLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  streakHeroValue: { fontSize: fontSize.xxl, fontWeight: '800', color: brand.white, marginTop: 2 },
  streakExtras: { marginTop: spacing.sm, gap: spacing.xs },
  streakMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  streakMetaTxt: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.92)', flex: 1, fontWeight: '600' },
  streakYearTitle: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.88)', fontWeight: '700', marginTop: spacing.xs },
  yearStrip: { maxHeight: 22, marginTop: 4 },
  yearStripContent: { flexDirection: 'row', alignItems: 'center', gap: 1, paddingVertical: 2 },
  yearDot: { width: 4, height: 8, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.14)' },
  yearDotP: { backgroundColor: '#34d399' },
  yearDotM: { backgroundColor: 'rgba(248,113,113,0.9)' },
  yearDotI: { backgroundColor: '#38bdf8' },
  yearDotN: { backgroundColor: 'rgba(255,255,255,0.12)' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 8, height: 8, borderRadius: 2 },
  legendLbl: { fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  milestonesTitle: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.88)', fontWeight: '700', marginTop: spacing.xs },
  milestonesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  msChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  msChipOn: { backgroundColor: 'rgba(245,158,11,0.45)' },
  msChipOff: { opacity: 0.75 },
  msChipTxt: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  msChipTxtOn: { color: brand.white },
  hubProgressCard: { marginBottom: spacing.md, padding: 0, overflow: 'hidden' },
  progressGamifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: brand.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.22)',
  },
  progressGamifyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
  progressGamifyBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  progressGamifyBannerTitles: { flex: 1, minWidth: 0 },
  progressGamifyBannerKicker: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.4,
  },
  progressGamifyBannerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.white, marginTop: 2 },
  progressGamifyLevelPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
    maxWidth: '42%',
  },
  progressGamifyLevelPillTxt: { fontSize: fontSize.xs, fontWeight: '800', color: brand.white, textAlign: 'center' },
  progressXpBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FAFBFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  progressXpLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.xs },
  progressXpFireRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressXpFireNum: { fontSize: fontSize.xl, fontWeight: '900', color: brand.text },
  progressXpCaption: { fontSize: fontSize.xs, fontWeight: '700', color: brand.textMuted, flex: 1, textAlign: 'right' },
  progressXpCaptionRtl: { textAlign: 'left' },
  progressXpTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: brand.borderLight,
    overflow: 'hidden',
    direction: 'ltr',
    position: 'relative',
  },
  progressXpFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: brand.primary,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
      },
      android: { elevation: 0 },
    }),
  },
  progressXpGloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  progressStatDeck: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  progressStatCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  progressStatCardGold: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  progressStatCardIce: {
    backgroundColor: '#F0F9FF',
    borderColor: '#7DD3FC',
  },
  progressStatValue: { fontSize: fontSize.xxl, fontWeight: '900', color: brand.text },
  progressStatLabel: { fontSize: 10, fontWeight: '700', color: brand.textMuted, textAlign: 'center' },
  progressRetroFrame: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  progressRetroFrameHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  progressYearTitleGamify: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, marginTop: 1 },
  yearStripGamify: { maxHeight: 28, marginTop: 4 },
  yearStripContentGamify: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  yearPixel: { width: 5, height: 14, borderRadius: 2, backgroundColor: brand.border },
  yearPixelP: {
    backgroundColor: brand.emerald,
    ...Platform.select({
      ios: {
        shadowColor: brand.emerald,
        shadowOpacity: 0.28,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {},
    }),
  },
  yearPixelM: { backgroundColor: brand.error },
  yearPixelI: { backgroundColor: brand.primary },
  yearPixelN: { backgroundColor: brand.borderLight },
  legendRowGamify: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.border,
  },
  legendDot: { width: 7, height: 7, borderRadius: 2 },
  legendPillTxt: { fontSize: 10, fontWeight: '700', color: brand.textMuted },
  progressQuestHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  progressQuestHeadTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  progressQuestScrollView: { maxHeight: 64, marginBottom: spacing.md },
  progressQuestScroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  progressQuestCluster: { flexDirection: 'row', alignItems: 'center' },
  progressQuestDash: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  progressQuestDashLit: { backgroundColor: brand.emerald },
  progressQuestOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 2,
  },
  progressQuestOrbGold: {
    backgroundColor: brand.primary,
    borderColor: brand.primaryInteractive,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  progressQuestOrbGrey: {
    backgroundColor: brand.borderLight,
    borderColor: brand.border,
    opacity: 0.92,
  },
  progressQuestOrbTxt: { fontSize: 9, fontWeight: '900', color: brand.textMuted },
  progressQuestOrbTxtOn: { color: brand.white },
  progressSectionTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary, marginBottom: spacing.sm },
  streakMetaTxtOnLight: { fontSize: fontSize.xs, color: brand.textMuted, flex: 1, fontWeight: '600' },
  progressYearTitle: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '700', marginTop: spacing.sm },
  yearDotLight: { width: 4, height: 8, borderRadius: 1, backgroundColor: '#e2e8f0' },
  yearDotNLight: { backgroundColor: '#cbd5e1' },
  legendLblOnLight: { fontSize: 10, color: brand.textMuted },
  milestonesTitleOnLight: { fontSize: fontSize.xs, color: brand.text, fontWeight: '700', marginTop: spacing.sm },
  msChipLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
  },
  msChipLightOn: { backgroundColor: '#D97706', borderColor: '#B45309' },
  msChipLightOff: { opacity: 0.9 },
  msChipTxtLight: { fontSize: 10, color: brand.textMuted, fontWeight: '700' },
  msChipTxtLightOn: { color: brand.white },
  hubFooterFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    zIndex: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  hubFooterRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm },
  hubFooterBtnHalf: { flex: 1, minWidth: 0 },
  hubFooterBtnFull: { flex: 1, minWidth: 0 },
  hubFooterBtnPrimary: {
    backgroundColor: brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubFooterBtnPrimaryTxt: { color: '#fff', fontWeight: '800', fontSize: fontSize.md },
  hubFooterBtnSecondary: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
  },
  hubFooterBtnSecondaryTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.md },
  missionsTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary, marginBottom: spacing.xs },
  missionCard: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  missionAccentBar: { width: 5, backgroundColor: brand.primary },
  missionCardInner: { flex: 1, padding: spacing.md, minWidth: 0 },
  missionCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  missionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: brand.linkChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecMission: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    alignItems: 'center',
  },
  cardKicker: { fontSize: fontSize.md, fontWeight: '700', color: brand.text, marginBottom: spacing.sm },
  cardHeading: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text, marginBottom: spacing.sm },
  miniTitle: { fontSize: fontSize.md, fontWeight: '700', color: brand.primary, marginBottom: spacing.sm },
  sub: { fontSize: fontSize.md, color: brand.textMuted, marginBottom: spacing.md },
  hint: { fontSize: fontSize.sm, color: brand.primary, marginBottom: spacing.md },
  btn: {
    backgroundColor: brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDis: { opacity: 0.5 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  btnOutline: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    alignItems: 'center',
    backgroundColor: brand.white,
  },
  btnOutlineTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.md },
  btnSec: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    alignItems: 'center',
  },
  btnSecTxt: { color: brand.primary, fontWeight: '700' },
  linkBtn: { marginTop: spacing.md, alignItems: 'center' },
  linkTxt: { color: brand.primary, fontWeight: '600', fontSize: fontSize.sm },
  microLearnBanner: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.35)',
    backgroundColor: '#f5f3ff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  microLearnBannerPressed: { opacity: 0.9 },
  microLearnBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  microLearnBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  microLearnBannerTextCol: { flex: 1, minWidth: 0 },
  microLearnBannerKicker: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary },
  microLearnBannerTeaser: {
    fontSize: fontSize.sm,
    color: brand.text,
    marginTop: 4,
    lineHeight: 20,
    opacity: 0.92,
  },
  microLearnBannerChevron: { marginLeft: 2, marginRight: 2 },
  microLearnSubtleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  microLearnSubtleTxt: { fontSize: fontSize.sm, color: brand.textMuted, fontWeight: '600' },
  progress: { fontSize: fontSize.sm, color: brand.textMuted, marginBottom: spacing.sm },
  qPrompt: { fontSize: fontSize.lg, fontWeight: '700', color: brand.text, marginBottom: spacing.md },
  choice: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    marginBottom: spacing.sm,
    backgroundColor: '#f8fafc',
  },
  choiceSel: { borderColor: brand.primary, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  choiceTxt: { fontSize: fontSize.md, color: brand.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  gameRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },
  gameRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  gameTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: brand.text },
  donePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  donePillTxt: { fontSize: fontSize.xs, fontWeight: '700', color: '#166534' },
  gameScore: { fontSize: fontSize.sm, color: brand.textMuted, marginTop: spacing.xs, marginBottom: spacing.sm },
  zipPlayToolbar: {
    flexShrink: 0,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  zipPlayToolbarTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  zipPlayTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: brand.text, minWidth: 0 },
  zipTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.linkChipBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: brand.border,
  },
  zipTimerTxt: { fontSize: fontSize.md, fontWeight: '800', color: brand.text, fontVariant: ['tabular-nums'] },
  zipPlayActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  zipPlayActionsLeft: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, flex: 1 },
  zipPlayFooterBottom: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
    alignItems: 'center',
    gap: spacing.md,
  },
  zipRulesLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  zipRulesLinkTxt: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary },
  rulesModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  rulesModalCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '72%',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  rulesModalScroll: { maxHeight: 240 },
  rulesModalTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text, marginBottom: spacing.md },
  rulesModalBody: { fontSize: fontSize.sm, color: brand.text, lineHeight: 22, marginBottom: spacing.sm },
  rulesModalBodyMuted: { fontSize: fontSize.sm, color: brand.textMuted, lineHeight: 20 },
  rulesModalClose: {
    marginTop: spacing.md,
    backgroundColor: brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  rulesModalCloseTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  iceExplainModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  iceExplainModalCard: {
    zIndex: 1,
    ...Platform.select({ android: { elevation: 6 } }),
  },
  iceExplainModalScroll: { maxHeight: 320 },
  zipCompactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  zipCompactBtnTxt: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary },
  zipHelpBtn: { borderColor: '#f59e0b', backgroundColor: 'rgba(254, 243, 199, 0.35)' },
  zipHelpBtnTxt: { fontSize: fontSize.sm, fontWeight: '800', color: '#b45309' },
  zipHelpNoHintTxt: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#b91c1c',
  },
  zipDevResetBtn: { backgroundColor: brand.warning, borderColor: '#B45309' },
  zipDevResetBtnTxt: { fontSize: fontSize.sm, fontWeight: '700', color: brand.white },
  zipPlayHint: { fontSize: fontSize.xs, color: brand.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  zipHowToPlay: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    marginTop: spacing.lg,
    lineHeight: 22,
  },
  devResetTodayBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.warning,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#B45309',
  },
  devResetTodayInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  devResetTodayBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  zipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  zipTile: {
    width: '47%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: '#f8fafc',
  },
  zipTileUsed: { opacity: 0.35, borderColor: brand.border },
  zipTileTxt: { fontSize: fontSize.sm, color: brand.text, fontWeight: '600' },
  zipOrderLabel: { fontSize: fontSize.sm, color: brand.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  zipFooterStat: { marginTop: 0, marginBottom: 0, fontWeight: '700', color: brand.text },
  zipGridFrame: { marginTop: spacing.md, alignSelf: 'center', position: 'relative' },
  zipGridFrameErr: { borderWidth: 2, borderColor: '#dc2626' },
  zipGridRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  zipGridCell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  zipGridCellsLayer: { zIndex: 1 },
  zipSnakeUnderlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  zipSnakePulseWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  zipSnakeSegment: {
    position: 'absolute',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
  },
  zipSnakeHeadLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  zipSnakeHead: {
    position: 'absolute',
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  zipGridCellPath: {
    backgroundColor: 'rgba(248, 250, 252, 0.42)',
    borderColor: brand.primary,
    borderWidth: StyleSheet.hairlineWidth,
  },
  zipGridGlyphOnSnake: {
    textShadowColor: 'rgba(255, 255, 255, 0.92)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  zipGridCellPathErr: { backgroundColor: 'rgba(254, 242, 242, 0.5)', borderColor: '#dc2626', borderWidth: StyleSheet.hairlineWidth },
  zipGridCellHint: {
    borderWidth: 3,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  zipGridWallR: { borderRightWidth: 4, borderRightColor: '#0f172a' },
  zipGridWallB: { borderBottomWidth: 4, borderBottomColor: '#0f172a' },
  zipGridNum: { fontSize: fontSize.xl, fontWeight: '800', color: brand.text },
  zipGridDot: { fontSize: fontSize.md, color: brand.textMuted },
  zipGridStep: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: '700',
    color: brand.primary,
  },
  zipGridStepErr: { color: '#b91c1c' },
  zipGridErrorBanner: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#b91c1c',
    textAlign: 'center',
  },
  modalRoot: { flex: 1, backgroundColor: brand.white },
  modalHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: brand.primary,
  },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.white },
  modalMicroSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
    lineHeight: 20,
  },
  microModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  microModalHeaderLead: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minWidth: 0 },
  microModalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microModalTitleCol: { flex: 1, minWidth: 0 },
  microModalCloseHit: { padding: spacing.xs },
  microModalIntroBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: brand.border,
  },
  microModalIntroTxt: {
    fontSize: fontSize.sm,
    lineHeight: 21,
    color: brand.text,
    fontWeight: '600',
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  infoScrollContent: { padding: spacing.lg, paddingBottom: spacing.sm },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    backgroundColor: '#f8fafc',
  },
  modalClosePill: {
    backgroundColor: brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  modalClosePillTxt: { color: '#fff', fontWeight: '800', fontSize: fontSize.md },
  resultCelebrationRoot: { alignSelf: 'stretch', width: '100%', marginBottom: spacing.section },
  resultHero: {
    backgroundColor: brand.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    minHeight: 268,
    overflow: 'hidden',
    position: 'relative',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  resultHeroContent: { alignItems: 'center' },
  flawlessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: brand.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  flawlessPillTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  resultCongratsTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: brand.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  resultSolvedIn: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: 2,
  },
  resultHeroTimer: {
    fontSize: 44,
    fontWeight: '800',
    color: brand.white,
    fontVariant: ['tabular-nums'],
  },
  resultHeroGameTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.94)',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  resultSummaryCard: {
    marginTop: -spacing.xxl,
    marginHorizontal: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: brand.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  resultSummaryCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
    marginBottom: spacing.md,
  },
  resultStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  resultStatLabel: { fontSize: fontSize.sm, color: brand.textMuted, fontWeight: '600' },
  resultStatValue: { fontSize: fontSize.md, fontWeight: '800', color: brand.text, fontVariant: ['tabular-nums'] },
  resultBeatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.linkChipBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  resultBeatBannerTxt: { flex: 1, fontSize: fontSize.sm, color: brand.text, lineHeight: 20, fontWeight: '600' },
  resultBadgesWrap: { marginTop: spacing.md },
  resultBadgesTitle: { fontSize: fontSize.sm, fontWeight: '700', color: brand.textMuted, marginBottom: spacing.sm },
  resultBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  resultBadgeChip: {
    backgroundColor: brand.chatSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    maxWidth: '100%',
  },
  resultBadgeChipTxt: { fontSize: fontSize.xs, fontWeight: '700', color: brand.primary },
  resultPrimaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.emerald,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  resultPrimaryCtaTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  resultSecondaryCta: { marginTop: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
  resultSecondaryCtaTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.md },
  lbModalRoot: { flex: 1, backgroundColor: brand.chatSurface },
  lbModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: brand.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  lbModalIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbModalTitle: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.white,
    textAlign: 'center',
  },
  lbHeroStrip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  lbHeroStripLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  lbHeroStripStat: { fontSize: fontSize.xs, color: brand.textMuted, marginTop: spacing.xs },
  lbScrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  lbCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: brand.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  lbCardRowYou: {
    borderColor: brand.emerald,
    borderWidth: 2,
    backgroundColor: 'rgba(4,120,87,0.06)',
  },
  lbRowToneGold: { borderLeftWidth: 4, borderLeftColor: '#CA8A04' },
  lbRowToneSilver: { borderLeftWidth: 4, borderLeftColor: '#94A3B8' },
  lbRowToneBronze: { borderLeftWidth: 4, borderLeftColor: '#C2410C' },
  lbRankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: brand.linkChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbRankCircleTxt: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary },
  lbAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.linkChipBg,
  },
  lbAvatarImg: { width: '100%', height: '100%' },
  lbCardMid: { flex: 1, minWidth: 0 },
  lbCardName: { fontSize: fontSize.md, fontWeight: '700', color: brand.text },
  lbYouTag: { fontSize: fontSize.xs, fontWeight: '800', color: brand.emerald, marginTop: 2 },
  lbRightCol: { alignItems: 'flex-end', minWidth: 72 },
  lbTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lbTimeTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, fontVariant: ['tabular-nums'] },
  lbScoreSmall: { fontSize: fontSize.xs, color: brand.textMuted, marginTop: 2, fontWeight: '600' },
  lbMyRankFooter: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.border,
  },
  lbMyRankFooterTxt: { textAlign: 'center', fontWeight: '800', color: brand.primary, fontSize: fontSize.sm },
  lbLoadMoreBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.primary,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  lbLoadMoreBtnDis: { opacity: 0.55 },
  lbLoadMoreBtnTxt: { fontWeight: '800', fontSize: fontSize.md, color: brand.primary },
  lbModalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },
  lbModalCloseBtn: {
    backgroundColor: brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  lbModalCloseBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
});

function splitZipPromptObjective(text: string): { badge: string; body: string } | null {
  const trimmed = text.trim();
  const fr = /^objectif\s*:\s*([\s\S]+)$/i.exec(trimmed);
  if (fr?.[1]?.trim()) {
    return { badge: 'Objectif', body: fr[1].trim() };
  }
  const ar = /^الهدف\s*[:：]\s*([\s\S]+)$/.exec(trimmed);
  if (ar?.[1]?.trim()) {
    return { badge: 'الهدف', body: ar[1].trim() };
  }
  return null;
}

function ZipObjectivePrompt({ text, isRTL }: { text: string; isRTL: boolean }) {
  const split = splitZipPromptObjective(text);
  if (split) {
    return (
      <View style={zipObjectiveStyles.block}>
        <Text
          style={[
            zipObjectiveStyles.badge,
            isRTL ? zipObjectiveStyles.badgeRtl : null,
            isRTL ? styles.rtl : null,
          ]}
        >
          {split.badge}
        </Text>
        <Text style={[zipObjectiveStyles.body, isRTL && styles.rtl]} numberOfLines={8}>
          {split.body}
        </Text>
      </View>
    );
  }
  return (
    <Text style={[zipObjectiveStyles.plain, isRTL && styles.rtl]} numberOfLines={4}>
      {text}
    </Text>
  );
}

const zipObjectiveStyles = StyleSheet.create({
  block: { marginBottom: spacing.sm, gap: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: brand.primary,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  badgeRtl: { alignSelf: 'flex-end' },
  body: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
    color: brand.textMuted,
  },
  plain: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: brand.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
});
