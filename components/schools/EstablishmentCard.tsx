import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { PaywallCardReservedOverlay } from '@/components/inscriptions/TawjihPlusPaywall';
import { DiagnosticEstablishmentCompatibilityBadge } from '@/components/diagnostic/DiagnosticEstablishmentCompatibilityBadge';
import { EligibilityBadge } from '@/components/inscriptions/EligibilityViews';
import {
  EstablishmentTypeBadge,
  establishmentTypeDisplayLabel,
} from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';

import { useLocale } from '@/contexts/LocaleContext';
import { useEstablishmentLeadGenSheetOptional } from '@/contexts/EstablishmentLeadGenSheetContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import type { EstablishmentNormalized } from '@/services/establishments';
import { recordReferencingClickNative, recordReferencingContactClickNative, recordReferencingImpressionNative } from '@/services/referencingAds';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { establishmentListingPlacement } from '@/utils/establishmentListingPlacement';
import { evaluateEligibility } from '@/utils/eligibility';
import { formatVillesCourtes, formatEstablishmentStudyDuration, secteurTitres, universityName } from '@/utils/establishmentFormat';
import { fireAndForget } from '@/utils/fireAndForget';
import { placementShowsContactForm, placementTrafficDestinationUrl, addUtmToUrl } from '@/utils/referencingPlacementUi';
import { stripHtmlToText } from '@/utils/sanitizeRichHtml';
import type { EstablishmentLockedVariant } from '@/utils/establishmentLockDisplay';

type Props = {
  item: EstablishmentNormalized;
  /** `compact` = même carte, contenu sensible masqué + zones désactivées. */
  lockedVariant?: 'none' | EstablishmentLockedVariant;
  onPress?: () => void;
  isFollowed?: boolean;
  followStateLoading?: boolean;
  followBusy?: boolean;
  onToggleFollow?: () => void;
  eligibilityLoading?: boolean;
};

export function EstablishmentCard({
  item,
  lockedVariant = 'none',
  onPress,
  isFollowed,
  followStateLoading,
  followBusy,
  onToggleFollow,
  eligibilityLoading,
}: Props) {
  const { isRTL, t, locale } = useLocale();
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const leadGenSheet = useEstablishmentLeadGenSheetOptional();
  const referencingImpSent = useRef(false);
  const contentLocked = lockedVariant === 'compact';

  const placement = establishmentListingPlacement(item);
  const showLeadgenButton = !contentLocked && placementShowsContactForm(placement);
  const trafficUrl = placementTrafficDestinationUrl(placement);
  const showTrafficSiteButton = !contentLocked && Boolean(trafficUrl);
  const showSponsorActions = showLeadgenButton || showTrafficSiteButton;
  const cardSource = item.isSponsored ? 'sponsorship' : 'referencing';

  const placementId = item.referencingPlacementId;
  useEffect(() => {
    if (!placementId || referencingImpSent.current) return;
    referencingImpSent.current = true;
    const source = item.isSponsored ? 'sponsorship' : 'referencing';
    fireAndForget(recordReferencingImpressionNative({ placementId, source }));
  }, [placementId, item.isSponsored]);

  const handleCardPress = () => {
    if (placementId) {
      fireAndForget(recordReferencingClickNative({ placementId, source: cardSource }));
    }
    onPress?.();
  };

  const recordPlacementClick = () => {
    if (placementId) {
      fireAndForget(recordReferencingClickNative({ placementId, source: cardSource }));
    }
  };

  const handleLeadgenPress = () => {
    if (!placement) return;
    fireAndForget(recordReferencingContactClickNative({ placementId: placement.placementId }));
    recordPlacementClick();
    leadGenSheet?.openLeadGenSheet(item, placement);
  };

  const handleTrafficSitePress = () => {
    recordPlacementClick();
    if (trafficUrl) {
      void Linking.openURL(addUtmToUrl(trafficUrl)).catch(() => undefined);
    }
  };

  const eligibility = evaluateEligibility(
    {
      filieresAcceptees: item.filieresAcceptees,
      specialitesBacMissionAcceptees: item.specialitesBacMissionAcceptees,
      anneesBacAcceptees: item.anneesBacAcceptees,
    },
    eligibilityProfile,
  );
  const villesTxt = formatVillesCourtes(item.villesListe, 2);
  const uni = universityName(item, { rtl: isRTL });
  const secteurs = secteurTitres(item, { rtl: isRTL });
  const primaryName = isRTL && item.nomArabe ? item.nomArabe : item.nom;
  const secondaryLine =
    isRTL && item.nomArabe
      ? [item.sigle, item.nom].filter(Boolean).join(' · ')
      : [item.sigle, item.nomArabe].filter(Boolean).join(' · ');
  const descRaw = (isRTL ? item.descriptionAr || item.description : item.description) || '';
  const desc = stripHtmlToText(descRaw, 220);
  const dipShow = item.mergedDiplomes.slice(0, 2);
  const dipExtra = item.mergedDiplomes.length > 2 ? ` +${item.mergedDiplomes.length - 2}` : '';
  const secShow = secteurs.slice(0, 2);
  const secExtra = secteurs.length > 2 ? ` +${secteurs.length - 2}` : '';
  const nbFil = item.academicInfo?.nbFilieres ?? item.nbFilieres;
  const showLocation = Boolean(villesTxt || uni);
  const showDesc = Boolean(desc);
  const showChips = dipShow.length > 0 || (typeof nbFil === 'number' && nbFil > 0);
  const showFooter =
    secShow.length > 0 || item.echangeInternational || item.eTawjihiInscription || item.boursesDisponibles;
  const showMetrics = true;
  const typeLabel = establishmentTypeDisplayLabel(item.type, t) || '—';
  const durationLabel =
    formatEstablishmentStudyDuration(item, locale === 'ar' ? 'ar' : 'fr') || item.dureeLabel || '—';

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        item.isSponsored && !contentLocked && styles.cardSponsored,
        contentLocked && styles.cardLocked,
        isRTL && styles.cardRtl,
        pressed && { opacity: 0.96 },
      ]}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />

      {item.isSponsored && !contentLocked ? (
        <View style={[styles.sponsoredTopWrap, isRTL && styles.sponsoredTopWrapRtl]}>
          <TinyBadge label={t('estCardBadgeSponsored')} tint="blue" textRtl={isRTL} />
        </View>
      ) : null}

      <View style={[styles.topRow, isRTL && styles.topRowRtl, contentLocked && styles.sectionDisabled]}>
        <View style={[styles.logoOuter, isRTL && styles.logoOuterRtl, contentLocked && styles.logoOuterLocked]}>
          {contentLocked ? (
            <View style={styles.logoPlaceholder}>
              <FontAwesome name="university" size={22} color="#CBD5E1" />
            </View>
          ) : (
            <Image
              source={{ uri: item.displayLogoUrl }}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          )}
        </View>
        <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
          {contentLocked ? (
            <>
              <HiddenBar width="88%" height={14} isRTL={isRTL} />
              <HiddenBar width="55%" height={11} style={{ marginTop: 6 }} isRTL={isRTL} />
            </>
          ) : (
            <>
              <View style={styles.titleLine}>
                <Text
                  style={[styles.title, isRTL && styles.titleRtl, isRTL && styles.txtRtl]}>
                  {primaryName}
                </Text>
              </View>
              {secondaryLine ? (
                <Text
                  style={[styles.sigleLine, isRTL && styles.sigleLineRtl, isRTL && styles.txtRtl]}>
                  {secondaryLine}
                </Text>
              ) : null}
            </>
          )}
          <View style={[styles.badgeRow, isRTL && styles.badgeRowRtl]}>
            {(item.type ?? '').trim() ? (
              <EstablishmentTypeBadge type={item.type} size="xs" />
            ) : null}
            {contentLocked ? (
              <>
                <BadgeLockedPlaceholder />
                <BadgeLockedPlaceholder />
              </>
            ) : (
              <>
                {item.isRecommended ? <TinyBadge label="Recommandé" tint="green" /> : null}
                {eligibilityLoading ? (
                  <View style={styles.eligibilityLoadingDot}>
                    <ActivityIndicator size="small" color={homeShell.blue} />
                  </View>
                ) : (
                  <EligibilityBadge result={eligibility} size="xs" />
                )}
                <DiagnosticEstablishmentCompatibilityBadge
                  establishmentId={item.id}
                  establishmentType={item.type}
                  size="xs"
                  isRTL={isRTL}
                  locale={locale === 'ar' ? 'ar' : 'fr'}
                />
              </>
            )}
          </View>
        </View>
        <View style={[styles.topRight, isRTL && styles.topRightRtl]}>
          <FontAwesome
            name={contentLocked ? 'lock' : isRTL ? 'chevron-left' : 'chevron-right'}
            size={14}
            color={contentLocked ? '#94A3B8' : homeShell.cardMuted}
            style={[styles.chev, isRTL && styles.chevRtl]}
          />
        </View>
      </View>

      {(showLocation || contentLocked) && (
        <View
          style={[
            styles.rowIcon,
            isRTL && styles.rowIconRtl,
            contentLocked && styles.sectionDisabled,
          ]}
          pointerEvents={contentLocked ? 'none' : 'auto'}>
          <FontAwesome name="map-marker" size={13} color={contentLocked ? '#CBD5E1' : homeShell.greenDark} />
          {contentLocked ? (
            <HiddenBar flex={1} height={12} isRTL={isRTL} />
          ) : (
            <Text style={[styles.rowTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
              {villesTxt}
              {villesTxt && uni ? ' · ' : ''}
              {uni}
            </Text>
          )}
        </View>
      )}

      {(showDesc || contentLocked) && (
        <View style={[contentLocked && styles.sectionDisabled]} pointerEvents={contentLocked ? 'none' : 'auto'}>
          {contentLocked ? (
            <View style={[styles.descPlaceholder, isRTL && styles.blockRtl]}>
              <HiddenBar width="100%" height={10} isRTL={isRTL} />
              <HiddenBar width="92%" height={10} style={{ marginTop: 6 }} isRTL={isRTL} />
              <HiddenBar width="75%" height={10} style={{ marginTop: 6 }} isRTL={isRTL} />
            </View>
          ) : (
            <View style={[isRTL && styles.descWrapRtl, isRTL && styles.blockRtl]}>
              <Text style={[styles.desc, isRTL && styles.txtRtl, isRTL && styles.blockRtl]} numberOfLines={3}>
                {desc}
              </Text>
            </View>
          )}
        </View>
      )}

      {showMetrics && (
        <View
          style={[styles.metricRow, isRTL && styles.metricRowRtl, contentLocked && styles.sectionDisabled]}
          pointerEvents={contentLocked ? 'none' : 'auto'}>
          <Metric icon="building" label={t('estLabelSchoolType')} value={typeLabel} locked={contentLocked} />
          <Metric
            icon="clock-o"
            label={t('estLabelDuration')}
            value={durationLabel}
            locked={contentLocked}
            latinDigits={isRTL}
          />
          <Metric
            icon="graduation-cap"
            label={t('estLabelAdmission')}
            value={item.concoursAdmission ? t('estAdmissionConcours') : t('estAdmissionDossier')}
            locked={contentLocked}
          />
        </View>
      )}

      {(showChips || contentLocked) && (
        <View
          style={[styles.chipRow, isRTL && styles.blockRtl, contentLocked && styles.sectionDisabled]}
          pointerEvents={contentLocked ? 'none' : 'auto'}>
          {contentLocked ? (
            <>
              <View style={styles.dipChipLocked}>
                <HiddenBar width={48} height={10} />
              </View>
              <View style={styles.dipChipLocked}>
                <HiddenBar width={56} height={10} />
              </View>
            </>
          ) : (
            <>
              {dipShow.map((d) => (
                <View key={d} style={styles.dipChip}>
                  <Text style={[styles.dipChipTxt, isRTL && styles.txtRtl]}>{d}</Text>
                </View>
              ))}
              {dipExtra ? (
                <View style={[styles.dipChip, styles.dipChipMuted]}>
                  <Text style={[styles.dipChipTxtMuted, isRTL && styles.txtRtl]}>{dipExtra.trim()}</Text>
                </View>
              ) : null}
              {typeof nbFil === 'number' && nbFil > 0 && dipShow.length === 0 ? (
                <View style={styles.dipChip}>
                  <Text style={[styles.dipChipTxt, isRTL && styles.txtRtl]}>
                    {nbFil} filière{nbFil > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      )}

      {(showFooter || contentLocked) && (
        <View
          style={[styles.footerRow, isRTL && styles.footerRowRtl, contentLocked && styles.sectionDisabled]}
          pointerEvents={contentLocked ? 'none' : 'auto'}>
          {contentLocked ? (
            <HiddenBar flex={1} height={11} isRTL={isRTL} />
          ) : (
            <>
              {secShow.length > 0 && (
                <Text style={[styles.footerMeta, isRTL && styles.txtRtl]} numberOfLines={2}>
                  <Text style={[styles.footerLbl, isRTL && styles.txtRtl]}>{t('estLabelSectors')} · </Text>
                  {secShow.join(', ')}
                  {secExtra}
                </Text>
              )}
              <View style={[styles.footerIcons, isRTL && styles.footerIconsRtl]}>
                {item.echangeInternational ? (
                  <FontAwesome name="globe" size={14} color={homeShell.blue} />
                ) : null}
                {item.eTawjihiInscription ? (
                  <FontAwesome name="bolt" size={14} color={homeShell.greenDark} />
                ) : null}
                {item.boursesDisponibles ? (
                  <FontAwesome name="gift" size={13} color={homeShell.greenDark} />
                ) : null}
              </View>
            </>
          )}
        </View>
      )}

      {showSponsorActions ? (
        <View style={[styles.sponsorActions, isRTL && styles.sponsorActionsRtl]}>
          {showTrafficSiteButton ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleTrafficSitePress();
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('estCardBtnVisitSite')} — ${primaryName}`}
              style={({ pressed }) => [styles.sponsorBtn, styles.sponsorBtnTraffic, pressed && { opacity: 0.88 }]}>
              <FontAwesome name="external-link" size={12} color={brand.white} />
              <Text style={[styles.sponsorBtnTxt, isRTL && styles.txtRtl]} numberOfLines={1}>
                {t('estCardBtnVisitSite')}
              </Text>
            </Pressable>
          ) : null}
          {showLeadgenButton ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleLeadgenPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('estCardBtnContact')} — ${primaryName}`}
              style={({ pressed }) => [styles.sponsorBtn, styles.sponsorBtnContact, pressed && { opacity: 0.88 }]}>
              <FontAwesome name="comment" size={12} color={brand.white} />
              <Text style={[styles.sponsorBtnTxt, isRTL && styles.txtRtl]} numberOfLines={1}>
                {t('estCardBtnContact')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {onToggleFollow ? (
        <View style={[styles.actionBar, isRTL && styles.actionBarRtl]}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFollow();
            }}
            disabled={contentLocked || followBusy || followStateLoading}
            accessibilityRole="button"
            accessibilityState={{
              selected: !contentLocked && !!isFollowed,
              busy: !contentLocked && (!!followBusy || !!followStateLoading),
            }}
            accessibilityLabel={
              contentLocked
                ? t('inscTawjihPlusUpgradeCta')
                : followStateLoading
                  ? t('inscLoading')
                  : isFollowed
                    ? t('followSchoolUnfollowBtn')
                    : t('followSchoolBtn')
            }
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBarBtn,
              styles.followBtn,
              contentLocked && styles.followBtnLocked,
              !contentLocked && !followStateLoading && isFollowed && styles.followBtnActive,
              pressed && { opacity: 0.85 },
              !contentLocked && (followBusy || followStateLoading) && { opacity: 0.6 },
            ]}>
            {followBusy || followStateLoading ? (
              <ActivityIndicator
                size="small"
                color={!followStateLoading && isFollowed ? brand.primary : brand.white}
              />
            ) : (
              <>
                <FontAwesome
                  name={contentLocked ? 'lock' : isFollowed ? 'heart' : 'heart-o'}
                  size={12}
                  color={contentLocked ? '#64748B' : isFollowed ? brand.primary : brand.white}
                />
                <Text
                  style={[
                    styles.followBtnTxt,
                    contentLocked && styles.followBtnTxtLocked,
                    !contentLocked && isFollowed && styles.followBtnTxtActive,
                    isRTL && styles.txtRtl,
                  ]}
                  numberOfLines={1}>
                  {contentLocked
                    ? t('inscTawjihPlusUpgradeCta')
                    : isFollowed
                      ? t('inscAnnouncementsFollowing')
                      : t('inscAnnouncementsFollow')}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : null}

      {contentLocked ? <PaywallCardReservedOverlay isRTL={isRTL} /> : null}
    </Pressable>
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

function BadgeLockedPlaceholder() {
  return (
    <View style={styles.badgeLockedPill}>
      <FontAwesome name="lock" size={9} color="#94A3B8" />
    </View>
  );
}

function TinyBadge({ label, tint, textRtl }: { label: string; tint: 'neutral' | 'blue' | 'green'; textRtl?: boolean }) {
  const bg =
    tint === 'blue'
      ? 'rgba(51,62,143,0.10)'
      : tint === 'green'
        ? homeShell.greenAlpha11
        : homeShell.greenAlpha18;
  const fg = tint === 'blue' ? homeShell.blue : tint === 'green' ? homeShell.greenDark : homeShell.blueDeep;
  return (
    <View style={[styles.tinyBadge, { backgroundColor: bg }]}>
      <Text style={[styles.tinyBadgeTxt, { color: fg }, textRtl && styles.txtRtl]}>{label}</Text>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  locked = false,
  latinDigits = false,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  locked?: boolean;
  latinDigits?: boolean;
}) {
  return (
    <View style={[styles.metric, locked && styles.metricLocked]}>
      <FontAwesome name={icon} size={12} color={locked ? '#CBD5E1' : homeShell.cardMuted} />
      <Text style={[styles.metricLbl, locked && styles.metricLblLocked]}>{label}</Text>
      {locked ? (
        <View style={styles.metricValLockedRow}>
          <FontAwesome name="lock" size={10} color="#94A3B8" />
        </View>
      ) : (
        <Text style={styles.metricVal} numberOfLines={2} latinDigits={latinDigits}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
  },
  cardLocked: {
    backgroundColor: '#FAFBFC',
  },
  cardSponsored: {
    borderColor: '#a78bfa',
    borderWidth: 2,
    backgroundColor: '#faf5ff',
  },
  cardRtl: {
    alignItems: 'stretch',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: homeShell.green,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  accentBarRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  sponsoredTopWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sponsoredTopWrapRtl: {
    justifyContent: 'flex-end',
  },
  sectionDisabled: {
    opacity: 0.72,
  },
  badgeLockedPill: {
    minWidth: 28,
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topRowRtl: {
    flexDirection: 'row-reverse',
    direction: 'ltr',
  },
  logoOuter: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: homeShell.card,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginStart: spacing.sm,
    flexShrink: 0,
  },
  logoOuterLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  logoOuterRtl: {
    marginStart: spacing.sm,
    marginEnd: 0,
  },
  logo: {
    width: 52,
    height: 52,
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    paddingStart: spacing.md,
    minWidth: 0,
  },
  titleBlockRtl: {
    paddingStart: 0,
    paddingEnd: spacing.md,
  },
  titleLine: {
    alignSelf: 'stretch',
    width: '100%',
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    alignSelf: 'stretch',
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  titleRtl: {
    lineHeight: Math.round(fontSize.lg * 1.45),
    letterSpacing: 0,
  },
  sigleLine: {
    marginTop: 5,
    flexShrink: 1,
    alignSelf: 'stretch',
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sigleLineRtl: {
    lineHeight: Math.round(fontSize.sm * 1.4),
    letterSpacing: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  badgeRowRtl: {
    flexDirection: 'row-reverse',
  },
  hiddenBar: {
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    maxWidth: '100%',
  },
  hiddenBarRtl: {
    alignSelf: 'flex-end',
  },
  tinyBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tinyBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  topRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
    marginStart: spacing.sm,
    flexShrink: 0,
  },
  topRightRtl: {
    marginStart: spacing.sm,
    marginEnd: 0,
    alignItems: 'flex-start',
  },
  chev: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  chevRtl: {
    alignSelf: 'flex-start',
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
    paddingRight: spacing.lg,
  },
  rowIconRtl: {
    flexDirection: 'row-reverse',
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
    paddingRight: 0,
    paddingLeft: spacing.lg,
  },
  rowTxt: {
    flex: 1,
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  desc: {
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    lineHeight: 19,
    fontWeight: '600',
  },
  descWrapRtl: {
    direction: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
  descPlaceholder: {
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
    gap: 0,
  },
  blockRtl: {
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  metricRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginStart: 2 + spacing.sm,
  },
  metricRowRtl: {
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: '28%',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    gap: 4,
  },
  metricLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginTop: 2,
  },
  metricLblLocked: {
    color: '#CBD5E1',
  },
  metricVal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.cardText,
    lineHeight: 18,
  },
  metricValLockedRow: {
    minHeight: 18,
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
  },
  dipChip: {
    backgroundColor: homeShell.greenAlpha11,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.22)',
    maxWidth: '100%',
  },
  dipChipLocked: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dipChipMuted: {
    backgroundColor: '#F8FAFC',
    borderColor: homeShell.borderOnWhite,
  },
  dipChipTxt: {
    color: homeShell.greenDark,
    fontSize: 12,
    fontWeight: '700',
  },
  dipChipTxtMuted: {
    color: homeShell.cardMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginStart: 2 + spacing.sm,
    paddingBottom: spacing.xs,
  },
  footerRowRtl: {
    flexDirection: 'row-reverse',
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  footerMeta: {
    flex: 1,
    color: homeShell.cardMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    minWidth: 0,
  },
  footerLbl: {
    color: homeShell.blue,
    fontWeight: '800',
  },
  footerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
    flexShrink: 0,
  },
  footerIconsRtl: {
    flexDirection: 'row-reverse',
  },
  sponsorActions: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  sponsorActionsRtl: {
    flexDirection: 'row-reverse',
  },
  sponsorBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  sponsorBtnContact: {
    backgroundColor: brand.primary,
  },
  sponsorBtnTraffic: {
    backgroundColor: brand.emerald,
  },
  sponsorBtnTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  actionBar: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  actionBarRtl: {
    flexDirection: 'row-reverse',
  },
  actionBarBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  followBtn: {
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: brand.primary,
    borderWidth: 1,
    borderColor: brand.primary,
  },
  followBtnActive: {
    backgroundColor: brand.white,
    borderColor: brand.primary,
  },
  followBtnTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  followBtnTxtActive: {
    color: brand.primary,
  },
  followBtnLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  followBtnTxtLocked: {
    color: '#64748B',
  },
  eligibilityLoadingDot: {
    minWidth: 28,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
