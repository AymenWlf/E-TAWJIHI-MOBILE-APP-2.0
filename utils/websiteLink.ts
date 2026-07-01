/** URL http(s) pour ouverture navigateur. */
export function normalizeWebsiteHref(url: string | null | undefined): string | null {
  const raw = (url ?? '').trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
