import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DiagnosticChoiceRow, DiagnosticHint, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { Text } from '@/components/ui/Text';
import { fetchSecteurDetail, fetchSecteursCatalog, pickSecteurTitle } from '@/services/secteurs';
import { getEstablishmentByIdSlug } from '@/services/establishments';
import metierService, { type Metier } from '../services/metierService';
import establishmentService, { type Establishment } from '../services/establishmentService';
import { toDiagnosticEstablishment } from '../adapters/establishmentAdapter';
import {
  buildOrientationSchoolMeta,
  establishmentDiplomesList,
  establishmentDureeEtudesLabel,
} from '../utils/orientationDiagnosticSchoolMeta';
import {
  FACULTES_PUBLIQUES_DIPLOMES,
  isFacultePubliqueAccesOuvert,
  partitionFacultePublique,
} from '../utils/orientationFacultePubliqueGroup';
import { modernMetiersForSecteur } from '../data/orientationDiagnosticModernMetiers';
import {
  flattenSelectedEcoleIds,
  METIER_STEP_PREFIX,
  SCHOOLS_PER_TYPE_MAX,
  syncEcoleMultiKeys,
  syncMetierMultiKeys,
} from '../data/orientationDiagnosticQuestions';
import { formatSalaryRange } from '../utils/formatAmount';
import {
  buildMetierDetailView,
  buildSecteurDetailView,
  type MetierDetailView,
  type SecteurDetailView,
} from '../data/orientationDiagnosticMarketDetails';
import { formatBilingualName, tOd, tOdFill, type OrientationUiLocale } from '../data/orientationDiagnosticI18n';
import {
  useOrientationCatalogDetail,
  type CatalogDetailModel,
} from './OrientationCatalogDetailSheet';
import { resolveAdmissionDisplayLabel } from '../constants/establishmentAdmissionType';
import {
  normalizeOrientationPlan,
  orientationPlanLabel,
} from '../constants/establishmentOrientationPlan';
import { establishmentDisplayCities } from '../utils/orientationDiagnosticSchoolReco';
import { toggleMultiMax } from '../utils/orientationMultiToggle';
import type { DiagnosticAnswers, DiagnosticStep } from '../types/orientationDiagnosticPrototype';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { orientationPlanSortRank } from '../constants/establishmentOrientationPlan';

const DIP_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#d1fae5', text: '#047857' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#ede9fe', text: '#6d28d9' },
] as const;

function bilingualLines(
  fr: string | null | undefined,
  ar: string | null | undefined,
  locale: 'fr' | 'ar',
): { primary: string; secondary?: string; secondaryRtl: boolean } {
  const french = (fr || '').trim();
  const arabic = (ar || '').trim();
  const distinct = Boolean(french && arabic && french !== arabic);
  if (locale === 'ar' && arabic) {
    return { primary: arabic, secondary: distinct ? french : undefined, secondaryRtl: false };
  }
  return { primary: french || arabic, secondary: distinct ? arabic : undefined, secondaryRtl: true };
}

function sourceBadge(source: 'api' | 'marche' | 'mixte', locale: OrientationUiLocale): string {
  if (source === 'api') return tOd(locale, 'sourceApi');
  if (source === 'mixte') return tOd(locale, 'sourceMixte');
  return tOd(locale, 'sourceMarche');
}

function splitStoredName(value: string, locale: OrientationUiLocale) {
  const parts = value.split(' · ');
  if (parts.length < 2) {
    return { primary: value, secondary: undefined as string | undefined, secondaryRtl: locale === 'ar' };
  }
  const french = parts[0];
  const arabic = parts.slice(1).join(' · ');
  if (locale === 'ar') return { primary: arabic, secondary: french, secondaryRtl: false };
  return { primary: french, secondary: arabic, secondaryRtl: true };
}

function plainText(value?: string | null): string {
  return (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function secteurDetailModel(view: SecteurDetailView, locale: OrientationUiLocale): CatalogDetailModel {
  const names = splitStoredName(view.titre, locale);
  const sections: CatalogDetailModel['sections'] = [];
  if (view.softSkills.length) sections.push({ title: tOd(locale, 'modalSoftSkills'), chips: view.softSkills });
  if (view.avantages.length) sections.push({ title: tOd(locale, 'modalAtouts'), chips: view.avantages });
  if (view.pointsAttention.length) {
    sections.push({ title: tOd(locale, 'modalAttention'), chips: view.pointsAttention, warn: true });
  }
  if (view.bacs.length) sections.push({ title: tOd(locale, 'modalBacs'), chips: view.bacs });
  if (view.exemplesMetiers.length) {
    sections.push({ title: tOd(locale, 'modalExemplesMetiers'), chips: view.exemplesMetiers });
  }
  const meta = [
    view.nbMetiers != null ? `${view.nbMetiers} ${tOd(locale, 'metiersWord')}` : '',
    view.nbEcoles != null ? `${view.nbEcoles} ${tOd(locale, 'schoolsLinked')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return {
    eyebrow: tOd(locale, 'ficheSecteur'),
    title: names.primary,
    titleRtl: locale === 'ar',
    subtitle: names.secondary,
    subtitleRtl: names.secondaryRtl,
    source: sourceBadge(view.source, locale),
    lead: view.description,
    leadRtl: locale === 'ar',
    meta: meta || undefined,
    stats: [
      { label: tOd(locale, 'modalTendance'), value: view.tendance },
      { label: tOd(locale, 'modalSalaire'), value: view.salaireLabel },
    ],
    sections,
  };
}

function metierDetailModel(
  view: MetierDetailView,
  locale: OrientationUiLocale,
): CatalogDetailModel {
  const names = splitStoredName(view.nom, locale);
  const sector = view.secteurLabel ? splitStoredName(view.secteurLabel, locale) : null;
  const sections: CatalogDetailModel['sections'] = [];
  if (view.tendance) sections.push({ title: tOd(locale, 'modalTendance'), lines: [view.tendance] });
  if (view.missions.length) sections.push({ title: tOd(locale, 'modalMissions'), lines: view.missions });
  if (view.competences.length) sections.push({ title: tOd(locale, 'modalCompetences'), chips: view.competences });
  if (view.formations.length) sections.push({ title: tOd(locale, 'modalFormations'), chips: view.formations });
  if (view.debouches.length) sections.push({ title: tOd(locale, 'modalDebouches'), chips: view.debouches });
  return {
    eyebrow: tOd(locale, 'ficheMetier'),
    title: names.primary,
    titleRtl: locale === 'ar',
    subtitle: names.secondary,
    subtitleRtl: names.secondaryRtl,
    source: sourceBadge(view.source, locale),
    lead: view.description,
    leadRtl: locale === 'ar',
    meta: sector ? `${tOd(locale, 'modalSecteur')} · ${sector.primary}` : undefined,
    stats: [
      { label: tOd(locale, 'modalSalaireDebut'), value: view.salaireLabel },
      { label: tOd(locale, 'modalAccess'), value: view.niveauAccessibilite },
    ],
    sections,
  };
}

function schoolFeesLabel(e: Establishment, locale: OrientationUiLocale): string {
  const min = e.fraisScolariteMin;
  const max = e.fraisScolariteMax;
  if (!min && !max) return tOd(locale, 'feesNotSet');
  if (min && max && min !== max) return tOdFill(locale, 'feesRangeTpl', { min, max });
  return tOdFill(locale, 'feesSingleTpl', { v: min || max || '' });
}

function schoolDetailModel(e: Establishment, locale: OrientationUiLocale): CatalogDetailModel {
  const names = bilingualLines(
    e.sigle?.trim() ? `${e.sigle.trim()} — ${e.nom}` : e.nom,
    e.nomArabe,
    locale,
  );
  const cities = establishmentDisplayCities(e);
  const cityLabel = cities.length ? cities.join(' · ') : e.ville || '—';
  const diplomes = establishmentDiplomesList(e);
  const rawDescription = (e.description || '').trim();
  const description = plainText(rawDescription);
  const lead = description
    ? rawDescription
    : [
      e.type ? normalizeSchoolType(e.type) : '',
      cityLabel !== '—' ? cityLabel : '',
      normalizeOrientationPlan(e.orientationPlan) ? orientationPlanLabel(e.orientationPlan) : '',
      resolveAdmissionDisplayLabel(e),
    ]
      .filter(Boolean)
      .join(' · ');
  const chips = [
    e.accreditationEtat ? tOd(locale, 'chipReconnuEtat') : '',
    e.echangeInternational ? tOd(locale, 'chipEchangesIntl') : '',
    e.bacObligatoire ? tOd(locale, 'chipBacObligatoire') : '',
  ].filter(Boolean);
  const sections: CatalogDetailModel['sections'] = [];
  if (chips.length) sections.push({ title: tOd(locale, 'modalPointsCles'), chips });
  if (diplomes.length) sections.push({ title: tOd(locale, 'modalDiplomesDelivres'), chips: diplomes.slice(0, 8) });
  if (e.filieresAcceptees?.length) {
    sections.push({ title: tOd(locale, 'modalFilieresBac'), chips: e.filieresAcceptees.map(String).slice(0, 10) });
  }
  if (e.secteurs?.length) {
    sections.push({
      title: tOd(locale, 'modalSecteurs'),
      chips: e.secteurs.map((s) => s.titre).filter(Boolean).slice(0, 8),
    });
  }
  return {
    eyebrow: tOd(locale, 'ficheEtablissement'),
    title: names.primary,
    titleRtl: locale === 'ar' && Boolean(e.nomArabe?.trim()),
    subtitle: names.secondary,
    subtitleRtl: names.secondaryRtl,
    source: tOd(locale, 'sourceFicheEtawjihi'),
    lead,
    leadRtl: locale === 'ar' && !description,
    stats: [
      { label: tOd(locale, 'modalType'), value: normalizeSchoolType(e.type) || e.type || '—' },
      {
        label: tOd(locale, 'modalPlanOrientation'),
        value: normalizeOrientationPlan(e.orientationPlan) ? orientationPlanLabel(e.orientationPlan) : '—',
      },
      { label: tOd(locale, 'modalVillesCampus'), value: cityLabel },
      { label: tOd(locale, 'modalFrais'), value: schoolFeesLabel(e, locale) },
      { label: tOd(locale, 'modalDuree'), value: establishmentDureeEtudesLabel(e) || '—' },
      { label: tOd(locale, 'modalAdmission'), value: resolveAdmissionDisplayLabel(e) },
    ],
    sections,
  };
}

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

function studyYearsMax(e: Establishment): number {
  const nums: number[] = [];
  const push = (raw: unknown) => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
      nums.push(raw);
      return;
    }
    if (typeof raw !== 'string') return;
    for (const part of raw.match(/\d+(?:[.,]\d+)?/g) ?? []) {
      const n = Number(part.replace(',', '.'));
      if (Number.isFinite(n) && n > 0) nums.push(n);
    }
  };
  push(e.dureeEtudesMax);
  push(e.dureeEtudesMin);
  push(e.dureeEtudes);
  push(e.anneesEtudes);
  return nums.length ? Math.max(...nums) : 0;
}

function sortSchoolsForSelection(list: Establishment[]): Establishment[] {
  return [...list].sort((a, b) => {
    const dp = orientationPlanSortRank(a.orientationPlan) - orientationPlanSortRank(b.orientationPlan);
    if (dp !== 0) return dp;
    const dd = studyYearsMax(b) - studyYearsMax(a);
    if (dd !== 0) return dd;
    return (a.nom || '').localeCompare(b.nom || '', 'fr', { sensitivity: 'base' });
  });
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
  const detail = useOrientationCatalogDetail();
  const detailReq = useRef(0);
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

  const openSecteur = (s: (typeof secteurs)[number]) => {
    const token = ++detailReq.current;
    const base = buildSecteurDetailView(
      {
        titre: s.titre,
        titreAr: s.titreAr,
        code: s.code,
        description: s.description,
        salaire: s.salaireLabel,
        softSkills: s.softSkills,
        avantages: s.avantages,
        inconvenients: s.inconvenients,
        bacs: s.bacs,
        typeBacs: s.typeBacs,
        metiers: s.metiers,
        nbMetiers: s.nbMetiers,
        nbEcoles: s.nbEcoles,
      },
      uiLocale,
    );
    detail.open({ ...secteurDetailModel(base, uiLocale), loading: true });
    void fetchSecteurDetail(s.id, { token: accessToken })
      .then((full) => {
        if (detailReq.current !== token || !full) return;
        detail.open({
          ...secteurDetailModel(
            buildSecteurDetailView(
              {
                titre: full.titre,
                titreAr: full.titreAr,
                code: full.code,
                description: full.description,
                salaire: full.salaireLabel,
                softSkills: full.softSkills,
                avantages: full.avantages,
                inconvenients: full.inconvenients,
                bacs: full.bacs,
                typeBacs: full.typeBacs,
                metiers: full.metiers,
                nbMetiers: full.nbMetiers,
                nbEcoles: full.nbEcoles,
              },
              uiLocale,
            ),
            uiLocale,
          ),
          loading: false,
        });
      })
      .catch(() => {
        if (detailReq.current === token) detail.patch({ loading: false });
      })
      .finally(() => {
        if (detailReq.current === token) detail.patch({ loading: false });
      });
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {tOdFill(uiLocale, 'sectorsCountTpl', { n: selected.length, max })}
      </Text>
      {secteurs.map((s) => {
        const id = String(s.id);
        const on = selected.includes(id);
        const title = pickSecteurTitle(s, uiLocale);
        const names = bilingualLines(s.titre, s.titreAr, uiLocale);
        return (
          <View key={id} style={styles.choiceBlock}>
            <DiagnosticChoiceRow
              rtl={rtl}
              mode="checkbox"
              label={names.primary || title}
              secondary={names.secondary}
              secondaryRtl={names.secondaryRtl}
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
            <Pressable
              onPress={() => openSecteur(s)}
              accessibilityRole="button"
              style={[styles.ficheBtn, rtl && styles.ficheBtnRtl]}>
              <Text style={styles.ficheTxt}>
                {uiLocale === 'ar' ? tOd(uiLocale, 'seeMoreDetailRtl') : tOd(uiLocale, 'seeMoreDetail')}
              </Text>
            </Pressable>
          </View>
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
  const detail = useOrientationCatalogDetail();
  const detailReq = useRef(0);
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

  const openMetier = (m: Metier) => {
    const token = ++detailReq.current;
    const titre = sectorTitreRef.current;
    detail.open({ ...metierDetailModel(buildMetierDetailView(m, titre, undefined, uiLocale), uiLocale), loading: true });
    const numericId = Number(m.id);
    if (!Number.isFinite(numericId) || String(m.id).startsWith('mm_')) {
      detail.patch({ loading: false });
      return;
    }
    void metierService
      .getById(numericId)
      .then((res) => {
        if (detailReq.current !== token || !res.success || !res.data) return;
        detail.open({
          ...metierDetailModel(
            buildMetierDetailView(res.data, titre || res.data.secteur?.titre, res.data.secteur?.code, uiLocale),
            uiLocale,
          ),
          loading: false,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (detailReq.current === token) detail.patch({ loading: false });
      });
  };

  return (
    <View style={styles.wrap}>
      {hint ? <DiagnosticHint rtl={rtl}>{hint}</DiagnosticHint> : null}
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {selected.length}/{max}
      </Text>
      {metiers.map((m) => {
        const id = String(m.id);
        const on = selected.includes(id);
        const names = bilingualLines(m.nom, m.nomArabe, uiLocale);
        const label = names.primary || m.nom;
        const salary = formatSalaryRange(m.salaireMin, m.salaireMax, uiLocale);
        return (
          <View key={id} style={styles.choiceBlock}>
            <DiagnosticChoiceRow
              rtl={rtl}
              mode="checkbox"
              label={label}
              secondary={names.secondary}
              secondaryRtl={names.secondaryRtl}
              detail={salary || undefined}
              selected={on}
              onPress={() =>
                setAnswers((prev) => {
                  const next = toggleMultiMax(prev.multi[stepKey] ?? [], id, max);
                  const labels = {
                    ...prev.labels,
                    [id]: formatBilingualName(m.nom, m.nomArabe) || label,
                  };
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
            <Pressable
              onPress={() => openMetier(m)}
              accessibilityRole="button"
              style={[styles.ficheBtn, rtl && styles.ficheBtnRtl]}>
              <Text style={styles.ficheTxt}>
                {uiLocale === 'ar' ? tOd(uiLocale, 'seeMoreDetailRtl') : tOd(uiLocale, 'seeMoreDetail')}
              </Text>
            </Pressable>
          </View>
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
  const detail = useOrientationCatalogDetail();
  const detailReq = useRef(0);
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
    const list = q
      ? ofType.filter((e) => {
          const hay = `${pickSchoolLabel(e)} ${e.nomArabe || ''}`.toLowerCase();
          return hay.includes(q);
        })
      : ofType;
    return sortSchoolsForSelection(list);
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
          {uiLocale === 'ar' ? 'لا توجد مدارس نشطة من هذا النوع.' : 'Aucune école active pour ce type.'}
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
    const atCap = !on && selected.length >= max;
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

  const openSchool = (e: Establishment) => {
    const token = ++detailReq.current;
    detail.open({ ...schoolDetailModel(e, uiLocale), loading: Boolean(e.id && e.slug) });
    if (!e.id || !e.slug) {
      detail.patch({ loading: false });
      return;
    }
    void getEstablishmentByIdSlug(e.id, e.slug)
      .then((full) => {
        if (detailReq.current !== token || !full) return;
        detail.open({
          ...schoolDetailModel({ ...e, ...toDiagnosticEstablishment(full) }, uiLocale),
          loading: false,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (detailReq.current === token) detail.patch({ loading: false });
      });
  };

  const renderSchoolRow = (e: Establishment) => {
    if (e.id == null) return null;
    const id = String(e.id);
    const on = selected.includes(id);
    const atCap = !on && selected.length >= max;
    const names = bilingualLines(pickSchoolLabel(e), e.nomArabe, uiLocale);
    const dureeLabel = establishmentDureeEtudesLabel(e);
    const diplomes = isFacultePubliqueAccesOuvert(e)
      ? [...FACULTES_PUBLIQUES_DIPLOMES]
      : establishmentDiplomesList(e);
    const diplomeTags = diplomes.slice(0, 4);
    const logo =
      getEstablishmentLogoUrl(e.logo) || fallbackEstablishmentAvatarName(e.nom, e.sigle);
    return (
      <View
        key={id}
        style={[
          styles.schoolCard,
          on && styles.schoolCardOn,
          atCap && styles.schoolCardDim,
        ]}>
      <Pressable
        onPress={() => {
          if (atCap) return;
          toggleSchool(e);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on, disabled: atCap }}
        style={[styles.schoolMain, rtl && styles.schoolCardRtl]}>
        <Image source={{ uri: logo }} style={styles.schoolLogo} resizeMode="contain" />
        <View style={styles.schoolBody}>
          <Text
            style={[
              styles.schoolName,
              uiLocale === 'ar' && e.nomArabe?.trim() ? styles.rtlText : styles.ltrText,
            ]}>
            {names.primary}
          </Text>
          {names.secondary ? (
            <Text
              style={[
                styles.schoolSecondary,
                names.secondaryRtl ? styles.rtlText : styles.ltrText,
              ]}>
              {names.secondary}
            </Text>
          ) : null}
          {e.ville?.trim() ? (
            <Text style={[styles.schoolCity, rtl && styles.rtlText]}>{e.ville.trim()}</Text>
          ) : null}
          {dureeLabel ? (
            <Text style={[styles.schoolMetaLine, rtl && styles.rtlText]}>
              {tOd(uiLocale, 'modalDuree')}
              {'  '}
              <Text style={styles.schoolDuree}>{dureeLabel}</Text>
            </Text>
          ) : null}
          {diplomeTags.length ? (
            <View style={[styles.dipRow, rtl && styles.dipRowRtl]}>
              {diplomeTags.map((name, i) => {
                const tone = DIP_COLORS[i % DIP_COLORS.length];
                return (
                  <View key={name} style={[styles.dipTag, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.dipTagTxt, { color: tone.text }]}>{name}</Text>
                  </View>
                );
              })}
              {diplomes.length > diplomeTags.length ? (
                <View style={[styles.dipTag, styles.dipTagMore]}>
                  <Text style={styles.dipTagMoreTxt}>+{diplomes.length - diplomeTags.length}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        onPress={() => openSchool(e)}
        accessibilityRole="button"
        style={[styles.ficheBtn, styles.ficheBtnInCard, rtl && styles.ficheBtnRtl]}>
        <Text style={styles.ficheTxt}>
          {uiLocale === 'ar' ? tOd(uiLocale, 'seeSummaryRtl') : tOd(uiLocale, 'seeSummary')}
        </Text>
      </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.count, rtl && styles.rtlText]}>
        {uiLocale === 'ar'
          ? `${selected.length}/${max} · الإجمالي ${totalSelected}`
          : `${selected.length}/${max} · ${totalSelected} au total`}
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
            {(() => {
              const sample = facultes.find((school) => school.logo?.trim());
              const uri = sample?.logo ? getEstablishmentLogoUrl(sample.logo) : '';
              return uri ? (
                <Image source={{ uri }} style={styles.accordionLogo} resizeMode="contain" />
              ) : null;
            })()}
            <View style={styles.accordionCopy}>
              <Text style={[styles.accordionTitle, rtl && styles.rtlText]}>
                {tOd(uiLocale, 'schoolGroupFacultesPubliques')}
              </Text>
              <View style={[styles.dipRow, rtl && styles.dipRowRtl]}>
                {FACULTES_PUBLIQUES_DIPLOMES.map((name, i) => {
                  const tone = DIP_COLORS[i % DIP_COLORS.length];
                  return (
                    <View key={name} style={[styles.dipTag, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.dipTagTxt, { color: tone.text }]}>{name}</Text>
                    </View>
                  );
                })}
              </View>
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
  accordionLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  choiceBlock: { gap: 2 },
  ficheBtn: { alignSelf: 'flex-start', paddingHorizontal: 4, paddingBottom: 4 },
  ficheBtnRtl: { alignSelf: 'flex-end' },
  ficheBtnInCard: { paddingHorizontal: spacing.sm, marginTop: -2, marginBottom: 8 },
  ficheTxt: { color: brand.primary, fontSize: fontSize.xs, fontWeight: '800' },
  schoolCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: brand.white,
    paddingBottom: 2,
  },
  schoolMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  schoolCardRtl: { flexDirection: 'row-reverse' },
  schoolCardOn: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  schoolCardDim: { opacity: 0.55 },
  schoolLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  schoolBody: { flex: 1, minWidth: 0, gap: 3 },
  schoolName: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, lineHeight: 20 },
  schoolSecondary: { fontSize: fontSize.xs, fontWeight: '600', color: brand.textMuted, lineHeight: 16 },
  schoolCity: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },
  schoolMetaLine: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '700' },
  schoolDuree: { writingDirection: 'ltr', color: brand.text, fontWeight: '700' },
  ltrText: { writingDirection: 'ltr', textAlign: 'left' },
  dipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  dipRowRtl: { flexDirection: 'row-reverse' },
  dipTag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dipTagTxt: { fontSize: 11, fontWeight: '700', writingDirection: 'ltr' },
  dipTagMore: { backgroundColor: '#f1f5f9' },
  dipTagMoreTxt: { fontSize: 11, fontWeight: '700', color: '#475569' },
  accordionClosed: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: fontSize.xs,
    color: brand.textMuted,
  },
});
