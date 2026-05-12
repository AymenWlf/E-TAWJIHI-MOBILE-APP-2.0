import type { DocumentPickerAsset, DocumentPickerResult } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { buildApiUrl } from '@/constants/api';

export type GlobalWallUploadedAttachment = {
  kind: 'photo' | 'document';
  url: string;
  name: string | null;
  mime: string | null;
  size: number | null;
};

type UploadResponse = { success: boolean; message?: string; data?: GlobalWallUploadedAttachment };

/**
 * Les URIs `content://` (souvent Android) ne sont pas toujours lisibles par `fetch` multipart.
 * Copie vers le cache app (`file://`) avant upload — évite crash natif / échec RN.
 */
async function ensureMultipartFileUri(uri: string, filenameHint: string): Promise<string> {
  const u = uri.trim();
  if (!u) {
    throw new Error('Fichier inaccessible');
  }

  if (Platform.OS === 'web') {
    return u;
  }

  const lower = u.toLowerCase();
  const needsCopy =
    lower.startsWith('content://') ||
    lower.startsWith('ph://') ||
    lower.startsWith('assets-library://') ||
    lower.startsWith('package:');

  if (!needsCopy && lower.startsWith('file://')) {
    return u;
  }

  if (!needsCopy && Platform.OS === 'android' && u.startsWith('/') && !u.startsWith('//')) {
    return u.startsWith('file://') ? u : `file://${u}`;
  }

  if (!needsCopy) {
    return u;
  }

  const base = FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('Stockage temporaire indisponible');
  }

  const safe =
    filenameHint
      .replace(/[^\w.\-\s]/g, '_')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 100) || 'document.bin';
  const dest = `${base}gw-upload-${Date.now()}-${safe}`;

  await FileSystem.copyAsync({ from: u, to: dest });
  return dest;
}

export async function uploadGlobalWallAttachment(params: {
  kind: 'photo' | 'document';
  uri: string;
  name: string;
  mime: string;
  accessToken: string;
}): Promise<UploadResponse> {
  let uploadUri = params.uri;
  try {
    uploadUri = await ensureMultipartFileUri(params.uri, params.name);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Impossible de préparer le fichier';
    return { success: false, message: msg };
  }

  const url = buildApiUrl('/api/global-wall/attachments/upload');
  const form = new FormData();
  form.append('kind', params.kind);
  const mime =
    params.mime && params.mime.trim() !== ''
      ? params.mime.trim()
      : params.kind === 'document'
        ? 'application/pdf'
        : 'image/jpeg';
  // React Native FormData expects { uri, name, type }
  form.append('file', { uri: uploadUri, name: params.name, type: mime } as never);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { success: false, message: text || `HTTP ${res.status}` };
    }
    return (await res.json()) as UploadResponse;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur réseau';
    return { success: false, message: msg };
  }
}

/** URL absolue pour afficher ou télécharger une pièce jointe (`/uploads/...` → même origine que l’API). */
export function resolveGlobalWallAttachmentUrl(relativeOrAbsolute: string): string {
  const u = relativeOrAbsolute.trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (!u.startsWith('/')) return u;
  const base = buildApiUrl('/').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}${u}`;
}

export async function fetchAbsoluteAttachmentUrl(relativeUrl: string): Promise<string> {
  return resolveGlobalWallAttachmentUrl(relativeUrl);
}

/** Normalise le résultat du document picker (formats Expo / plateformes variables). */
export function normalizeDocumentPickerAsset(res: DocumentPickerResult): DocumentPickerAsset | null {
  const loose = res as unknown as { type?: string; canceled?: boolean };
  if (loose.type === 'cancel') {
    return null;
  }
  if (res.canceled) {
    return null;
  }
  const first = res.assets?.[0];
  if (first && typeof first.uri === 'string' && first.uri.length > 0) {
    return {
      ...first,
      lastModified: typeof first.lastModified === 'number' ? first.lastModified : Date.now(),
    };
  }
  const legacy = res as unknown as {
    uri?: string;
    name?: string;
    size?: number;
    mimeType?: string;
    canceled?: boolean;
  };
  if (legacy.canceled) {
    return null;
  }
  if (typeof legacy.uri === 'string' && legacy.uri.length > 0) {
    return {
      uri: legacy.uri,
      name: typeof legacy.name === 'string' && legacy.name.trim() !== '' ? legacy.name : 'document',
      size: typeof legacy.size === 'number' ? legacy.size : 0,
      mimeType: legacy.mimeType,
      lastModified: Date.now(),
    };
  }
  return null;
}
