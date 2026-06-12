/** Modalités d'inscription d'une annonce concours (multi-sélection). */
export type ContestRegistrationMethod = 'online' | 'physical' | 'email';

export type ContestRegistrationMethodsData = {
  registrationMethods?: ContestRegistrationMethod[] | null;
  registrationEmail?: string | null;
  physicalDepositAddressFr?: string | null;
  physicalDepositAddressAr?: string | null;
  registrationUrl?: string | null;
};

export const CONTEST_REGISTRATION_METHOD_OPTIONS: {
  value: ContestRegistrationMethod;
  labelFr: string;
  labelAr: string;
}[] = [
  {
    value: 'online',
    labelFr: 'Préinscription en ligne',
    labelAr: 'التسجيل القبلي عبر الإنترنت',
  },
  {
    value: 'physical',
    labelFr: 'Dépôt physique du dossier',
    labelAr: 'إيداع الملف حضورياً',
  },
  {
    value: 'email',
    labelFr: 'Préinscription par e-mail',
    labelAr: 'التسجيل القبلي عبر البريد الإلكتروني',
  },
];

export function sanitizeRegistrationMethods(
  raw: unknown,
): ContestRegistrationMethod[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<ContestRegistrationMethod>(['online', 'physical', 'email']);
  const out: ContestRegistrationMethod[] = [];
  for (const m of raw) {
    if (typeof m === 'string' && allowed.has(m as ContestRegistrationMethod)) {
      const v = m as ContestRegistrationMethod;
      if (!out.includes(v)) out.push(v);
    }
  }
  return out;
}

export function effectiveRegistrationMethods(
  data: ContestRegistrationMethodsData,
): ContestRegistrationMethod[] {
  const stored = sanitizeRegistrationMethods(data.registrationMethods);
  if (stored.length > 0) return stored;
  const url = (data.registrationUrl ?? '').trim();
  if (url) return ['online'];
  return [];
}

export function registrationMethodLabel(
  method: ContestRegistrationMethod,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const row = CONTEST_REGISTRATION_METHOD_OPTIONS.find((o) => o.value === method);
  if (!row) return method;
  return locale === 'ar' ? row.labelAr : row.labelFr;
}

export function formatRegistrationMethodsList(
  data: ContestRegistrationMethodsData,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const methods = effectiveRegistrationMethods(data);
  if (methods.length === 0) return '';
  return methods.map((m) => registrationMethodLabel(m, locale)).join(' · ');
}

export function pickPhysicalDepositAddress(
  data: ContestRegistrationMethodsData,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const fr = (data.physicalDepositAddressFr ?? '').trim();
  const ar = (data.physicalDepositAddressAr ?? '').trim();
  if (locale === 'ar' && ar) return ar;
  if (fr) return fr;
  return ar;
}

export function hasAnyRegistrationModality(
  data: ContestRegistrationMethodsData,
): boolean {
  const methods = effectiveRegistrationMethods(data);
  if (methods.length === 0) return false;
  const url = (data.registrationUrl ?? '').trim();
  if (methods.includes('online') && url) return true;
  if (methods.includes('email') && (data.registrationEmail ?? '').trim()) return true;
  if (
    methods.includes('physical') &&
    ((data.physicalDepositAddressFr ?? '').trim() ||
      (data.physicalDepositAddressAr ?? '').trim())
  ) {
    return true;
  }
  return methods.length > 0;
}

export function primaryRegistrationUrl(data: ContestRegistrationMethodsData): string {
  return (data.registrationUrl ?? '').trim();
}

export function registrationMailto(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return '';
  return `mailto:${trimmed}`;
}
