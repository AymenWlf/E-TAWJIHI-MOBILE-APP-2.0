import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { tOd, type OrientationUiLocale } from '../data/orientationDiagnosticI18n';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

import { DIR_RTL } from '@/utils/layoutDirection';
type BriefKind = 'situation' | 'versus';

const PLUS = {
  bg: '#d1fae5',
  border: '#059669',
  text: '#065f46',
  badge: '#059669',
} as const;

const MOINS = {
  bg: '#fecaca',
  border: '#dc2626',
  text: '#7f1d1d',
  badge: '#dc2626',
} as const;

export function OrientationDiagnosticBriefScreen({
  kind,
  uiLocale,
  rtl,
}: {
  kind: BriefKind;
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
}) {
  if (kind === 'situation') {
    return (
      <View style={[styles.wrap, rtl && styles.wrapRtl]}>
        <View style={[styles.hero, rtl && styles.heroRtl]}>
          <View style={styles.iconCircle}>
            <FontAwesome name="balance-scale" size={26} color={brand.primary} />
          </View>
          <Text style={[styles.title, rtl && styles.rtlBlock]}>
            {tOd(uiLocale, 'situationBriefTitle')}
          </Text>
          <Text style={[styles.sub, rtl && styles.rtlBlock]}>
            {tOd(uiLocale, 'situationBriefSub')}
          </Text>
        </View>

        <View style={styles.cards}>
          <BriefCard
            rtl={rtl}
            palette={PLUS}
            badge={tOd(uiLocale, 'plusBadge')}
            title={tOd(uiLocale, 'plusTitle')}
            body={tOd(uiLocale, 'plusText')}
          />
          <BriefCard
            rtl={rtl}
            palette={MOINS}
            badge={tOd(uiLocale, 'moinsBadge')}
            title={tOd(uiLocale, 'moinsTitle')}
            body={tOd(uiLocale, 'moinsText')}
          />
        </View>

        <View style={[styles.tipBox, rtl && styles.tipBoxRtl]}>
          <FontAwesome name="lightbulb-o" size={16} color={brand.primary} />
          <Text style={[styles.tipTxt, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'briefTip')}</Text>
        </View>
      </View>
    );
  }

  const rounds = [
    ['16', 'versusPathR16'],
    ['8', 'versusPathQF'],
    ['4', 'versusPathSF'],
    ['2', 'versusPathFinal'],
  ] as const;

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <View style={[styles.hero, rtl && styles.heroRtl]}>
        <View style={styles.iconCircle}>
          <FontAwesome name="trophy" size={26} color={brand.primary} />
        </View>
        <Text style={[styles.title, rtl && styles.rtlBlock]}>
          {tOd(uiLocale, 'versusBriefTitle')}
        </Text>
        <Text style={[styles.sub, rtl && styles.rtlBlock]}>
          {tOd(uiLocale, 'versusBriefSub')}
        </Text>
      </View>

      <View style={[styles.path, rtl && styles.pathRtl]}>
        {rounds.map(([count, labelKey], index) => (
          <View
            key={labelKey}
            style={[styles.pathStep, index === rounds.length - 1 && styles.pathStepFinal]}>
            <Text style={[styles.pathCount, index === rounds.length - 1 && styles.pathOn]}>{count}</Text>
            <Text style={[styles.pathLabel, index === rounds.length - 1 && styles.pathOn]}>
              {tOd(uiLocale, labelKey)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.duel, rtl && styles.duelRtl]}>
        <View style={[styles.player, styles.playerOn, rtl && styles.cardRtl]}>
          <Text style={[styles.playerKicker, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusChosen')}</Text>
          <Text style={[styles.playerName, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusFavorite')}</Text>
        </View>
        <View style={styles.vs}>
          <Text style={styles.vsTxt}>VS</Text>
        </View>
        <View style={[styles.player, rtl && styles.cardRtl]}>
          <Text style={[styles.playerKicker, rtl && styles.rtlBlock]}>
            {tOd(uiLocale, 'versusTapToChoose')}
          </Text>
          <Text style={[styles.playerName, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusChallenger')}</Text>
        </View>
      </View>

      <View style={styles.lanes}>
        <View style={[styles.lane, rtl && styles.cardRtl]}>
          <View style={styles.step}>
            <Text style={styles.stepTxt}>1</Text>
          </View>
          <View style={styles.laneBody}>
            <Text style={[styles.laneTitle, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'metierBadge')}</Text>
            <Text style={[styles.laneText, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusMetierText')}</Text>
          </View>
        </View>
        <View style={[styles.lane, rtl && styles.cardRtl]}>
          <View style={styles.step}>
            <Text style={styles.stepTxt}>2</Text>
          </View>
          <View style={styles.laneBody}>
            <Text style={[styles.laneTitle, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'ecoleBadge')}</Text>
            <Text style={[styles.laneText, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusEcoleText')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tipBox, rtl && styles.tipBoxRtl]}>
        <FontAwesome name="info-circle" size={16} color={brand.primary} />
        <Text style={[styles.tipTxt, rtl && styles.rtlBlock]}>{tOd(uiLocale, 'versusNote')}</Text>
      </View>
    </View>
  );
}

function BriefCard({
  palette,
  badge,
  title,
  body,
  rtl,
}: {
  palette: typeof PLUS | typeof MOINS;
  badge: string;
  title: string;
  body: string;
  rtl?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.bg, borderColor: palette.border },
        rtl && styles.cardRtl,
      ]}>
      <View
        style={[
          styles.badge,
          { backgroundColor: palette.badge },
          rtl && styles.badgeRtl,
        ]}>
        <Text style={[styles.badgeTxt, rtl && styles.badgeTxtRtl]}>{badge}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: palette.text }, rtl && styles.rtlBlock]}>
        {title}
      </Text>
      <Text style={[styles.cardBody, { color: palette.text }, rtl && styles.rtlBlock]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  wrapRtl: DIR_RTL,
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  heroRtl: { ...DIR_RTL, alignItems: 'stretch' },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  sub: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  cards: { gap: spacing.sm },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: 6,
  },
  cardRtl: { ...DIR_RTL, alignItems: 'stretch' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  badgeRtl: { alignSelf: 'flex-start' },
  badgeTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgeTxtRtl: { writingDirection: 'rtl', textAlign: 'right', letterSpacing: 0 },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  cardBody: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: diagnosticTheme.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  tipBoxRtl: { flexDirection: 'row-reverse' },
  tipTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  path: { flexDirection: 'row', gap: 6 },
  pathRtl: { flexDirection: 'row-reverse' },
  pathStep: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: '#f4f6fb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pathStepFinal: { backgroundColor: brand.primary, borderColor: brand.primary },
  pathCount: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary },
  pathLabel: { fontSize: 10, fontWeight: '700', color: brand.textMuted, textAlign: 'center' },
  pathOn: { color: brand.white },
  duel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duelRtl: { flexDirection: 'row-reverse' },
  player: {
    flex: 1,
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: brand.white,
  },
  playerOn: { borderWidth: 2, borderColor: brand.primary },
  playerKicker: { fontSize: 10, fontWeight: '800', color: brand.primary },
  playerName: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  vs: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
  },
  vsTxt: { color: brand.white, fontSize: 11, fontWeight: '800' },
  lanes: { gap: spacing.sm },
  lane: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: brand.white,
  },
  laneBody: { flex: 1, gap: 4 },
  laneTitle: { fontSize: 12, fontWeight: '800', color: brand.primary, letterSpacing: 0.4 },
  laneText: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: '600', color: brand.text },
  step: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
  },
  stepTxt: { color: brand.white, fontSize: 12, fontWeight: '800' },
  rtlBlock: {
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'stretch',
    width: '100%',
  },
});
