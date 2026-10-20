export type SeuilNoteChip = {
  id: 'premiere' | 'cc' | 'national' | 'term' | 'bac';
  value: string;
};

export type SeuilNotesView = {
  kind: 'marocain' | 'mission';
  chips: SeuilNoteChip[];
  /** 25 % régionale + 25 % contrôle continu + 50 % nationale. */
  moyenneGenerale: string | null;
  /** 75 % nationale + 25 % moyenne (régionale et contrôle continu). */
  measure: string | null;
};

const CHIP_TONE: Record<SeuilNoteChip['id'] | 'measure', { background: string; color: string }> = {
  premiere: { background: '#EEF2FF', color: '#333E8F' },
  cc: { background: '#F1F5F9', color: '#334155' },
  national: { background: '#DBEAFE', color: '#1D4ED8' },
  term: { background: '#F5F3FF', color: '#6D28D9' },
  bac: { background: '#FEF3C7', color: '#B45309' },
  measure: { background: '#D1FAE5', color: '#047857' },
};

function cleanNote(value: string): string {
  return value.replace(/\s*\(estim\.\)\s*/gi, '').trim();
}

function parseNote(value: string): number | null {
  const note = Number(value.replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(note)) return null;
  return note;
}

function formatCalc(note: number): string {
  const text = (Math.round(note * 10) / 10).toFixed(1).replace('.', ',');
  return text.endsWith(',0') ? text.slice(0, -2) : text;
}

function marocainCalcs(chips: SeuilNoteChip[]): { moyenneGenerale: string | null; measure: string | null } {
  const byId = Object.fromEntries(chips.map((chip) => [chip.id, parseNote(chip.value)])) as Partial<
    Record<SeuilNoteChip['id'], number | null>
  >;
  const regional = byId.premiere ?? null;
  const cc = byId.cc ?? null;
  const national = byId.national ?? null;
  const moyenneGenerale =
    regional != null && cc != null && national != null
      ? formatCalc(regional * 0.25 + cc * 0.25 + national * 0.5)
      : null;
  const regionalParts = [regional, cc].filter((note): note is number => note != null);
  const regionalAvg = regionalParts.length
    ? regionalParts.reduce((sum, note) => sum + note, 0) / regionalParts.length
    : null;
  const measure =
    regionalAvg != null && national != null ? formatCalc(national * 0.75 + regionalAvg * 0.25) : null;
  return { moyenneGenerale, measure };
}

export function seuilNotesFromLabel(label: string | null | undefined): SeuilNotesView | null {
  const text = (label ?? '').trim();
  if (!text || text === 'Non renseignées' || text === '—') return null;

  const maroc = text.match(
    /1ère\s+([^·]+?)\s+·\s+CC\s+([^·]+?)\s+·\s+Nat\.\s+([^·(]+?)(?:\s+·\s+Mesure\s+([0-9]+(?:[.,][0-9]+)?)\/20)?/i,
  );
  if (maroc) {
    const chips = (
      [
        ['premiere', maroc[1]],
        ['cc', maroc[2]],
        ['national', maroc[3]],
      ] as const
    )
      .map(([id, raw]) => ({ id, value: cleanNote(raw) }))
      .filter((chip) => chip.value && chip.value !== '—');
    const calcs = marocainCalcs(chips);
    const parsedMeasure = maroc[4] ? maroc[4].replace('.', ',') : null;
    if (!chips.length && !calcs.measure && !parsedMeasure && !calcs.moyenneGenerale) return null;
    return {
      kind: 'marocain',
      chips,
      moyenneGenerale: calcs.moyenneGenerale,
      measure: calcs.measure ?? parsedMeasure,
    };
  }

  const mission = text.match(/1ère\s+([^·]+?)\s+·\s+Term\.\s+([^·]+?)\s+·\s+Bac\s+([^·(]+)/i);
  if (mission) {
    const chips = (
      [
        ['premiere', mission[1]],
        ['term', mission[2]],
        ['bac', mission[3]],
      ] as const
    )
      .map(([id, raw]) => ({ id, value: cleanNote(raw) }))
      .filter((chip) => chip.value && chip.value !== '—');
    if (!chips.length) return null;
    return { kind: 'mission', chips, moyenneGenerale: null, measure: null };
  }

  return null;
}

export function seuilChipTone(id: SeuilNoteChip['id'] | 'measure'): { background: string; color: string } {
  return CHIP_TONE[id];
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LABELS_FR: Record<SeuilNoteChip['id'], string> = {
  premiere: 'Note régionale',
  cc: 'Contrôle continu',
  national: 'Note nationale',
  term: 'Terminale',
  bac: 'Bac',
};

const LABELS_AR: Record<SeuilNoteChip['id'], string> = {
  premiere: 'النقطة الجهوية',
  cc: 'المراقبة المستمرة',
  national: 'النقطة الوطنية',
  term: 'النهائية',
  bac: 'Bac',
};

export function seuilNotesPrintHtml(label: string | null | undefined, isAr: boolean): string {
  const notes = seuilNotesFromLabel(label);
  if (!notes) return '';
  const labels = isAr ? LABELS_AR : LABELS_FR;
  const cells = notes.chips
    .map((chip) => {
      const tone = seuilChipTone(chip.id);
      const chipLabel =
        notes.kind === 'mission' && chip.id === 'premiere' ? (isAr ? 'السنة الأولى' : 'Première') : labels[chip.id];
      return `<div style="flex:1;min-width:90px;background:${tone.background};border-radius:6px;padding:8px;text-align:center">
        <div style="font-size:8pt;color:${tone.color};font-weight:700">${esc(chipLabel)}</div>
        <div style="font-size:13pt;font-weight:800;color:${tone.color}">${esc(chip.value)}/20</div>
      </div>`;
    })
    .join('');
  const calcRow = (title: string, formula: string, value: string, background: string, color: string) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:${background};border-radius:6px;padding:8px 10px;margin-top:6px">
      <div><div style="font-size:10pt;font-weight:800;color:${color}">${esc(title)}</div><div style="font-size:8pt;color:#475569">${esc(formula)}</div></div>
      <div style="font-size:14pt;font-weight:800;color:${color}">${esc(value)}/20</div>
    </div>`;
  const calcs =
    notes.kind === 'marocain'
      ? `${
          notes.moyenneGenerale
            ? calcRow(
                isAr ? 'المعدل العام' : 'Moyenne générale',
                isAr ? '25٪ جهوية + 25٪ مراقبة مستمرة + 50٪ وطنية' : '25 % régionale + 25 % contrôle continu + 50 % nationale',
                notes.moyenneGenerale,
                '#eff6ff',
                '#1e40af',
              )
            : ''
        }${
          notes.measure
            ? calcRow(
                isAr ? '75٪ + 25٪' : '75 % + 25 %',
                isAr ? '75٪ وطنية + 25٪ (الجهوية والمراقبة المستمرة)' : '75 % nationale + 25 % (régionale et contrôle continu)',
                notes.measure,
                '#ecfdf5',
                '#047857',
              )
            : ''
        }`
      : '';
  const hint =
    notes.kind === 'mission'
      ? isAr
        ? 'باك Mission : هذه النقط مرجع للمقارنة مع المدارس.'
        : 'Bac mission : ces notes servent de repère face aux écoles.'
      : isAr
        ? 'هذه النقط تُقارن بعتبات المدارس.'
        : 'Ces notes sont comparées aux seuils des écoles.';
  const title = isAr ? 'النقط والعتبات' : 'Notes et seuils';
  return `<div class="card" style="margin-top:8px;background:#f8fafc;border:1px solid #e2e8f0">
    <div style="font-size:11pt;font-weight:800;color:#333E8F;margin-bottom:6px">${esc(title)}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${cells}</div>
    ${calcs}
    <p style="margin:6px 0 0;font-size:9pt;color:#475569">${esc(hint)}</p>
  </div>`;
}
