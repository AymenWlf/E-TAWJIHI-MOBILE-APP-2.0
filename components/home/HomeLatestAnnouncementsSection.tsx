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
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  formatShortDate,
  pickAnnouncementTitle,
  pickEstablishmentName,
} from '@/utils/candidacyStatus';

const CARD_W = 212;
const CARD_H = 108;
const LOGO = 40;
const PREVIEW_LIMIT = 10;
const ACCENT = homeShell.green;

type Props = {
  width: number;
  items: ContestAnnouncementCard[];
  loading?: boolean;
  onPressAnnouncement: (item: ContestAnnouncementCard) => void;
  onSeeMore: () => void;
};

function LatestAnnouncementCard({
  item,
  isRTL,
  locale,
  openLabel,
  closedLabel,
  datesLockedLabel,
  datesLocked,
  onPress,
}: {
  item: ContestAnnouncementCard;
  isRTL: boolean;
  locale: string;
  openLabel: string;
  closedLabel: string;
  datesLockedLabel: string;
  datesLocked: boolean;
  onPress: () => void;
}) {
  const title = pickAnnouncementTitle(item, locale);
  const school = item.establishment;
  const schoolLabel = school ? pickEstablishmentName(school, locale) : '';
  const logoUri = school
    ? getEstablishmentLogoUrl(school.logo) ??
      fallbackEstablishmentAvatarName(school.nom, school.sigle)
    : null;
  const dateLabel = formatShortDate(item.dateStart, locale);
  const showDateLocked = datesLocked || Boolean(item.previewOnly);
  const statusLabel = item.isOpen ? openLabel : closedLabel;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, homeFeedCardShadow, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />
      <View style={styles.cardBody}>
        <View style={styles.logoWrap}>
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <FontAwesome name="bullhorn" size={16} color={ACCENT} />
            </View>
          )}
        </View>

        <View style={styles.textCol}>
          <View style={[styles.metaRow, isRTL && styles.metaRowRtl]}>
            <View
              style={[
                styles.statusPill,
                item.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}>
              <View style={[styles.statusDot, item.isOpen ? styles.statusDotOpen : styles.statusDotClosed]} />
              <Text
                style={[
                  styles.statusTxt,
                  isRTL && styles.statusTxtRtl,
                  item.isOpen ? styles.statusTxtOpen : styles.statusTxtClosed,
                ]}
                numberOfLines={1}>
                {statusLabel}
              </Text>
            </View>
            {showDateLocked && (dateLabel || item.dateStart) ? (
              <View style={[styles.dateRow, styles.dateRowLocked, isRTL && styles.dateRowRtl]}>
                <FontAwesome name="lock" size={9} color={brand.primary} />
                <Text
                  style={[styles.dateLocked, isRTL && styles.dateRtl]}
                  numberOfLines={1}
                  accessibilityLabel={datesLockedLabel}>
                  {datesLockedLabel}
                </Text>
              </View>
            ) : dateLabel ? (
              <View style={[styles.dateRow, isRTL && styles.dateRowRtl]}>
                <FontAwesome name="calendar-o" size={9} color={brand.textMuted} />
                <Text style={[styles.date, isRTL && styles.dateRtl]} numberOfLines={1} latinDigits>
                  {dateLabel}
                </Text>
              </View>
            ) : null}
          </View>

          {schoolLabel ? (
            <Text style={[styles.school, isRTL && styles.schoolRtl]} numberOfLines={1}>
              {schoolLabel}
            </Text>
          ) : null}

          <Text
            style={[
              styles.title,
              isRTL && styles.titleRtl,
              schoolLabel ? styles.titleAfterSchool : styles.titleStandalone,
            ]}
            numberOfLines={2}
            ellipsizeMode="tail">
            {title}
          </Text>
        </View>

        <View style={styles.chevronWrap}>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color="rgba(13, 148, 136, 0.45)"
          />
        </View>
      </View>
    </Pressable>
  );
}

function LatestAnnouncementCardSkeleton({ isRTL }: { isRTL: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[styles.card, styles.cardSkeleton, homeFeedCardShadow]}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl, styles.skeletonAccent]} />
      <View style={styles.cardBody}>
        <SkeletonBlock style={styles.logoSkeleton} pulseStyle={pulseStyle} />
        <View style={styles.textCol}>
          <SkeletonBlock style={[styles.lineMeta, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.lineSchool, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.lineTitle, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.lineTitleShort, isRTL && styles.lineRtl]} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

export function HomeLatestAnnouncementsSection({
  width,
  items,
  loading = false,
  onPressAnnouncement,
  onSeeMore,
}: Props) {
  const { t, isRTL, locale } = useLocale();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  const datesLocked = !tawjihPlusLoading && !hasTawjihPlusAccess;
  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <HomeFeedSection
      width={width}
      title={t('homeLatestAnnouncementsTitle')}
      subtitle={t('homeLatestAnnouncementsSubtitle')}
      accessibilityLabel={t('homeLatestAnnouncementsA11y')}
      onSeeMore={onSeeMore}>
      {loading ? (
        <HomeFeedHorizontalScroll isRTL={isRTL}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.cardSlot, i < 2 && styles.cardSlotGap]}>
              <LatestAnnouncementCardSkeleton isRTL={isRTL} />
            </View>
          ))}
        </HomeFeedHorizontalScroll>
      ) : preview.length === 0 ? null : (
        <HomeFeedHorizontalScroll isRTL={isRTL}>
          {preview.map((item, index) => (
            <View
              key={item.id}
              style={[styles.cardSlot, index < preview.length - 1 && styles.cardSlotGap]}>
              <LatestAnnouncementCard
                item={item}
                isRTL={isRTL}
                locale={locale}
                openLabel={t('homeAnnouncementOpen')}
                closedLabel={t('homeAnnouncementClosed')}
                datesLocked={datesLocked}
                datesLockedLabel={t('homeAnnouncementDatesLocked')}
                onPress={() => onPressAnnouncement(item)}
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
  cardSlotGap: {
    marginEnd: spacing.md,
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
    backgroundColor: ACCENT,
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
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
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
  cardBodyRtl: {
    flexDirection: 'row-reverse',
  },
  logoWrap: {
    flexShrink: 0,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.md,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13, 148, 136, 0.16)',
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  logoSkeleton: {
    width: LOGO,
    height: LOGO,
    borderRadius: radius.md,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
    maxWidth: '100%',
  },
  metaRowRtl: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  statusOpen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusClosed: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusDotOpen: {
    backgroundColor: '#10B981',
  },
  statusDotClosed: {
    backgroundColor: '#94A3B8',
  },
  statusTxt: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.15,
    ...androidTextFix,
  },
  statusTxtRtl: {
    writingDirection: 'rtl',
  },
  statusTxtOpen: {
    color: '#047857',
  },
  statusTxtClosed: {
    color: brand.textMuted,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
    minWidth: 0,
  },
  dateRowRtl: {
    flexDirection: 'row-reverse',
  },
  dateRowLocked: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.14)',
  },
  dateLocked: {
    flexShrink: 1,
    color: brand.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 12,
    ...androidTextFix,
  },
  date: {
    flexShrink: 1,
    color: brand.textMuted,
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
    ...androidTextFix,
  },
  dateRtl: {
    writingDirection: 'rtl',
    lineHeight: 14,
  },
  school: {
    color: brand.primary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    marginBottom: 2,
    ...androidTextFix,
  },
  schoolRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 15,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    lineHeight: 16,
    letterSpacing: -0.1,
    ...androidTextFix,
  },
  titleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
    fontSize: 12,
  },
  titleAfterSchool: {
    marginBottom: 0,
  },
  titleStandalone: {
    marginTop: 2,
  },
  chevronWrap: {
    width: 14,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineMeta: {
    width: '72%',
    height: 16,
    borderRadius: radius.full,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    marginBottom: 6,
  },
  lineSchool: {
    width: '55%',
    height: 10,
    borderRadius: 3,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    marginBottom: 5,
  },
  lineTitle: {
    width: '92%',
    height: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(13, 148, 136, 0.14)',
    marginBottom: 4,
  },
  lineTitleShort: {
    width: '70%',
    height: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  lineRtl: {
    alignSelf: 'flex-end',
  },
});
