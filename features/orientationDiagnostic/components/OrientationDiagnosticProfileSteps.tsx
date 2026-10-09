import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  DiagnosticChoiceRow,
  DiagnosticFieldLabel,
  DiagnosticFormBlock,
  DiagnosticGradeAvailabilityBlock,
  DiagnosticTextInput,
  diagnosticTheme,
} from '@/components/diagnostic/DiagnosticUi';
import { SearchablePickSheet, type SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import { Text } from '@/components/ui/Text';
import { SPECIALITES_MISSION_LABELS } from '@/constants/academicSetup';
import { listCities, type CityRow } from '@/services/referenceData';
import { brand, fontSize, spacing } from '@/theme/tokens';
import {
  filiereOptionsForNiveau,
  resolveFiliereDisplayLabel,
  sanitizeFiliereForNiveau,
} from '@/utils/academicFiliere';
import {
  anneesBacOptionsForLocale,
  formatBacAnneePickerLabel,
} from '@/utils/bacSchoolYearLabels';
import { SPECIALITES_MISSION } from '../constants/academicSetup';
import type { OrientationUiLocale } from '../data/orientationDiagnosticI18n';
import {
  BAC_TYPES,
  EMPTY_DIAGNOSTIC_PROFILE,
  isBacStudyLevel,
  maxMissionSpecialites,
  needsNotes,
  STUDY_LEVELS,
  type DiagnosticProfile,
} from '../data/orientationDiagnosticProfile';
import type { DiagnosticStep } from '../types/orientationDiagnosticPrototype';

type PickerKey = 'city' | 'studyLevel' | 'bacType' | 'bacFiliere' | 'bacYear' | 'spec1' | 'spec2' | 'spec3';

const STUDY_LEVEL_AR: Record<string, string> = {
  '1ère année Baccalauréat': 'السنة الأولى باك',
  '2ème année Baccalauréat en cours': 'السنة الثانية باك (قيد الدراسة)',
  '2ème année Baccalauréat terminé': 'السنة الثانية باك (تم الحصول على الباك)',
  Bachelier: 'حاصل على الباك في سنة سابقة',
  'BAC+1': 'باك +1',
  'BAC+2': 'باك +2',
  'BAC+3': 'باك +3',
  'BAC+4': 'باك +4',
  'BAC+5': 'باك +5',
  'BAC+6': 'باك +6',
  'BAC+8': 'باك +8 (دكتوراه)',
};

const BAC_TYPE_AR: Record<string, string> = {
  marocain: 'البكالوريا المغربية',
  mission: 'البكالوريا الفرنسية (البعثة)',
};

const MISSION_SPECIALITY_AR: Record<string, string> = {
  Mathématiques: 'الرياضيات',
  'Physique-Chimie': 'الفيزياء والكيمياء',
  SVT: 'علوم الحياة والأرض',
  NSI: 'المعلوميات والعلوم الرقمية',
  SES: 'العلوم الاقتصادية والاجتماعية',
  HGGSP: 'التاريخ والجغرافيا والجيوسياسة والعلوم السياسية',
  HLP: 'العلوم الإنسانية والآداب والفلسفة',
  LLCE: 'اللغات والآداب والثقافات الأجنبية',
  Arts: 'الفنون',
  Technologique: 'المسار التكنولوجي',
};

function labeledPickItems(
  options: ReadonlyArray<{ value: string; label: string; labelAr?: string }>,
  locale: OrientationUiLocale,
): SearchablePickItem[] {
  return options
    .filter((o) => o.value)
    .map((o) => ({
      id: o.value,
      value: o.value,
      label: locale === 'ar' ? (o.labelAr ?? o.label) : o.label,
    }));
}

export function OrientationDiagnosticProfileSteps({
  step,
  profile,
  onChange,
  uiLocale,
  rtl,
}: {
  step: DiagnosticStep;
  profile: DiagnosticProfile;
  onChange: (patch: Partial<DiagnosticProfile>) => void;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
}) {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [picker, setPicker] = useState<PickerKey | null>(null);

  useEffect(() => {
    void listCities(1000).then(setCities).catch(() => undefined);
  }, []);

  const pickCommon = {
    searchPlaceholder: uiLocale === 'ar' ? 'بحث…' : 'Rechercher…',
    emptyLabel: uiLocale === 'ar' ? 'لا نتائج' : 'Aucun résultat',
    allLabel: '—',
    rtl: Boolean(rtl),
  };

  const cityItems: SearchablePickItem[] = useMemo(
    () =>
      cities.map((c) => ({
        id: String(c.id),
        value: String(c.id),
        label: c.titre,
      })),
    [cities],
  );

  const studyItems: SearchablePickItem[] = STUDY_LEVELS.map((o) => ({
    id: o.value,
    value: o.value,
    label: uiLocale === 'ar' ? STUDY_LEVEL_AR[o.value] || o.label : o.label,
  }));

  const p = profile ?? EMPTY_DIAGNOSTIC_PROFILE;
  const bacLocale = uiLocale === 'ar' ? 'ar' : 'fr';
  const isBac = isBacStudyLevel(p.studyLevel);

  const filiereItems = useMemo(
    () => labeledPickItems(filiereOptionsForNiveau(p.studyLevel), uiLocale),
    [p.studyLevel, uiLocale],
  );
  const yearItems = useMemo(
    () => labeledPickItems(anneesBacOptionsForLocale(bacLocale), uiLocale),
    [bacLocale, uiLocale],
  );
  const specItems: SearchablePickItem[] = SPECIALITES_MISSION.map((s) => ({
    id: s,
    value: s,
    label:
      uiLocale === 'ar'
        ? MISSION_SPECIALITY_AR[s] || SPECIALITES_MISSION_LABELS[s] || s
        : SPECIALITES_MISSION_LABELS[s] || s,
  }));
  const filiereFieldLabel =
    p.studyLevel === '1ère année Baccalauréat'
      ? uiLocale === 'ar'
        ? 'الشعبة (الأولى باك)'
        : 'Filière (1ère bac)'
      : uiLocale === 'ar'
        ? 'الشعبة'
        : 'Filière';
  const studyLabel =
    studyItems.find((s) => s.value === p.studyLevel)?.label ||
    p.studyLevel ||
    (uiLocale === 'ar' ? 'اختر' : 'Choisir');
  const yearLabel = p.bacYear
    ? formatBacAnneePickerLabel(p.bacYear, bacLocale)
    : uiLocale === 'ar'
      ? 'اختر'
      : 'Choisir';
  const filiereLabel =
    resolveFiliereDisplayLabel(p.bacFiliere, bacLocale) ||
    (uiLocale === 'ar' ? 'اختر الشعبة' : 'Choisir la filière');

  if (step.kind === 'profile_identity') {
    return (
      <>
        <DiagnosticFormBlock rtl={rtl}>
          <DiagnosticFieldLabel required rtl={rtl}>
            {uiLocale === 'ar' ? 'الاسم الشخصي' : 'Prénom'}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput
            value={p.firstName}
            onChangeText={(v) => onChange({ firstName: v })}
            rtl={rtl}
          />
          <DiagnosticFieldLabel required rtl={rtl}>
            {uiLocale === 'ar' ? 'اسم العائلة' : 'Nom'}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput
            value={p.lastName}
            onChangeText={(v) => onChange({ lastName: v })}
            rtl={rtl}
          />
          <DiagnosticFieldLabel rtl={rtl}>
            {uiLocale === 'ar' ? 'الهاتف' : 'Téléphone'}
          </DiagnosticFieldLabel>
          <DiagnosticTextInput
            value={p.phoneNumber}
            onChangeText={(v) => onChange({ phoneNumber: v })}
            keyboardType="phone-pad"
            rtl={rtl}
          />
          <DiagnosticFieldLabel required rtl={rtl}>
            {uiLocale === 'ar' ? 'المدينة' : 'Ville'}
          </DiagnosticFieldLabel>
          <Pressable onPress={() => setPicker('city')} style={styles.pickField}>
            <Text style={[styles.pickTxt, rtl && styles.rtlText]}>
              {p.city || (uiLocale === 'ar' ? 'اختر مدينة' : 'Choisir une ville')}
            </Text>
          </Pressable>
        </DiagnosticFormBlock>
        <SearchablePickSheet
          visible={picker === 'city'}
          title={uiLocale === 'ar' ? 'المدينة' : 'Ville'}
          items={cityItems}
          selectedValue={p.cityId}
          onPick={(v) => {
            const row = cities.find((c) => String(c.id) === v);
            onChange({ cityId: v, city: row?.titre ?? '' });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          {...pickCommon}
        />
      </>
    );
  }

  if (step.kind === 'profile_school') {
    return (
      <>
        <DiagnosticFormBlock rtl={rtl}>
          <DiagnosticFieldLabel required rtl={rtl}>
            {uiLocale === 'ar' ? 'المستوى الدراسي' : 'Niveau d’études'}
          </DiagnosticFieldLabel>
          <Pressable onPress={() => setPicker('studyLevel')} style={styles.pickField}>
            <Text style={[styles.pickTxt, rtl && styles.rtlText]}>{studyLabel}</Text>
          </Pressable>
          {isBac ? (
            <>
              <DiagnosticFieldLabel required rtl={rtl}>
                {uiLocale === 'ar' ? 'نوع البكالوريا' : 'Type de bac'}
              </DiagnosticFieldLabel>
              <View style={styles.rowChoices}>
                {BAC_TYPES.map((bt) => (
                  <DiagnosticChoiceRow
                    key={bt.value}
                    rtl={rtl}
                    label={uiLocale === 'ar' ? BAC_TYPE_AR[bt.value] || bt.label : bt.label}
                    selected={p.bacType === bt.value}
                    onPress={() =>
                      onChange({
                        bacType: bt.value,
                        bacFiliere: bt.value === 'marocain' ? p.bacFiliere : '',
                        bacSpecialites: bt.value === 'mission' ? p.bacSpecialites : [],
                      })
                    }
                  />
                ))}
              </View>
            </>
          ) : null}
          {isBac && p.bacType === 'marocain' ? (
            <>
              <DiagnosticFieldLabel required rtl={rtl}>
                {filiereFieldLabel}
              </DiagnosticFieldLabel>
              <Pressable onPress={() => setPicker('bacFiliere')} style={styles.pickField}>
                <Text style={[styles.pickTxt, rtl && styles.rtlText]}>{filiereLabel}</Text>
              </Pressable>
            </>
          ) : null}
          {isBac && p.bacType === 'mission' ? (
            <>
              {[1, 2, 3].slice(0, maxMissionSpecialites(p.studyLevel)).map((n) => {
                const key = `spec${n}` as PickerKey;
                const val = p.bacSpecialites[n - 1] || '';
                return (
                  <View key={n}>
                    <DiagnosticFieldLabel rtl={rtl}>
                      {uiLocale === 'ar' ? `تخصص ${n}` : `Spécialité ${n}`}
                    </DiagnosticFieldLabel>
                    <Pressable onPress={() => setPicker(key)} style={styles.pickField}>
                      <Text style={[styles.pickTxt, rtl && styles.rtlText]}>
                        {SPECIALITES_MISSION_LABELS[val] ||
                          val ||
                          (uiLocale === 'ar' ? 'اختر' : 'Choisir')}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </>
          ) : null}
          {isBac ? (
            <>
              <DiagnosticFieldLabel required rtl={rtl}>
                {uiLocale === 'ar' ? 'سنة البكالوريا' : 'Année du bac'}
              </DiagnosticFieldLabel>
              <Pressable onPress={() => setPicker('bacYear')} style={styles.pickField}>
                <Text style={[styles.pickTxt, rtl && styles.rtlText]}>{yearLabel}</Text>
              </Pressable>
            </>
          ) : null}
        </DiagnosticFormBlock>
        <SearchablePickSheet
          visible={picker === 'studyLevel'}
          title={uiLocale === 'ar' ? 'المستوى' : 'Niveau'}
          items={studyItems}
          selectedValue={p.studyLevel}
          onPick={(v) => {
            const stillBac = isBacStudyLevel(v);
            onChange({
              studyLevel: v,
              bacType: stillBac ? p.bacType : '',
              bacFiliere: stillBac ? sanitizeFiliereForNiveau(v, p.bacFiliere) : '',
              bacSpecialites: stillBac ? p.bacSpecialites : [],
              bacYear: stillBac ? p.bacYear : '',
              noteAvailability: needsNotes(v) ? p.noteAvailability : '',
            });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          {...pickCommon}
        />
        <SearchablePickSheet
          visible={picker === 'bacFiliere'}
          title={filiereFieldLabel}
          items={filiereItems}
          selectedValue={p.bacFiliere}
          onPick={(v) => {
            onChange({ bacFiliere: v });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          {...pickCommon}
        />
        <SearchablePickSheet
          visible={picker === 'bacYear'}
          title={uiLocale === 'ar' ? 'السنة' : 'Année'}
          items={yearItems}
          selectedValue={p.bacYear}
          onPick={(v) => {
            onChange({ bacYear: v });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
          {...pickCommon}
        />
        {(['spec1', 'spec2', 'spec3'] as const).map((key, idx) => (
          <SearchablePickSheet
            key={key}
            visible={picker === key}
            title={`Spécialité ${idx + 1}`}
            items={specItems}
            selectedValue={p.bacSpecialites[idx] || ''}
            onPick={(v) => {
              const next = [...p.bacSpecialites];
              next[idx] = v;
              onChange({ bacSpecialites: next.filter(Boolean) });
              setPicker(null);
            }}
            onClose={() => setPicker(null)}
            {...pickCommon}
          />
        ))}
      </>
    );
  }

  if (step.kind === 'profile_grades' && needsNotes(p.studyLevel)) {
    const noteAvail = p.noteAvailability === 'estimation' ? 'no' : p.noteAvailability === 'real' ? 'yes' : '';
    return (
      <DiagnosticFormBlock rtl={rtl}>
        {p.bacType === 'marocain' ? (
          <>
            <DiagnosticGradeAvailabilityBlock
              sectionTitle={uiLocale === 'ar' ? 'نقط البكالوريا المغربية' : 'Notes Bac marocain'}
              question={uiLocale === 'ar' ? 'هل تتوفر على النقط النهائية؟' : 'As-tu tes notes définitives ?'}
              accent="national"
              received={noteAvail as '' | 'yes' | 'no'}
              onSelectYes={() => onChange({ noteAvailability: 'real' })}
              onSelectNo={() => onChange({ noteAvailability: 'estimation' })}
              definitiveLabel={uiLocale === 'ar' ? 'المعدل العام 1ère باك' : 'Moyenne 1ère bac'}
              definitiveValue={p.noteGenerale1ereBac}
              onDefinitiveChange={(v) => onChange({ noteGenerale1ereBac: v })}
              previsionnelMin={p.noteControleContinu}
              previsionnelMax={p.noteNational}
              onPrevisionnelMinChange={(v) => onChange({ noteControleContinu: v })}
              onPrevisionnelMaxChange={(v) => onChange({ noteNational: v })}
              rtl={rtl}
              locale={uiLocale}
            />
          </>
        ) : null}
        {p.bacType === 'mission' ? (
          <>
            <DiagnosticFieldLabel required rtl={rtl}>
              {uiLocale === 'ar' ? 'Première' : 'Première'}
            </DiagnosticFieldLabel>
            <DiagnosticTextInput
              value={p.noteGeneralePremiere}
              onChangeText={(v) => onChange({ noteGeneralePremiere: v })}
              keyboardType="decimal-pad"
              rtl={rtl}
            />
            <DiagnosticFieldLabel required rtl={rtl}>
              {uiLocale === 'ar' ? 'Terminale' : 'Terminale'}
            </DiagnosticFieldLabel>
            <DiagnosticTextInput
              value={p.noteGeneraleTerminale}
              onChangeText={(v) => onChange({ noteGeneraleTerminale: v })}
              keyboardType="decimal-pad"
              rtl={rtl}
            />
            <DiagnosticFieldLabel rtl={rtl}>Bac</DiagnosticFieldLabel>
            <DiagnosticTextInput
              value={p.noteGeneraleBac}
              onChangeText={(v) => onChange({ noteGeneraleBac: v })}
              keyboardType="decimal-pad"
              rtl={rtl}
            />
          </>
        ) : null}
      </DiagnosticFormBlock>
    );
  }

  if (step.kind === 'profile_grades') {
    return (
      <Text style={[styles.skipNote, rtl && styles.rtlText]}>
        {uiLocale === 'ar'
          ? 'لا يلزم إدخال النقط في هذا المستوى.'
          : 'Aucune note requise pour ton niveau actuel.'}
      </Text>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  pickField: {
    borderWidth: 1,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: brand.white,
  },
  pickTxt: { fontSize: fontSize.sm, color: brand.text },
  rowChoices: { gap: spacing.xs },
  skipNote: { fontSize: fontSize.sm, color: brand.textMuted, paddingVertical: spacing.md },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
