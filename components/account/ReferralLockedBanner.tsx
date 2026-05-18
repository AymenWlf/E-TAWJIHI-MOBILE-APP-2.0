import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  requiredServiceName: string;
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  variant?: 'card' | 'hero';
  onCtaPress?: () => void;
};

export function ReferralLockedBanner({
  requiredServiceName,
  rtl,
  t,
  variant = 'card',
  onCtaPress,
}: Props) {
  const isHero = variant === 'hero';

  return (
    <View style={[styles.wrap, isHero ? styles.wrapHero : styles.wrapCard, rtl && styles.wrapRtl]}>
      <View style={[styles.iconCircle, isHero && styles.iconCircleHero]}>
        <FontAwesome name="lock" size={isHero ? 22 : 18} color={isHero ? brand.white : brand.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, isHero && styles.titleHero, rtl && styles.txtRtl]}>
          {t('referralLockedTitle')}
        </Text>
        <Text style={[styles.body, isHero && styles.bodyHero, rtl && styles.txtRtl]}>
          {t('referralLockedBody').replace('{{service}}', requiredServiceName)}
        </Text>
      </View>
      {onCtaPress ? (
        <Pressable
          onPress={onCtaPress}
          style={[styles.cta, isHero && styles.ctaHero, rtl && styles.rowRtl]}
          accessibilityRole="button">
          <Text style={[styles.ctaTxt, isHero && styles.ctaTxtHero]}>{t('referralLockedCta')}</Text>
          <FontAwesome
            name={rtl ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={isHero ? homeShell.bg : brand.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'stretch',
  },
  wrapCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  wrapHero: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  wrapRtl: { direction: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${brand.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconCircleHero: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  textBlock: { gap: 4 },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  titleHero: {
    color: brand.white,
  },
  body: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: homeShell.cardMuted,
    lineHeight: 18,
  },
  bodyHero: {
    color: 'rgba(255,255,255,0.88)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${brand.primary}12`,
    borderWidth: 1,
    borderColor: `${brand.primary}33`,
  },
  ctaHero: {
    backgroundColor: brand.white,
    borderWidth: 0,
  },
  ctaTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  ctaTxtHero: {
    color: homeShell.bg,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
