/** Génère chemins 5×5 et 6×6 et 7×7 pour zipPuzzlePrecomputedPaths (import rapide). */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ham(size: number, seed: number, maxSteps: number, startCap: number): number[] | null {
  const rng = mulberry32(seed);
  const rows = size;
  const cols = size;
  const total = size * size;
  const visited = new Uint8Array(total);
  const path: number[] = [];
  let steps = 0;
  const idxRC = (i: number) => ({ r: Math.floor(i / cols), c: i % cols });
  const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;
  const toIdx = (r: number, c: number) => r * cols + c;
  const unvisitedNeighborCount = (cellIdx: number): number => {
    const { r, c } = idxRC(cellIdx);
    let cnt = 0;
    for (const [dr, dc] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !visited[toIdx(nr, nc)]) cnt++;
    }
    return cnt;
  };
  const neighbors = (cellIdx: number): number[] => {
    const { r, c } = idxRC(cellIdx);
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      [dirs[i], dirs[j]] = [dirs[j]!, dirs[i]!];
    }
    const arr: number[] = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc)) arr.push(toIdx(nr, nc));
    }
    arr.sort((a, b) => {
      const da = unvisitedNeighborCount(a);
      const db = unvisitedNeighborCount(b);
      if (da !== db) return da - db;
      return rng() < 0.5 ? -1 : 1;
    });
    return arr;
  };
  const dfs = (cellIdx: number): boolean => {
    if (++steps > maxSteps) return false;
    visited[cellIdx] = 1;
    path.push(cellIdx);
    if (path.length === total) return true;
    for (const nb of neighbors(cellIdx)) {
      if (!visited[nb] && dfs(nb)) return true;
    }
    visited[cellIdx] = 0;
    path.pop();
    return false;
  };
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const cap = Math.min(startCap, order.length);
  for (let s = 0; s < cap; s++) {
    visited.fill(0);
    path.length = 0;
    steps = 0;
    if (dfs(order[s]!)) return path;
  }
  return null;
}

function findPath(size: number, seedBase: number): number[] {
  const area = size * size;
  const startCap = Math.min(48, area);
  const baseSteps = 1_800_000 + area * area * 3_500;
  for (let a = 0; a < 200; a++) {
    const seed = (seedBase + Math.imul(a, 0x9e3779b1)) >>> 0;
    const maxSteps = Math.min(15_000_000, baseSteps + a * 50_000);
    const p = ham(size, seed, maxSteps, startCap);
    if (p) return p;
  }
  throw new Error(`no path ${size}`);
}

for (const j of [
  { name: 'Z5A', size: 5, seed: 0x5a1101 },
  { name: 'Z5B', size: 5, seed: 0x5a1102 },
  { name: 'Z6', size: 6, seed: 0x6a1101 },
  { name: 'Z7', size: 7, seed: 0x7a1101 },
] as const) {
  const t0 = Date.now();
  const p = findPath(j.size, j.seed ^ 0x9e3779b9);
  console.log(`// ${j.name} ${j.size}x${j.size} ${Date.now() - t0}ms`);
  console.log(`export const PRECOMPUTED_PATH_${j.name}: readonly number[] = [`);
  for (let i = 0; i < p.length; i += 16) {
    console.log('  ' + p.slice(i, i + 16).join(', ') + (i + 16 < p.length ? ',' : ''));
  }
  console.log('];\n');
}
