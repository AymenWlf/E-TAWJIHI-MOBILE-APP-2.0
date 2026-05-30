import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SelectField } from '@/components/ui/SelectField';
import { BAC_TYPES, FILIERE_BAC_OPTIONS, NIVEAU_ETUDE_OPTIONS } from '@/constants/academicSetup';
import { getDiagnosticFormLabels, INGENIEUR_MASTER_PATH_QUESTION_I18N } from '@/constants/schoolDiagnosticFormLabels';
import {
  pickIdOptionLabel,
  pickLabeledOption,
  pickPathOption,
  type DiagnosticUiLocale,
} from '@/constants/schoolDiagnosticLocale';
import {
  GENDER_OPTIONS,
  HIGHER_ED_TEACHING_LANGUAGE_OPTIONS,
  LYCEE_PUBLIC_PRIVE_OPTIONS,
  PRIVATE_FEE_BRACKET_OPTIONS,
  INGENIEUR_MASTER_PATH_OPTIONS,
  TARGET_LEVEL_MASTER_INGENIEUR_ID,
  TARGET_STUDY_LEVEL_OPTIONS,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';
import type { CityRow, SecteurRow } from '@/services/referenceData';
import { formatSelectedCityNames, sectorDisplayLabel } from '@/utils/schoolDiagnosticPayloadDisplayContext';
import {
  DiagnosticChoiceRow,
  DiagnosticChip,
  DiagnosticChipGrid,
  DiagnosticFieldLabel,
  DiagnosticFormBlock,
  DiagnosticGradeAvailabilityBlock,
  DiagnosticHint,
  DiagnosticSectionCard,
  DiagnosticNoteSur20Input,
  DiagnosticTextInput,
  DiagnosticYesNoPills,
} from '@/components/diagnostic/DiagnosticUi';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, spacing } from '@/theme/tokens';

export type DiagnosticStepContext = {
  form: SchoolQuickDiagnosticForm;
  setForm: Dispatch<SetStateAction<SchoolQuickDiagnosticForm>>;
  isRTL: boolean;
  locale: DiagnosticUiLocale;
  onOpenCity: () => void;
  onOpenPrefCities: () => void;
  onOpenStudyLevel: () => void;
  onOpenBacStream: () => void;
  onOpenMissionSp1: () => void;
  onOpenMissionSp2: () => void;
  onOpenMissionSp3: () => void;
  onOpenGender: () => void;
  onOpenLyceeType: () => void;
  update: <K extends keyof SchoolQuickDiagnosticForm>(key: K, value: SchoolQuickDiagnosticForm[K]) => void;
  toggleArray: (
    key:
      | 'strongSubjects'
      | 'weakSubjects'
      | 'attractedSectors'
      | 'excludedSectors'
      | 'targetStudyLevelIds'
      | 'diplomesSouhaites'
      | 'preferredStudyCityIds',
    id: string,
  ) => void;
  toggleLang: (id: string) => void;
  secteurs: SecteurRow[];
  cities: CityRow[];
  citiesLoading: boolean;
  secteursLoading: boolean;
  /** Ancres pour scroll ciblé au focus clavier (commentaire libre, codes Massar, etc.). */
  registerFocusAnchor?: (key: string, node: View | null) => void;
  onFieldFocus?: (key: string) => void;
};

export function SchoolDiagnosticStepContent({ step, ctx }: { step: number; ctx: DiagnosticStepContext }) {
  const { t } = useLocale();
  const {
    form,
    isRTL,
    locale,
    update,
    toggleArray,
    toggleLang,
    onOpenCity,
    onOpenGender,
    secteurs,
    cities,
    citiesLoading,
    secteursLoading,
  } = ctx;
  const L = getDiagnosticFormLabels(locale);

  const secteursSorted = [...secteurs].sort((a, b) =>
    sectorDisplayLabel(a, locale).localeCompare(sectorDisplayLabel(b, locale), locale),
  );

  switch (step) {
    case 0:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.youAre}
          </DiagnosticFieldLabel>
          <DiagnosticChoiceRow
            rtl={isRTL}
            label={L.student}
            selected={form.profileRole === 'student'}
            onPress={() => update('profileRole', 'student')}
          />
          <DiagnosticChoiceRow
            rtl={isRTL}
            label={L.tutor}
            selected={form.profileRole === 'tutor'}
            onPress={() => update('profileRole', 'tutor')}
          />
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.firstName}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput value={form.firstName} onChangeText={(v) => update('firstName', v)} rtl={isRTL} />
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.lastName}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput value={form.lastName} onChangeText={(v) => update('lastName', v)} rtl={isRTL} />
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.phone}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
            rtl={isRTL}
          />
          <SelectField
            label={`${L.city} *`}
            value={form.city}
            onPress={onOpenCity}
            rtl={isRTL}
            required
            loading={citiesLoading}
            loadingLabel={L.loadingCities}
          />
          <SelectField
            label={`${L.gender} *`}
            value={pickLabeledOption(GENDER_OPTIONS, form.gender, locale)}
            onPress={onOpenGender}
            rtl={isRTL}
            required
          />
        </DiagnosticFormBlock>
      );
    case 1:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <SelectField
            label={`${L.studyLevel} *`}
            value={pickLabeledOption(NIVEAU_ETUDE_OPTIONS, form.studyLevel, locale)}
            onPress={ctx.onOpenStudyLevel}
            rtl={isRTL}
            required
          />
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.bacType}
          </DiagnosticFieldLabel>
          {BAC_TYPES.map((b) => (
            <DiagnosticChoiceRow
              key={b.value}
              rtl={isRTL}
              label={pickLabeledOption([b], b.value, locale)}
              selected={form.bacType === b.value}
              onPress={() =>
                ctx.setForm((prev) => ({
                  ...prev,
                  bacType: b.value,
                  ...(b.value === 'mission'
                    ? { lyceePublicPrive: '', bacStream: '', massarCode: '' }
                    : {
                        missionSpecialite1: '',
                        missionSpecialite2: '',
                        missionSpecialite3: '',
                        studentCode: '',
                      }),
                }))
              }
            />
          ))}
          {form.bacType === 'normal' ? (
            <>
              <SelectField
                label={`${L.lyceeType} *`}
                value={pickLabeledOption(LYCEE_PUBLIC_PRIVE_OPTIONS, form.lyceePublicPrive, locale)}
                onPress={ctx.onOpenLyceeType}
                rtl={isRTL}
                required
              />
              <SelectField
                label={`${L.bacStream} *`}
                value={pickLabeledOption(FILIERE_BAC_OPTIONS, form.bacStream, locale)}
                onPress={ctx.onOpenBacStream}
                rtl={isRTL}
                required
              />
              <View
                ref={(node) => ctx.registerFocusAnchor?.('massarCode', node)}
                collapsable={false}>
                <DiagnosticFieldLabel required rtl={isRTL}>
                  {t('accountMassarCode')}
                </DiagnosticFieldLabel>
                <DiagnosticHint rtl={isRTL}>{t('accountMassarCodeHint')}</DiagnosticHint>
                <DiagnosticTextInput
                  value={form.massarCode}
                  onChangeText={(v) => update('massarCode', v)}
                  placeholder={t('accountMassarCode')}
                  rtl={isRTL}
                  onFocus={() => ctx.onFieldFocus?.('massarCode')}
                />
              </View>
            </>
          ) : null}
          {form.bacType === 'mission' ? (
            <DiagnosticSectionCard title={L.missionSpecs} rtl={isRTL}>
              <SelectField
                label={`${L.spec1} *`}
                value={form.missionSpecialite1}
                onPress={ctx.onOpenMissionSp1}
                rtl={isRTL}
                required
              />
              <SelectField
                label={`${L.spec2} *`}
                value={form.missionSpecialite2}
                onPress={ctx.onOpenMissionSp2}
                rtl={isRTL}
                required
              />
              <SelectField
                label={L.spec3}
                value={form.missionSpecialite3}
                onPress={ctx.onOpenMissionSp3}
                rtl={isRTL}
              />
              <View
                ref={(node) => ctx.registerFocusAnchor?.('studentCode', node)}
                collapsable={false}>
                <DiagnosticFieldLabel required rtl={isRTL}>
                  {t('accountStudentCode')}
                </DiagnosticFieldLabel>
                <DiagnosticHint rtl={isRTL}>{t('accountStudentCodeHint')}</DiagnosticHint>
                <DiagnosticTextInput
                  value={form.studentCode}
                  onChangeText={(v) => update('studentCode', v)}
                  placeholder={t('accountStudentCode')}
                  rtl={isRTL}
                  onFocus={() => ctx.onFieldFocus?.('studentCode')}
                />
              </View>
            </DiagnosticSectionCard>
          ) : null}
        </DiagnosticFormBlock>
      );
    case 2:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticHint rtl={isRTL}>{L.gradesHint}</DiagnosticHint>
          {form.bacType === 'normal' ? (
            <>
              <DiagnosticFieldLabel rtl={isRTL}>{L.troncCommun}</DiagnosticFieldLabel>
              <DiagnosticNoteSur20Input
                value={form.noteGeneraleTroncCommunSur20}
                onChangeText={(v) => update('noteGeneraleTroncCommunSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecJihawia}
                accent="regional"
                question={L.gradeQJihawia}
                locale={locale}
                labels={L}
                received={form.regionalGradeReceived}
                onSelectYes={() => {
                  update('regionalGradeReceived', 'yes');
                  update('previsionnelRegionalMinSur20', '');
                  update('previsionnelRegionalMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('regionalGradeReceived', 'no');
                  update('noteGeneralePremiereBacSur20', '');
                }}
                definitiveLabel={L.gradeLblJihawia}
                definitiveValue={form.noteGeneralePremiereBacSur20}
                onDefinitiveChange={(v) => update('noteGeneralePremiereBacSur20', v)}
                previsionnelMin={form.previsionnelRegionalMinSur20}
                previsionnelMax={form.previsionnelRegionalMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelRegionalMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelRegionalMaxSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecSem1Bac}
                accent="semestre1"
                question={L.gradeQSem1Bac}
                locale={locale}
                labels={L}
                received={form.semestre1BacGradeReceived}
                onSelectYes={() => {
                  update('semestre1BacGradeReceived', 'yes');
                  update('previsionnelSemestre1BacMinSur20', '');
                  update('previsionnelSemestre1BacMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('semestre1BacGradeReceived', 'no');
                  update('noteGeneraleSemestre1SecondBacSur20', '');
                }}
                definitiveLabel={L.gradeLblSem1Bac}
                definitiveValue={form.noteGeneraleSemestre1SecondBacSur20}
                onDefinitiveChange={(v) => update('noteGeneraleSemestre1SecondBacSur20', v)}
                previsionnelMin={form.previsionnelSemestre1BacMinSur20}
                previsionnelMax={form.previsionnelSemestre1BacMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelSemestre1BacMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelSemestre1BacMaxSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecBacNat}
                accent="national"
                question={L.gradeQBacNat}
                locale={locale}
                labels={L}
                received={form.bacGradeReceived}
                onSelectYes={() => {
                  update('bacGradeReceived', 'yes');
                  update('previsionnelBacNationalMinSur20', '');
                  update('previsionnelBacNationalMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('bacGradeReceived', 'no');
                  update('noteBacFinaleSur20', '');
                }}
                definitiveLabel={L.gradeLblBacNat}
                definitiveValue={form.noteBacFinaleSur20}
                onDefinitiveChange={(v) => update('noteBacFinaleSur20', v)}
                previsionnelMin={form.previsionnelBacNationalMinSur20}
                previsionnelMax={form.previsionnelBacNationalMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelBacNationalMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelBacNationalMaxSur20', v)}
                rtl={isRTL}
              />
            </>
          ) : null}
          {form.bacType === 'mission' ? (
            <>
              <DiagnosticFieldLabel rtl={isRTL}>{L.missionSeconde}</DiagnosticFieldLabel>
              <DiagnosticNoteSur20Input
                value={form.noteMissionSecondeSur20}
                onChangeText={(v) => update('noteMissionSecondeSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecPremiereMission}
                accent="missionPremiere"
                question={L.gradeQPremiereMission}
                locale={locale}
                labels={L}
                received={form.premiereMissionGradeReceived}
                onSelectYes={() => {
                  update('premiereMissionGradeReceived', 'yes');
                  update('previsionnelPremiereMissionMinSur20', '');
                  update('previsionnelPremiereMissionMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('premiereMissionGradeReceived', 'no');
                  update('noteMissionPremiereSur20', '');
                }}
                definitiveLabel={L.gradeLblPremiereMission}
                definitiveValue={form.noteMissionPremiereSur20}
                onDefinitiveChange={(v) => update('noteMissionPremiereSur20', v)}
                previsionnelMin={form.previsionnelPremiereMissionMinSur20}
                previsionnelMax={form.previsionnelPremiereMissionMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelPremiereMissionMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelPremiereMissionMaxSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecS1Mission}
                accent="missionSemestre1"
                question={L.gradeQS1Mission}
                locale={locale}
                labels={L}
                received={form.semestre1MissionGradeReceived}
                onSelectYes={() => {
                  update('semestre1MissionGradeReceived', 'yes');
                  update('previsionnelSemestre1MissionMinSur20', '');
                  update('previsionnelSemestre1MissionMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('semestre1MissionGradeReceived', 'no');
                  update('noteMissionSemestre1TerminaleSur20', '');
                }}
                definitiveLabel={L.gradeLblS1Mission}
                definitiveValue={form.noteMissionSemestre1TerminaleSur20}
                onDefinitiveChange={(v) => update('noteMissionSemestre1TerminaleSur20', v)}
                previsionnelMin={form.previsionnelSemestre1MissionMinSur20}
                previsionnelMax={form.previsionnelSemestre1MissionMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelSemestre1MissionMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelSemestre1MissionMaxSur20', v)}
                rtl={isRTL}
              />
              <DiagnosticGradeAvailabilityBlock
                sectionTitle={L.gradeSecBacMission}
                accent="missionNational"
                question={L.gradeQBacMission}
                locale={locale}
                labels={L}
                received={form.bacGradeReceived}
                onSelectYes={() => {
                  update('bacGradeReceived', 'yes');
                  update('previsionnelBacMissionMinSur20', '');
                  update('previsionnelBacMissionMaxSur20', '');
                }}
                onSelectNo={() => {
                  update('bacGradeReceived', 'no');
                  update('noteBacFinaleSur20', '');
                }}
                definitiveLabel={L.gradeLblBacMission}
                definitiveValue={form.noteBacFinaleSur20}
                onDefinitiveChange={(v) => update('noteBacFinaleSur20', v)}
                previsionnelMin={form.previsionnelBacMissionMinSur20}
                previsionnelMax={form.previsionnelBacMissionMaxSur20}
                onPrevisionnelMinChange={(v) => update('previsionnelBacMissionMinSur20', v)}
                onPrevisionnelMaxChange={(v) => update('previsionnelBacMissionMaxSur20', v)}
                rtl={isRTL}
              />
            </>
          ) : null}
        </DiagnosticFormBlock>
      );
    case 3:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.schoolTypes}
          </DiagnosticFieldLabel>
          {(
            [
              ['prefPublic', L.public, 'building'] as const,
              ['prefPrivate', L.private, 'lock'] as const,
              ['prefSemiPublic', L.semiPublic, 'balance-scale'] as const,
              ['prefMilitary', L.military, 'shield'] as const,
            ] as const
          ).map(([k, lab, icon]) => (
            <DiagnosticChoiceRow
              key={k}
              rtl={isRTL}
              mode="checkbox"
              icon={icon}
              label={lab}
              selected={form[k]}
              onPress={() => update(k, !form[k])}
            />
          ))}
          {form.prefMilitary ? (
            <DiagnosticSectionCard title={L.militarySchools} rtl={isRTL}>
              {form.gender === 'femme' ? (
                <DiagnosticYesNoPills
                  rtl={isRTL}
                  locale={locale}
                  variant="yesNo"
                  label={L.veilQuestion}
                  value={form.militaryVeilWearing}
                  onChange={(v) => update('militaryVeilWearing', v as SchoolQuickDiagnosticForm['militaryVeilWearing'])}
                />
              ) : null}
              <DiagnosticYesNoPills
                rtl={isRTL}
                locale={locale}
                variant="yesNoUnsure"
                label={L.heightQuestion}
                value={form.militaryHeightRequirementMet}
                onChange={(v) =>
                  update('militaryHeightRequirementMet', v as SchoolQuickDiagnosticForm['militaryHeightRequirementMet'])
                }
              />
            </DiagnosticSectionCard>
          ) : null}
        </DiagnosticFormBlock>
      );
    case 4:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.whereStudy}
          </DiagnosticFieldLabel>
          <DiagnosticChoiceRow
            rtl={isRTL}
            label={L.anyCity}
            selected={form.studyCityScope === 'any'}
            onPress={() => update('studyCityScope', 'any')}
          />
          <DiagnosticChoiceRow
            rtl={isRTL}
            label={L.targetCities}
            selected={form.studyCityScope === 'specific'}
            onPress={() => update('studyCityScope', 'specific')}
          />
          {form.studyCityScope === 'specific' ? (
            <SelectField
              label={`${L.citiesStudyField} *`}
              value={formatSelectedCityNames(form.preferredStudyCityIds, cities, locale)}
              onPress={ctx.onOpenPrefCities}
              rtl={isRTL}
              required
              loading={citiesLoading}
              loadingLabel={L.loadingCities}
            />
          ) : null}
          <DiagnosticYesNoPills
            rtl={isRTL}
            locale={locale}
            label={L.privateIfReject}
            value={form.privateIfDreamSchoolRejects}
            onChange={(v) =>
              update('privateIfDreamSchoolRejects', v as SchoolQuickDiagnosticForm['privateIfDreamSchoolRejects'])
            }
          />
          {form.privateIfDreamSchoolRejects === 'yes' ? (
            <DiagnosticChipGrid rtl={isRTL}>
              {PRIVATE_FEE_BRACKET_OPTIONS.map((o) => (
                <DiagnosticChip
                  rtl={isRTL}
                  key={o.value}
                  label={pickLabeledOption(PRIVATE_FEE_BRACKET_OPTIONS, o.value, locale)}
                  selected={form.privateMonthlyBudgetBracket === o.value}
                  onPress={() => update('privateMonthlyBudgetBracket', o.value)}
                />
              ))}
            </DiagnosticChipGrid>
          ) : null}
        </DiagnosticFormBlock>
      );
    case 5:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.contests}
          </DiagnosticFieldLabel>
          {(
            [
              ['yes', L.yes],
              ['no', L.no],
              ['maybe', L.maybe],
            ] as const
          ).map(([v, lab]) => (
            <DiagnosticChoiceRow
              key={v}
              rtl={isRTL}
              label={lab}
              selected={form.considersContests === v}
              onPress={() => update('considersContests', v)}
            />
          ))}
          {form.considersContests === 'yes' ? (
            <DiagnosticSectionCard title={L.contestPrep}>
              <DiagnosticFieldLabel required rtl={isRTL}>
                {L.howPrep}
              </DiagnosticFieldLabel>
              {(
                [
                  ['alone', L.prepAlone],
                  ['center', L.prepCenter],
                  ['online', L.prepOnline],
                  ['mixed', L.prepMixed],
                ] as const
              ).map(([v, lab]) => (
                <DiagnosticChoiceRow
                  key={v}
                  rtl={isRTL}
                  label={lab}
                  selected={form.contestPrep === v}
                  onPress={() => update('contestPrep', v)}
                />
              ))}
            </DiagnosticSectionCard>
          ) : null}
        </DiagnosticFormBlock>
      );
    case 6:
      return (
        <DiagnosticFormBlock rtl={isRTL}>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.targetLevels}
          </DiagnosticFieldLabel>
          <DiagnosticChipGrid rtl={isRTL}>
            {TARGET_STUDY_LEVEL_OPTIONS.map((o) => (
              <DiagnosticChip
                rtl={isRTL}
                key={o.id}
                label={pickIdOptionLabel(TARGET_STUDY_LEVEL_OPTIONS, o.id, locale)}
                selected={form.targetStudyLevelIds.includes(o.id)}
                onPress={() => toggleArray('targetStudyLevelIds', o.id)}
              />
            ))}
          </DiagnosticChipGrid>
          {form.targetStudyLevelIds.includes(TARGET_LEVEL_MASTER_INGENIEUR_ID) ? (
            <DiagnosticSectionCard title={L.masterSection} rtl={isRTL}>
              <DiagnosticFieldLabel required rtl={isRTL}>
                {INGENIEUR_MASTER_PATH_QUESTION_I18N[locale].title}
              </DiagnosticFieldLabel>
              <DiagnosticHint rtl={isRTL}>{INGENIEUR_MASTER_PATH_QUESTION_I18N[locale].hint}</DiagnosticHint>
              {INGENIEUR_MASTER_PATH_OPTIONS.map((o) => {
                const path = pickPathOption(o, locale);
                return (
                  <DiagnosticChoiceRow
                    key={o.id}
                    rtl={isRTL}
                    label={path.label}
                    detail={path.description}
                    selected={form.ingenieurMasterPathPreference === o.id}
                    onPress={() => update('ingenieurMasterPathPreference', o.id)}
                  />
                );
              })}
            </DiagnosticSectionCard>
          ) : null}
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.languages}
          </DiagnosticFieldLabel>
          <DiagnosticChipGrid rtl={isRTL}>
            {HIGHER_ED_TEACHING_LANGUAGE_OPTIONS.map((o) => (
              <DiagnosticChip
                rtl={isRTL}
                key={o.id}
                label={pickIdOptionLabel(HIGHER_ED_TEACHING_LANGUAGE_OPTIONS, o.id, locale)}
                selected={form.acceptedHigherEdLanguages.includes(o.id)}
                onPress={() => toggleLang(o.id)}
              />
            ))}
          </DiagnosticChipGrid>
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.sectorsAttract}
          </DiagnosticFieldLabel>
          {secteursLoading ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.md,
                borderRadius: 12,
                backgroundColor: 'rgba(51, 62, 143, 0.06)',
                borderWidth: 1,
                borderColor: 'rgba(51, 62, 143, 0.12)',
                alignSelf: 'stretch',
                ...(isRTL ? { direction: 'rtl' as const } : {}),
              }}>
              <ActivityIndicator size="small" color={brand.primary} />
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: '600',
                  color: brand.primary,
                  flex: 1,
                  ...(isRTL
                    ? { textAlign: 'right' as const, writingDirection: 'rtl' as const }
                    : {}),
                }}>
                {L.sectorsLoading}
              </Text>
            </View>
          ) : (
            <DiagnosticChipGrid rtl={isRTL}>
              {secteursSorted.map((s) => {
                const idStr = String(s.id);
                return (
                  <DiagnosticChip
                    rtl={isRTL}
                    key={s.id}
                    label={sectorDisplayLabel(s, locale)}
                    selected={form.attractedSectors.includes(idStr)}
                    onPress={() => toggleArray('attractedSectors', idStr)}
                  />
                );
              })}
            </DiagnosticChipGrid>
          )}
          <DiagnosticFieldLabel required rtl={isRTL}>
            {L.publicThenPrivate}
          </DiagnosticFieldLabel>
          {(
            [
              ['public2_then_private', L.split2],
              ['public3_then_private', L.split3],
              ['both_2_or_3', L.splitBoth],
              ['no', L.splitNo],
              ['depends', L.splitDepends],
            ] as const
          ).map(([v, lab]) => (
            <DiagnosticChoiceRow
              key={v}
              rtl={isRTL}
              label={lab}
              selected={form.splitPublicYearsThenPrivate === v}
              onPress={() => update('splitPublicYearsThenPrivate', v)}
            />
          ))}
          <View
            ref={(node) => ctx.registerFocusAnchor?.('freeComment', node)}
            collapsable={false}>
            <DiagnosticFieldLabel rtl={isRTL}>
              {L.freeComment}
            </DiagnosticFieldLabel>
            <DiagnosticTextInput
              value={form.freeComment}
              onChangeText={(v) => update('freeComment', v)}
              multiline
              rtl={isRTL}
              placeholder={L.freeCommentPh}
              onFocus={() => ctx.onFieldFocus?.('freeComment')}
            />
          </View>
          <DiagnosticChoiceRow
            rtl={isRTL}
            mode="checkbox"
            label={`${L.consent} *`}
            selected={form.consentProcessing}
            onPress={() => update('consentProcessing', !form.consentProcessing)}
          />
        </DiagnosticFormBlock>
      );
    default:
      return null;
  }
}
