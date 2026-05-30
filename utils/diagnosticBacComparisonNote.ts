/**
 * Note de comparaison bac (diagnostic écoles) : pondération 25 % régional (moyenne des notes de parcours)
 * et 75 % prévisionnel national ; bac Mission = note de référence prévisionnelle (baccalauréat Mission).
 */

export type DiagnosticBacComparisonKind = 'marocain' | 'mission';

export type DiagnosticBacComparisonSummary = {
  kind: DiagnosticBacComparisonKind;
  /** Note « centrale » (moyenne des bornes min/max quand les deux existent) — rétrocompat affichage */
  comparisonNote: number | null;
  /** Borne basse de la fourchette de comparaison /20 (cas note min prévisionnelle) */
  comparisonNoteMin: number | null;
  /** Borne haute /20 (cas note max prévisionnelle) */
  comparisonNoteMax: number | null;
  /** Moyenne des notes tronc commun, 1re année bac, S1 2e année (champs renseignés uniquement) */
  regionalAverage: number | null;
  /** Moyenne min/max prévisionnel national si les deux, sinon la valeur unique */
  nationalReference: number | null;
  /** Détail textuel pour l’UI */
  formulaLines: string[];
  /** Indique si la formule complète 25/75 a pu être appliquée */
  usedFullWeightedFormula: boolean;
  /** True si min ≠ max (fourchette issue des champs min/max du diagnostic) */
  hasNoteRange: boolean;
  /** Origine de la note utilisée pour les seuils (bulletin bac vs diagnostic). */
  comparisonSource?: 'bac_results' | 'diagnostic';
};

function parseNote20(v: unknown): number | null {
  if (typeof v !== 'string' || !v.trim()) {
    return null;
  }
  const f = parseFloat(v.trim().replace(',', '.'));
  if (!Number.isFinite(f) || f < 0 || f > 20) {
    return null;
  }
  return f;
}

export function formatNoteFr20(n: number): string {
  const t = n.toFixed(1).replace('.', ',');
  return t.endsWith(',0') ? t.slice(0, -2) : t;
}

export type SeuilComparisonTone = 'green' | 'yellow' | 'red' | 'unknown';

export function compareNoteToSeuil(
  note: number | null,
  seuil: number | null
): { tone: SeuilComparisonTone; gap: number | null; detail: string } {
  if (note == null) {
    return {
      tone: 'unknown',
      gap: null,
      detail: 'Note de comparaison non calculable — saisissez vos notes dans Résultats du bac ou complétez le diagnostic.',
    };
  }
  if (seuil == null) {
    return {
      tone: 'unknown',
      gap: null,
      detail: 'Seuil prévisionnel absent sur la fiche de cet établissement.',
    };
  }
  const gap = note - seuil;
  if (gap >= -1e-9) {
    return {
      tone: 'green',
      gap,
      detail: 'Votre note est au-dessus ou égale au seuil prévisionnel affiché.',
    };
  }
  const below = seuil - note;
  if (below < 0.5 - 1e-9) {
    return {
      tone: 'yellow',
      gap,
      detail: 'Juste sous le seuil (écart strictement inférieur à 0,5 point).',
    };
  }
  return {
    tone: 'red',
    gap,
    detail: 'En dessous du seuil (écart d’au moins 0,5 point).',
  };
}

export type RangeComparisonResult = {
  tone: SeuilComparisonTone;
  gapMin: number | null;
  gapMax: number | null;
  detail: string;
};

/**
 * Compare une fourchette de notes candidat [min, max] au seuil.
 * - Les deux au-dessus du seuil → vert
 * - Les deux strictement sous le seuil → rouge (ou jaune si écart min < 0,5 pt, comme note unique)
 * - Chevauchement → jaune (selon la note réelle, vous pouvez être au-dessus ou en dessous)
 */
export function compareNoteRangeToSeuil(
  noteMin: number | null,
  noteMax: number | null,
  seuil: number | null
): RangeComparisonResult {
  if (noteMin == null && noteMax == null) {
    return {
      tone: 'unknown',
      gapMin: null,
      gapMax: null,
      detail: 'Note de comparaison non calculable — saisissez vos notes dans Résultats du bac ou complétez le diagnostic.',
    };
  }
  if (seuil == null) {
    return {
      tone: 'unknown',
      gapMin: null,
      gapMax: null,
      detail: 'Seuil prévisionnel absent sur la fiche de cet établissement.',
    };
  }

  const lo = noteMin != null && noteMax != null ? Math.min(noteMin, noteMax) : (noteMin ?? noteMax)!;
  const hi = noteMin != null && noteMax != null ? Math.max(noteMin, noteMax) : (noteMin ?? noteMax)!;

  if (Math.abs(hi - lo) < 1e-9) {
    const one = compareNoteToSeuil(lo, seuil);
    return { tone: one.tone, gapMin: one.gap, gapMax: one.gap, detail: one.detail };
  }

  const gapMin = lo - seuil;
  const gapMax = hi - seuil;

  if (lo >= seuil - 1e-9) {
    return {
      tone: 'green',
      gapMin,
      gapMax,
      detail:
        'Dans les deux cas (note min et note max de votre fourchette), vous êtes au-dessus ou au niveau du seuil prévisionnel.',
    };
  }

  if (hi < seuil - 1e-9) {
    const belowHi = seuil - hi;
    if (belowHi < 0.5 - 1e-9) {
      return {
        tone: 'yellow',
        gapMin,
        gapMax,
        detail:
          'Même avec la note haute de votre fourchette, vous restez légèrement sous le seuil (écart strictement inférieur à 0,5 point).',
      };
    }
    return {
      tone: 'red',
      gapMin,
      gapMax,
      detail:
        'Même en prenant la note haute de votre fourchette, vous restez au moins 0,5 point sous le seuil prévisionnel.',
    };
  }

  return {
    tone: 'yellow',
    gapMin,
    gapMax,
    detail:
      'Votre fourchette chevauche le seuil : avec une note plus basse vous seriez sous le seuil ; avec une note plus haute vous pourriez l’atteindre ou le dépasser.',
  };
}

export function computeDiagnosticBacComparisonNote(payload: Record<string, unknown>): DiagnosticBacComparisonSummary {
  const bacType = typeof payload.bacType === 'string' ? payload.bacType : '';

  if (bacType === 'mission') {
    const min = parseNote20(payload.previsionnelBacMissionMinSur20);
    const max = parseNote20(payload.previsionnelBacMissionMaxSur20);
    let comparisonNoteMin: number | null = null;
    let comparisonNoteMax: number | null = null;
    if (min != null && max != null) {
      comparisonNoteMin = Math.min(min, max);
      comparisonNoteMax = Math.max(min, max);
    } else if (min != null) {
      comparisonNoteMin = min;
      comparisonNoteMax = min;
    } else if (max != null) {
      comparisonNoteMin = max;
      comparisonNoteMax = max;
    } else {
      const candidates = [
        parseNote20(payload.noteMissionSemestre1TerminaleSur20),
        parseNote20(payload.noteMissionPremiereSur20),
        parseNote20(payload.noteMissionSecondeSur20),
      ].filter((x): x is number => x != null);
      const single = candidates.length > 0 ? Math.max(...candidates) : null;
      comparisonNoteMin = single;
      comparisonNoteMax = single;
    }

    const hasNoteRange =
      comparisonNoteMin != null &&
      comparisonNoteMax != null &&
      Math.abs(comparisonNoteMax - comparisonNoteMin) >= 1e-9;
    const comparisonNote =
      comparisonNoteMin != null && comparisonNoteMax != null
        ? (comparisonNoteMin + comparisonNoteMax) / 2
        : null;

    const formulaLines: string[] = [
      'Bac Mission : la comparaison aux seuils utilise votre prévisionnel Mission en cas note min et cas note max (fourchette si les deux champs sont renseignés).',
    ];
    if (min != null && max != null) {
      formulaLines.push(
        `Cas note min : ${formatNoteFr20(comparisonNoteMin!)}/20 ; cas note max : ${formatNoteFr20(comparisonNoteMax!)}/20.`
      );
    } else if (comparisonNote != null) {
      formulaLines.push(`Note unique retenue : ${formatNoteFr20(comparisonNote)}/20.`);
    }

    return {
      kind: 'mission',
      comparisonNote,
      comparisonNoteMin,
      comparisonNoteMax,
      regionalAverage: null,
      nationalReference: null,
      formulaLines,
      usedFullWeightedFormula: false,
      hasNoteRange,
    };
  }

  const regionalParts = [
    parseNote20(payload.noteGeneraleTroncCommunSur20),
    parseNote20(payload.noteGeneralePremiereBacSur20),
    parseNote20(payload.noteGeneraleSemestre1SecondBacSur20),
  ].filter((x): x is number => x != null);

  const regionalAverage =
    regionalParts.length > 0 ? regionalParts.reduce((a, b) => a + b, 0) / regionalParts.length : null;

  const nMin = parseNote20(payload.previsionnelBacNationalMinSur20);
  const nMax = parseNote20(payload.previsionnelBacNationalMaxSur20);
  const nLo = nMin != null && nMax != null ? Math.min(nMin, nMax) : (nMin ?? nMax);
  const nHi = nMin != null && nMax != null ? Math.max(nMin, nMax) : (nMin ?? nMax);

  let nationalReference: number | null = null;
  if (nMin != null && nMax != null) {
    nationalReference = (nMin + nMax) / 2;
  } else if (nMin != null) {
    nationalReference = nMin;
  } else if (nMax != null) {
    nationalReference = nMax;
  }

  let comparisonNoteMin: number | null = null;
  let comparisonNoteMax: number | null = null;
  let usedFullWeightedFormula = false;

  if (regionalAverage != null && nLo != null && nHi != null) {
    comparisonNoteMin = 0.25 * regionalAverage + 0.75 * nLo;
    comparisonNoteMax = 0.25 * regionalAverage + 0.75 * nHi;
    usedFullWeightedFormula = true;
  } else if (regionalAverage != null && nLo != null) {
    comparisonNoteMin = 0.25 * regionalAverage + 0.75 * nLo;
    comparisonNoteMax = comparisonNoteMin;
    usedFullWeightedFormula = true;
  } else if (nLo != null && nHi != null) {
    comparisonNoteMin = nLo;
    comparisonNoteMax = nHi;
  } else if (nLo != null) {
    comparisonNoteMin = nLo;
    comparisonNoteMax = nLo;
  } else if (regionalAverage != null) {
    comparisonNoteMin = regionalAverage;
    comparisonNoteMax = regionalAverage;
  }

  const hasNoteRange =
    comparisonNoteMin != null &&
    comparisonNoteMax != null &&
    Math.abs(comparisonNoteMax - comparisonNoteMin) >= 1e-9;
  const comparisonNote =
    comparisonNoteMin != null && comparisonNoteMax != null
      ? (comparisonNoteMin + comparisonNoteMax) / 2
      : null;

  const formulaLines: string[] = [
    'Bac marocain : la comparaison aux seuils utilise une fourchette (cas note min / cas note max) dès que vous indiquez les deux bornes du prévisionnel national.',
    '• Part régionale (25 %) : moyenne des notes de parcours renseignées (tronc commun, 1re année du bac, 1er semestre de la 2e année).',
    '• Part « nationale » (75 %) : prévisionnel national — on applique séparément la borne min et la borne max à la formule 25 % / 75 %.',
  ];

  if (regionalAverage != null) {
    formulaLines.push(
      regionalParts.length > 1
        ? `Moyenne parcours : ${regionalParts.map(formatNoteFr20).join(', ')} → ${formatNoteFr20(regionalAverage)}/20.`
        : `Note de parcours utilisée : ${formatNoteFr20(regionalAverage)}/20.`
    );
  }

  if (nMin != null && nMax != null && regionalAverage != null) {
    formulaLines.push(
      `Prévisionnel national : ${formatNoteFr20(nMin)}/20 (min) — ${formatNoteFr20(nMax)}/20 (max).`
    );
    formulaLines.push(
      `Cas note min : 0,25 × ${formatNoteFr20(regionalAverage)} + 0,75 × ${formatNoteFr20(nMin)} = ${formatNoteFr20(comparisonNoteMin!)}/20.`
    );
    formulaLines.push(
      `Cas note max : 0,25 × ${formatNoteFr20(regionalAverage)} + 0,75 × ${formatNoteFr20(nMax)} = ${formatNoteFr20(comparisonNoteMax!)}/20.`
    );
  } else if (nMin != null && nMax != null && regionalAverage == null) {
    formulaLines.push(
      `Prévisionnel national : ${formatNoteFr20(nMin)}/20 (min) — ${formatNoteFr20(nMax)}/20 (max).`
    );
    formulaLines.push(
      `Cas note min : ${formatNoteFr20(comparisonNoteMin!)}/20 ; cas note max : ${formatNoteFr20(comparisonNoteMax!)}/20.`
    );
  } else if (nationalReference != null) {
    formulaLines.push(`Prévisionnel national : ${formatNoteFr20(nationalReference)}/20.`);
    if (usedFullWeightedFormula && regionalAverage != null) {
      formulaLines.push(
        `Note de comparaison : 0,25 × ${formatNoteFr20(regionalAverage)} + 0,75 × ${formatNoteFr20(nationalReference)} = ${formatNoteFr20(comparisonNoteMin!)}/20.`
      );
    }
  }

  if (regionalAverage != null && nationalReference == null && comparisonNote != null) {
    formulaLines.push(
      `Parcours seul (prévisionnel national non renseigné) : note de comparaison = ${formatNoteFr20(comparisonNote)}/20.`
    );
  } else if (
    nationalReference != null &&
    regionalAverage == null &&
    comparisonNote != null &&
    !usedFullWeightedFormula &&
    !(nMin != null && nMax != null)
  ) {
    formulaLines.push(
      `National seul (parcours régional non renseigné) : note = ${formatNoteFr20(comparisonNote)}/20.`
    );
  }

  return {
    kind: 'marocain',
    comparisonNote,
    comparisonNoteMin,
    comparisonNoteMax,
    regionalAverage,
    nationalReference,
    formulaLines,
    usedFullWeightedFormula,
    hasNoteRange,
  };
}
