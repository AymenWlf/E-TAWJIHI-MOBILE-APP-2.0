import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { promptTawjihPlusPartialFeatureLock } from '@/utils/tawjihPlusParcoursGate';

import { TassjilServiceBadge } from '@/components/inscriptions/TassjilServiceBadge';
import { PaywallCardReservedOverlay } from '@/components/inscriptions/TawjihPlusPaywall';
import { DiagnosticEstablishmentCompatibilityBadge } from '@/components/diagnostic/DiagnosticEstablishmentCompatibilityBadge';
import { AnnouncementTypeChip } from '@/components/inscriptions/AnnouncementTypeChip';
import { TourFocusWrap } from '@/components/inscriptions/TourFocusWrap';
import { EligibilityBadge } from '@/components/inscriptions/EligibilityViews';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccessContextOptional } from '@/contexts/TawjihPlusAccessContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType } from '@/types/inscriptions';
import type { ApplyToSchoolsTourGate } from '@/utils/applyToSchoolsTourProgress';
import { getAnnouncementTypeStyle } from '@/utils/announcementTypeStyle';
import {
  formatDaysUntilClose,
  formatShortDate,
  pickAnnouncementTitle,
  pickEstablishmentNamesPair,
  pickRegistrationUrlLabel,
} from '@/utils/candidacyStatus';
import { isPremiereBacNiveau } from '@/utils/academicFiliere';
import { evaluateEligibility } from '@/utils/eligibility';
import { shouldShowTassjilServiceBadge } from '@/utils/tassjilServiceIncludedNotice';
import type { AnnouncementLockedVariant } from '@/utils/announcementLockDisplay';

type Props = {
  item: ContestAnnouncementCard;
  isFollowed: boolean;
  followStateLoading?: boolean;
  eligibilityLoading?: boolean;
  busy?: boolean;
  onToggleFollow: () => void;
  onOpenLink: () => void;
  onPress?: () => void;
  currentStatus?: CandidacyStatusType | null;
  onUpdateStatus?: () => void;
  showDiagnosticBadge?: boolean;
  tourFocus?: null | 'type' | 'follow' | 'status' | 'link' | 'all';
  tourFocusLabel?: string;
  tourFocusPulse?: boolean;
  tourGate?: ApplyToSchoolsTourGate;
  isUnread?: boolean;
  isUnseen?: boolean;
  /**
   * Aperçu paywall : `featured` (1ʳᵉ annonce) ou `compact` — même carte,
   * contenu sensible masqué + zones désactivées.
   */
  lockedVariant?: 'none' | AnnouncementLockedVariant;
  /** @deprecated Préférer `lockedVariant="featured"`. */
  previewOnly?: boolean;
};

type FaName = ComponentProps<typeof FontAwesome>['name'];

function AnimatedUnseenDot({ label }: { label: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.35, duration: 650, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 650, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.15, duration: 650, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.55, duration: 650, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [ringOpacity, scale]);

  return (
    <View style={styles.unseenDotWrap} accessibilityLabel={label} accessibilityRole="text">
      <Animated.View style={[styles.unseenDotRing, { opacity: ringOpacity, transform: [{ scale }] }]} />
      <View style={styles.unseenDotCore} />
    </View>
  );
}

/** Ligne méta : icône + libellé + valeur (s’aligne via `direction` du parent). */
function InfoLine({
  icon,
  iconColor,
  label,
  value,
  isRTL,
}: {
  icon: FaName;
  iconColor: string;
  label: string;
  value: string;
  isRTL: boolean;
}) {
  if (!value.trim()) return null;
  return (
    <View style={styles.infoLine}>
      <View style={styles.infoIconWrap}>
        <FontAwesome name={icon} size={11} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoLabel, isRTL && styles.rtlText]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.infoValue, isRTL && styles.rtlText]} numberOfLines={2} latinDigits>
          {value}
        </Text>
      </View>
    </View>
  );
}

function InfoLineLocked({
  icon,
  iconColor,
  label,
  value,
  isRTL,
  onPress,
}: {
  icon: FaName;
  iconColor: string;
  label: string;
  value: string;
  isRTL: boolean;
  onPress: () => void;
}) {
  if (!value.trim()) return null;
  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        onPress();
      }}
      style={styles.infoLine}>
      <View style={styles.infoIconWrap}>
        <FontAwesome name={icon} size={11} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoLabel, isRTL && styles.rtlText]} numberOfLines={1}>
          {label}
        </Text>
        <View style={[styles.infoValueLockedRow, isRTL && styles.rowRtl]}>
          <Text
            style={[styles.infoValueLockedPlaceholder, isRTL && styles.rtlText]}
            aria-hidden
            importantForAccessibility="no-hide-descendants">
            ————————
          </Text>
          <FontAwesome name="lock" size={10} color="#64748B" />
        </View>
      </View>
    </Pressable>
  );
}

function InfoLineHidden({
  icon,
  iconColor,
  label,
  isRTL,
}: {
  icon: FaName;
  iconColor: string;
  label: string;
  isRTL: boolean;
}) {
  return (
    <View style={styles.infoLine} pointerEvents="none">
      <View style={styles.infoIconWrap}>
        <FontAwesome name={icon} size={11} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoLabel, isRTL && styles.rtlText]} numberOfLines={1}>
          {label}
        </Text>
        <HiddenBar width="78%" height={12} isRTL={isRTL} />
      </View>
    </View>
  );
}

function HiddenBar({
  width,
  height = 12,
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

export function AnnouncementCard({
  item,
  isFollowed,
  followStateLoading,
  eligibilityLoading,
  busy,
  onToggleFollow,
  onOpenLink,
  onPress,
  currentStatus = null,
  onUpdateStatus,
  showDiagnosticBadge = true,
  tourFocus = null,
  tourFocusLabel,
  tourFocusPulse = true,
  tourGate,
  isUnread = false,
  isUnseen = false,
  lockedVariant: lockedVariantProp,
  previewOnly = false,
}: Props) {
  if (!item?.id) {
    return null;
  }
  const lockVariant: 'none' | AnnouncementLockedVariant =
    lockedVariantProp ?? (previewOnly ? 'featured' : 'none');
  const contentLocked = lockVariant !== 'none';
  const registrationLocked = contentLocked || item.registrationLinkLocked === true;
  const deadlineLocked = contentLocked || item.deadlineLocked === true;
  const sensitiveHidden = contentLocked;
  const showOgCoverImage = Boolean(item.ogImage) && !contentLocked;
  const showOgCoverLocked = Boolean(item.ogImage) && contentLocked;
  const showHeaderRow = !contentLocked || !item.ogImage;
  const { t, locale, isRTL } = useLocale();
  const router = useRouter();
  const tawjihPlusAccess = useTawjihPlusAccessContextOptional();
  const openTawjihPlusProduct = useCallback(() => {
    if (tawjihPlusAccess?.openTawjihPlusProduct) {
      tawjihPlusAccess.openTawjihPlusProduct();
      return;
    }
    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
  }, [router, tawjihPlusAccess]);
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const typeVisual = getAnnouncementTypeStyle(item.announcementType);

  const eligibility = evaluateEligibility(
    {
      filieresAcceptees: item.filieresAcceptees,
      specialitesBacMissionAcceptees: item.specialitesBacMissionAcceptees,
      anneesBacAcceptees: item.anneesBacAcceptees,
    },
    eligibilityProfile,
  );
  const niveauBlocksInscriptions = Boolean(
    eligibilityProfile?.niveau && isPremiereBacNiveau(eligibilityProfile.niveau),
  );
  const effectiveEligibility = niveauBlocksInscriptions
    ? { verdict: 'not_eligible' as const, checks: eligibility.checks }
    : eligibility;
  const est = item.establishment;
  const { primary: estNamePrimary, secondary: estNameSecondary } = pickEstablishmentNamesPair(
    est,
    locale,
  );
  const villes = (est?.villes ?? []).filter(Boolean);
  const villeMain = est?.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.slice(0, 3).join(' · ') : villeMain;
  const villesExtra = villes.length > 3 ? villes.length - 3 : 0;

  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ??
    fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  const deadline = formatDaysUntilClose(item.daysUntilClose, locale);
  const canUpdateStatus =
    typeof onUpdateStatus === 'function' &&
    ((item.availableStatuses?.length ?? 0) > 0 || tourGate === 'status');
  /** En aperçu TAWJIH PLUS : toujours afficher les CTA verrouillés (statut + lien). */
  const showStatusAction = contentLocked ? true : canUpdateStatus;

  const tourFocusActive = (zone: 'type' | 'follow' | 'status' | 'link') =>
    tourFocus === zone || tourFocus === 'all';
  const tourFocusDimmed = (zone: 'type' | 'follow' | 'status' | 'link') =>
    Boolean(tourFocus) && tourFocus !== 'all' && tourFocus !== zone;

  const registrationLinkLabel = pickRegistrationUrlLabel(
    item.registrationUrlLabel,
    item.announcementType,
    t,
    locale,
    item.registrationUrlLabelAr,
  );
  const showTassjilServiceBadge = shouldShowTassjilServiceBadge(est);

  const followInteractionEnabled = !tourGate || tourGate === 'follow';
  const statusInteractionEnabled = !tourGate || tourGate === 'status';
  const linkInteractionEnabled = !tourGate || tourGate === 'link';
  const hasRegistrationUrl = Boolean(item.registrationUrl?.trim());
  /** Tutoriel « lien d'inscription » : le tap doit rester actif même sans URL API. */
  const canPressRegistrationLink =
    linkInteractionEnabled &&
    (registrationLocked || hasRegistrationUrl || tourGate === 'link');

  const hasMetaPanel =
    Boolean(villesShort) ||
    Boolean(item.dateStart?.trim()) ||
    Boolean(item.dateEnd?.trim());
  const usefulLinks = Array.isArray(item.liensUtiles)
    ? item.liensUtiles.filter((l) => Boolean(l?.url?.trim())).slice(0, 6)
    : [];

  const followBtn = (locked = false) => (
    <TourFocusWrap
      active={tourFocusActive('follow')}
      dimmed={tourFocusDimmed('follow')}
      pulse={tourFocusPulse}
      label={tourFocusActive('follow') ? tourFocusLabel : undefined}
      style={styles.btnFlex}>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          if (locked) {
            openTawjihPlusProduct();
            return;
          }
          if (!followInteractionEnabled) return;
          onToggleFollow();
        }}
        disabled={!locked && (busy || followStateLoading || !followInteractionEnabled)}
        accessibilityRole="button"
        accessibilityLabel={
          locked ? t('inscTawjihPlusUpgradeCta') : isFollowed
            ? t('inscAnnouncementsFollowing')
            : t('inscAnnouncementsFollow')
        }
        style={({ pressed }) => [
          styles.btn,
          styles.btnFlex,
          locked && styles.btnLockedPaywall,
          !locked && !followStateLoading && isFollowed ? styles.btnFollowed : !locked ? styles.btnFollow : null,
          pressed && (locked || followInteractionEnabled) && { opacity: 0.85 },
          !locked && (busy || followStateLoading || !followInteractionEnabled) && { opacity: 0.5 },
          tourFocusActive('follow') && styles.btnFollowFocus,
          !locked && !followInteractionEnabled && styles.tourActionDisabled,
        ]}>
        {busy || followStateLoading ? (
          <ActivityIndicator
            size="small"
            color={
              locked
                ? '#64748B'
                : !followStateLoading && isFollowed
                  ? brand.primary
                  : brand.white
            }
          />
        ) : (
          <>
            <FontAwesome
              name={locked ? 'lock' : isFollowed ? 'heart' : 'heart-o'}
              size={11}
              color={locked ? '#64748B' : isFollowed ? brand.primary : brand.white}
            />
            <Text
              style={[
                locked
                  ? styles.btnLinkTxtLocked
                  : isFollowed
                    ? styles.btnFollowedTxt
                    : styles.btnFollowTxt,
                isRTL && styles.rtlText,
              ]}
              numberOfLines={1}>
              {locked
                ? t('inscAnnouncementsFollow')
                : isFollowed
                  ? t('inscAnnouncementsFollowing')
                  : t('inscAnnouncementsFollow')}
            </Text>
          </>
        )}
      </Pressable>
    </TourFocusWrap>
  );

  const promptPartialLock = useCallback(() => {
    promptTawjihPlusPartialFeatureLock({
      hasAccess: false,
      loading: false,
      openProduct: openTawjihPlusProduct,
      t,
    });
  }, [openTawjihPlusProduct, t]);

  const registrationLinkBtn = (fullWidth: boolean, locked = false) => (
    <TourFocusWrap
      active={tourFocusActive('link')}
      dimmed={tourFocusDimmed('link')}
      pulse={tourFocusPulse}
      label={tourFocusActive('link') ? tourFocusLabel : undefined}
      fill={tourFocus === 'link'}
      style={fullWidth ? styles.btnLinkFocusFull : styles.btnFlex}>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          if (locked) {
            if (contentLocked) openTawjihPlusProduct();
            else promptPartialLock();
            return;
          }
          if (!linkInteractionEnabled) return;
          onOpenLink();
        }}
        disabled={!locked && !canPressRegistrationLink}
        accessibilityRole="button"
        accessibilityLabel={locked ? t('inscTawjihPlusUpgradeCta') : registrationLinkLabel}
        style={({ pressed }) => [
          styles.btn,
          fullWidth ? styles.btnLinkFull : styles.btnFlex,
          styles.btnLink,
          locked && styles.btnLockedPaywall,
          !locked && !canPressRegistrationLink && styles.btnDisabled,
          pressed && (locked || canPressRegistrationLink) && { opacity: 0.85 },
          !locked && !linkInteractionEnabled && styles.tourActionDisabled,
          tourFocusActive('link') && styles.btnLinkFocus,
        ]}>
        <FontAwesome
          name={locked ? 'lock' : 'external-link'}
          size={11}
          color={locked ? '#64748B' : brand.primary}
        />
        <Text
          style={[
            styles.btnLinkTxt,
            locked && styles.btnLinkTxtLocked,
            isRTL && styles.rtlText,
          ]}
          numberOfLines={2}>
          {registrationLinkLabel}
        </Text>
      </Pressable>
    </TourFocusWrap>
  );

  const statusActionBtn = (locked = false) => (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        if (locked) {
          openTawjihPlusProduct();
          return;
        }
        if (!statusInteractionEnabled) return;
        onUpdateStatus?.();
      }}
      disabled={!locked && !statusInteractionEnabled}
      accessibilityRole="button"
      accessibilityLabel={
        locked ? t('inscTawjihPlusUpgradeCta') : currentStatus
          ? t('inscStatusActionUpdate')
          : t('inscStatusActionTitle')
      }
      style={({ pressed }) => [
        styles.statusEditBtn,
        locked && styles.statusEditBtnLocked,
        pressed && (locked || statusInteractionEnabled) && { opacity: 0.85 },
        tourFocusActive('status') && styles.statusEditBtnFocus,
        !locked && !statusInteractionEnabled && styles.tourActionDisabled,
      ]}>
      <FontAwesome
        name={locked ? 'lock' : 'pencil'}
        size={11}
        color={locked ? '#64748B' : brand.primary}
      />
      <Text
        style={[
          styles.statusEditBtnTxt,
          locked && styles.statusEditBtnTxtLocked,
          isRTL && styles.rtlText,
        ]}
        numberOfLines={2}>
        {currentStatus ? t('inscStatusActionUpdate') : t('inscStatusActionTitle')}
      </Text>
    </Pressable>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderStartColor: typeVisual.border,
          borderStartWidth: 4,
        },
        contentLocked && styles.cardLocked,
        isUnread && !contentLocked && styles.cardUnread,
        pressed && onPress && { opacity: 0.92 },
      ]}>
      {isUnseen ? (
        <View style={styles.unseenDotAnchor} pointerEvents="none">
          <AnimatedUnseenDot label={t('inscAnnouncementUnseen')} />
        </View>
      ) : null}

      {showOgCoverImage ? (
        <View style={styles.coverWrap}>
          <Image source={{ uri: item.ogImage! }} style={styles.cover} resizeMode="cover" />
          <View style={styles.coverChip}>
            <TourFocusWrap
              active={tourFocusActive('type')}
              dimmed={tourFocusDimmed('type')}
              pulse={tourFocusPulse}
              label={tourFocusActive('type') ? tourFocusLabel : undefined}>
              <AnnouncementTypeChip type={item.announcementType} variant="pill" isRTL={isRTL} />
            </TourFocusWrap>
          </View>
        </View>
      ) : null}

      {showOgCoverLocked ? (
        <View style={styles.coverWrap} pointerEvents="none">
          <View style={[styles.cover, styles.coverLocked]} />
          <View style={styles.coverChip}>
            <AnnouncementTypeChip type={item.announcementType} variant="pill" isRTL={isRTL} />
          </View>
        </View>
      ) : null}

      <View style={[styles.body, isRTL && styles.bodyRtl, contentLocked && styles.bodyLocked]}>
        {showHeaderRow ? (
          <View style={styles.headerRow}>
            {!item.ogImage || sensitiveHidden ? (
              <TourFocusWrap
                active={tourFocusActive('type')}
                dimmed={tourFocusDimmed('type')}
                pulse={tourFocusPulse}
                label={tourFocusActive('type') ? tourFocusLabel : undefined}
                style={styles.headerTypeWrap}>
                <AnnouncementTypeChip
                  type={item.announcementType}
                  variant="banner"
                  isRTL={isRTL}
                />
              </TourFocusWrap>
            ) : (
              <View style={styles.headerTypeSpacer} />
            )}
            {isUnread && !contentLocked ? (
              <View style={styles.stateChipUnread}>
                <View style={styles.stateDotUnread} />
                <Text style={[styles.stateChipUnreadTxt, isRTL && styles.rtlText]}>
                  {t('inscAnnouncementUnread')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.schoolBlock, sensitiveHidden && styles.sectionDisabled]} pointerEvents={sensitiveHidden ? 'none' : 'auto'}>
          {sensitiveHidden ? (
            <>
              <View
                style={[
                  styles.estLogo,
                  styles.estLogoLocked,
                  { backgroundColor: typeVisual.bg, borderColor: typeVisual.border },
                ]}>
                <FontAwesome name={typeVisual.icon} size={20} color={typeVisual.fg} />
              </View>
              <View style={styles.estTexts}>
                <HiddenBar width="92%" height={14} isRTL={isRTL} />
                <HiddenBar width="68%" height={11} style={{ marginTop: 4 }} isRTL={isRTL} />
                {est?.type ? (
                  <View style={[styles.estMetaRow, isRTL && styles.rowRtl]}>
                    <EstablishmentTypeBadge type={est.type} size="xs" />
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <>
              <Image
                source={{ uri: logoUri }}
                style={styles.estLogo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.estTexts}>
                <Text style={[styles.estName, isRTL && styles.rtlText]} numberOfLines={3}>
                  {estNamePrimary}
                </Text>
                {estNameSecondary ? (
                  <Text style={[styles.estNameAlt, isRTL && styles.rtlText]} numberOfLines={2}>
                    {estNameSecondary}
                  </Text>
                ) : null}
                {(est?.sigle || est?.type) ? (
                  <View style={styles.estMetaRow}>
                    {est?.sigle ? (
                      <View style={styles.siglePill}>
                        <Text style={styles.siglePillTxt}>{est.sigle}</Text>
                      </View>
                    ) : null}
                    {est?.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
                  </View>
                ) : null}
              </View>
            </>
          )}
        </View>

        {sensitiveHidden ? (
          <View style={styles.titleHiddenWrap} pointerEvents="none">
            <HiddenBar width="100%" height={14} isRTL={isRTL} />
            <HiddenBar width="88%" height={14} style={{ marginTop: 6 }} isRTL={isRTL} />
          </View>
        ) : null}

        {!contentLocked ? (
          <>
        {/* Titre de l'annonce */}
        <Text
          style={[styles.title, isUnread && styles.titleUnread, isRTL && styles.rtlText]}
          numberOfLines={3}>
          {pickAnnouncementTitle(item, locale) || item.title}
        </Text>

        {showTassjilServiceBadge ? (
          <TassjilServiceBadge included={est?.isServiceTassjil === true} isRTL={isRTL} />
        ) : null}

        {/* Dates, lieu — panneau structuré */}
        {hasMetaPanel ? (
          <View style={styles.metaPanel}>
            {villesShort ? (
              <InfoLine
                icon="map-marker"
                iconColor={brand.textMuted}
                label={t('schoolsCityLabel')}
                value={villesExtra > 0 ? `${villesShort} +${villesExtra}` : villesShort}
                isRTL={isRTL}
              />
            ) : null}
            {item.dateStart ? (
              <InfoLine
                icon="play-circle"
                iconColor={brand.success}
                label={t('inscDateOpens')}
                value={formatShortDate(item.dateStart, locale)}
                isRTL={isRTL}
              />
            ) : null}
            {item.dateEnd ? (
              deadlineLocked && !contentLocked ? (
                <InfoLineLocked
                  icon="stop-circle"
                  iconColor={brand.textMuted}
                  label={t('inscDateCloses')}
                  value={formatShortDate(item.dateEnd, locale)}
                  isRTL={isRTL}
                  onPress={promptPartialLock}
                />
              ) : (
                <InfoLine
                  icon="stop-circle"
                  iconColor={brand.textMuted}
                  label={t('inscDateCloses')}
                  value={formatShortDate(item.dateEnd, locale)}
                  isRTL={isRTL}
                />
              )
            ) : null}
          </View>
        ) : null}

        {/* Countdown (ouverture / clôture) */}
        {deadlineLocked && !contentLocked ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              promptPartialLock();
            }}
            style={[styles.countdown, styles.countdownLocked]}>
            <FontAwesome name="lock" size={11} color="#64748B" />
            <Text style={[styles.countdownTxt, styles.countdownLockedTxt, isRTL && styles.rtlText]}>
              {t('inscPartialFeatureLockedHint')}
            </Text>
          </Pressable>
        ) : deadline.label ? (
          <View
            style={[
              styles.countdown,
              deadline.kind === 'closed' && styles.countdownClosed,
              deadline.kind === 'today' && styles.countdownToday,
              deadline.kind === 'soon' && styles.countdownSoon,
              deadline.kind === 'normal' && styles.countdownOpen,
            ]}>
            <FontAwesome
              name={deadline.kind === 'closed' ? 'lock' : 'hourglass-half'}
              size={11}
              color={
                deadline.kind === 'closed'
                  ? '#B91C1C'
                  : deadline.kind === 'today'
                    ? '#B45309'
                    : deadline.kind === 'soon'
                      ? '#9A3412'
                      : '#15803D'
              }
            />
            <Text
              style={[
                styles.countdownTxt,
                isRTL && styles.rtlText,
                deadline.kind === 'closed' && styles.countdownClosedTxt,
                deadline.kind === 'today' && styles.countdownTodayTxt,
                deadline.kind === 'soon' && styles.countdownSoonTxt,
                deadline.kind === 'normal' && styles.countdownOpenTxt,
              ]}>
              {deadline.label}
            </Text>
          </View>
        ) : null}

        {/* Éligibilité */}
        <View style={styles.badgeRow}>
          {eligibilityLoading ? (
            <View style={styles.eligibilityLoadingDot}>
              <ActivityIndicator size="small" color={brand.primary} />
            </View>
          ) : (
            <EligibilityBadge result={effectiveEligibility} size="xs" />
          )}
          {showDiagnosticBadge ? (
            <DiagnosticEstablishmentCompatibilityBadge
              establishmentId={est?.id ?? 0}
              announcementId={item.id}
              establishmentType={est?.type}
              size="xs"
              isRTL={isRTL}
              locale={locale === 'ar' ? 'ar' : 'fr'}
            />
          ) : null}
        </View>

        {/* Liens utiles */}
        {usefulLinks.length > 0 ? (
          <View style={styles.linksPanel}>
            <Text style={[styles.linksPanelTitle, isRTL && styles.rtlText]}>
              {t('inscDetailUsefulLinks')}
            </Text>
            <View style={styles.linksWrap}>
              {usefulLinks.map((l, i) => (
                <Pressable
                  key={`${l.url}-${i}`}
                  onPress={() => {
                    void Linking.openURL(l.url).catch(() => undefined);
                  }}
                  style={({ pressed }) => [styles.linkChip, pressed && { opacity: 0.85 }]}>
                  <FontAwesome name="link" size={10} color={brand.primary} />
                  <Text style={[styles.linkChipTxt, isRTL && styles.rtlText]} numberOfLines={1}>
                    {l.titre || l.url}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Statut candidature */}
        {showStatusAction ? (
          <TourFocusWrap
            active={tourFocusActive('status')}
            dimmed={tourFocusDimmed('status')}
            pulse={tourFocusPulse}
            label={tourFocusActive('status') ? tourFocusLabel : undefined}>
            <View style={styles.statusPanel}>
              <View style={styles.statusPanelTop}>
                {currentStatus ? <StatusBadge status={currentStatus} size="sm" /> : null}
                {statusActionBtn(false)}
              </View>
            </View>
          </TourFocusWrap>
        ) : null}

        {/* Actions principales */}
        <View style={styles.actionsCol}>
          <View style={styles.actionsRow}>
            {followBtn(false)}
            {registrationLinkBtn(false, registrationLocked && !contentLocked)}
          </View>
        </View>
          </>
        ) : (
          <>
            <View style={[styles.metaPanel, styles.sectionDisabled]} pointerEvents="none">
              <InfoLineHidden
                icon="map-marker"
                iconColor={brand.textMuted}
                label={t('schoolsCityLabel')}
                isRTL={isRTL}
              />
              <InfoLineHidden
                icon="play-circle"
                iconColor={brand.success}
                label={t('inscDateOpens')}
                isRTL={isRTL}
              />
              <InfoLineHidden
                icon="stop-circle"
                iconColor={brand.textMuted}
                label={t('inscDateCloses')}
                isRTL={isRTL}
              />
            </View>

            <View
              style={[styles.countdown, styles.countdownLocked, styles.sectionDisabled]}
              pointerEvents="none">
              <FontAwesome name="lock" size={11} color="#64748B" />
              <HiddenBar flex={1} height={12} isRTL={isRTL} />
            </View>

            <View style={[styles.badgeRow, styles.sectionDisabled]} pointerEvents="none">
              <View style={styles.badgeLocked}>
                <FontAwesome name="lock" size={10} color="#64748B" />
              </View>
              <View style={styles.badgeLocked}>
                <FontAwesome name="lock" size={10} color="#64748B" />
              </View>
            </View>

            <View style={[styles.linksPanel, styles.sectionDisabled]} pointerEvents="none">
              <Text style={[styles.linksPanelTitle, isRTL && styles.rtlText]}>
                {t('inscDetailUsefulLinks')}
              </Text>
              <View style={[styles.linksWrap, isRTL && styles.rowRtl]}>
                <View style={styles.linkChipLocked}>
                  <HiddenBar width={72} height={10} />
                </View>
                <View style={styles.linkChipLocked}>
                  <HiddenBar width={56} height={10} />
                </View>
              </View>
            </View>
          </>
        )}

        {contentLocked ? (
          <>
            <View style={styles.statusPanel}>
              <View style={styles.statusPanelTop}>
                {currentStatus ? <StatusBadge status={currentStatus} size="sm" /> : null}
                {statusActionBtn(true)}
              </View>
            </View>
            <View style={styles.actionsCol}>
              <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
                {followBtn(true)}
                {registrationLinkBtn(false, true)}
              </View>
            </View>
          </>
        ) : null}
      </View>

      {contentLocked ? <PaywallCardReservedOverlay isRTL={isRTL} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: 'rgba(51,62,143,0.04)',
    borderColor: 'rgba(51,62,143,0.25)',
  },
  cardLocked: {
    backgroundColor: '#FAFBFC',
  },
  bodyLocked: {
    opacity: 0.92,
  },
  sectionDisabled: {
    opacity: 0.72,
  },
  previewLockBlock: {
    alignSelf: 'stretch',
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  titleHiddenWrap: {
    alignSelf: 'stretch',
    width: '100%',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  btnLockedPaywall: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  btnLinkTxtLocked: {
    color: '#64748B',
  },
  statusEditBtnLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusEditBtnTxtLocked: {
    color: '#64748B',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  unseenDotAnchor: {
    position: 'absolute',
    top: spacing.sm,
    end: spacing.sm,
    zIndex: 2,
  },
  unseenDotWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unseenDotRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: brand.warning,
  },
  unseenDotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.warning,
    borderWidth: 1.5,
    borderColor: brand.white,
  },
  coverWrap: { position: 'relative' },
  cover: { width: '100%', height: 110, backgroundColor: brand.borderLight },
  coverLocked: {
    backgroundColor: '#E2E8F0',
  },
  hiddenBar: {
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    maxWidth: '100%',
  },
  hiddenBarRtl: {
    alignSelf: 'flex-end',
  },
  coverChip: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  bodyRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 0,
  },
  headerTypeWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTypeSpacer: {
    flex: 1,
  },
  stateChipUnread: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.22)',
    flexShrink: 0,
  },
  stateChipUnreadTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  stateDotUnread: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: brand.primary,
  },
  schoolBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.borderLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  estLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: brand.white,
  },
  estLogoLocked: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  estTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  estName: {
    fontWeight: '800',
    color: brand.text,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  estNameAlt: {
    fontWeight: '600',
    color: brand.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 17,
  },
  estMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  siglePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderRadius: radius.sm,
  },
  siglePillTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
  },
  title: {
    color: brand.text,
    fontWeight: '700',
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  titleUnread: {
    fontWeight: '800',
    color: brand.primary,
  },
  metaPanel: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minWidth: 0,
  },
  infoIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    marginTop: 1,
  },
  infoTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 18,
  },
  infoValueLockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValueLockedPlaceholder: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    letterSpacing: 1,
    lineHeight: 18,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignSelf: 'stretch',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  countdownTxt: {
    flex: 1,
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  countdownOpen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  countdownOpenTxt: { color: '#15803D' },
  countdownSoon: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  countdownSoonTxt: { color: '#9A3412' },
  countdownToday: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  countdownTodayTxt: { color: '#B45309' },
  countdownClosed: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  countdownClosedTxt: { color: '#B91C1C' },
  countdownLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  countdownLockedTxt: { color: '#64748B' },
  badgeLocked: {
    minWidth: 28,
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 0,
  },
  eligibilityLoadingDot: {
    minWidth: 28,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linksPanel: {
    gap: spacing.xs,
    paddingTop: 2,
  },
  linksPanelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  linkChipLocked: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.25)',
    backgroundColor: 'rgba(51,62,143,0.06)',
    maxWidth: '100%',
    flexShrink: 1,
  },
  linkChipTxt: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    flexShrink: 1,
  },
  statusPanel: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.14)',
  },
  statusPanelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
    flexShrink: 1,
  },
  statusEditBtnTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.xs,
  },
  statusEditBtnFocus: {
    borderWidth: 2,
    borderColor: homeShell.green,
    backgroundColor: homeShell.greenAlpha11,
  },
  actionsCol: {
    marginTop: 2,
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    minWidth: 0,
  },
  btnFlex: { flex: 1, minWidth: 0 },
  btnLinkFull: { alignSelf: 'stretch' },
  btnFollow: { backgroundColor: brand.primary },
  btnLinkFocus: {
    borderColor: homeShell.green,
    borderWidth: 2,
  },
  btnLinkFocusFull: { width: '100%' },
  btnFollowFocus: {
    borderWidth: 2,
    borderColor: homeShell.green,
  },
  btnFollowTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  btnFollowed: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: 'rgba(51,62,143,0.08)',
  },
  btnFollowedTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700' },
  btnLink: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  btnLinkTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700', flexShrink: 1 },
  btnDisabled: { opacity: 0.4 },
  tourActionDisabled: { opacity: 0.38 },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
