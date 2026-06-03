import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PaywallCardReservedOverlay } from '@/components/inscriptions/TawjihPlusPaywall';
import { HomeFeedHorizontalScroll } from '@/components/home/HomeFeedHorizontalScroll';
import { HomeFeedSection, homeFeedCardShadow } from '@/components/home/HomeFeedSection';
import {
  EstablishmentTypeBadge,
  establishmentTypeDisplayLabel,
} from '@/components/ui/EstablishmentTypeBadge';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { FREE_ESTABLISHMENT_PREVIEW_COUNT, TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
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
  onPressSchool: (item: MostVisitedEstablishment, index: number) => void;
  onSeeMore: () => void;
};

function MostVisitedSchoolCard({
  item,
  isRTL,
  locale,
  compactLocked,
  onPress,
}: {
  item: MostVisitedEstablishment;
  isRTL: boolean;
  locale: string;
  /** Même carte ; nom / ville masqués, zones désactivées. */
  compactLocked: boolean;
  onPress: () => void;
}) {
  const { t } = useLocale();
  const label = pickEstablishmentName(item, locale);
  const logoUri =
    getEstablishmentLogoUrl(item.logo) ?? fallbackEstablishmentAvatarName(item.nom, item.sigle);
  const city =
    (item.ville ?? '').trim() ||
    (Array.isArray(item.villes) && item.villes[0] ? String(item.villes[0]) : '');
  const sigle = (item.sigle ?? '').trim();
  const showSigle = Boolean(sigle) && sigle.toLowerCase() !== label.trim().toLowerCase();
  const typeA11y = establishmentTypeDisplayLabel(item.type, t);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        homeFeedCardShadow,
        compactLocked && styles.cardLocked,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={compactLocked ? typeA11y : label}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />
      <View style={[styles.cardBody, isRTL && styles.cardBodyRtl, compactLocked && styles.cardBodyLocked]}>
        <View style={[styles.logoWrap, compactLocked && styles.logoWrapLocked]}>
          {compactLocked ? (
            <View style={styles.logoPlaceholder}>
              <FontAwesome name="university" size={16} color="#CBD5E1" />
            </View>
          ) : (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          )}
        </View>

        <View style={[styles.textCol, isRTL && styles.textColRtl]}>
          {compactLocked ? (
            <>
              <HiddenBar width="70%" height={8} isRTL={isRTL} />
              <HiddenBar width="90%" height={10} style={{ marginTop: 4 }} isRTL={isRTL} />
              <View style={[styles.cityRow, isRTL && styles.cityRowRtl, styles.cityRowLocked]}>
                <FontAwesome name="map-marker" size={10} color="#CBD5E1" />
                <HiddenBar flex={1} height={8} isRTL={isRTL} />
              </View>
              {(item.type ?? '').trim() ? (
                <View style={[styles.typeRow, isRTL && styles.typeRowRtl]}>
                  <EstablishmentTypeBadge type={item.type} size="xs" />
                </View>
              ) : null}
            </>
          ) : (
            <>
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
              {(item.type ?? '').trim() ? (
                <View style={[styles.typeRow, isRTL && styles.typeRowRtl]}>
                  <EstablishmentTypeBadge type={item.type} size="xs" />
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.chevronWrap}>
          <FontAwesome
            name={compactLocked ? 'lock' : isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={compactLocked ? brand.primary : 'rgba(51, 62, 143, 0.35)'}
          />
        </View>
      </View>
      {compactLocked ? <PaywallCardReservedOverlay isRTL={isRTL} compact /> : null}
    </Pressable>
  );
}

function HiddenBar({
  width,
  height = 8,
  flex,
  style,
  isRTL,
}: {
  width?: number | `${number}%`;
  height?: number;
  flex?: number;
  style?: object;
  isRTL?: boolean;
}) {
  return (
    <View
      style={[
        styles.hiddenBar,
        flex != null ? { flex } : { width: width ?? '100%' },
        { height },
        isRTL && styles.hiddenBarRtl,
        style,
      ]}
    />
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
  const router = useRouter();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  const schoolsCatalogLocked = !tawjihPlusLoading && !hasTawjihPlusAccess;
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
          {preview.map((item, index) => {
            const compactLocked =
              schoolsCatalogLocked && index >= FREE_ESTABLISHMENT_PREVIEW_COUNT;
            return (
            <View key={item.id} style={styles.cardSlot}>
              <MostVisitedSchoolCard
                item={item}
                isRTL={isRTL}
                locale={locale}
                compactLocked={compactLocked}
                onPress={() => {
                  if (compactLocked) {
                    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
                    return;
                  }
                  onPressSchool(item, index);
                }}
              />
            </View>
            );
          })}
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
    position: 'relative',
  },
  cardSkeleton: {
    backgroundColor: brand.white,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardLocked: {
    backgroundColor: '#FAFBFC',
  },
  cardBodyLocked: {
    opacity: 0.85,
  },
  logoWrapLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  logoPlaceholder: {
    width: LOGO,
    height: LOGO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenBar: {
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    maxWidth: '100%',
  },
  hiddenBarRtl: {
    alignSelf: 'flex-end',
  },
  cityRowLocked: {
    marginTop: 4,
  },
  typeRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeRowRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
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
