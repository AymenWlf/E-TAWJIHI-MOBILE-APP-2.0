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
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <FontAwesome name="balance-scale" size={26} color={brand.primary} />
          </View>
          <Text style={[styles.title, rtl && styles.rtlText]}>
            {tOd(uiLocale, 'situationBriefTitle')}
          </Text>
          <Text style={[styles.sub, rtl && styles.rtlText]}>
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
          <Text style={[styles.tipTxt, rtl && styles.rtlText]}>{tOd(uiLocale, 'briefTip')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <FontAwesome name="random" size={26} color={brand.primary} />
        </View>
        <Text style={[styles.title, rtl && styles.rtlText]}>
          {tOd(uiLocale, 'versusBriefTitle')}
        </Text>
        <Text style={[styles.sub, rtl && styles.rtlText]}>
          {tOd(uiLocale, 'versusBriefSub')}
        </Text>
      </View>

      <View style={styles.cards}>
        <BriefCard
          rtl={rtl}
          palette={PLUS}
          badge={tOd(uiLocale, 'metierBadge')}
          title={tOd(uiLocale, 'versusCardTitle')}
          body={tOd(uiLocale, 'versusMetierText')}
        />
        <BriefCard
          rtl={rtl}
          palette={MOINS}
          badge={tOd(uiLocale, 'ecoleBadge')}
          title={tOd(uiLocale, 'versusCardTitle')}
          body={tOd(uiLocale, 'versusEcoleText')}
        />
      </View>

      <View style={[styles.tipBox, rtl && styles.tipBoxRtl]}>
        <FontAwesome name="info-circle" size={16} color={brand.primary} />
        <Text style={[styles.tipTxt, rtl && styles.rtlText]}>{tOd(uiLocale, 'versusNote')}</Text>
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
        <Text style={styles.badgeTxt}>{badge}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: palette.text }, rtl && styles.rtlText]}>
        {title}
      </Text>
      <Text style={[styles.cardBody, { color: palette.text }, rtl && styles.rtlText]}>{body}</Text>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
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
  cardRtl: { alignItems: 'flex-end' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  badgeRtl: { alignSelf: 'flex-end' },
  badgeTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
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
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
