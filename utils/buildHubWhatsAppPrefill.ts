/** Remplace les placeholders `{key}` dans un modèle i18n. */
export function applyMessageTemplate(
  template: string,
  values: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function formatUserFullName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const parts = [(firstName ?? '').trim(), (lastName ?? '').trim()].filter(Boolean);
  return parts.join(' ');
}

/** Premier numéro de contrat parmi les services actifs du client. */
export function pickPrimaryContractNumber(
  services: ReadonlyArray<{ numeroContrat?: string | null }>,
): string | null {
  for (const s of services) {
    const ref = (s.numeroContrat ?? '').trim();
    if (ref) return ref;
  }
  return null;
}
