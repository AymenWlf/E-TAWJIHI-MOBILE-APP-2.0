/**
 * 10 grilles SNAKE d’entraînement (5×5 → 12×12) : parcours hamiltoniens **aléatoires**
 * (DFS + heuristique MRV, graines fixes ; chemins embarqués dans zipPuzzlePrecomputedPaths.ts
 * pour un import instantané). Moins de numéros sur les niveaux durs. Quelques murs « pièges »
 * (sous-ensemble aléatoire hors chemin), pas un couloir unique collé au tracé.
 */

import {
  PRECOMPUTED_PATH_Z10,
  PRECOMPUTED_PATH_Z11,
  PRECOMPUTED_PATH_Z12A,
  PRECOMPUTED_PATH_Z12B,
  PRECOMPUTED_PATH_Z5A,
  PRECOMPUTED_PATH_Z5B,
  PRECOMPUTED_PATH_Z6,
  PRECOMPUTED_PATH_Z7,
  PRECOMPUTED_PATH_Z8,
  PRECOMPUTED_PATH_Z9,
} from '@/constants/zipPuzzlePrecomputedPaths';

export type ZipPracticeVariant = {
  key: string;
  labelFr: string;
  labelAr: string;
  rows: number;
  cols: number;
  cells: number[];
  wallsHorizontal: number[];
  wallsVertical: number[];
  /** Solution de référence (non affichée au joueur) */
  solutionPath: number[];
};

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeWalls(raw: number[] | undefined, len: number): number[] {
  const out = new Array(len).fill(0);
  if (!raw?.length) return out;
  for (let i = 0; i < len && i < raw.length; i++) out[i] = raw[i] ? 1 : 0;
  return out;
}

/**
 * Score = rows×cols si chemin valide, sinon 0 (même logique que ZipGridPathValidator côté PHP).
 * Le dernier numéro (checkpoint final) doit être sur la **dernière** case du parcours (toutes les cases).
 */
export function scoreZipGridPath(
  zip: Pick<ZipPracticeVariant, 'rows' | 'cols' | 'cells' | 'wallsHorizontal' | 'wallsVertical'>,
  path: number[],
): number {
  const rows = zip.rows;
  const cols = zip.cols;
  if (rows < 1 || cols < 1) return 0;
  const n = rows * cols;
  const cells = zip.cells;
  if (cells.length !== n) return 0;
  const whLen = Math.max(0, (rows - 1) * cols);
  const wvLen = Math.max(0, rows * Math.max(0, cols - 1));
  const wh = normalizeWalls(zip.wallsHorizontal, whLen);
  const wv = normalizeWalls(zip.wallsVertical, wvLen);
  if (path.length !== n) return 0;
  const seen = new Set<number>();
  for (let i = 0; i < path.length; i++) {
    const idx = path[i]!;
    if (idx < 0 || idx >= n || seen.has(idx)) return 0;
    seen.add(idx);
    if (i > 0 && !areAdjacentNoWall(path[i - 1]!, idx, rows, cols, wh, wv)) return 0;
  }
  if (cells[path[0]!] !== 1) return 0;
  const maxNum = Math.max(...cells);
  if (maxNum < 1) return 0;
  let expected = 1;
  for (const idx of path) {
    const v = cells[idx]!;
    if (v <= 0) continue;
    if (v !== expected) return 0;
    expected++;
  }
  if (expected !== maxNum + 1) return 0;
  if (cells[path[n - 1]!] !== maxNum) return 0;
  return n;
}

/**
 * Murs sur **toutes** les arêtes hors chemin solution (couloir unique) — conservé pour tests / outils.
 * En jeu on préfère {@link wallsScatteredAwayFromPath}.
 */
export function wallsBlockingAllExceptPath(
  rows: number,
  cols: number,
  path: number[],
): { wallsHorizontal: number[]; wallsVertical: number[] } {
  const whLen = Math.max(0, (rows - 1) * cols);
  const wvLen = Math.max(0, rows * Math.max(0, cols - 1));
  const wallsHorizontal = new Array(whLen).fill(1);
  const wallsVertical = new Array(wvLen).fill(1);

  const openEdge = (a: number, b: number) => {
    const ra = Math.floor(a / cols);
    const ca = a % cols;
    const rb = Math.floor(b / cols);
    const cb = b % cols;
    if (Math.abs(ra - rb) + Math.abs(ca - cb) !== 1) return;
    if (ra === rb) {
      const c = Math.min(ca, cb);
      const idx = ra * Math.max(0, cols - 1) + c;
      if (idx >= 0 && idx < wvLen) wallsVertical[idx] = 0;
    } else {
      const r = Math.min(ra, rb);
      const idx = r * cols + ca;
      if (idx >= 0 && idx < whLen) wallsHorizontal[idx] = 0;
    }
  };

  for (let i = 0; i < path.length - 1; i++) {
    openEdge(path[i]!, path[i + 1]!);
  }
  return { wallsHorizontal, wallsVertical };
}

function variantWallSalt(seed: number, key: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i)!, 0x9e3779b1);
  }
  return h >>> 0;
}

/**
 * Murs modérés sur des arêtes hors chemin solution (mélangées à la graine) : quelques raccourcis
 * bloqués sans murer toute la grille — chaque variante a un motif différent.
 */
export function wallsScatteredAwayFromPath(
  rows: number,
  cols: number,
  path: number[],
  seed: number,
  difficulty: number,
): { wallsHorizontal: number[]; wallsVertical: number[] } {
  const whLen = Math.max(0, (rows - 1) * cols);
  const wvLen = Math.max(0, rows * Math.max(0, cols - 1));
  const wallsHorizontal = new Array(whLen).fill(0);
  const wallsVertical = new Array(wvLen).fill(0);
  const pathEdgeKeys = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    pathEdgeKeys.add(`${lo},${hi}`);
  }
  const candidates: { kind: 'h' | 'v'; idx: number }[] = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * cols + c;
      const b = (r + 1) * cols + c;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (!pathEdgeKeys.has(`${lo},${hi}`)) {
        candidates.push({ kind: 'h', idx: r * cols + c });
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c;
      const b = r * cols + c + 1;
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (!pathEdgeKeys.has(`${lo},${hi}`)) {
        candidates.push({ kind: 'v', idx: r * (cols - 1) + c });
      }
    }
  }
  if (candidates.length === 0) {
    return { wallsHorizontal, wallsVertical };
  }
  const tier = Math.min(5, Math.max(1, difficulty));
  const rng = mulberry32(seed ^ 0xf1ea5e77);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  const fracBase = 0.065 + tier * 0.017;
  const fracJitter = rng() * 0.048;
  const fracSalt = ((seed >>> 3) % 19) / 420;
  let want = Math.floor(candidates.length * (fracBase + fracJitter + fracSalt));
  const hardCap = Math.max(1, Math.floor(candidates.length * 0.32));
  want = Math.min(hardCap, Math.max(0, want));
  if (want === 0 && candidates.length >= 6 && tier >= 4) {
    want = 1;
  }
  if (want === 0 && candidates.length >= 1 && rows * cols <= 16) {
    want = Math.min(1, candidates.length);
  }
  for (let k = 0; k < want; k++) {
    const e = candidates[k]!;
    if (e.kind === 'h') wallsHorizontal[e.idx] = 1;
    else wallsVertical[e.idx] = 1;
  }
  return { wallsHorizontal, wallsVertical };
}

function areAdjacentNoWall(
  a: number,
  b: number,
  rows: number,
  cols: number,
  wh: number[],
  wv: number[],
): boolean {
  const ra = Math.floor(a / cols);
  const ca = a % cols;
  const rb = Math.floor(b / cols);
  const cb = b % cols;
  if (Math.abs(ra - rb) + Math.abs(ca - cb) !== 1) return false;
  if (ra === rb) {
    const c = Math.min(ca, cb);
    const idx = ra * Math.max(0, cols - 1) + c;
    return (wv[idx] ?? 0) === 0;
  }
  const r = Math.min(ra, rb);
  const idx = r * cols + ca;
  return (wh[idx] ?? 0) === 0;
}

/** Préfixe du chemin : `null` si OK ; sinon erreur d’ordre des numéros ou de parcours (mur / adjacence). */
export function getZipGridPrefixIssue(
  zip: Pick<ZipPracticeVariant, 'rows' | 'cols' | 'cells' | 'wallsHorizontal' | 'wallsVertical'>,
  path: number[],
): null | 'order' | 'path' {
  const rows = zip.rows;
  const cols = zip.cols;
  if (rows < 1 || cols < 1) return null;
  const n = rows * cols;
  const cells = zip.cells;
  if (cells.length !== n) return 'path';
  if (path.length === 0) return null;
  const whLen = Math.max(0, (rows - 1) * cols);
  const wvLen = Math.max(0, rows * Math.max(0, cols - 1));
  const wh = normalizeWalls(zip.wallsHorizontal, whLen);
  const wv = normalizeWalls(zip.wallsVertical, wvLen);
  const seen = new Set<number>();
  for (let i = 0; i < path.length; i++) {
    const idx = path[i]!;
    if (idx < 0 || idx >= n) return 'path';
    if (seen.has(idx)) return 'path';
    seen.add(idx);
    if (i > 0 && !areAdjacentNoWall(path[i - 1]!, idx, rows, cols, wh, wv)) return 'path';
  }
  if (cells[path[0]!] !== 1) return 'order';
  const maxNum = Math.max(...cells);
  if (maxNum < 1) return null;
  let expected = 1;
  for (const idx of path) {
    const v = cells[idx]!;
    if (v <= 0) continue;
    if (v !== expected) return 'order';
    expected++;
  }
  const k = path.findIndex((idx) => cells[idx] === maxNum);
  if (k >= 0 && (k !== path.length - 1 || path.length < n)) return 'order';
  if (path.length === n && expected !== maxNum + 1) return 'order';
  return null;
}

/** Longueur L maximale telle que `path.slice(0, L)` est un préfixe valide (même règles que {@link getZipGridPrefixIssue}). */
export function getZipSnakeCorrectPrefixLength(
  zip: Pick<ZipPracticeVariant, 'rows' | 'cols' | 'cells' | 'wallsHorizontal' | 'wallsVertical'>,
  path: number[],
): number {
  if (!path.length) return 0;
  for (let L = path.length; L >= 1; L--) {
    if (getZipGridPrefixIssue(zip, path.slice(0, L)) === null) return L;
  }
  return 0;
}

/**
 * Prochaine case à jouer après le dernier préfixe correct : d’abord `solutionPath[L]`
 * si la solution complète est valide ; sinon voisin unique portant le prochain numéro attendu, ou unique case vide (0).
 */
export function getZipSnakeNextHintCellIndex(
  zip: Pick<ZipPracticeVariant, 'rows' | 'cols' | 'cells' | 'wallsHorizontal' | 'wallsVertical'> & {
    solutionPath?: number[];
  },
  path: number[],
): number | null {
  const rows = zip.rows;
  const cols = zip.cols;
  if (rows < 1 || cols < 1) return null;
  const n = rows * cols;
  const cells = zip.cells;
  if (cells.length !== n) return null;

  const L = getZipSnakeCorrectPrefixLength(zip, path);
  if (L >= n) return null;

  const sp = zip.solutionPath;
  if (Array.isArray(sp) && sp.length === n && scoreZipGridPath(zip, sp) === n) {
    const next = sp[L];
    return typeof next === 'number' && next >= 0 && next < n ? next : null;
  }

  let nextExpected = 1;
  for (let i = 0; i < L; i++) {
    const v = cells[path[i]!]!;
    if (v > 0) nextExpected++;
  }

  if (L === 0) {
    const ones: number[] = [];
    for (let i = 0; i < n; i++) if (cells[i] === 1) ones.push(i);
    if (ones.length === 0) return null;
    return ones.sort((a, b) => a - b)[0] ?? null;
  }

  const lastIdx = path[L - 1]!;
  const whLen = Math.max(0, (rows - 1) * cols);
  const wvLen = Math.max(0, rows * Math.max(0, cols - 1));
  const wh = normalizeWalls(zip.wallsHorizontal, whLen);
  const wv = normalizeWalls(zip.wallsVertical, wvLen);

  const neighbors: number[] = [];
  const pushIf = (b: number) => {
    if (b >= 0 && b < n && areAdjacentNoWall(lastIdx, b, rows, cols, wh, wv)) neighbors.push(b);
  };
  const c = lastIdx % cols;
  pushIf(lastIdx - cols);
  pushIf(lastIdx + cols);
  if (c > 0) pushIf(lastIdx - 1);
  if (c < cols - 1) pushIf(lastIdx + 1);

  const numHits = neighbors.filter((j) => cells[j] === nextExpected);
  if (numHits.length === 1) return numHits[0]!;
  if (numHits.length > 1) return [...numHits].sort((a, b) => a - b)[0] ?? null;

  const zeroHits = neighbors.filter((j) => cells[j] === 0);
  if (zeroHits.length === 1) return zeroHits[0]!;

  return null;
}

/**
 * Place m numéros (1…m) sur des cases du chemin à des étapes croissantes,
 * avec dispersion contrôlée par la graine (pas seulement équidistant).
 */
function placeNumbersDispersed(path: number[], m: number, seed: number): number[] {
  const len = path.length;
  const rng = mulberry32(seed);
  const cells = new Array(len).fill(0);
  if (m < 2) {
    cells[path[0]!] = 1;
    return cells;
  }
  const steps: number[] = [0];
  const inner = m - 2;
  let lo = 1;
  const hiCap = len - 2;
  for (let j = 0; j < inner; j++) {
    const remainingSlots = inner - j;
    const room = hiCap - lo + 1;
    const minStep = Math.max(1, Math.floor(room / (remainingSlots + 1)));
    const maxStep = Math.max(minStep, Math.floor(room / remainingSlots));
    const step = minStep + Math.floor(rng() * Math.max(1, maxStep - minStep + 1));
    lo = Math.min(hiCap, lo + step);
    steps.push(lo);
  }
  steps.push(len - 1);
  for (let i = 1; i < steps.length; i++) {
    if (steps[i]! <= steps[i - 1]!) steps[i] = Math.min(len - 1, steps[i - 1]! + 1);
  }
  steps[steps.length - 1] = len - 1;
  for (let i = steps.length - 2; i >= 0; i--) {
    if (steps[i]! >= steps[i + 1]!) steps[i] = Math.max(0, steps[i + 1]! - 1);
  }
  steps[0] = 0;
  const mUse = Math.min(m, steps.length);
  for (let j = 0; j < mUse; j++) {
    cells[path[steps[j]!]!] = j + 1;
  }
  return cells;
}

/**
 * Nombre de cases numérotées sur le chemin.
 * `difficulty` 1 = plus d’indices (plus facile) … 5 = moins d’indices (plus dur).
 */
function numberCountFor(n: number, difficulty: number): number {
  const tier = Math.min(5, Math.max(1, difficulty));
  const inv = 6 - tier;
  const area = n * n;
  const base = 3 + Math.floor((area / 36) * inv);
  return Math.min(12, Math.max(3, Math.min(base, Math.floor(area / 5))));
}

function buildVariant(def: {
  key: string;
  labelFr: string;
  labelAr: string;
  n: number;
  difficulty: number;
  seed: number;
  fixedPath: readonly number[];
}): ZipPracticeVariant {
  const { n, difficulty, seed, key, labelFr, labelAr, fixedPath } = def;
  const path = [...fixedPath];
  const m = numberCountFor(n, difficulty);
  const cells = placeNumbersDispersed(path, m, seed);
  const { wallsHorizontal, wallsVertical } = wallsScatteredAwayFromPath(
    n,
    n,
    path,
    variantWallSalt(seed, key),
    difficulty,
  );
  const v: ZipPracticeVariant = {
    key,
    labelFr,
    labelAr,
    rows: n,
    cols: n,
    cells,
    wallsHorizontal,
    wallsVertical,
    solutionPath: path,
  };
  const area = n * n;
  const sc = scoreZipGridPath(v, path);
  if (sc !== area) {
    throw new Error(`Variante SNAKE invalide ${key}: score attendu ${area}, obtenu ${sc}`);
  }
  return v;
}

const tierLabel = (t: 1 | 2 | 3 | 4 | 5) => {
  const fr = ['', 'facile', 'moyen', 'difficile', 'très difficile', 'expert'][t]!;
  const ar = ['', 'سهل', 'متوسط', 'صعب', 'صعب جدًا', 'خبير'][t]!;
  return { fr, ar };
};

/**
 * 10 grilles : tailles 5…12, parcours aléatoires uniquement, difficulté croissante.
 */
export const ZIP_PRACTICE_VARIANTS: ZipPracticeVariant[] = [
  buildVariant({
    key: 'z5a',
    n: 5,
    difficulty: 1,
    seed: 0x5a1101,
    fixedPath: PRECOMPUTED_PATH_Z5A,
    labelFr: `5×5 — ${tierLabel(1).fr} (parcours aléatoire A)`,
    labelAr: `٥×٥ — ${tierLabel(1).ar} (مسار عشوائي أ)`,
  }),
  buildVariant({
    key: 'z5b',
    n: 5,
    difficulty: 2,
    seed: 0x5a1102,
    fixedPath: PRECOMPUTED_PATH_Z5B,
    labelFr: `5×5 — ${tierLabel(2).fr} (parcours aléatoire B)`,
    labelAr: `٥×٥ — ${tierLabel(2).ar} (مسار عشوائي ب)`,
  }),
  buildVariant({
    key: 'z6',
    n: 6,
    difficulty: 2,
    seed: 0x6a1101,
    fixedPath: PRECOMPUTED_PATH_Z6,
    labelFr: `6×6 — ${tierLabel(2).fr} (aléatoire)`,
    labelAr: `٦×٦ — ${tierLabel(2).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z7',
    n: 7,
    difficulty: 3,
    seed: 0x7a1101,
    fixedPath: PRECOMPUTED_PATH_Z7,
    labelFr: `7×7 — ${tierLabel(3).fr} (aléatoire)`,
    labelAr: `٧×٧ — ${tierLabel(3).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z8',
    n: 8,
    difficulty: 3,
    seed: 0x8a1101,
    fixedPath: PRECOMPUTED_PATH_Z8,
    labelFr: `8×8 — ${tierLabel(3).fr} (aléatoire)`,
    labelAr: `٨×٨ — ${tierLabel(3).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z9',
    n: 9,
    difficulty: 4,
    seed: 0x9a1101,
    fixedPath: PRECOMPUTED_PATH_Z9,
    labelFr: `9×9 — ${tierLabel(4).fr} (aléatoire)`,
    labelAr: `٩×٩ — ${tierLabel(4).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z10',
    n: 10,
    difficulty: 4,
    seed: 0xa1101,
    fixedPath: PRECOMPUTED_PATH_Z10,
    labelFr: `10×10 — ${tierLabel(4).fr} (aléatoire)`,
    labelAr: `١٠×١٠ — ${tierLabel(4).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z11',
    n: 11,
    difficulty: 5,
    seed: 0xb1101,
    fixedPath: PRECOMPUTED_PATH_Z11,
    labelFr: `11×11 — ${tierLabel(5).fr} (aléatoire)`,
    labelAr: `١١×١١ — ${tierLabel(5).ar} (عشوائي)`,
  }),
  buildVariant({
    key: 'z12a',
    n: 12,
    difficulty: 5,
    seed: 0xc1101,
    fixedPath: PRECOMPUTED_PATH_Z12A,
    labelFr: `12×12 — ${tierLabel(5).fr} (aléatoire A)`,
    labelAr: `١٢×١٢ — ${tierLabel(5).ar} (عشوائي أ)`,
  }),
  buildVariant({
    key: 'z12b',
    n: 12,
    difficulty: 5,
    seed: 0xc1102,
    fixedPath: PRECOMPUTED_PATH_Z12B,
    labelFr: `12×12 — ${tierLabel(5).fr} (aléatoire B)`,
    labelAr: `١٢×١٢ — ${tierLabel(5).ar} (عشوائي ب)`,
  }),
];
