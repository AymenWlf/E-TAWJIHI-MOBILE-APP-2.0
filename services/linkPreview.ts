import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type LinkPreviewApiResponse = {
  success: boolean;
  url?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
  message?: string;
};

/**
 * Aperçu Open Graph via l’API backend (domaines E‑TAWJIHI autorisés côté serveur).
 * Ne lance pas d’exception : retourne `null` si indisponible.
 */
export async function fetchLinkPreview(absoluteUrl: string): Promise<LinkPreviewApiResponse | null> {
  const trimmed = absoluteUrl.trim();
  if (!trimmed) return null;
  try {
    const url = buildApiUrl('/api/public/link-preview', { url: trimmed });
    return await httpGetJson<LinkPreviewApiResponse>(url);
  } catch {
    return null;
  }
}
