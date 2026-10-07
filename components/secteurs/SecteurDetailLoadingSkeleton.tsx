import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

function SectionCardSkeleton({
  pulseStyle,
  isRTL,
  variant = 'text',
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
  variant?: 'text' | 'salary' | 'chips' | 'bullets';
}) {
  return (
    <View style={styles.section}>
      <SkeletonBlock
        style={[styles.sectionTitle, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
        pulseStyle={pulseStyle}
      />
      {variant === 'salary' ? (
        <SkeletonBlock style={styles.salaryBox} pulseStyle={pulseStyle} />
      ) : null}
      {variant === 'text' ? (
        <View style={styles.textBlock}>
          <SkeletonBlock style={styles.line} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.line} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.line, styles.lineShort]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.line, styles.lineMid]} pulseStyle={pulseStyle} />
        </View>
      ) : null}
      {variant === 'chips' ? (
        <View style={[styles.chips, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.chipWide} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.chipShort} pulseStyle={pulseStyle} />
        </View>
      ) : null}
      {variant === 'bullets' ? (
        <View style={styles.bulletList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.bulletRow, isRTL && styles.rowRtl]}>
              <SkeletonBlock style={styles.bulletIcon} pulseStyle={pulseStyle} />
              <SkeletonBlock
                style={[styles.bulletTxt, i === 2 ? styles.lineShort : null]}
                pulseStyle={pulseStyle}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Placeholder aligné sur `secteurs/[id]` :
 * cover → carte header → sections blanches → CTA.
 * Même pattern pulse / cartes blanches que annonces & écoles.
 */
export function SecteurDetailLoadingSkeleton({
  isRTL = false,
  bottomInset = 0,
  style,
}: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + bottomInset }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.coverWrap}>
        <SkeletonBlock style={styles.cover} pulseStyle={pulseStyle} />
      </View>

      <View style={styles.headerCard}>
        <SkeletonBlock
          style={[styles.h1, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.code, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.matchPill, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.statBox} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.statBox} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.statBox} pulseStyle={pulseStyle} />
        </View>
      </View>

      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} variant="salary" />
      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} variant="text" />
      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} variant="chips" />
      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} variant="chips" />
      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} variant="bullets" />

      <SkeletonBlock style={styles.cta} pulseStyle={pulseStyle} />
    </ScrollView>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
  },
  content: {
    gap: spacing.md,
  },
  coverWrap: {
    height: 200,
    backgroundColor: brand.borderLight,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    backgroundColor: brand.borderLight,
  },
  headerCard: {
    marginTop: -28,
    marginHorizontal: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: 10,
  },
  h1: {
    width: '78%',
    height: 22,
    borderRadius: 6,
    backgroundColor: skStrong,
  },
  code: {
    width: '36%',
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  matchPill: {
    width: 96,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: sk,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  statBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
  },
  section: {
    marginHorizontal: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: spacing.sm,
  },
  sectionTitle: {
    width: '42%',
    height: 16,
    borderRadius: 5,
    backgroundColor: skStrong,
    marginBottom: 2,
  },
  salaryBox: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  textBlock: { gap: 8 },
  line: {
    width: '100%',
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  lineMid: { width: '72%' },
  lineShort: { width: '58%' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: 76,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  chipWide: {
    width: 104,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  chipShort: {
    width: 52,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  bulletList: { gap: 10 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: sk,
  },
  bulletTxt: {
    flex: 1,
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  cta: {
    marginHorizontal: spacing.lg,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: skStrong,
  },
});
