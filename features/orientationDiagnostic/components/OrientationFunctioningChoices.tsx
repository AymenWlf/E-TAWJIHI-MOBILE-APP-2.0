import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { diagnosticTheme, LIKERT_DEGREE_ICON } from '@/components/diagnostic/DiagnosticUi';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

import { DIR_RTL } from '@/utils/layoutDirection';
export type FunctioningOption = {
  id: string;
  label: string;
};

/** Échelle 1→5 (likert / single à 5 options) — module fonctionnement. */
export function FunctioningScaleChoices({
  options,
  selectedId,
  onSelect,
  rtl,
  lowHint,
  highHint,
}: {
  options: FunctioningOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  rtl?: boolean;
  lowHint?: string;
  highHint?: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.scaleTrack, rtl && styles.scaleTrackRtl]}>
        <View style={styles.scaleBar}>
          <View
            style={[
              styles.scaleFill,
              {
                width: selectedId
                  ? `${((options.findIndex((o) => o.id === selectedId) + 1) / options.length) * 100}%`
                  : '0%',
              },
            ]}
          />
        </View>
        <View style={[styles.scaleHints, rtl && styles.scaleHintsRtl]}>
          <Text style={styles.scaleHint}>{lowHint ?? (rtl ? 'أقل' : 'Moins')}</Text>
          <Text style={styles.scaleHint}>{highHint ?? (rtl ? 'أكثر' : 'Plus')}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {options.map((opt, index) => {
          const on = selectedId === opt.id;
          const n = index + 1;
          const degreeIcon = LIKERT_DEGREE_ICON[opt.id];
          const mark = (
            <View style={[styles.numChip, on && styles.numChipOn]}>
              {degreeIcon ? (
                <FontAwesome name={degreeIcon} size={14} color={on ? brand.white : brand.primary} />
              ) : (
                <Text style={[styles.numChipTxt, on && styles.numChipTxtOn]} latinDigits>
                  {n}
                </Text>
              )}
            </View>
          );
          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                styles.scaleRow,
                on && styles.scaleRowOn,
                pressed && !on && styles.pressed,
              ]}>
              {rtl ? (
                <>
                  <Text
                    style={[styles.scaleLabel, styles.rtlText, on && styles.scaleLabelOn]}
                    numberOfLines={3}>
                    {opt.label}
                  </Text>
                  <View style={[styles.checkSlot, on && styles.checkSlotOn]}>
                    {on ? <FontAwesome name="check" size={12} color={brand.white} /> : null}
                  </View>
                  {mark}
                </>
              ) : (
                <>
                  {mark}
                  <Text
                    style={[styles.scaleLabel, on && styles.scaleLabelOn]}
                    numberOfLines={3}>
                    {opt.label}
                  </Text>
                  <View style={[styles.checkSlot, on && styles.checkSlotOn]}>
                    {on ? <FontAwesome name="check" size={12} color={brand.white} /> : null}
                  </View>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Deux options opposées (cartes A / B). */
export function FunctioningBinaryChoices({
  options,
  selectedId,
  onSelect,
  rtl,
}: {
  options: FunctioningOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  rtl?: boolean;
}) {
  const letters = ['A', 'B'] as const;
  return (
    <View style={styles.binaryCol}>
      {options.map((opt, i) => {
        const on = selectedId === opt.id;
        const letter = letters[i] ?? String(i + 1);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={({ pressed }) => [
              styles.binaryCard,
              on && styles.binaryCardOn,
              pressed && !on && styles.pressed,
            ]}>
            <View style={[styles.binaryTop, rtl && styles.binaryTopRtl]}>
              <View style={[styles.letter, on && styles.letterOn]}>
                <Text style={[styles.letterTxt, on && styles.letterTxtOn]}>{letter}</Text>
              </View>
              {on ? (
                <View style={[styles.pickedPill, rtl && styles.pickedPillRtl]}>
                  <FontAwesome name="check" size={11} color={homeShell.greenDark} />
                  <Text style={styles.pickedPillTxt}>{rtl ? 'مختار' : 'Choisi'}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.binaryLabel, rtl && styles.rtlText, on && styles.binaryLabelOn]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Dilemme A / milieu / B — polish module fonctionnement & réalité. */
export function FunctioningDilemmaChoices({
  leftLabel,
  rightLabel,
  midLabel,
  value,
  onSelect,
  rtl,
}: {
  leftLabel: string;
  rightLabel: string;
  midLabel: string;
  value?: number;
  onSelect: (score: number) => void;
  rtl?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dilemmaPair, rtl && styles.dilemmaPairRtl]}>
        {(
          [
            { letter: 'A', label: leftLabel, score: 20 },
            { letter: 'B', label: rightLabel, score: 80 },
          ] as const
        ).map((c) => {
          const on = value === c.score;
          return (
            <Pressable
              key={c.letter}
              onPress={() => onSelect(c.score)}
              style={({ pressed }) => [
                styles.dilemmaCard,
                on && styles.dilemmaCardOn,
                pressed && !on && styles.pressed,
              ]}>
              <View style={[styles.letter, on && styles.letterOn]}>
                <Text style={[styles.letterTxt, on && styles.letterTxtOn]}>{c.letter}</Text>
              </View>
              <Text style={[styles.dilemmaLabel, rtl && styles.rtlText, on && styles.binaryLabelOn]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={() => onSelect(50)}
        style={({ pressed }) => [
          styles.midBtn,
          value === 50 && styles.midBtnOn,
          pressed && value !== 50 && styles.pressed,
        ]}>
        {rtl ? (
          <>
            <Text style={[styles.midTxt, styles.rtlText, value === 50 && styles.midTxtOn]}>
              {midLabel}
            </Text>
            <FontAwesome
              name="balance-scale"
              size={14}
              color={value === 50 ? brand.primary : brand.textMuted}
            />
          </>
        ) : (
          <>
            <FontAwesome
              name="balance-scale"
              size={14}
              color={value === 50 ? brand.primary : brand.textMuted}
            />
            <Text style={[styles.midTxt, value === 50 && styles.midTxtOn]}>{midLabel}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingBottom: spacing.xl },
  scaleTrack: { gap: 6 },
  scaleTrackRtl: DIR_RTL,
  scaleBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  scaleFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: homeShell.green,
  },
  scaleHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleHintsRtl: { flexDirection: 'row-reverse' },
  scaleHint: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: { gap: spacing.sm },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  scaleRowOn: {
    borderColor: homeShell.green,
    backgroundColor: homeShell.greenSurface,
  },
  pressed: { opacity: 0.92 },
  numChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: diagnosticTheme.primarySoft,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 62, 143, 0.15)',
  },
  numChipOn: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.green,
  },
  numChipTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  numChipTxtOn: { color: brand.white },
  scaleLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.text,
    lineHeight: 20,
  },
  scaleLabelOn: { fontWeight: '800', color: homeShell.greenDark },
  checkSlot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSlotOn: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.green,
  },
  binaryCol: { gap: spacing.sm, paddingBottom: spacing.xl },
  binaryCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 108,
  },
  binaryCardOn: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  binaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  binaryTopRtl: { flexDirection: 'row-reverse' },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
  },
  letterOn: { backgroundColor: brand.primary },
  letterTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  letterTxtOn: { color: brand.white },
  pickedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: homeShell.greenSurfaceStrong,
  },
  pickedPillRtl: { flexDirection: 'row-reverse' },
  pickedPillTxt: { fontSize: 11, fontWeight: '800', color: homeShell.greenDark },
  binaryLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 22,
  },
  binaryLabelOn: { color: brand.primary },
  dilemmaPair: { flexDirection: 'row', gap: spacing.sm },
  dilemmaPairRtl: { flexDirection: 'row-reverse' },
  dilemmaCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 140,
  },
  dilemmaCardOn: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  dilemmaLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  midBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  midBtnOn: {
    borderStyle: 'solid',
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  midTxt: { fontSize: fontSize.sm, fontWeight: '700', color: brand.textMuted },
  midTxtOn: { color: brand.primary },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
