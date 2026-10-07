import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DiagnosticChoiceRow, DiagnosticHint, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { Text } from '@/components/ui/Text';
import { fetchSecteursCatalog, pickSecteurTitle } from '@/services/secteurs';
import metierService, { type Metier } from '../services/metierService';
import establishmentService, { type Establishment } from '../services/establishmentService';
import { buildOrientationSchoolMeta } from '../utils/orientationDiagnosticSchoolMeta';
import { partitionFacultePublique } from '../utils/orientationFacultePubliqueGroup';
import { modernMetiersForSecteur } from '../data/orientationDiagnosticModernMetiers';
import {
  flattenSelectedEcoleIds,
  METIER_STEP_PREFIX,
  SCHOOLS_PER_TYPE_MAX,
  SCHOOLS_TOTAL_MAX,
  syncEcoleMultiKeys,
  syncMetierMultiKeys,
} from '../data/orientationDiagnosticQuestions';
import { formatSalaryRange } from '../utils/formatAmount';
import { tOd, tOdFill, type OrientationUiLocale } from '../data/orientationDiagnosticI18n';
import { toggleMultiMax } from '../utils/orientationMultiToggle';
import type { DiagnosticAnswers, DiagnosticStep } from '../types/orientationDiagnosticPrototype';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

function parseSalaryNum(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const n = parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function metierSalarySortValue(m: Metier): number {
  return parseSalaryNum(m.salaireMax) || parseSalaryNum(m.salaireMin) || 0;
}

function seedToMetier(
  seed: ReturnType<typeof modernMetiersForSecteur>[number],
  titre: string,
): Metier {
  return {
    id: seed.id as unknown as number,
    nom: seed.nom,
    nomArabe: seed.nomArabe,
    slug: seed.slug,
    secteur: { id: Number(seed.secteurId) || 0, titre, code: '' },
    description: seed.description,
    descriptionAr: seed.descriptionAr,
    niveauAccessibilite: seed.niveauAccessibilite,
    salaireMin: String(seed.salaireMin || 1),
    salaireMax: String(seed.salaireMax),
    isActivate: true,
    afficherDansTest: true,
  };
}

function mergeMetiersForSector(
  apiMetiers: Metier[],
  secteurId: string,
  titre: string,
  code?: string,
): Metier[] {
  const modern = modernMetiersForSecteur(secteurId, titre, code, 9).map((s) =>
    seedToMetier(s, titre),
  );
  const byName = new Map<string, Metier>();
  for (const m of apiMetiers) {
    const key = (m.nom || '').toLowerCase().trim();
    if (key) byName.set(key, m);
  }
  for (const m of modern) {
    const key = (m.nom || '').toLowerCase().trim();
    if (key && !byName.has(key)) byName.set(key, m);
  }
  return [...byName.values()]
    .sort((a, b) => metierSalarySortValue(b) - metierSalarySortValue(a))
    .slice(0, 10);
}

function normalizeSchoolType(type?: string | null): string {
  const t = (type || '').trim();
  if (!t) return '';
  if (t.toLowerCase().includes('semi')) return 'Semi-Public';
  if (t.toLowerCase() === 'prive' || t.toLowerCase() === 'privé') return 'Privé';
  if (t.toLowerCase() === 'public') return 'Public';
  if (t.toLowerCase() === 'militaire') return 'Militaire';
  return t;
}

function pickSchoolLabel(e: Establishment): string {
  const sigle = e.sigle?.trim();
  const nom = e.nom?.trim() || 'École';
  return sigle ? `${sigle} — ${nom}` : nom;
}

export function OrientationDynamicSectorsStep({
  step,
  answers,
  setAnswers,
  uiLocale,
  rtl,
  onLoadingChange,
  accessToken,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
  onLoadingChange?: (v: boolean) => void;
  accessToken?: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const max = step.maxSelect ?? 7;
  const selected = answers.multi.car_secteurs ?? [];

  const [secteurs, setSecteurs] = useState<Awaited<ReturnType<typeof fetchSecteursCatalog>>['items']>(
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      onLoadingChange?.(true);
      try {
        const { items } = await fetchSecteursCatalog({ token: accessToken });
        if (cancelled) return;
        setSecteurs(items);
        if (!items.length) setError(tOd(uiLocale, 'noSectors'));
      } catch {
        if (!cancelled) setError(tOd(uiLocale, 'sectorsLoadError'));
      } finally {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      onLoadingChange?.(false);
    };
  }, [accessToken, onLoadingChange, uiLocale]);

  if (loading && !secteurs.length) {
    return <ActivityIndicator color={brand.primary} style={{ marginTop: spacing.lg }} />;
  }
  if (error) return <Text style={styles.err}>{error}</Text>;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {tOdFill(uiLocale, 'sectorsCountTpl', { n: selected.length, max })}
      </Text>
      {secteurs.map((s) => {
        const id = String(s.id);
        const on = selected.includes(id);
        const title = pickSecteurTitle(s, uiLocale);
        return (
          <DiagnosticChoiceRow
            key={id}
            rtl={rtl}
            mode="checkbox"
            label={title}
            detail={s.salaireLabel || undefined}
            selected={on}
            onPress={() =>
              setAnswers((prev) => {
                const next = toggleMultiMax(prev.multi.car_secteurs ?? [], id, max);
                const labels = { ...prev.labels };
                if (next.includes(id)) labels[id] = title;
                else delete labels[id];
                return {
                  ...prev,
                  multi: syncMetierMultiKeys({ ...prev.multi, car_secteurs: next }, next),
                  labels,
                };
              })
            }
          />
        );
      })}
    </View>
  );
}

export function OrientationDynamicMetiersStep({
  step,
  answers,
  setAnswers,
  uiLocale,
  rtl,
  onLoadingChange,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
  onLoadingChange?: (v: boolean) => void;
}) {
  const [metiers, setMetiers] = useState<Metier[]>([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const max = step.maxSelect ?? 3;
  const secteurId =
    step.secteurId ||
    (step.id.startsWith(METIER_STEP_PREFIX) ? step.id.slice(METIER_STEP_PREFIX.length) : '');
  const stepKey = secteurId ? `${METIER_STEP_PREFIX}${secteurId}` : step.id;
  const selected = answers.multi[stepKey] ?? [];

  // Ne pas dépendre de `answers.labels` : chaque sélection de métier les met à jour
  // et relançait un fetch + loading à chaque clic.
  const sectorTitreRef = useRef(answers.labels?.[secteurId] || '');
  sectorTitreRef.current = answers.labels?.[secteurId] || sectorTitreRef.current;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!secteurId) {
        setMetiers([]);
        setLoading(false);
        setHint(tOd(uiLocale, 'hintSelectSectorsFirst'));
        onLoadingChange?.(false);
        return;
      }
      setLoading(true);
      onLoadingChange?.(true);
      const sectorTitre =
        sectorTitreRef.current || `Secteur ${secteurId}`;
      let code = '';
      let apiMetiers: Metier[] = [];
      const num = Number(secteurId);
      if (Number.isFinite(num)) {
        try {
          const mRes = await metierService.getAll({ secteur: num, limit: 100, afficherDansTest: true });
          apiMetiers = mRes.success && mRes.data ? [...mRes.data] : [];
        } catch {
          apiMetiers = [];
        }
      }
      const list = mergeMetiersForSector(apiMetiers, secteurId, sectorTitre, code);
      if (cancelled) return;
      setMetiers(list);
      setHint(
        apiMetiers.length === 0
          ? tOd(uiLocale, 'hintMarketMetiers')
          : apiMetiers.length < list.length
            ? tOd(uiLocale, 'hintMixteMetiers')
            : null,
      );
      setLoading(false);
      onLoadingChange?.(false);
    })();
    return () => {
      cancelled = true;
      onLoadingChange?.(false);
    };
  }, [secteurId, stepKey, uiLocale, onLoadingChange]);

  if (loading) return <ActivityIndicator color={brand.primary} style={{ marginTop: spacing.lg }} />;

  return (
    <View style={styles.wrap}>
      {hint ? <DiagnosticHint rtl={rtl}>{hint}</DiagnosticHint> : null}
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {selected.length}/{max}
      </Text>
      {metiers.map((m) => {
        const id = String(m.id);
        const on = selected.includes(id);
        const label = uiLocale === 'ar' && m.nomArabe ? m.nomArabe : m.nom;
        const salary = formatSalaryRange(m.salaireMin, m.salaireMax, uiLocale);
        return (
          <DiagnosticChoiceRow
            key={id}
            rtl={rtl}
            mode="checkbox"
            label={label}
            detail={salary || undefined}
            selected={on}
            onPress={() =>
              setAnswers((prev) => {
                const next = toggleMultiMax(prev.multi[stepKey] ?? [], id, max);
                const labels = { ...prev.labels, [id]: label };
                const multi = { ...prev.multi, [stepKey]: next };
                multi.car_metiers = [
                  ...new Set(
                    Object.keys(multi)
                      .filter((k) => k.startsWith(METIER_STEP_PREFIX))
                      .flatMap((k) => multi[k] ?? []),
                  ),
                ];
                return { ...prev, multi, labels };
              })
            }
          />
        );
      })}
    </View>
  );
}

export function OrientationDynamicSchoolsStep({
  step,
  answers,
  setAnswers,
  uiLocale,
  rtl,
  onLoadingChange,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
  onLoadingChange?: (v: boolean) => void;
}) {
  const [ecoles, setEcoles] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [facultesOpen, setFacultesOpen] = useState(false);
  const stepKey = step.id;
  const max = step.maxSelect ?? SCHOOLS_PER_TYPE_MAX;
  const selected = answers.multi[stepKey] ?? [];
  const totalSelected = flattenSelectedEcoleIds(answers.multi).length;
  const emptyKey = `${stepKey}__empty`;
  const typeMatch = step.schoolType || '';

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      onLoadingChange?.(true);
      try {
        const list = await establishmentService.fetchAllPublicCatalog({ isActive: true });
        if (!cancelled) setEcoles(list);
      } catch {
        if (!cancelled) setEcoles([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      onLoadingChange?.(false);
    };
  }, [onLoadingChange]);

  const filtered = useMemo(() => {
    const ofType = ecoles.filter((e) => normalizeSchoolType(e.type) === typeMatch);
    const q = query.trim().toLowerCase();
    if (!q) return ofType;
    return ofType.filter((e) => pickSchoolLabel(e).toLowerCase().includes(q));
  }, [ecoles, query, typeMatch]);

  const { facultes, others } = useMemo(() => partitionFacultePublique(filtered), [filtered]);
  const selectedInFacultes = useMemo(
    () => facultes.filter((e) => e.id != null && selected.includes(String(e.id))).length,
    [facultes, selected],
  );

  if (loading) return <ActivityIndicator color={brand.primary} style={{ marginTop: spacing.lg }} />;

  if (!filtered.length && !answers.single[emptyKey]) {
    return (
      <View style={styles.wrap}>
        <DiagnosticHint rtl={rtl}>
          {uiLocale === 'ar' ? 'لا مدارس لهذا النوع في القاعدة.' : 'Aucune école active pour ce type.'}
        </DiagnosticHint>
        <Pressable
          onPress={() =>
            setAnswers((prev) => ({
              ...prev,
              single: { ...prev.single, [emptyKey]: '1' },
            }))
          }
          style={styles.emptyBtn}>
          <Text style={styles.emptyBtnTxt}>
            {uiLocale === 'ar' ? 'تخطي هذه الصفحة' : 'Passer cette page'}
          </Text>
        </Pressable>
      </View>
    );
  }

  const toggleSchool = (e: Establishment) => {
    if (e.id == null) return;
    const id = String(e.id);
    const on = selected.includes(id);
    const atCap = !on && (selected.length >= max || totalSelected >= SCHOOLS_TOTAL_MAX);
    if (atCap) return;
    const label = pickSchoolLabel(e);
    setAnswers((prev) => {
      const next = toggleMultiMax(prev.multi[stepKey] ?? [], id, max);
      const labels = { ...prev.labels, [id]: label };
      const meta = buildOrientationSchoolMeta(e);
      const typeKeys = prev.multi.sch_types ?? [];
      const multi = syncEcoleMultiKeys({ ...prev.multi, [stepKey]: next }, typeKeys);
      const single = { ...prev.single };
      delete single[emptyKey];
      return {
        ...prev,
        multi,
        labels,
        single,
        schoolMeta: { ...(prev.schoolMeta || {}), [id]: meta },
      };
    });
  };

  const renderSchoolRow = (e: Establishment) => {
    if (e.id == null) return null;
    const id = String(e.id);
    const on = selected.includes(id);
    const atCap = !on && (selected.length >= max || totalSelected >= SCHOOLS_TOTAL_MAX);
    return (
      <DiagnosticChoiceRow
        key={id}
        rtl={rtl}
        mode="checkbox"
        label={pickSchoolLabel(e)}
        detail={e.ville || undefined}
        selected={on}
        onPress={() => {
          if (atCap) return;
          toggleSchool(e);
        }}
      />
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {uiLocale === 'ar'
          ? `${selected.length}/${max} · ${totalSelected}/${SCHOOLS_TOTAL_MAX} إجمالي`
          : `${selected.length}/${max} · ${totalSelected}/${SCHOOLS_TOTAL_MAX} au total`}
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={uiLocale === 'ar' ? 'بحث…' : 'Rechercher…'}
        placeholderTextColor={brand.textMuted}
        style={[styles.search, rtl && styles.searchRtl]}
      />

      {facultes.length ? (
        <View style={styles.accordion}>
          <Pressable
            onPress={() => setFacultesOpen((v) => !v)}
            style={[styles.accordionTrigger, rtl && styles.accordionTriggerRtl]}
            accessibilityRole="button"
            accessibilityState={{ expanded: facultesOpen }}>
            <View style={styles.accordionCopy}>
              <Text style={[styles.accordionTitle, rtl && styles.rtlText]}>
                {tOd(uiLocale, 'schoolGroupFacultesPubliques')}
              </Text>
              <Text style={[styles.accordionHint, rtl && styles.rtlText]}>
                {tOd(uiLocale, 'schoolGroupFacultesPubliquesHint')}
              </Text>
            </View>
            <View style={styles.accordionMeta}>
              <Text style={styles.accordionCount} latinDigits>
                {tOdFill(uiLocale, 'schoolGroupFacultesPubliquesCount', {
                  n: facultes.length,
                })}
                {selectedInFacultes > 0 ? ` · ${selectedInFacultes} ✓` : ''}
              </Text>
              <Text style={styles.accordionChevron}>{facultesOpen ? '▴' : '▾'}</Text>
            </View>
          </Pressable>
          {facultesOpen ? (
            <View style={styles.accordionBody}>{facultes.map(renderSchoolRow)}</View>
          ) : (
            <Text style={[styles.accordionClosed, rtl && styles.rtlText]}>
              {tOd(uiLocale, 'schoolGroupFacultesClosed')}
            </Text>
          )}
        </View>
      ) : null}

      {others.slice(0, 80).map(renderSchoolRow)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingBottom: spacing.xl },
  count: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary, marginBottom: 4 },
  err: { color: brand.error, paddingVertical: spacing.md },
  search: {
    borderWidth: 1,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    backgroundColor: brand.white,
    marginBottom: spacing.sm,
  },
  searchRtl: { textAlign: 'right' },
  emptyBtn: {
    backgroundColor: diagnosticTheme.primarySoft,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  emptyBtnTxt: { color: brand.primary, fontWeight: '700' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  accordion: {
    borderWidth: 1,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: radius.lg,
    backgroundColor: brand.backgroundSoft,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  accordionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  accordionTriggerRtl: { flexDirection: 'row-reverse' },
  accordionCopy: { flex: 1, gap: 2 },
  accordionTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  accordionHint: { fontSize: fontSize.xs, color: brand.textMuted, fontStyle: 'italic' },
  accordionMeta: { alignItems: 'flex-end', gap: 2 },
  accordionCount: { fontSize: 11, fontWeight: '700', color: brand.textMuted },
  accordionChevron: { fontSize: 14, color: brand.primary, fontWeight: '700' },
  accordionBody: { gap: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  accordionClosed: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: fontSize.xs,
    color: brand.textMuted,
  },
});
