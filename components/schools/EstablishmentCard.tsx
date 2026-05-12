import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { EligibilityBadge } from '@/components/inscriptions/EligibilityViews';
import { EstablishmentTypeBadge, establishmentTypeDisplayLabel } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';

import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import type { EstablishmentNormalized } from '@/services/establishments';
import { recordReferencingClickNative, recordReferencingImpressionNative } from '@/services/referencingAds';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { evaluateEligibility } from '@/utils/eligibility';
import { formatVillesCourtes, secteurTitres, universityName } from '@/utils/establishmentFormat';
import { fireAndForget } from '@/utils/fireAndForget';

type Props = {
  item: EstablishmentNormalized;
  onPress?: () => void;
  /**
   * Suivi : bouton texte « Suivre » / « Abonné » en bas si `onToggleFollow` est fourni.
   * Le tap ne déclenche pas l’`onPress` de la carte.
   */
  isFollowed?: boolean;
  /** Tant que `true`, n’affiche pas un état suivi/non suivi avant la fin du chargement serveur. */
  followStateLoading?: boolean;
  followBusy?: boolean;
  onToggleFollow?: () => void;
  /** Profil éligibilité en cours de chargement — pas de badge « éligible » approximatif. */
  eligibilityLoading?: boolean;
  /** Ouvre le panneau Q&R (commentaires / questions) depuis le bas ; icône en barre d’actions. */
  onOpenComments?: () => void;
};

export function EstablishmentCard({
  item,
  onPress,
  isFollowed,
  followStateLoading,
  followBusy,
  onToggleFollow,
  eligibilityLoading,
  onOpenComments,
}: Props) {
  const { isRTL, t } = useLocale();
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const referencingImpSent = useRef(false);

  const placementId = item.referencingPlacementId;
  useEffect(() => {
    if (!placementId || referencingImpSent.current) return;
    referencingImpSent.current = true;
    const source = item.isSponsored ? 'sponsorship' : 'referencing';
    fireAndForget(recordReferencingImpressionNative({ placementId, source }));
  }, [placementId, item.isSponsored]);

  const handleCardPress = () => {
    if (placementId) {
      const source = item.isSponsored ? 'sponsorship' : 'referencing';
      fireAndForget(recordReferencingClickNative({ placementId, source }));
    }
    onPress?.();
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
  const desc = (isRTL ? item.descriptionAr || item.description : item.description) || '';
  const dipShow = item.mergedDiplomes.slice(0, 2);
  const dipExtra = item.mergedDiplomes.length > 2 ? ` +${item.mergedDiplomes.length - 2}` : '';
  const secShow = secteurs.slice(0, 2);
  const secExtra = secteurs.length > 2 ? ` +${secteurs.length - 2}` : '';
  const nbFil = item.academicInfo?.nbFilieres ?? item.nbFilieres;
  const bourseLbl =
    item.boursesDisponibles && item.bourseMin !== undefined != null ? 'Bourses' : '';

  const followersKnown = typeof item.followersCount === 'number' && Number.isFinite(item.followersCount);
  const followersCount = followersKnown ? Math.max(0, Math.floor(item.followersCount as number)) : null;
  const commentsKnown =
    typeof item.communityQnaMessageCount === 'number' && Number.isFinite(item.communityQnaMessageCount);
  const commentsCount = commentsKnown ? Math.max(0, Math.floor(item.communityQnaMessageCount as number)) : null;
  const commentsStatsPending = Boolean(onOpenComments) && !commentsKnown;
  const statsClusterA11y = commentsStatsPending
    ? t('estCardStatsLoadingA11y')
    : t('estCardStatsClusterA11y')
        .replace('{{followers}}', followersCount != null ? String(followersCount) : '—')
        .replace('{{comments}}', commentsCount != null ? String(commentsCount) : '—');

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        item.isSponsored && styles.cardSponsored,
        isRTL && styles.cardRtl,
        pressed && { opacity: 0.96 },
      ]}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />

      {item.isSponsored ? (
        <View style={styles.sponsoredTopWrap}>
          <TinyBadge label={t('estCardBadgeSponsored')} tint="blue" textRtl={isRTL} />
        </View>
      ) : null}

      <View style={[styles.topRow, isRTL && styles.topRowRtl]}>
        <View style={[styles.logoOuter, isRTL && styles.logoOuterRtl]}>
          <Image source={{ uri: item.displayLogoUrl }} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
        </View>
        <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
          <View style={styles.titleLine}>
            <Text style={[styles.title, isRTL && styles.titleRtl, isRTL && styles.txtRtl]} numberOfLines={2}>
              {primaryName}
            </Text>
          </View>
          {secondaryLine ? (
            <Text style={[styles.sigleLine, isRTL && styles.sigleLineRtl, isRTL && styles.txtRtl]} numberOfLines={1}>
              {secondaryLine}
            </Text>
          ) : null}
          <View style={[styles.badgeRow, isRTL && styles.badgeRowRtl]}>
            <EstablishmentTypeBadge type={item.type} size="xs" hideIfUnknown={false} />
            {item.isRecommended ? <TinyBadge label="Recommandé" tint="green" /> : null}
            {item.accreditationEtat ? <TinyBadge label="État" tint="green" /> : null}
            {eligibilityLoading ? (
              <View style={styles.eligibilityLoadingDot}>
                <ActivityIndicator size="small" color={homeShell.blue} />
              </View>
            ) : (
              <EligibilityBadge result={eligibility} size="xs" />
            )}
          </View>
        </View>
        <View style={[styles.topRight, isRTL && styles.topRightRtl]}>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={14}
            color={homeShell.cardMuted}
            style={[styles.chev, isRTL && styles.chevRtl]}
          />
        </View>
      </View>

      {(villesTxt || uni) && (
        <View style={[styles.rowIcon, isRTL && styles.rowIconRtl]}>
          <FontAwesome name="map-marker" size={13} color={homeShell.greenDark} />
          <Text style={[styles.rowTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
            {villesTxt}
            {villesTxt && uni ? ' · ' : ''}
            {uni}
          </Text>
        </View>
      )}

      {desc ? (
        <Text style={[styles.desc, isRTL && styles.txtRtl, isRTL && styles.blockRtl]} numberOfLines={3}>
          {desc}
        </Text>
      ) : null}

      <View style={[styles.metricRow, isRTL && styles.metricRowRtl]}>
        <Metric
          icon="building"
          label={t('estLabelSchoolType')}
          value={establishmentTypeDisplayLabel(item.type, t)}
        />
        {item.dureeLabel ? <Metric icon="clock-o" label={t('estLabelDuration')} value={item.dureeLabel} /> : null}
        <Metric
          icon="graduation-cap"
          label={t('estLabelAdmission')}
          value={item.concoursAdmission ? t('estAdmissionConcours') : t('estAdmissionDossier')}
        />
      </View>

      {(dipShow.length > 0 || (typeof nbFil === 'number' && nbFil > 0)) && (
        <View style={[styles.chipRow, isRTL && styles.blockRtl]}>
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
              <Text style={[styles.dipChipTxt, isRTL && styles.txtRtl]}>{nbFil} filière{nbFil > 1 ? 's' : ''}</Text>
            </View>
          ) : null}
        </View>
      )}

      {(secShow.length > 0 || item.echangeInternational || item.eTawjihiInscription || item.boursesDisponibles) && (
        <View style={[styles.footerRow, isRTL && styles.footerRowRtl]}>
          {secShow.length > 0 && (
            <Text style={[styles.footerMeta, isRTL && styles.txtRtl]} numberOfLines={2}>
              <Text style={[styles.footerLbl, isRTL && styles.txtRtl]}>{t('estLabelSectors')} · </Text>
              {secShow.join(', ')}
              {secExtra}
            </Text>
          )}
          <View style={[styles.footerIcons, isRTL && styles.footerIconsRtl]}>
            {item.echangeInternational ? <FontAwesome name="globe" size={14} color={homeShell.blue} /> : null}
            {item.eTawjihiInscription ? <FontAwesome name="bolt" size={14} color={homeShell.greenDark} /> : null}
            {item.boursesDisponibles ? <FontAwesome name="gift" size={13} color={homeShell.greenDark} /> : null}
          </View>
        </View>
      )}

      {onToggleFollow || onOpenComments ? (
        <View style={[styles.actionBar, isRTL && styles.actionBarRtl]}>
          {onToggleFollow ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleFollow();
              }}
              disabled={followBusy || followStateLoading}
              accessibilityRole="button"
              accessibilityState={{
                selected: !!isFollowed,
                busy: !!followBusy || !!followStateLoading,
              }}
              accessibilityLabel={
                followStateLoading ? t('inscLoading') : isFollowed ? t('followSchoolUnfollowBtn') : t('followSchoolBtn')
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBarBtn,
                styles.followBtn,
                !followStateLoading && isFollowed && styles.followBtnActive,
                pressed && { opacity: 0.85 },
                (followBusy || followStateLoading) && { opacity: 0.6 },
              ]}>
              {followBusy || followStateLoading ? (
                <ActivityIndicator
                  size="small"
                  color={!followStateLoading && isFollowed ? brand.primary : brand.white}
                />
              ) : (
                <>
                  <FontAwesome
                    name={isFollowed ? 'heart' : 'heart-o'}
                    size={12}
                    color={isFollowed ? brand.primary : brand.white}
                  />
                  <Text
                    style={[styles.followBtnTxt, isFollowed && styles.followBtnTxtActive, isRTL && styles.txtRtl]}
                    numberOfLines={1}
                  >
                    {isFollowed ? t('inscAnnouncementsFollowing') : t('inscAnnouncementsFollow')}
                  </Text>
                </>
              )}
            </Pressable>
          ) : null}
          {onOpenComments ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onOpenComments();
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('estCardBtnComment')}. ${statsClusterA11y}. ${t('estCardQnaOpenA11y')}`}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBarBtn,
                styles.commentBtn,
                pressed && { opacity: 0.88 },
              ]}>
              <FontAwesome name="comment-o" size={12} color={brand.primary} />
              {commentsStatsPending ? (
                <ActivityIndicator size="small" color={brand.primary} style={{ marginStart: 4 }} />
              ) : (
                <Text style={[styles.commentBtnTxt, isRTL && styles.txtRtl]} numberOfLines={1}>
                  {commentsCount != null && commentsCount > 0
                    ? `${t('estCardBtnComment')} (${commentsCount})`
                    : t('estCardBtnComment')}
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function TinyBadge({ label, tint, textRtl }: { label: string; tint: 'neutral' | 'blue' | 'green'; textRtl?: boolean }) {
  const bg =
    tint === 'blue'
      ? 'rgba(51,62,143,0.10)'
      : tint === 'green'
        ? homeShell.greenAlpha11
        : homeShell.greenAlpha18;
  const fg =
    tint === 'blue' ? homeShell.blue : tint === 'green' ? homeShell.greenDark : homeShell.blueDeep;
  return (
    <View style={[styles.tinyBadge, { backgroundColor: bg }]}>
      <Text style={[styles.tinyBadgeTxt, { color: fg }, textRtl && styles.txtRtl]}>{label}</Text>
    </View>
  );
}

function Metric({ icon, label, value }: { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <FontAwesome name={icon} size={12} color={homeShell.cardMuted} />
      <Text style={styles.metricLbl}>{label}</Text>
      <Text style={styles.metricVal} numberOfLines={2}>
        {value}
      </Text>
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
  cardSponsored: {
    borderColor: '#a78bfa',
    borderWidth: 2,
    backgroundColor: '#faf5ff',
  },
  cardRtl: {
    direction: 'rtl',
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topRowRtl: {
    flexDirection: 'row-reverse',
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
  },
  logoOuterRtl: {
    marginStart: 0,
    marginEnd: spacing.sm,
  },
  logo: {
    width: 52,
    height: 52,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  /** Cairo / arabe : sans interligne explicite assez large, les lignes wrap se collent ou se chevauchent. */
  titleRtl: {
    lineHeight: Math.round(fontSize.lg * 1.45),
    letterSpacing: 0,
  },
  sigleLine: {
    marginTop: 5,
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
  },
  topRightRtl: {
    marginStart: 0,
    marginEnd: spacing.sm,
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
    alignItems: 'flex-start',
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
  metricLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginTop: 2,
  },
  metricVal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.cardText,
    lineHeight: 18,
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
  /** Deux boutons (Suivre / Commentaire) partagent la largeur. */
  actionBarBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  /** Non suivi = bouton rempli ; suivi = contour (via `followBtnActive`). */
  followBtn: {
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: brand.primary,
    borderWidth: 1,
    borderColor: brand.primary,
  },
  commentBtn: {
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.primary,
  },
  commentBtnTxt: {
    color: brand.primary,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
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
