/** Rendu serpent ZIP — helpers partagés (perf Android). */

export const ZIP_SNAKE_BODY = '#1d4ed8';
export const ZIP_SNAKE_HEAD = '#2563eb';
export const ZIP_SNAKE_ERR = 'rgba(220, 38, 38, 0.9)';

const ZIP_SNAKE_THICKNESS_RATIO = 0.38;
const ZIP_SNAKE_MIN_THICKNESS = 10;
const ZIP_SNAKE_HEAD_RATIO = 0.44;

export type ZipSnakeSegment = {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  angleDeg: number;
};

export type ZipSnakeJoint = {
  key: string;
  left: number;
  top: number;
  size: number;
};

export function zipSnakeThickness(cellSize: number): number {
  return Math.max(ZIP_SNAKE_MIN_THICKNESS, Math.round(cellSize * ZIP_SNAKE_THICKNESS_RATIO));
}

export function zipSnakeHeadSize(cellSize: number): number {
  return Math.max(14, Math.round(cellSize * ZIP_SNAKE_HEAD_RATIO));
}

export function buildZipSnakeJoints(order: readonly number[], cols: number, cellSize: number): ZipSnakeJoint[] {
  const d = zipSnakeThickness(cellSize);
  const out: ZipSnakeJoint[] = [];
  for (let i = 0; i < order.length; i++) {
    const idx = order[i]!;
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const cx = c * cellSize + cellSize / 2;
    const cy = r * cellSize + cellSize / 2;
    out.push({
      key: `zip-joint-${i}-${idx}`,
      left: cx - d / 2,
      top: cy - d / 2,
      size: d,
    });
  }
  return out;
}

export function buildZipSnakeSegments(order: readonly number[], cols: number, cellSize: number): ZipSnakeSegment[] {
  const th = zipSnakeThickness(cellSize);
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

export function buildZipPathStepMap(order: readonly number[]): Map<number, number> {
  const pathPos = new Map<number, number>();
  for (let step = 0; step < order.length; step++) {
    pathPos.set(order[step]!, step + 1);
  }
  return pathPos;
}
