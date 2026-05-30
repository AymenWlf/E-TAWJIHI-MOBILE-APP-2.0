/** Formate une durée SNAKE en chrono m:ss (ex. 1:04). */
export function formatZipDurationMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Affiche le record chrono ou un tiret si aucune partie enregistrée. */
export function formatDailyChallengeRecordTime(ms: number | null | undefined): string {
  if (ms == null || ms <= 0) return '—';
  return formatZipDurationMs(ms);
}
