import { useCallback, useMemo, useState } from 'react';

/** Brouillon de saisie vs terme appliqué (API / filtre local). Pas de recherche à la frappe. */
export function useAppliedTextSearch(initialApplied = '') {
  const [draft, setDraft] = useState(initialApplied);
  const [applied, setApplied] = useState(initialApplied);

  const hasPending = useMemo(() => draft.trim() !== applied.trim(), [draft, applied]);

  const apply = useCallback(() => {
    setApplied(draft.trim());
  }, [draft]);

  const clear = useCallback(() => {
    setDraft('');
    setApplied('');
  }, []);

  return { draft, setDraft, applied, setApplied, hasPending, apply, clear };
}
