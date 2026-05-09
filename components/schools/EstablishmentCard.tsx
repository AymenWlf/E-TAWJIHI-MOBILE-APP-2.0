import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { EligibilityBadge } from '@/components/inscriptions/EligibilityViews';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';

import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import type { EstablishmentNormalized } from '@/services/establishments';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { evaluateEligibility } from '@/utils/eligibility';
import { formatVillesCourtes, secteurTitres, universityName } from '@/utils/establishmentFormat';

type Props = {
  item: EstablishmentNormalized;
  onPress?: () => void;
  /**
   * Affiche un bouton de suivi compact dans le coin de la card lorsqu'`onToggleFollow`
   * est fourni. Le tap sur ce bouton ne déclenche pas l'`onPress` parent
   * (Pressable imbriqué = événement consommé localement).
   */
  isFollowed?: boolean;
  followBusy?: boolean;
  onToggleFollow?: () => void;
};

export function EstablishmentCard({
  item,
  onPress,
  isFollowed,
  followBusy,
  onToggleFollow,
}: Props) {
  const { isRTL, t } = useLocale();
  const { profile: eligibilityProfile } = useEligibilityProfile();
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

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, isRTL && styles.cardRtl, pressed && { opacity: 0.96 }]}>
      <View style={[styles.accentBar, isRTL && styles.accentBarRtl]} />

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
            {item.isSponsored ? <TinyBadge label="Sponsorisé" tint="blue" /> : null}
            {item.isRecommended ? <TinyBadge label="Recommandé" tint="green" /> : null}
            {item.accreditationEtat ? <TinyBadge label="État" tint="green" /> : null}
            <EligibilityBadge result={eligibility} size="xs" />
          </View>
        </View>
        <View style={[styles.topRight, isRTL && styles.topRightRtl]}>
          {onToggleFollow ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleFollow();
              }}
              disabled={followBusy}
              accessibilityRole="button"
              accessibilityState={{ selected: !!isFollowed, busy: !!followBusy }}
              accessibilityLabel={
                isFollowed ? t('followSchoolUnfollowBtn') : t('followSchoolBtn')
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.followBtn,
                isFollowed && styles.followBtnActive,
                pressed && { opacity: 0.85 },
                followBusy && { opacity: 0.6 },
              ]}
            >
              {followBusy ? (
                <ActivityIndicator size="small" color={isFollowed ? brand.white : brand.primary} />
              ) : (
                <>
                  <FontAwesome
                    name={isFollowed ? 'heart' : 'heart-o'}
                    size={12}
                    color={isFollowed ? brand.white : brand.primary}
                  />
                  <Text
                    style={[styles.followBtnTxt, isFollowed && styles.followBtnTxtActive]}
                    numberOfLines={1}
                  >
                    {isFollowed
                      ? t('inscAnnouncementsFollowing')
                      : t('inscAnnouncementsFollow')}
                  </Text>
                </>
              )}
            </Pressable>
          ) : null}
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
        <Metric icon="money" label={t('estLabelTuition')} value={item.fraisLabel} />
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
    </Pressable>
  );
}

function TinyBadge({ label, tint }: { label: string; tint: 'neutral' | 'blue' | 'green' }) {
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
      <Text style={[styles.tinyBadgeTxt, { color: fg }]}>{label}</Text>
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
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.primary,
    minHeight: 26,
  },
  followBtnActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  followBtnTxt: {
    color: brand.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  followBtnTxtActive: {
    color: brand.white,
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
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
