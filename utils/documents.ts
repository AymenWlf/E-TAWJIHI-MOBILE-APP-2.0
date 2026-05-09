/**
 * Helpers pour visualiser et télécharger les documents joints aux annonces.
 *
 * - `viewDocument()` ouvre le document dans un navigateur in-app
 *   (SafariViewController sur iOS, Chrome Custom Tab sur Android), ce qui
 *   permet de prévisualiser PDF, images et pages HTML sans quitter l'app.
 * - `downloadDocument()` télécharge le fichier dans le cache de l'app puis
 *   ouvre le système de partage natif pour permettre à l'utilisateur de le
 *   sauvegarder dans Files / Drive / Photos / autre app.
 *
 * Ces helpers sont volontairement tolérants aux erreurs (Promise<boolean>)
 * pour que l'UI puisse simplement afficher un Alert basique en cas d'échec
 * et rester fluide.
 */
import * as WebBrowser from 'expo-web-browser';
import * as Sharing from 'expo-sharing';
import { Directory, File, Paths } from 'expo-file-system';

/** Ouvre le document dans un navigateur in-app (Safari View / Custom Tab). */
export async function viewDocument(url: string): Promise<boolean> {
  try {
    if (!url) return false;
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.OVER_FULL_SCREEN,
      readerMode: false,
      showTitle: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Télécharge le fichier vers le cache de l'app, puis ouvre la feuille de
 * partage native afin que l'utilisateur puisse le sauvegarder ou l'ouvrir
 * dans une autre application. Retourne `true` si la séquence aboutit.
 *
 * `suggestedName` est utilisé comme nom local préféré ; on garde une
 * extension lisible (ex: ".pdf") en s'appuyant sur l'URL si possible.
 */
export async function downloadDocument(
  url: string,
  suggestedName?: string,
): Promise<{ ok: boolean; reason?: 'invalid-url' | 'download-failed' | 'sharing-unavailable' }> {
  if (!url) return { ok: false, reason: 'invalid-url' };
  try {
    // Dossier dédié dans le cache : nettoyé automatiquement par l'OS si la
    // place vient à manquer, mais accessible le temps de la session.
    const dir = new Directory(Paths.cache, 'documents');
    if (!dir.exists) dir.create({ intermediates: true });

    const filename = buildLocalFilename(url, suggestedName);
    const target = new File(dir, filename);
    if (target.exists) target.delete();

    await File.downloadFileAsync(url, target);

    const sharingAvailable = await Sharing.isAvailableAsync();
    if (!sharingAvailable) {
      return { ok: false, reason: 'sharing-unavailable' };
    }

    await Sharing.shareAsync(target.uri, {
      mimeType: guessMimeType(url),
      dialogTitle: filename,
      UTI: guessUti(url),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'download-failed' };
  }
}

/* ─────────────────────────── helpers internes ─────────────────────────── */

/**
 * Construit un nom de fichier local sûr à partir de l'URL et du titre
 * éventuel. On garde l'extension de l'URL si présente, sinon on retombe
 * sur `.pdf` (cas majoritaire pour les annonces officielles).
 */
function buildLocalFilename(url: string, suggested?: string): string {
  const urlExt = extractExtension(url);
  const baseFromUrl = (() => {
    try {
      const u = new URL(url);
      const last = u.pathname.split('/').filter(Boolean).pop() ?? '';
      return decodeURIComponent(last.replace(/\.[a-z0-9]+$/i, ''));
    } catch {
      return '';
    }
  })();
  const base = sanitize(suggested || baseFromUrl || 'document');
  const ext = urlExt || '.pdf';
  return `${base}${ext}`;
}

function extractExtension(url: string): string | null {
  const m = url.match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i);
  return m ? `.${m[1].toLowerCase()}` : null;
}

function sanitize(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replace(/[^\w.\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 80) || 'document'
  );
}

function guessMimeType(url: string): string | undefined {
  const ext = extractExtension(url);
  if (!ext) return undefined;
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.zip': 'application/zip',
  };
  return map[ext];
}

function guessUti(url: string): string | undefined {
  const ext = extractExtension(url);
  if (!ext) return undefined;
  const map: Record<string, string> = {
    '.pdf': 'com.adobe.pdf',
    '.png': 'public.png',
    '.jpg': 'public.jpeg',
    '.jpeg': 'public.jpeg',
    '.gif': 'com.compuserve.gif',
    '.webp': 'org.webmproject.webp',
    '.doc': 'com.microsoft.word.doc',
    '.docx': 'org.openxmlformats.wordprocessingml.document',
    '.xls': 'com.microsoft.excel.xls',
    '.xlsx': 'org.openxmlformats.spreadsheetml.sheet',
    '.ppt': 'com.microsoft.powerpoint.ppt',
    '.pptx': 'org.openxmlformats.presentationml.presentation',
    '.txt': 'public.plain-text',
    '.csv': 'public.comma-separated-values-text',
    '.zip': 'public.zip-archive',
  };
  return map[ext];
}

/** Renvoie une icône FontAwesome adaptée à l'extension du document. */
export function pickDocumentIcon(url: string): 'file-pdf-o' | 'file-image-o' | 'file-word-o' | 'file-excel-o' | 'file-powerpoint-o' | 'file-archive-o' | 'file-text-o' | 'file-o' {
  const ext = extractExtension(url);
  if (!ext) return 'file-o';
  if (ext === '.pdf') return 'file-pdf-o';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].includes(ext)) return 'file-image-o';
  if (['.doc', '.docx', '.odt', '.rtf'].includes(ext)) return 'file-word-o';
  if (['.xls', '.xlsx', '.ods', '.csv'].includes(ext)) return 'file-excel-o';
  if (['.ppt', '.pptx', '.odp', '.key'].includes(ext)) return 'file-powerpoint-o';
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return 'file-archive-o';
  if (['.txt', '.md', '.json', '.xml', '.html'].includes(ext)) return 'file-text-o';
  return 'file-o';
}
