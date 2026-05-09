import { getApiBaseUrl } from '@/constants/api';

/** Aligné sur Global Front `getFileUrl`. */
export function getEstablishmentFileUrl(relativeUrl: string | undefined | null): string | null {
  if (!relativeUrl?.trim()) return null;
  const s = relativeUrl.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  const base = getApiBaseUrl().replace(/\/$/, '');
  if (s.startsWith('/uploads/')) return `${base}${s}`;
  if (!s.startsWith('/')) return `${base}/uploads/${s}`;
  return `${base}${s}`;
}

/** Aligné sur Global Front `getEstablishmentLogoUrl`. */
export function getEstablishmentLogoUrl(logoFileName: string | undefined | null): string | null {
  if (!logoFileName?.trim()) return null;
  const s = logoFileName.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  const base = getApiBaseUrl().replace(/\/$/, '');
  if (s.startsWith('/uploads/')) return `${base}${s}`;

  const fileName = s.split('/').pop() || s;
  return `${base}/uploads/ecoles/${encodeURIComponent(fileName)}`;
}

export function fallbackEstablishmentAvatarName(nom?: string | null, sigle?: string | null): string {
  const name = (sigle ?? nom ?? 'École').trim().slice(0, 48);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=333E8F&color=ffffff&size=200`;
}
