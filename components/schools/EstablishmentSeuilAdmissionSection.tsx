import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type ComponentProps } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  type SeuilAdmissionDisplay,
  type SeuilAdmissionMode,
  type SeuilRowDisplay,
  type SeuilSource,
} from '@/utils/establishmentSeuilAdmission';

type Props = {
  display: SeuilAdmissionDisplay;
  rtl?: boolean;
  disclaimer: string;
  bacNormalLabel: string;
  bacMissionLabel: string;
  modeLabel: string;
};

function iconForMode(mode: SeuilAdmissionMode): ComponentProps<typeof FontAwesome>['name'] {
  switch (mode) {
    case 'general':
      return 'tachometer';
    case 'filiere_bac':
      return 'book';
    case 'genre':
      return 'users';
    case 'ville':
      return 'map-marker';
    default:
      return 'graduation-cap';
  }
}

function segmentIconName(label: string, mission?: boolean): ComponentProps<typeof FontAwesome>['name'] {
  if (mission) return 'star';
  const l = label.toLowerCase();
  if (l.includes('mission') || l.includes('international') || l.includes('دولية')) return 'star';
  if (l.includes('site') || l.includes('ville') || l.includes('موقع') || l.includes('مدينة')) return 'map-marker';
  if (l.includes('hommes') || l.includes('femmes') || l.includes('ذكور') || l.includes('إناث')) return 'users';
  if (l.includes('filière') || l.includes('filiere') || l.includes('شعبة')) return 'book';
  return 'graduation-cap';
}

/** Largeur segment si plusieurs lignes (filières, campus…). */
function segmentCellStyle(count: number): ViewStyle | undefined {
  if (count <= 1) return undefined;
  if (count === 2) return { flexBasis: '48%', minWidth: '46%', flexGrow: 1, maxWidth: '100%' };
  return { flexBasis: '100%', minWidth: 0, flexGrow: 1 };
}

function sourceColors(source: SeuilSource): { bg: string; text: string; border: string } {
  if (source === 'official') {
    return {
      bg: 'rgba(4,120,87,0.10)',
      text: brand.emerald,
      border: 'rgba(4,120,87,0.22)',
    };
  }
  return {
    bg: 'rgba(245,158,11,0.12)',
    text: '#B45309',
    border: 'rgba(245,158,11,0.28)',
  };
}

/** Largeur des cartes valeur selon le nombre affiché (évite les colonnes vides). */
function valueChipFlexStyle(count: number): ViewStyle {
  if (count <= 1) {
    return { flexBasis: '100%', maxWidth: '100%', flexGrow: 1 };
  }
  if (count === 2) {
    return { flexBasis: '48%', minWidth: '46%', flexGrow: 1, maxWidth: '100%' };
  }
  return { flexBasis: '31%', minWidth: '30%', flexGrow: 1, maxWidth: '100%' };
}

function ValueChip({
  temporalLabel,
  valueLabel,
  sourceLabel,
  source,
  rtl,
  flexStyle,
}: {
  temporalLabel: string;
  valueLabel: string;
  sourceLabel: string;
  source: SeuilSource;
  rtl?: boolean;
  flexStyle: ViewStyle;
}) {
  const colors = sourceColors(source);
  return (
    <View style={[styles.valueChip, flexStyle, { borderColor: colors.border, backgroundColor: colors.bg }]}>
      <Text style={[styles.valueTemporal, rtl && styles.rtlText]}>{temporalLabel}</Text>
      <Text style={[styles.valueNote, rtl && styles.rtlText]}>{valueLabel}</Text>
      <View style={[styles.sourcePill, { borderColor: colors.border, backgroundColor: '#fff' }]}>
        <Text style={[styles.sourceTxt, { color: colors.text }, rtl && styles.rtlText]}>{sourceLabel}</Text>
      </View>
    </View>
  );
}

function SegmentBlock({
  row,
  rtl,
  mission,
}: {
  row: SeuilRowDisplay;
  rtl?: boolean;
  mission?: boolean;
}) {
  const valueCount = row.values.length;
  const iconName = segmentIconName(row.segmentLabel, mission);
  return (
    <View style={styles.segment}>
      <View style={[styles.segmentHead, rtl && styles.rowRtl]}>
        <View style={styles.segmentIcon}>
          <FontAwesome name={iconName} size={13} color={brand.primary} />
        </View>
        <Text style={[styles.segmentTitle, rtl && styles.rtlText]}>{row.segmentLabel}</Text>
      </View>
      <View style={styles.valuesGrid}>
        {row.values.map((val) => (
          <ValueChip
            key={`${row.segmentLabel}-${val.key}`}
            temporalLabel={val.temporalLabel}
            valueLabel={val.valueLabel}
            sourceLabel={val.sourceLabel}
            source={val.source}
            rtl={rtl}
            flexStyle={valueChipFlexStyle(valueCount)}
          />
        ))}
      </View>
    </View>
  );
}

function SeuilPanel({
  display,
  rtl,
  disclaimer,
  bacNormalLabel,
  bacMissionLabel,
  modeLabel,
}: {
  display: SeuilAdmissionDisplay;
  rtl?: boolean;
  disclaimer: string;
  bacNormalLabel: string;
  bacMissionLabel: string;
  modeLabel: string;
}) {
  const modeIcon = iconForMode(display.mode);
  const hasBacNormal = display.bacNormalRows.length > 0;

  return (
    <View style={styles.panel}>
      <View style={styles.accentBar} />
      <View style={[styles.panelHead, rtl && styles.rowRtl]}>
        <View style={styles.panelIcon}>
          <FontAwesome name={modeIcon} size={16} color={brand.primary} />
        </View>
        <View style={[styles.panelHeadText, rtl && styles.rtlCol]}>
          {display.mode ? (
            <View style={styles.modePill}>
              <Text style={[styles.modePillTxt, rtl && styles.rtlText]}>
                {modeLabel} : {display.modeShortLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.groupsCol}>
        {hasBacNormal ? (
          <View style={styles.group}>
            <Text style={[styles.groupLbl, rtl && styles.rtlText]}>{bacNormalLabel}</Text>
            <View style={display.bacNormalRows.length > 1 ? styles.segmentsGrid : styles.segmentsCol}>
              {display.bacNormalRows.map((row, idx) => (
                <View
                  key={`${row.segmentLabel}-${idx}`}
                  style={segmentCellStyle(display.bacNormalRows.length)}
                >
                  <SegmentBlock row={row} rtl={rtl} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {display.bacMissionRow ? (
          <View style={styles.group}>
            <Text style={[styles.groupLbl, rtl && styles.rtlText]}>{bacMissionLabel}</Text>
            <SegmentBlock row={display.bacMissionRow} rtl={rtl} mission />
          </View>
        ) : null}
      </View>

      <Text style={[styles.disclaimer, rtl && styles.rtlText]}>{disclaimer}</Text>
    </View>
  );
}

export function EstablishmentSeuilAdmissionSection({
  display,
  rtl,
  disclaimer,
  bacNormalLabel,
  bacMissionLabel,
  modeLabel,
}: Props) {
  return (
    <SeuilPanel
      display={display}
      rtl={rtl}
      disclaimer={disclaimer}
      bacNormalLabel={bacNormalLabel}
      bacMissionLabel={bacMissionLabel}
      modeLabel={modeLabel}
    />
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
  panelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: 4,
  },
  panelIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  panelHeadText: {
    flex: 1,
    gap: 6,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.18)',
    backgroundColor: 'rgba(51,62,143,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modePillTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.primary,
  },
  groupsCol: {
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  groupLbl: {
    fontSize: 10,
    fontWeight: '900',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  segmentsCol: {
    gap: spacing.sm,
  },
  segmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.10)',
    backgroundColor: brand.backgroundSoft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  segmentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  segmentTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  valueChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: 4,
  },
  valueTemporal: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  valueNote: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
  },
  sourcePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  sourceTxt: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: brand.textMuted,
    fontWeight: '600',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(51,62,143,0.10)',
    paddingTop: spacing.sm,
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
