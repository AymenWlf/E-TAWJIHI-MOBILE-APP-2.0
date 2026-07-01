/** Logs analytics en dev uniquement (Metro / Expo). */
export function logAnalytics(event: string, payload?: Record<string, unknown>): void {
  if (!__DEV__) return;
  if (payload && Object.keys(payload).length > 0) {
    console.log(`[analytics] ${event}`, payload);
    return;
  }
  console.log(`[analytics] ${event}`);
}
