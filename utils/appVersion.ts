import Constants from 'expo-constants';

/** Version affichée (app.json / expo config). */
export function getAppVersion(): string {
  const v = Constants.expoConfig?.version ?? Constants.nativeAppVersion;
  if (typeof v === 'string' && v.trim() !== '') {
    return v.trim();
  }
  return '0.0.0';
}

/** -1 si a < b, 0 si égal, 1 si a > b */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((part) => {
    const n = parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });
  const pb = b.split('.').map((part) => {
    const n = parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}
