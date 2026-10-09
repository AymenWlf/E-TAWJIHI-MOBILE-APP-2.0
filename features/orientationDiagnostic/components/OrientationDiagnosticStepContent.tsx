import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { DiagnosticChoiceRow, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { SearchablePickSheet, type SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import { SelectField } from '@/components/ui/SelectField';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { listCities, type CityRow } from '@/services/referenceData';
import { applyVersusWinner, hydrateVersusSchoolVisuals } from '../utils/orientationDiagnosticVersus';
import {
  formatBilingualName,
  localizeAmbitionLabel,
  localizeStep,
  RIASEC_LIKERT_AR,
  tOd,
  type OrientationUiLocale,
} from '../data/orientationDiagnosticI18n';
import {
  orientationPlanLabel,
} from '../constants/establishmentOrientationPlan';
import { findModernMetierName } from '../data/orientationDiagnosticModernMetiers';
import type {
  ChoiceOption,
  DiagnosticAnswers,
  DiagnosticStep,
  Likert5,
} from '../types/orientationDiagnosticPrototype';
import { OrientationDiagnosticProfileSteps } from './OrientationDiagnosticProfileSteps';
import {
  OrientationDynamicMetiersStep,
  OrientationDynamicSchoolsStep,
  OrientationDynamicSectorsStep,
} from './OrientationDiagnosticCatalogSteps';
import {
  FunctioningBinaryChoices,
  FunctioningDilemmaChoices,
  FunctioningScaleChoices,
} from './OrientationFunctioningChoices';
import {
  isMetierSectorStepId,
  sectorIdFromMetierStepId,
  syncEcoleMultiKeys,
} from '../data/orientationDiagnosticQuestions';
import { toggleMultiMax } from '../utils/orientationMultiToggle';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

function versusSectorLine(value: string, locale: OrientationUiLocale) {
  const splitAt = value.indexOf(' · ');
  const french = (splitAt > 0 ? value.slice(0, splitAt) : value).trim();
  const arabic = (splitAt > 0 ? value.slice(splitAt + 3) : '').trim();
  if (locale === 'ar') return { text: arabic || french, rtl: true };
  return { text: french || arabic, rtl: false };
}

function versusMetierSector(
  opt: ChoiceOption,
  answers: DiagnosticAnswers,
  locale: OrientationUiLocale,
) {
  let raw = (opt.secteurLabel || '').trim();
  if (!raw) {
    const labels = answers.labels || {};
    for (const [stepId, ids] of Object.entries(answers.multi || {})) {
      if (!isMetierSectorStepId(stepId) || !(ids || []).includes(opt.id)) continue;
      const sectorId = sectorIdFromMetierStepId(stepId);
      raw = (sectorId ? labels[sectorId] : '').trim();
      if (raw) break;
    }
  }
  if (!raw) {
    const embedded = opt.id.match(/_s(\d+)/);
    raw = (embedded ? answers.labels?.[embedded[1]] : '').trim();
  }
  if (!raw) {
    const found = findModernMetierName(opt.id, opt.label);
    if (found?.secteurTitre) raw = formatBilingualName(found.secteurTitre, found.secteurTitreAr);
  }
  if (!raw || /^Secteur \d+$/i.test(raw)) return null;
  return versusSectorLine(raw, locale);
}

function versusMetierLines(id: string, label: string, locale: OrientationUiLocale) {
  const found = findModernMetierName(id, label);
  const splitAt = label.indexOf(' · ');
  const french = (found?.nom ?? (splitAt > 0 ? label.slice(0, splitAt) : label)).trim();
  const arabic = (found?.nomArabe ?? (splitAt > 0 ? label.slice(splitAt + 3) : '')).trim();
  const distinct = Boolean(french && arabic && french !== arabic);
  if (locale === 'ar' && arabic) {
    return {
      primary: arabic,
      secondary: distinct ? french : '',
      primaryRtl: true,
      secondaryRtl: false,
    };
  }
  return {
    primary: french || arabic,
    secondary: distinct ? arabic : '',
    primaryRtl: false,
    secondaryRtl: true,
  };
}

const DIP_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#d1fae5', text: '#047857' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#ede9fe', text: '#6d28d9' },
] as const;

function parseVersusSchoolLabel(label: string): { fr: string; ar: string; ville: string } {
  const cityMatch = label.match(/^(.*?)(?:\s*\(([^)]+)\))\s*$/);
  const core = (cityMatch ? cityMatch[1] : label).trim();
  const ville = cityMatch?.[2]?.trim() || '';
  const idx = core.indexOf(' · ');
  if (idx > 0) {
    return { fr: core.slice(0, idx).trim(), ar: core.slice(idx + 3).trim(), ville };
  }
  return { fr: core, ar: '', ville };
}

function versusSchoolLines(opt: ChoiceOption, locale: OrientationUiLocale) {
  const parsed = parseVersusSchoolLabel(opt.label);
  const french = opt.nom || opt.sigle
    ? opt.sigle?.trim()
      ? `${opt.sigle.trim()} — ${(opt.nom || '').trim()}`
      : (opt.nom || '').trim()
    : parsed.fr;
  const arabic = (opt.nomArabe || parsed.ar || '').trim();
  const distinct = Boolean(french && arabic && french !== arabic);
  const ville = (opt.ville || parsed.ville || '').trim();
  if (locale === 'ar' && arabic) {
    return {
      primary: arabic,
      secondary: distinct ? french : '',
      primaryRtl: true,
      secondaryRtl: false,
      ville,
    };
  }
  return {
    primary: french || arabic,
    secondary: distinct ? arabic : '',
    primaryRtl: false,
    secondaryRtl: true,
    ville,
  };
}

function versusSchoolLogoUri(opt: ChoiceOption): string {
  return (
    (opt.logo ? getEstablishmentLogoUrl(opt.logo) : null) ||
    fallbackEstablishmentAvatarName(opt.nom || opt.label, opt.sigle)
  );
}

const LEGACY_STUDY_CITY: Record<string, string> = {
  casa: 'Casablanca',
  rabat: 'Rabat',
  marrakech: 'Marrakech',
  tanger: 'Tanger',
  fes: 'Fès',
};

const FLEX_CITY = 'peuimporte';
const FLEX_CITY_LABEL = 'Peu importe — partout au Maroc';

function selectedStudyCityNames(answers: DiagnosticAnswers): string[] {
  const selected = answers.cities ?? [];
  if (selected.includes(FLEX_CITY)) return [FLEX_CITY];
  const names: string[] = [];
  for (const id of selected) {
    if (id === 'autres' || id === FLEX_CITY) continue;
    const name = LEGACY_STUDY_CITY[id] || id;
    if (name && !names.includes(name)) names.push(name);
  }
  for (const raw of answers.cityOther ?? []) {
    const name = raw.trim();
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

export function OrientationDiagnosticStepContent({
  step,
  answers,
  setAnswers,
  uiLocale,
  rtl,
  situationPhase,
  onCatalogLoadingChange,
  accessToken,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
  situationPhase: 'most' | 'least';
  onCatalogLoadingChange?: (v: boolean) => void;
  accessToken?: string | null;
}) {
  const displayStep = useMemo(() => localizeStep(step, uiLocale), [step, uiLocale]);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (step.kind !== 'versus' || step.versusType !== 'ecole') return;
    const missing = (step.options ?? []).some((option) => /^\d+$/.test(option.id) && !option.nom);
    if (!missing) return;
    let cancelled = false;
    void hydrateVersusSchoolVisuals(answersRef.current).then((next) => {
      if (!cancelled && next) setAnswers(next);
    });
    return () => {
      cancelled = true;
    };
  }, [setAnswers, step.id, step.kind, step.options, step.versusType]);

  if (
    step.kind === 'profile_identity' ||
    step.kind === 'profile_school' ||
    step.kind === 'profile_grades'
  ) {
    return (
      <OrientationDiagnosticProfileSteps
        step={step}
        profile={answers.profile}
        onChange={(patch) =>
          setAnswers((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }))
        }
        uiLocale={uiLocale}
        rtl={rtl}
      />
    );
  }

  if (step.kind === 'dynamic_sectors') {
    return (
      <OrientationDynamicSectorsStep
        step={step}
        answers={answers}
        setAnswers={setAnswers}
        uiLocale={uiLocale}
        rtl={rtl}
        onLoadingChange={onCatalogLoadingChange}
        accessToken={accessToken}
      />
    );
  }

  if (step.kind === 'dynamic_metiers') {
    return (
      <OrientationDynamicMetiersStep
        step={step}
        answers={answers}
        setAnswers={setAnswers}
        uiLocale={uiLocale}
        rtl={rtl}
        onLoadingChange={onCatalogLoadingChange}
      />
    );
  }

  if (step.kind === 'dynamic_schools') {
    return (
      <OrientationDynamicSchoolsStep
        step={step}
        answers={answers}
        setAnswers={setAnswers}
        uiLocale={uiLocale}
        rtl={rtl}
        onLoadingChange={onCatalogLoadingChange}
      />
    );
  }

  if (step.kind === 'likert') {
    const opts = (displayStep.options ?? []).map((opt) => ({
      id: opt.id,
      label:
        uiLocale === 'ar' ? RIASEC_LIKERT_AR[opt.id] ?? opt.label : opt.label,
    }));
    const selectedId =
      answers.likert[step.id] != null ? String(answers.likert[step.id]) : undefined;

    if (step.module === 'functioning') {
      return (
        <FunctioningScaleChoices
          options={opts}
          selectedId={selectedId}
          rtl={rtl}
          lowHint={uiLocale === 'ar' ? 'أقل ملاءمة' : 'Moins adapté'}
          highHint={uiLocale === 'ar' ? 'أكثر ملاءمة' : 'Plus adapté'}
          onSelect={(id) =>
            setAnswers((prev) => ({
              ...prev,
              likert: { ...prev.likert, [step.id]: Number(id) as Likert5 },
            }))
          }
        />
      );
    }

    return (
      <View style={styles.gap}>
        {opts.map((opt) => {
          const val = Number(opt.id) as Likert5;
          const on = answers.likert[step.id] === val;
          return (
            <DiagnosticChoiceRow
              key={opt.id}
              rtl={rtl}
              label={opt.label}
              degreeId={opt.id}
              selected={on}
              onPress={() =>
                setAnswers((prev) => ({
                  ...prev,
                  likert: { ...prev.likert, [step.id]: val },
                }))
              }
            />
          );
        })}
      </View>
    );
  }

  if (step.kind === 'single') {
    // amb_priorite : options remplies depuis les 3 moteurs choisis (amb_top3).
    const opts =
      step.id === 'amb_priorite'
        ? (answers.multi.amb_top3 ?? []).map((id) => ({
            id,
            label: localizeAmbitionLabel(id, uiLocale),
          }))
        : (displayStep.options ?? []);
    const selectedId = answers.single[step.id];

    if (step.id === 'amb_priorite' && opts.length === 0) {
      return (
        <View style={styles.gap}>
          <Text style={[styles.emptyHint, rtl && styles.rtlText]}>
            {uiLocale === 'ar'
              ? 'ارجع إلى الخطوة السابقة واختر ثلاثة دوافع أولاً.'
              : 'Reviens à l’étape précédente et sélectionne d’abord 3 moteurs.'}
          </Text>
        </View>
      );
    }

    if (step.module === 'functioning' && opts.length === 2) {
      return (
        <FunctioningBinaryChoices
          options={opts.map((o) => ({ id: o.id, label: o.label }))}
          selectedId={selectedId}
          rtl={rtl}
          onSelect={(id) =>
            setAnswers((prev) => ({
              ...prev,
              single: { ...prev.single, [step.id]: id },
            }))
          }
        />
      );
    }

    if (step.module === 'functioning' && opts.length >= 4) {
      return (
        <FunctioningScaleChoices
          options={opts.map((o) => ({ id: o.id, label: o.label }))}
          selectedId={selectedId}
          rtl={rtl}
          lowHint={uiLocale === 'ar' ? 'الخيار أ' : 'Pôle A'}
          highHint={uiLocale === 'ar' ? 'الخيار ب' : 'Pôle B'}
          onSelect={(id) =>
            setAnswers((prev) => ({
              ...prev,
              single: { ...prev.single, [step.id]: id },
            }))
          }
        />
      );
    }

    return (
      <View style={styles.gap}>
        {opts.map((opt) => {
          const on = selectedId === opt.id;
          return (
            <DiagnosticChoiceRow
              key={opt.id}
              rtl={rtl}
              label={opt.label}
              selected={on}
              onPress={() =>
                setAnswers((prev) => ({
                  ...prev,
                  single: { ...prev.single, [step.id]: opt.id },
                }))
              }
            />
          );
        })}
      </View>
    );
  }

  if (step.kind === 'multi_max') {
    const max = step.maxSelect ?? 3;
    const selected = answers.multi[step.id] ?? [];
    const showRank = step.id === 'amb_top3';
    const opts = displayStep.options ?? [];
    return (
      <View style={styles.gap}>
        {opts.map((opt) => {
          const on = selected.includes(opt.id);
          return (
            <DiagnosticChoiceRow
              key={opt.id}
              rtl={rtl}
              mode="checkbox"
              label={
                on && showRank
                  ? `${opt.label} · ${selected.indexOf(opt.id) + 1}`
                  : opt.label
              }
              selected={on}
              onPress={() =>
                setAnswers((prev) => {
                  const next = toggleMultiMax(prev.multi[step.id] ?? [], opt.id, max);
                  let multi = { ...prev.multi, [step.id]: next };
                  if (step.id === 'sch_types') {
                    multi = syncEcoleMultiKeys(multi, next);
                  }
                  const single = { ...prev.single };
                  if (
                    step.id === 'amb_top3' &&
                    single.amb_priorite &&
                    !next.includes(single.amb_priorite)
                  ) {
                    delete single.amb_priorite;
                  }
                  return { ...prev, multi, single };
                })
              }
            />
          );
        })}
      </View>
    );
  }

  if (step.kind === 'situation') {
    const sit = answers.situations[step.id] ?? { most: '', least: '' };
    const isMost = situationPhase === 'most';
    const opts = displayStep.options ?? [];
    return (
      <View style={styles.gap}>
        <View style={[styles.situationHintRow, rtl && styles.situationHintRowRtl]}>
          {isMost ? (
            <View style={[styles.situationPill, styles.situationPillMost]}>
              <Text style={styles.situationPillTxtMost}>
                {tOd(uiLocale, 'situationPhaseMost')}
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.situationPill, styles.situationPillMost]}>
                <Text style={styles.situationPillTxtMost}>
                  {tOd(uiLocale, 'situationPhasePlusDone')}
                </Text>
              </View>
              <View style={[styles.situationPill, styles.situationPillLeast]}>
                <Text style={styles.situationPillTxtLeast}>
                  {tOd(uiLocale, 'situationPhaseLeast')}
                </Text>
              </View>
            </>
          )}
        </View>
        {opts.map((opt) => {
          const id = opt.id;
          const isPlus = sit.most === id;
          const isMoins = sit.least === id;
          const lockedPlus = !isMost && isPlus;
          const selected = isMost ? isPlus : isMoins;
          const accent = isPlus ? 'plus' : isMoins ? 'moins' : undefined;
          return (
            <DiagnosticChoiceRow
              key={id}
              rtl={rtl}
              label={opt.label}
              selected={selected || lockedPlus}
              accent={accent}
              disabled={lockedPlus}
              onPress={() => {
                if (lockedPlus) return;
                setAnswers((prev) => {
                  const cur = prev.situations[step.id] ?? { most: '', least: '' };
                  if (isMost) {
                    return {
                      ...prev,
                      situations: {
                        ...prev.situations,
                        [step.id]: { most: id, least: '' },
                      },
                    };
                  }
                  return {
                    ...prev,
                    situations: {
                      ...prev.situations,
                      [step.id]: { most: cur.most, least: id },
                    },
                  };
                });
              }}
            />
          );
        })}
      </View>
    );
  }

  if (step.kind === 'dilemma') {
    const value = answers.sliders[step.id];
    const left = displayStep.leftLabel ?? 'A';
    const right = displayStep.rightLabel ?? 'B';
    return (
      <FunctioningDilemmaChoices
        leftLabel={left}
        rightLabel={right}
        midLabel={tOd(uiLocale, 'dilemmaEqual')}
        value={value}
        rtl={rtl}
        onSelect={(score) =>
          setAnswers((prev) => ({
            ...prev,
            sliders: { ...prev.sliders, [step.id]: score },
          }))
        }
      />
    );
  }

  if (step.kind === 'cities') {
    return (
      <CitiesStepMobile
        step={displayStep}
        answers={answers}
        setAnswers={setAnswers}
        uiLocale={uiLocale}
        rtl={rtl}
      />
    );
  }

  if (step.kind === 'versus') {
    const winner = answers.single[step.id];
    const opts = displayStep.options ?? [];
    const kindLabel =
      step.versusType === 'ecole'
        ? tOd(uiLocale, 'versusKindEcole')
        : tOd(uiLocale, 'versusKindMetier');
    const hint =
      step.versusType === 'ecole'
        ? tOd(uiLocale, 'versusHintEcole')
        : tOd(uiLocale, 'versusHintMetier');

    const pick = (opt: (typeof opts)[number]) => {
      setAnswers((prev) => {
        let next = applyVersusWinner(prev, step.id, {
          id: opt.id,
          label: opt.label,
          orientationPlan: opt.orientationPlan,
          admissionType: opt.admissionType,
          admissionLabel: opt.admissionLabel,
          seed: opt.seed,
        });
        if (step.versusType === 'ecole') {
          next = {
            ...next,
            schoolMeta: {
              ...(next.schoolMeta || {}),
              [opt.id]: {
                ...(next.schoolMeta?.[opt.id] || {}),
                orientationPlan: opt.orientationPlan ?? null,
                admissionType: opt.admissionType ?? null,
                admissionLabel: opt.admissionLabel ?? null,
              },
            },
          };
        }
        return next;
      });
    };

    return (
      <View style={styles.versusArena}>
        <View style={[styles.versusMetaRow, rtl && styles.versusMetaRowRtl]}>
          <View style={styles.versusKindPill}>
            <Text style={styles.versusKindPillTxt}>{kindLabel}</Text>
          </View>
          <Text style={[styles.versusHintInline, rtl && styles.rtlText]}>{hint}</Text>
        </View>

        {opts.map((opt, idx) => {
          const on = winner === opt.id;
          const dim = Boolean(winner) && !on;
          const seed = opt.seed != null ? opt.seed : idx === 0 ? 1 : 2;
          const role =
            seed === 1
              ? tOd(uiLocale, 'versusFavorite')
              : seed >= 9
                ? tOd(uiLocale, 'versusChallenger')
                : null;
          const card = (
            <Pressable
              onPress={() => pick(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                styles.versusCard,
                on && styles.versusCardOn,
                dim && styles.versusCardDim,
                pressed && styles.versusCardPressed,
              ]}>
              <View style={[styles.versusCardTop, rtl && styles.versusCardTopRtl]}>
                <View style={[styles.versusSeedBadge, on && styles.versusSeedBadgeOn]}>
                  <Text style={[styles.versusSeedTxt, on && styles.versusSeedTxtOn]}>
                    #{seed}
                  </Text>
                </View>
                {role ? (
                  <Text style={[styles.versusRole, on && styles.versusRoleOn]}>{role}</Text>
                ) : (
                  <View />
                )}
              </View>
              {step.versusType === 'metier' ? (
                (() => {
                  const names = versusMetierLines(opt.id, opt.label, uiLocale);
                  const sector = versusMetierSector(opt, answers, uiLocale);
                  return (
                    <View style={rtl ? styles.versusNameRtl : undefined}>
                      <Text
                        style={[
                          styles.versusLabel,
                          names.primaryRtl && styles.rtlText,
                          on && styles.versusLabelOn,
                        ]}>
                        {names.primary}
                      </Text>
                      {names.secondary ? (
                        <Text
                          style={[
                            styles.versusLabelSecondary,
                            names.secondaryRtl ? styles.rtlText : styles.versusLabelLtr,
                            rtl && !names.secondaryRtl && styles.versusLabelAlignEnd,
                          ]}>
                          {names.secondary}
                        </Text>
                      ) : null}
                      {sector ? (
                        <View style={[styles.versusSectorPill, rtl && styles.versusSectorPillRtl]}>
                          <Text style={[styles.versusSectorTxt, sector.rtl && styles.rtlText]}>
                            {sector.text}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })()
              ) : (
                (() => {
                  const face = versusSchoolLines(opt, uiLocale);
                  const diplomes = opt.diplomes || [];
                  const diplomeTags = diplomes.slice(0, 4);
                  return (
                    <View style={[styles.versusSchool, rtl && styles.versusSchoolRtl]}>
                      <Image
                        source={{ uri: versusSchoolLogoUri(opt) }}
                        style={styles.versusLogo}
                        resizeMode="contain"
                      />
                      <View style={styles.versusSchoolBody}>
                        <Text
                          style={[
                            styles.versusSchoolName,
                            face.primaryRtl && styles.rtlText,
                            on && styles.versusLabelOn,
                          ]}>
                          {face.primary}
                        </Text>
                        {face.secondary ? (
                          <Text
                            style={[
                              styles.versusLabelSecondary,
                              face.secondaryRtl ? styles.rtlText : styles.versusLabelLtr,
                            ]}>
                            {face.secondary}
                          </Text>
                        ) : null}
                        {face.ville ? (
                          <Text style={[styles.versusCity, rtl && styles.rtlText]}>{face.ville}</Text>
                        ) : null}
                        {opt.dureeEtudes ? (
                          <Text style={[styles.versusCity, rtl && styles.rtlText]}>
                            {tOd(uiLocale, 'modalDuree')}
                            {'  '}
                            <Text style={styles.versusDuree}>{opt.dureeEtudes}</Text>
                          </Text>
                        ) : null}
                        {diplomeTags.length ? (
                          <View style={[styles.versusDipRow, rtl && styles.versusDipRowRtl]}>
                            {diplomeTags.map((name, i) => {
                              const tone = DIP_COLORS[i % DIP_COLORS.length];
                              return (
                                <View key={name} style={[styles.versusDip, { backgroundColor: tone.bg }]}>
                                  <Text style={[styles.versusDipTxt, { color: tone.text }]}>{name}</Text>
                                </View>
                              );
                            })}
                            {diplomes.length > diplomeTags.length ? (
                              <View style={[styles.versusDip, styles.versusDipMore]}>
                                <Text style={styles.versusDipMoreTxt}>
                                  +{diplomes.length - diplomeTags.length}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                        {opt.orientationPlan || opt.admissionLabel ? (
                          <View style={[styles.versusDipRow, rtl && styles.versusDipRowRtl]}>
                            {opt.orientationPlan ? (
                              <Text style={styles.versusTag}>
                                {orientationPlanLabel(opt.orientationPlan)}
                              </Text>
                            ) : null}
                            {opt.admissionLabel ? (
                              <Text style={styles.versusTag}>{opt.admissionLabel}</Text>
                            ) : null}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })()
              )}
              <View style={[styles.versusFooter, rtl && styles.versusFooterRtl]}>
                {on ? (
                  <View style={[styles.versusWin, rtl && styles.versusFooterRtl]}>
                    <FontAwesome name="check" size={12} color={brand.white} />
                    <Text style={styles.versusWinTxt}>{tOd(uiLocale, 'versusChosen')}</Text>
                  </View>
                ) : (
                  <Text style={styles.versusTap}>{tOd(uiLocale, 'versusTapToChoose')}</Text>
                )}
              </View>
            </Pressable>
          );

          if (idx === 0) {
            return (
              <View key={opt.id} style={styles.versusStack}>
                {card}
                <View style={styles.versusMid}>
                  <View style={styles.versusMidLine} />
                  <View style={styles.versusBanner}>
                    <Text style={styles.versusVs}>VS</Text>
                  </View>
                  <View style={styles.versusMidLine} />
                </View>
              </View>
            );
          }
          return <View key={opt.id}>{card}</View>;
        })}
      </View>
    );
  }

  return null;
}


function applyStudyCityToggle(current: string[], picked: string): string[] {
  if (picked === FLEX_CITY) {
    return current.includes(FLEX_CITY) ? [] : [FLEX_CITY];
  }
  const withoutFlex = current.filter((name) => name !== FLEX_CITY);
  return withoutFlex.includes(picked)
    ? withoutFlex.filter((name) => name !== picked)
    : [...withoutFlex, picked];
}

function CitiesStepMobile({
  answers,
  setAnswers,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
}) {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void listCities(1000)
      .then((rows) => {
        if (alive) setCities(rows);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedNames = selectedStudyCityNames(answers);
  const flexible = selectedNames.includes(FLEX_CITY);
  const chosen = selectedNames.filter((name) => name !== FLEX_CITY);

  const items = useMemo<SearchablePickItem[]>(() => {
    return [...cities]
      .filter((c) => c.titre?.trim())
      .sort((a, b) => a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' }))
      .map((c) => ({
        id: String(c.id),
        value: c.titre,
        label: c.titre,
        subtitle: c.region?.titre,
      }));
  }, [cities]);

  const toggle = (picked: string) => {
    setAnswers((prev) => ({
      ...prev,
      cities: applyStudyCityToggle(selectedStudyCityNames(prev), picked),
      cityOther: [],
    }));
  };

  return (
    <View style={styles.cityField}>
      <Pressable
        onPress={() => toggle(FLEX_CITY)}
        accessibilityRole="button"
        accessibilityState={{ selected: flexible }}
        style={[styles.flexCity, flexible && styles.flexCityOn]}>
        <Text style={[styles.flexCityTxt, flexible && styles.flexCityTxtOn]}>{FLEX_CITY_LABEL}</Text>
      </Pressable>
      <SelectField
        label="Villes"
        hint="Appuyez sur le champ pour rechercher et choisir plusieurs villes."
        value=""
        rtl={false}
        loading={loading}
        loadingLabel="Chargement des villes…"
        disabled={!loading && cities.length === 0}
        onPress={() => setOpen(true)}
      />
      {chosen.length > 0 ? (
        <View style={styles.cityChips}>
          {chosen.map((name) => (
            <View key={name} style={styles.cityChip}>
              <Text style={styles.cityChipTxt}>{name}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <SearchablePickSheet
        visible={open}
        title="Sélectionnez vos villes"
        searchPlaceholder="Rechercher une ville…"
        emptyLabel="Aucune ville trouvée"
        allLabel="Choisir des villes…"
        items={items}
        selectedValue=""
        selectedValues={chosen}
        multiSelect
        closeOnPick={false}
        confirmLabel="Confirmer"
        rtl={false}
        onPick={toggle}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.sm, paddingBottom: spacing.xl },
  emptyHint: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 20,
    paddingVertical: spacing.sm,
  },
  cityField: { paddingBottom: spacing.sm, gap: spacing.sm },
  flexCity: {
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  flexCityOn: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  flexCityTxt: { fontSize: fontSize.sm, fontWeight: '700', color: brand.text },
  flexCityTxtOn: { color: brand.primary },
  cityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityChip: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cityChipTxt: { fontSize: 12, fontWeight: '700', color: brand.primary },
  situationHintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  situationHintRowRtl: { flexDirection: 'row-reverse' },
  situationPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  situationPillMost: { backgroundColor: '#d1fae5' },
  situationPillLeast: { backgroundColor: '#fee2e2' },
  situationPillTxtMost: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  situationPillTxtLeast: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b91c1c',
  },
  versusArena: { gap: spacing.sm, paddingBottom: spacing.xl },
  versusMetaRow: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  versusMetaRowRtl: { alignItems: 'flex-end' },
  versusKindPill: {
    alignSelf: 'flex-start',
    backgroundColor: brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  versusKindPillTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  versusHintInline: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 20,
    fontWeight: '600',
  },
  versusStack: { gap: 0 },
  versusMid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  versusMidLine: {
    flex: 1,
    height: 1,
    backgroundColor: diagnosticTheme.fieldBorder,
  },
  versusBanner: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: brand.primary,
    borderRadius: 999,
  },
  versusVs: { color: brand.white, fontWeight: '900', letterSpacing: 2, fontSize: 13 },
  versusCard: {
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: brand.white,
    gap: 8,
    minHeight: 120,
  },
  versusCardOn: {
    borderColor: homeShell.green,
    backgroundColor: '#ecfdf5',
  },
  versusCardDim: { opacity: 0.55 },
  versusCardPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  versusCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versusCardTopRtl: { flexDirection: 'row-reverse' },
  versusSeedBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  versusSeedBadgeOn: { backgroundColor: homeShell.green },
  versusSeedTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: brand.primary,
  },
  versusSeedTxtOn: { color: brand.white },
  versusRole: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  versusRoleOn: { color: '#047857' },
  versusLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 24,
  },
  versusLabelOn: { color: '#065f46' },
  versusNameRtl: { alignItems: 'flex-end' },
  versusLabelSecondary: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 20,
  },
  versusLabelLtr: { writingDirection: 'ltr', textAlign: 'left' },
  versusLabelAlignEnd: { textAlign: 'right' },
  versusSectorPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: homeShell.greenSurface,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  versusSectorPillRtl: { alignSelf: 'flex-end' },
  versusSectorTxt: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.greenDark,
  },
  versusSchool: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  versusSchoolRtl: { flexDirection: 'row-reverse' },
  versusLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  versusSchoolBody: { flex: 1, minWidth: 0, gap: 3 },
  versusSchoolName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 20,
  },
  versusCity: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },
  versusDuree: { writingDirection: 'ltr', color: brand.text, fontWeight: '700' },
  versusDipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  versusDipRowRtl: { flexDirection: 'row-reverse' },
  versusDip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  versusDipTxt: { fontSize: 11, fontWeight: '700', writingDirection: 'ltr' },
  versusDipMore: { backgroundColor: '#f1f5f9' },
  versusDipMoreTxt: { fontSize: 11, fontWeight: '700', color: '#475569' },
  versusTag: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },
  versusFooter: { marginTop: 2 },
  versusFooterRtl: { alignItems: 'flex-end' },
  versusTap: {
    fontSize: 12,
    fontWeight: '700',
    color: brand.primary,
  },
  versusWin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: homeShell.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  versusWinTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '800' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
