import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticStatusBar, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { TawjihPlusUpgradeCta } from '@/components/inscriptions/TawjihPlusPaywall';
import { Text } from '@/components/ui/Text';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  rtl?: boolean;
  onBack?: () => void;
};

const FEATURE_ICONS: Array<ComponentProps<typeof FontAwesome>['name']> = [
  'graduation-cap',
  'magic',
  'heart-o',
];

type FeatureIcon = ComponentProps<typeof FontAwesome>['name'];

/** Écran affiché à la place du chargement IA lorsque les recommandations sont réservées TAWJIH PLUS. */
export function DiagnosticRecommendationsTawjihPlusGate({ rtl = false, onBack }: Props) {
  const { t, isRTL } = useLocale();
  const layoutRtl = rtl || isRTL;

  const featureKeys = [
    'diagnosticRecoGateFeature1',
    'diagnosticRecoGateFeature2',
    'diagnosticRecoGateFeature3',
  ] as const;

  return (
    <View style={[styles.root, layoutRtl && styles.rootRtl]}>
      <DiagnosticStatusBar />

      <SafeAreaView style={[styles.headerSafe, layoutRtl && styles.headerRtl]} edges={['top']}>
        <View style={[styles.headerRow, layoutRtl && styles.headerRowRtl]}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10} accessibilityRole="button">
              <FontAwesome
                name={layoutRtl ? 'chevron-right' : 'chevron-left'}
                size={18}
                color={brand.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <View style={[styles.headerCenter, layoutRtl && styles.headerCenterRtl]}>
            <Text
              style={[
                styles.headerEyebrow,
                layoutRtl && styles.rtlText,
                layoutRtl && styles.rtlNoTransform,
              ]}>
              {t('diagnosticRecoGateEyebrow')}
            </Text>
            <Text style={[styles.headerTitle, layoutRtl && styles.rtlText]}>
              {t('diagnosticRecoGateHeaderTitle')}
            </Text>
            <Text style={[styles.headerSub, layoutRtl && styles.rtlText]}>
              {t('diagnosticRecoGateHeaderSub')}
            </Text>
          </View>
        </View>
        <View style={styles.headerAccentLine} />
      </SafeAreaView>

      <ScrollView
        style={[styles.body, layoutRtl && styles.bodyRtl]}
        contentContainerStyle={[styles.bodyContent, layoutRtl && styles.bodyContentRtl]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.lockCard}>
          <View style={[styles.cardBadgeRow, layoutRtl && styles.cardBadgeRowRtl]}>
            <View style={styles.plusBadge}>
              <FontAwesome name="star" size={10} color={homeShell.greenDark} />
              <Text style={[styles.plusBadgeTxt, layoutRtl && styles.rtlText]}>
                {t('diagnosticRecoGateCardBadge')}
              </Text>
            </View>
            <View style={styles.lockPill}>
              <FontAwesome name="lock" size={11} color={brand.primary} />
            </View>
          </View>

          <View style={[styles.cardHero, layoutRtl && styles.cardHeroRtl]}>
            <View style={styles.cardIconMain}>
              <FontAwesome name="graduation-cap" size={22} color={brand.primary} />
            </View>
            <View style={styles.cardIconIa}>
              <FontAwesome name="magic" size={14} color={homeShell.greenDark} />
            </View>
          </View>

          <Text style={[styles.cardTitle, layoutRtl && styles.rtlText]}>
            {t('diagnosticRecoGateCardTitle')}
          </Text>
          <Text style={[styles.cardDesc, layoutRtl && styles.rtlText]}>
            {t('diagnosticRecoGateCardDesc')}
          </Text>

          <View style={styles.featureList}>
            {featureKeys.map((key, index) => (
              <View key={key} style={[styles.featureRow, layoutRtl && styles.featureRowRtl]}>
                <View style={styles.featureIconWrap}>
                  <FontAwesome
                    name={FEATURE_ICONS[index] as FeatureIcon}
                    size={13}
                    color={brand.primary}
                  />
                </View>
                <Text style={[styles.featureTxt, layoutRtl && styles.rtlTextLeft]}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.savedBox, layoutRtl && styles.savedBoxRtl]}>
          <FontAwesome name="check-circle" size={18} color={homeShell.greenDark} />
          <Text style={[styles.savedBoxTxt, layoutRtl && styles.rtlTextLeft]}>
            {t('diagnosticRecoGateSavedBox')}
          </Text>
        </View>

        <TawjihPlusUpgradeCta
          onPress={() => router.push(TAWJIH_PLUS_PRODUCT_PATH as never)}
          style={styles.cta}
        />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  rootRtl: { direction: 'rtl' },
  headerRtl: { direction: 'rtl' },
  headerSafe: {
    backgroundColor: brand.primary,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  headerRowRtl: { direction: 'rtl' },
  headerCenter: { flex: 1, minWidth: 0, gap: 4 },
  headerCenterRtl: { alignItems: 'flex-end' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  backBtnPlaceholder: { width: 40 },
  headerEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.88)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: diagnosticTheme.headerMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  headerAccentLine: {
    height: 3,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 2,
    backgroundColor: homeShell.green,
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bodyRtl: { direction: 'rtl' },
  bodyContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  bodyContentRtl: { alignItems: 'stretch' },
  lockCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: spacing.md,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBadgeRowRtl: { flexDirection: 'row-reverse' },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: homeShell.greenAlpha11,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  plusBadgeTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
    letterSpacing: 0.3,
  },
  lockPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHero: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    marginTop: spacing.xs,
  },
  cardHeroRtl: { alignSelf: 'center' },
  cardIconMain: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  cardIconIa: {
    position: 'absolute',
    end: -4,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: homeShell.greenAlpha28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  featureList: { gap: spacing.sm, marginTop: spacing.xs },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
  },
  featureRowRtl: { flexDirection: 'row-reverse' },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  savedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: homeShell.greenAlpha11,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  savedBoxRtl: { flexDirection: 'row-reverse' },
  savedBoxTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: homeShell.greenDark,
    lineHeight: 20,
    fontWeight: '600',
  },
  cta: { marginTop: spacing.xs },
  bottomSafe: { backgroundColor: '#F8FAFC' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  rtlTextLeft: { writingDirection: 'rtl', textAlign: 'right' },
  rtlNoTransform: { textTransform: 'none', letterSpacing: 0 },
});
