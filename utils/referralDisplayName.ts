/** Affiche le prénom et le nom complets d’un parrainé (API referral / notifications). */
export function referredUserDisplayName(parts: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const first = parts.firstName?.trim() ?? '';
  const last = parts.lastName?.trim() ?? '';
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  const display = parts.displayName?.trim() ?? '';
  return display || '—';
}

/** Nom du parrainé depuis les métadonnées d’une notification referral. */
export function referredNameFromNotificationMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata) return null;
  const name = referredUserDisplayName({
    firstName:
      typeof metadata.referred_first_name === 'string' ? metadata.referred_first_name : null,
    lastName:
      typeof metadata.referred_last_name === 'string' ? metadata.referred_last_name : null,
    displayName:
      typeof metadata.referred_display_name === 'string' ? metadata.referred_display_name : null,
  });
  return name === '—' ? null : name;
}
