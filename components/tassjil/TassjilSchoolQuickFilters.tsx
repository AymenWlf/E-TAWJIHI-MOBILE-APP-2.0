import { useMemo } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  STATUT_CATEGORY_STYLES,
  buildTassjilStatutFilterOptions,
  getStatutCategory,
  getTassjilStatutFilterLabel,
  TASSJIL_STATUT_NONE,
} from '@/constants/tassjilInscriptionStatus';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { TassjilSchool } from '@/types/tassjilSchoolChoices';

type Props = {
  schools: TassjilSchool[];
  inscriptionFilter: string;
  suiviFilter: string;
  onInscriptionFilterChange: (value: string) => void;
  onSuiviFilterChange: (value: string) => void;
  filteredCount: number;
};

function chipColors(value: string, active: boolean) {
  if (!active) {
    return {
      bg: brand.white,
      text: brand.textMuted,
      border: brand.border,
      badgeBg: brand.backgroundSoft,
      badgeText: brand.textMuted,
    };
  }
  const category = value === TASSJIL_STATUT_NONE ? 'default' : getStatutCategory(value);
  const styles = STATUT_CATEGORY_STYLES[category] ?? STATUT_CATEGORY_STYLES.default;
  return {
    bg: styles.bg,
    text: styles.text,
    border: styles.text,
    badgeBg: 'rgba(255,255,255,0.55)',
    badgeText: styles.text,
  };
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  allLabel,
  isRTL,
  isArabic,
}: {
  label: string;
  options: { value: string; count: number }[];
  value: string;
  onChange: (next: string) => void;
  allLabel: string;
  isRTL: boolean;
  isArabic: boolean;
}) {
  if (options.length <= 1) return null;

  const allColors = chipColors('', !value);

  return (
    <View style={styles.rowBlock}>
      <Text style={[styles.rowLabel, isRTL && styles.rtlText]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsRow, isRTL && styles.chipsRowRtl]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !value }}
          onPress={() => onChange('')}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: allColors.bg,
              borderColor: allColors.border,
            },
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={[styles.chipTxt, { color: allColors.text }, isRTL && styles.rtlText]}>
            {allLabel}
          </Text>
        </Pressable>
        {options.map((opt) => {
          const active = value === opt.value;
          const colors = chipColors(opt.value, active);
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(active ? '' : opt.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text
                style={[styles.chipTxt, { color: colors.text }, isRTL && styles.rtlText]}
                numberOfLines={1}
              >
                {getTassjilStatutFilterLabel(opt.value, isArabic)}
              </Text>
              <View style={[styles.chipBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.chipBadgeTxt, { color: colors.badgeText }]}>{opt.count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function TassjilSchoolQuickFilters({
  schools,
  inscriptionFilter,
  suiviFilter,
  onInscriptionFilterChange,
  onSuiviFilterChange,
  filteredCount,
}: Props) {
  const { t, isRTL, locale } = useLocale();
  const isArabic = locale === 'ar';

  const inscriptionOptions = useMemo(
    () => buildTassjilStatutFilterOptions(schools, 'statut_inscription'),
    [schools],
  );
  const suiviOptions = useMemo(
    () => buildTassjilStatutFilterOptions(schools, 'statut_suivi'),
    [schools],
  );

  const hasActiveFilter = Boolean(inscriptionFilter || suiviFilter);
  const showPanel =
    inscriptionOptions.length > 1 || suiviOptions.length > 1 || hasActiveFilter;

  if (!showPanel) return null;

  const clearAll = () => {
    onInscriptionFilterChange('');
    onSuiviFilterChange('');
  };

  const resultsLabel = t('tassjilFilterResults')
    .replace('{shown}', String(filteredCount))
    .replace('{total}', String(schools.length));

  return (
    <View style={styles.panel}>
      <View style={[styles.panelHead, isRTL && styles.rowRtl]}>
        <View style={[styles.panelTitleRow, isRTL && styles.rowRtl]}>
          <FontAwesome name="filter" size={13} color={brand.primary} />
          <Text style={[styles.panelTitle, isRTL && styles.rtlText]}>
            {t('tassjilFilterTitle')}
          </Text>
        </View>
        <View style={[styles.panelActions, isRTL && styles.rowRtl]}>
          <Text style={[styles.resultsTxt, isRTL && styles.rtlText]}>{resultsLabel}</Text>
          {hasActiveFilter ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tassjilFilterReset')}
              onPress={clearAll}
              style={({ pressed }) => [styles.resetBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
            >
              <FontAwesome name="times-circle" size={12} color={brand.textMuted} />
              <Text style={[styles.resetBtnTxt, isRTL && styles.rtlText]}>
                {t('tassjilFilterReset')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <FilterRow
        label={t('tassjilStatInscription')}
        options={inscriptionOptions}
        value={inscriptionFilter}
        onChange={onInscriptionFilterChange}
        allLabel={t('tassjilFilterAll')}
        isRTL={isRTL}
        isArabic={isArabic}
      />
      <FilterRow
        label={t('tassjilStatSuivi')}
        options={suiviOptions}
        value={suiviFilter}
        onChange={onSuiviFilterChange}
        allLabel={t('tassjilFilterAll')}
        isRTL={isRTL}
        isArabic={isArabic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  panelHead: {
    gap: spacing.xs,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  panelTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  panelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resultsTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  resetBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.textMuted,
  },
  rowBlock: {
    gap: 6,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: brand.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chipsRowRtl: {
    flexDirection: 'row-reverse',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: 260,
  },
  chipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    flexShrink: 1,
  },
  chipBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  chipBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
