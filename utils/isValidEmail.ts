/**
 * Pragmatic email check for forms (ASCII mailbox + domain).
 * Not exhaustive vs full RFC 5322; rejects obvious invalid input.
 */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 254) return false;
  return EMAIL_RE.test(s);
}
