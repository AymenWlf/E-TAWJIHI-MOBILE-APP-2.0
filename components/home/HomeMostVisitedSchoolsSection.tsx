import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { HomeFeedHorizontalScroll } from '@/components/home/HomeFeedHorizontalScroll';
import { HomeFeedSection, homeFeedCardShadow } from '@/components/home/HomeFeedSection';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import type { MostVisitedEstablishment } from '@/services/establishments';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { pickEstablishmentName } from '@/utils/candidacyStatus';

const CARD_W = 188;
const CARD_H = 100;
const LOGO = 44;
const PREVIEW_LIMIT = 10;

type Props = {
  width: number;
  items: MostVisitedEstablishment[];
  loading?: boolean;
  onPressSchool: (item: MostVisitedEstablishment) => void;
  onSeeMore: () => void;
};

function MostVisitedSchoolCard({
  item,
  isRTL,
  locale,
  onPress,
}: {
  item: MostVisitedEstablishment;
  isRTL: boolean;
  locale: string;
  onPress: () => void;
}) {
  const label = pickEstablishmentName(item, locale);
  const logoUri =
    getEstablishmentLogoUrl(item.logo) ?? fallbackEstablishmentAvatarName(item.nom, item.sigle);
  const city =
    (item.ville ?? '').trim() ||
    (Array.isArray(item.villes) && item.villes[0] ? String(item.villes[0]) : '');
  const sigle = (item.sigle ?? '').trim();
  const showSigle = Boolean(sigle) && sigle.toLowerCase() !== label.trim().toLowerCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, homeFeedCardShadow, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />
      <View style={[styles.cardBody, isRTL && styles.cardBodyRtl]}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={[styles.textCol, isRTL && styles.textColRtl]}>
          {showSigle ? (
            <Text
              style={[styles.sigle, isRTL && styles.sigleRtl, !isRTL && styles.sigleUpper]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {sigle}
            </Text>
          ) : null}
          <View style={styles.nameWrap}>
            <Text
              style={[styles.name, isRTL && styles.nameRtl]}
              numberOfLines={2}
              ellipsizeMode="tail">
              {label}
            </Text>
          </View>
          {city ? (
            <View style={[styles.cityRow, isRTL && styles.cityRowRtl]}>
              <FontAwesome name="map-marker" size={10} color={brand.textMuted} />
              <Text style={[styles.city, isRTL && styles.cityRtl]} numberOfLines={1} ellipsizeMode="tail">
                {city}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.chevronWrap}>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color="rgba(51, 62, 143, 0.35)"
          />
        </View>
      </View>
    </Pressable>
  );
}

function MostVisitedSchoolCardSkeleton({ isRTL }: { isRTL: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[styles.card, styles.cardSkeleton, homeFeedCardShadow]}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl, styles.skeletonAccent]} />
      <View style={[styles.cardBody, isRTL && styles.cardBodyRtl]}>
        <SkeletonBlock style={styles.logoSkeleton} pulseStyle={pulseStyle} />
        <View style={[styles.textCol, isRTL && styles.textColRtl]}>
          <SkeletonBlock style={[styles.lineShort, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.lineMain, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.lineCity, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

export function HomeMostVisitedSchoolsSection({
  width,
  items,
  loading = false,
  onPressSchool,
  onSeeMore,
}: Props) {
  const { t, isRTL, locale } = useLocale();
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <HomeFeedSection
      width={width}
      title={t('homeMostVisitedSchoolsTitle')}
      subtitle={t('homeMostVisitedSchoolsSubtitle')}
      accessibilityLabel={t('homeMostVisitedSchoolsA11y')}
      onSeeMore={onSeeMore}>
      {loading ? (
        <HomeFeedHorizontalScroll isRTL={isRTL}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.cardSlot}>
              <MostVisitedSchoolCardSkeleton isRTL={isRTL} />
            </View>
          ))}
        </HomeFeedHorizontalScroll>
      ) : preview.length === 0 ? null : (
        <HomeFeedHorizontalScroll isRTL={isRTL}>
          {preview.map((item) => (
            <View key={item.id} style={styles.cardSlot}>
              <MostVisitedSchoolCard
                item={item}
                isRTL={isRTL}
                locale={locale}
                onPress={() => onPressSchool(item)}
              />
            </View>
          ))}
        </HomeFeedHorizontalScroll>
      )}
    </HomeFeedSection>
  );
}

const androidTextFix =
  Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : ({} as const);

const styles = StyleSheet.create({
  cardSlot: {
    width: CARD_W,
    height: CARD_H,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
  },
  cardSkeleton: {
    backgroundColor: brand.white,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: homeShell.blue,
    borderTopStartRadius: radius.lg,
    borderBottomStartRadius: radius.lg,
  },
  accentBarRtl: {
    start: undefined,
    end: 0,
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
    borderTopEndRadius: radius.lg,
    borderBottomEndRadius: radius.lg,
  },
  skeletonAccent: {
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: spacing.sm + 4,
    paddingEnd: spacing.sm,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  /** Logo à droite, chevron à gauche ; ordre DOM inchangé (logo · texte · chevron). */
  cardBodyRtl: {
    direction: 'rtl',
  },
  logoWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.1)',
  },
  logoSkeleton: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 3,
  },
  textColRtl: {
    alignItems: 'flex-end',
  },
  nameWrap: {
    width: '100%',
    minHeight: 0,
    flexShrink: 1,
  },
  sigle: {
    color: brand.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 14,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    ...androidTextFix,
  },
  sigleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    lineHeight: 15,
  },
  sigleUpper: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    color: brand.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    lineHeight: 16,
    letterSpacing: -0.1,
    ...androidTextFix,
  },
  nameRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 17,
    fontSize: fontSize.xs,
    letterSpacing: 0,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  cityRowRtl: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  city: {
    flexShrink: 1,
    color: brand.textMuted,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    ...androidTextFix,
  },
  cityRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 15,
  },
  chevronWrap: {
    width: 14,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  lineShort: {
    width: 36,
    height: 9,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    marginBottom: 4,
  },
  lineMain: {
    width: '88%',
    height: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    marginBottom: 6,
  },
  lineCity: {
    width: '55%',
    height: 9,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  lineRtl: {
    alignSelf: 'flex-end',
  },
});
