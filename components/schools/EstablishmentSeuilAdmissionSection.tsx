import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';
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

type ModeTheme = {
  accent: string;
  accentSoft: string;
  border: string;
  icon: 'tachometer' | 'book' | 'users' | 'map-marker' | 'graduation-cap';
};

function themeForMode(mode: SeuilAdmissionMode): ModeTheme {
  switch (mode) {
    case 'general':
      return {
        accent: '#B45309',
        accentSoft: 'rgba(245,158,11,0.10)',
        border: 'rgba(245,158,11,0.22)',
        icon: 'tachometer',
      };
    case 'filiere_bac':
      return {
        accent: homeShell.greenDark,
        accentSoft: homeShell.greenAlpha11,
        border: 'rgba(47,206,148,0.22)',
        icon: 'book',
      };
    case 'genre':
      return {
        accent: homeShell.blue,
        accentSoft: 'rgba(51,62,143,0.08)',
        border: 'rgba(51,62,143,0.18)',
        icon: 'users',
      };
    case 'ville':
      return {
        accent: '#0F766E',
        accentSoft: 'rgba(15,118,110,0.10)',
        border: 'rgba(15,118,110,0.20)',
        icon: 'map-marker',
      };
    default:
      return {
        accent: homeShell.cardMuted,
        accentSoft: '#F8FAFC',
        border: homeShell.borderOnWhite,
        icon: 'graduation-cap',
      };
  }
}

function sourceColors(source: SeuilSource): { bg: string; text: string; border: string } {
  if (source === 'official') {
    return {
      bg: 'rgba(16,185,129,0.10)',
      text: '#047857',
      border: 'rgba(16,185,129,0.22)',
    };
  }
  return {
    bg: 'rgba(245,158,11,0.12)',
    text: '#B45309',
    border: 'rgba(245,158,11,0.28)',
  };
}

function ValueChip({
  temporalLabel,
  valueLabel,
  sourceLabel,
  source,
  rtl,
}: {
  temporalLabel: string;
  valueLabel: string;
  sourceLabel: string;
  source: SeuilSource;
  rtl?: boolean;
}) {
  const colors = sourceColors(source);
  return (
    <View style={[styles.valueChip, { borderColor: colors.border, backgroundColor: colors.bg }]}>
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
  theme,
  rtl,
  mission,
}: {
  row: SeuilRowDisplay;
  theme: ModeTheme;
  rtl?: boolean;
  mission?: boolean;
}) {
  const iconName = mission ? 'star' : theme.icon;
  return (
    <View style={[styles.segment, { borderColor: theme.border, backgroundColor: theme.accentSoft }]}>
      <View style={[styles.segmentHead, rtl && styles.rowRtl]}>
        <FontAwesome name={iconName} size={13} color={theme.accent} />
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
          />
        ))}
      </View>
    </View>
  );
}

function SeuilPanel({
  display,
  theme,
  rtl,
  disclaimer,
  bacNormalLabel,
  bacMissionLabel,
  modeLabel,
}: {
  display: SeuilAdmissionDisplay;
  theme: ModeTheme;
  rtl?: boolean;
  disclaimer: string;
  bacNormalLabel: string;
  bacMissionLabel: string;
  modeLabel: string;
}) {
  return (
    <View style={[styles.panel, { borderLeftColor: theme.accent }]}>
      <View style={[styles.panelHead, rtl && styles.rowRtl]}>
        <View style={[styles.panelIcon, { backgroundColor: theme.accentSoft }]}>
          <FontAwesome name={theme.icon} size={16} color={theme.accent} />
        </View>
        <View style={[styles.panelHeadText, rtl && styles.rtlCol]}>
          {display.mode ? (
            <View style={[styles.modePill, { borderColor: theme.border, backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.modePillTxt, { color: theme.accent }, rtl && styles.rtlText]}>
                {modeLabel} : {display.modeShortLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {display.bacNormalRows.length > 0 ? (
        <View style={styles.group}>
          <Text style={[styles.groupLbl, rtl && styles.rtlText]}>{bacNormalLabel}</Text>
          {display.bacNormalRows.map((row, idx) => (
            <SegmentBlock key={`${row.segmentLabel}-${idx}`} row={row} theme={theme} rtl={rtl} />
          ))}
        </View>
      ) : null}

      {display.bacMissionRow ? (
        <View style={styles.group}>
          <Text style={[styles.groupLbl, rtl && styles.rtlText]}>{bacMissionLabel}</Text>
          <SegmentBlock row={display.bacMissionRow} theme={theme} rtl={rtl} mission />
        </View>
      ) : null}

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
  const theme = themeForMode(display.mode);

  return (
    <SeuilPanel
      display={display}
      theme={theme}
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
    borderColor: homeShell.borderOnWhite,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    padding: spacing.md,
    gap: spacing.md,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  panelIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeadText: {
    flex: 1,
    gap: 6,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modePillTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  group: {
    gap: spacing.sm,
  },
  groupLbl: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  segment: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  segmentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  valueChip: {
    minWidth: '46%',
    flexGrow: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: 4,
  },
  valueTemporal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  valueNote: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: homeShell.cardText,
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
    color: homeShell.cardMuted,
    fontWeight: '600',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
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
