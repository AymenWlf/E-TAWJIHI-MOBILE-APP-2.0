/**
 * Repère un document « brochure » dans la liste renvoyée par l’API
 * (même heuristique que le Global Front `EcoleDetail`).
 */
export type EstablishmentDocumentItem = {
  url?: string;
  titre?: string;
  type?: string;
};

export function pickBrochureFromDocuments(
  docs: unknown[] | null | undefined,
): EstablishmentDocumentItem | null {
  if (!Array.isArray(docs) || docs.length === 0) return null;

  for (const d of docs) {
    if (!d || typeof d !== 'object') continue;
    const o = d as EstablishmentDocumentItem;
    const titre = String(o.titre ?? '').toLowerCase();
    const url = String(o.url ?? '').toLowerCase();
    const type = String(o.type ?? '').toLowerCase();
    if (
      type === 'brochure' ||
      titre.includes('brochure') ||
      url.includes('brochure')
    ) {
      return o;
    }
  }

  if (docs.length === 1) {
    const only = docs[0];
    if (only && typeof only === 'object') {
      const x = only as EstablishmentDocumentItem;
      if (String(x.type ?? '').toLowerCase() === 'pdf') return x;
    }
  }

  return null;
}
