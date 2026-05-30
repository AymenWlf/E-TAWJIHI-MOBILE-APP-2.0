export function normalizeGradeInput(raw: string): string {
  return raw.replace(',', '.').replace(/[^\d.]/g, '');
}

export function toNullableNumber(raw: string): number | null {
  const t = normalizeGradeInput(raw).trim();
  if (!t) return null;
  const v = Number(t);
  if (!Number.isFinite(v)) return null;
  if (v < 0 || v > 20) return null;
  return v;
}

export function formatGradeDisplay(raw: string | null | undefined): string {
  if (!raw) return '—';
  const v = Number(raw);
  if (!Number.isFinite(v)) return raw;
  return v.toFixed(2);
}
