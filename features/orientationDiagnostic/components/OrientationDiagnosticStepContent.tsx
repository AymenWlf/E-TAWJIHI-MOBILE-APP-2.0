import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  DiagnosticChoiceRow,
  DiagnosticChip,
  DiagnosticChipGrid,
  DiagnosticFieldLabel,
  DiagnosticFormBlock,
  DiagnosticTextInput,
  diagnosticTheme,
} from '@/components/diagnostic/DiagnosticUi';
import { Text } from '@/components/ui/Text';
import { listCities, type CityRow } from '@/services/referenceData';
import { applyVersusWinner } from '../utils/orientationDiagnosticVersus';
import {
  localizeAmbitionLabel,
  localizeStep,
  RIASEC_LIKERT_AR,
  tOd,
  tOdFill,
  type OrientationUiLocale,
} from '../data/orientationDiagnosticI18n';
import {
  orientationPlanLabel,
} from '../constants/establishmentOrientationPlan';
import type {
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
import { syncEcoleMultiKeys } from '../data/orientationDiagnosticQuestions';
import { toggleMultiMax } from '../utils/orientationMultiToggle';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { useEffect } from 'react';

const PRIMARY_CITY_LABELS = new Set([
  'casablanca',
  'rabat',
  'marrakech',
  'tanger',
  'fès',
  'fes',
]);

const QUICK_OTHER_CITIES = [
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'El Jadida',
  'Tétouan',
  'Safi',
  'Nador',
  'Mohammedia',
  'Beni Mellal',
];

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
              ? 'ارجع خطوة للخلف واختر 3 محركات أولاً.'
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
          lowHint={uiLocale === 'ar' ? 'قطب أ' : 'Pôle A'}
          highHint={uiLocale === 'ar' ? 'قطب ب' : 'Pôle B'}
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
          const tone = isPlus ? 'most' : isMoins ? 'least' : undefined;
          const badge = isPlus
            ? tOd(uiLocale, 'plusBadge')
            : isMoins
              ? tOd(uiLocale, 'moinsBadge')
              : undefined;
          return (
            <DiagnosticChoiceRow
              key={id}
              rtl={rtl}
              label={opt.label}
              selected={selected || lockedPlus}
              tone={tone}
              badge={badge}
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
              <Text style={[styles.versusLabel, rtl && styles.rtlText, on && styles.versusLabelOn]}>
                {opt.label}
              </Text>
              {step.versusType === 'ecole' && opt.orientationPlan ? (
                <Text style={styles.versusTag}>
                  {orientationPlanLabel(opt.orientationPlan)}
                </Text>
              ) : null}
              {step.versusType === 'ecole' && opt.admissionLabel ? (
                <Text style={styles.versusTag}>{opt.admissionLabel}</Text>
              ) : null}
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

function CitiesStepMobile({
  step,
  answers,
  setAnswers,
  uiLocale,
  rtl,
}: {
  step: DiagnosticStep;
  answers: DiagnosticAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<DiagnosticAnswers>>;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
}) {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [query, setQuery] = useState('');
  const selected = answers.cities ?? [];
  const others = answers.cityOther ?? [];
  const flexible = selected.includes('peuimporte');
  const showOther = selected.includes('autres');

  useEffect(() => {
    void listCities(2000).then(setCities).catch(() => undefined);
  }, []);

  const primaryOpts = (step.options ?? []).filter(
    (o) => o.id !== 'autres' && o.id !== 'peuimporte',
  );
  const autresOpt = (step.options ?? []).find((o) => o.id === 'autres');
  const flexOpt = (step.options ?? []).find((o) => o.id === 'peuimporte');

  const availableOther = useMemo(
    () =>
      cities
        .map((c) => c.titre)
        .filter((n): n is string => Boolean(n))
        .filter((n) => !PRIMARY_CITY_LABELS.has(n.toLowerCase())),
    [cities],
  );

  const quickOthers = useMemo(
    () =>
      QUICK_OTHER_CITIES.map(
        (name) =>
          availableOther.find((c) => c.toLowerCase() === name.toLowerCase()) || name,
      ).filter((name) =>
        availableOther.some((c) => c.toLowerCase() === name.toLowerCase()),
      ),
    [availableOther],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return availableOther.filter((n) => n.toLowerCase().includes(q)).slice(0, 30);
  }, [availableOther, query]);

  const searchTotal = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return 0;
    return availableOther.filter((n) => n.toLowerCase().includes(q)).length;
  }, [availableOther, query]);

  const summaryLabels = [
    ...primaryOpts.filter((o) => selected.includes(o.id)).map((o) => o.label),
    ...others,
  ];

  const toggleCityId = (optId: string) => {
    setAnswers((prev) => {
      let nextCities = prev.cities ?? [];
      let cityOther = [...(prev.cityOther ?? [])];
      if (optId === 'peuimporte') {
        const on = nextCities.includes('peuimporte');
        nextCities = on ? [] : ['peuimporte'];
        cityOther = [];
        if (!on) setQuery('');
      } else {
        nextCities = nextCities.filter((c) => c !== 'peuimporte');
        if (nextCities.includes(optId)) {
          nextCities = nextCities.filter((c) => c !== optId);
          if (optId === 'autres') {
            cityOther = [];
            setQuery('');
          }
        } else {
          nextCities = [...nextCities, optId];
        }
      }
      return { ...prev, cities: nextCities, cityOther };
    });
  };

  const toggleOther = (name: string) => {
    setAnswers((prev) => {
      const cur = prev.cityOther ?? [];
      const next = cur.includes(name) ? cur.filter((c) => c !== name) : [...cur, name];
      let citiesList = prev.cities ?? [];
      if (!citiesList.includes('autres')) {
        citiesList = [...citiesList.filter((c) => c !== 'peuimporte'), 'autres'];
      }
      return { ...prev, cities: citiesList, cityOther: next };
    });
  };

  return (
    <DiagnosticFormBlock rtl={rtl}>
      {!flexible && summaryLabels.length > 0 ? (
        <View style={styles.citiesSummary}>
          <Text style={[styles.citiesSummaryLabel, rtl && styles.rtlText]}>
            {tOdFill(uiLocale, 'citiesRetainedTpl', {
              n: summaryLabels.length,
              s: summaryLabels.length > 1 ? 's' : '',
            })}
          </Text>
          <DiagnosticChipGrid rtl={rtl}>
            {summaryLabels.map((name) => {
              const primary = primaryOpts.find((o) => o.label === name);
              return (
                <DiagnosticChip
                  key={name}
                  label={`✕ ${name}`}
                  selected
                  rtl={rtl}
                  onPress={() => {
                    if (primary) toggleCityId(primary.id);
                    else toggleOther(name);
                  }}
                />
              );
            })}
          </DiagnosticChipGrid>
        </View>
      ) : null}

      {flexible ? (
        <View style={styles.citiesFlexBanner}>
          <Text style={[styles.citiesFlexTitle, rtl && styles.rtlText]}>
            {tOd(uiLocale, 'citiesFlexibleTitle')}
          </Text>
          <Text style={[styles.citiesFlexSub, rtl && styles.rtlText]}>
            {tOd(uiLocale, 'citiesFlexibleSub')}
          </Text>
        </View>
      ) : null}

      {!flexible ? (
        <>
          <DiagnosticFieldLabel rtl={rtl}>
            {tOd(uiLocale, 'citiesPrimaryTitle')}
          </DiagnosticFieldLabel>
          <DiagnosticChipGrid rtl={rtl}>
            {primaryOpts.map((o) => (
              <DiagnosticChip
                key={o.id}
                label={o.label}
                selected={selected.includes(o.id)}
                onPress={() => toggleCityId(o.id)}
                rtl={rtl}
              />
            ))}
          </DiagnosticChipGrid>
        </>
      ) : null}

      {flexOpt ? (
        <DiagnosticChoiceRow
          rtl={rtl}
          mode="checkbox"
          label={flexOpt.label}
          detail={tOd(uiLocale, 'citiesFlexibleReplace')}
          selected={flexible}
          onPress={() => toggleCityId('peuimporte')}
        />
      ) : null}

      {autresOpt && !flexible ? (
        <DiagnosticChoiceRow
          rtl={rtl}
          mode="checkbox"
          label={autresOpt.label}
          detail={
            others.length
              ? tOdFill(uiLocale, 'citiesSelectedTpl', {
                  n: others.length,
                  s: others.length > 1 ? 's' : '',
                })
              : tOd(uiLocale, 'citiesOthersExamples')
          }
          selected={showOther}
          onPress={() => toggleCityId('autres')}
        />
      ) : null}

      {showOther && !flexible ? (
        <View style={styles.citiesOtherBlock}>
          {others.length === 0 ? (
            <Text style={[styles.emptyHint, rtl && styles.rtlText]}>
              {tOd(uiLocale, 'citiesSelectAtLeastOne')}
            </Text>
          ) : (
            <>
              <DiagnosticFieldLabel rtl={rtl}>
                {tOdFill(uiLocale, 'citiesSelectedTpl', {
                  n: others.length,
                  s: others.length > 1 ? 's' : '',
                })}
              </DiagnosticFieldLabel>
              <DiagnosticChipGrid rtl={rtl}>
                {others.map((name) => (
                  <DiagnosticChip
                    key={name}
                    label={`✕ ${name}`}
                    selected
                    onPress={() => toggleOther(name)}
                    rtl={rtl}
                  />
                ))}
              </DiagnosticChipGrid>
            </>
          )}

          {quickOthers.length > 0 ? (
            <>
              <DiagnosticFieldLabel rtl={rtl}>
                {tOd(uiLocale, 'citiesSuggestions')}
              </DiagnosticFieldLabel>
              <DiagnosticChipGrid rtl={rtl}>
                {quickOthers.map((name) => (
                  <DiagnosticChip
                    key={name}
                    label={name}
                    selected={others.some((c) => c.toLowerCase() === name.toLowerCase())}
                    onPress={() => toggleOther(name)}
                    rtl={rtl}
                  />
                ))}
              </DiagnosticChipGrid>
            </>
          ) : null}

          <DiagnosticFieldLabel rtl={rtl}>{tOd(uiLocale, 'citiesSearch')}</DiagnosticFieldLabel>
          <DiagnosticTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={tOd(uiLocale, 'citiesSearchPlaceholder')}
            rtl={rtl}
          />

          {query.trim().length < 2 ? (
            <Text style={[styles.emptyHint, rtl && styles.rtlText]}>
              {tOd(uiLocale, 'citiesSearchMinChars')}
            </Text>
          ) : searchResults.length === 0 ? (
            <Text style={[styles.emptyHint, rtl && styles.rtlText]}>
              {tOdFill(uiLocale, 'citiesNoResult', { q: query.trim() })}
            </Text>
          ) : (
            <>
              <DiagnosticChipGrid rtl={rtl}>
                {searchResults.map((name) => (
                  <DiagnosticChip
                    key={name}
                    label={name}
                    selected={others.includes(name)}
                    onPress={() => toggleOther(name)}
                    rtl={rtl}
                  />
                ))}
              </DiagnosticChipGrid>
              {searchTotal > 30 ? (
                <Text style={[styles.emptyHint, rtl && styles.rtlText]}>
                  {tOd(uiLocale, 'citiesShowFirst60')}
                </Text>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </DiagnosticFormBlock>
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
  citiesSummary: { gap: spacing.xs, marginBottom: spacing.sm },
  citiesSummaryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
  },
  citiesFlexBanner: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: diagnosticTheme.accentSoft,
    borderWidth: 1,
    borderColor: homeShell.green,
    marginBottom: spacing.sm,
  },
  citiesFlexTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  citiesFlexSub: { fontSize: fontSize.xs, color: brand.textMuted, lineHeight: 18 },
  citiesOtherBlock: { gap: spacing.sm, marginTop: spacing.xs },
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
