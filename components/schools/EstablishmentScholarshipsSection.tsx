import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type ComponentProps } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { HomeCopyKey } from '@/constants/i18n';
import {
  bourseTypeIconName,
  formatEstablishmentBoursePercentRange,
  labelEstablishmentBourseType,
} from '@/utils/establishmentFormat';

type Props = {
  bourseMin?: string | number | null;
  bourseMax?: string | number | null;
  typesBourse?: string[];
  rtl?: boolean;
  t: (key: HomeCopyKey) => string;
};

function typeChipStyle(count: number): ViewStyle {
  if (count <= 1) return { flexBasis: '100%', maxWidth: '100%', flexGrow: 1 };
  if (count === 2) return { flexBasis: '48%', minWidth: '46%', flexGrow: 1 };
  return { flexBasis: '31%', minWidth: '30%', flexGrow: 1 };
}

function typeVisual(type: string): {
  icon: ComponentProps<typeof FontAwesome>['name'];
  chipBg: string;
  chipBorder: string;
  chipText: string;
  iconBg: string;
  iconColor: string;
} {
  switch (type.trim()) {
    case 'financiere':
      return {
        icon: 'money',
        chipBg: 'rgba(51,62,143,0.08)',
        chipBorder: 'rgba(51,62,143,0.18)',
        chipText: brand.primary,
        iconBg: 'rgba(51,62,143,0.12)',
        iconColor: brand.primary,
      };
    case 'logement':
      return {
        icon: 'home',
        chipBg: 'rgba(47,206,148,0.12)',
        chipBorder: 'rgba(47,206,148,0.30)',
        chipText: brand.emerald,
        iconBg: 'rgba(47,206,148,0.18)',
        iconColor: brand.emerald,
      };
    case 'reduction_scolarite':
      return {
        icon: 'tag' as const,
        chipBg: 'rgba(61,75,168,0.10)',
        chipBorder: 'rgba(61,75,168,0.22)',
        chipText: '#1a2454',
        iconBg: 'rgba(61,75,168,0.12)',
        iconColor: brand.primary,
      };
    default:
      return {
        icon: bourseTypeIconName(type),
        chipBg: 'rgba(51,62,143,0.08)',
        chipBorder: 'rgba(51,62,143,0.18)',
        chipText: brand.primary,
        iconBg: 'rgba(51,62,143,0.12)',
        iconColor: brand.primary,
      };
  }
}

export function EstablishmentScholarshipsSection({
  bourseMin,
  bourseMax,
  typesBourse = [],
  rtl,
  t,
}: Props) {
  const rangeLabel = formatEstablishmentBoursePercentRange(bourseMin, bourseMax, {
    from: t('estScholarshipsFromPct'),
    upTo: t('estScholarshipsUpToPct'),
    singleSuffix: t('estScholarshipsPctSuffix'),
    rangeSep: t('estScholarshipsRangeSep'),
  });
  const types = typesBourse.filter(Boolean);
  const typeCount = types.length;

  return (
    <View style={styles.panel}>
      <View style={styles.accentBar} />
      <View style={[styles.head, rtl && styles.rowRtl]}>
        <View style={styles.headIcon}>
          <FontAwesome name="gift" size={16} color={brand.primary} />
        </View>
        <View style={[styles.headText, rtl && styles.rtlCol]}>
          <Text style={[styles.title, rtl && styles.rtlText]}>{t('estScholarshipsAvailable')}</Text>
          <Text style={[styles.subtitle, rtl && styles.rtlText]}>{t('estScholarshipsSubtitle')}</Text>
        </View>
      </View>

      {rangeLabel ? (
        <View style={styles.valueCard}>
          <View style={[styles.valueHead, rtl && styles.rowRtl]}>
            <View style={styles.valueIcon}>
              <FontAwesome name="line-chart" size={13} color={brand.primary} />
            </View>
            <Text style={[styles.valueLbl, rtl && styles.rtlText]}>{t('estScholarshipsValueLabel')}</Text>
          </View>
          <Text style={[styles.valueTxt, rtl && styles.rtlText]}>{rangeLabel}</Text>
        </View>
      ) : null}

      {types.length > 0 ? (
        <View style={styles.typesBlock}>
          <Text style={[styles.typesLbl, rtl && styles.rtlText]}>{t('estScholarshipsTypesLabel')}</Text>
          <View style={styles.typesGrid}>
            {types.map((typeKey) => {
              const visual = typeVisual(String(typeKey));
              return (
                <View
                  key={typeKey}
                  style={[
                    styles.typeChip,
                    typeChipStyle(typeCount),
                    {
                      backgroundColor: visual.chipBg,
                      borderColor: visual.chipBorder,
                    },
                  ]}
                >
                  <View style={[styles.typeIcon, { backgroundColor: visual.iconBg }]}>
                    <FontAwesome name={visual.icon} size={14} color={visual.iconColor} />
                  </View>
                  <Text style={[styles.typeTxt, { color: visual.chipText }, rtl && styles.rtlText]}>
                    {labelEstablishmentBourseType(String(typeKey), t)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.md,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: brand.primary,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: 4,
  },
  headIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  headText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: brand.textMuted,
    fontWeight: '600',
  },
  valueCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    backgroundColor: 'rgba(51,62,143,0.05)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  valueHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  valueLbl: {
    fontSize: 10,
    fontWeight: '900',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  valueTxt: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: brand.text,
  },
  typesBlock: {
    gap: spacing.sm,
  },
  typesLbl: {
    fontSize: 10,
    fontWeight: '900',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minWidth: 0,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rtlCol: {
    alignItems: 'flex-end',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
