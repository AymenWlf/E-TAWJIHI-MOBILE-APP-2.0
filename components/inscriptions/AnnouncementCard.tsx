import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { EligibilityBadge } from '@/components/inscriptions/EligibilityViews';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  formatDaysUntilClose,
  formatShortDate,
  pickAnnouncementTitle,
  pickEstablishmentNamesPair,
  pickRegistrationUrlLabel,
} from '@/utils/candidacyStatus';
import { evaluateEligibility } from '@/utils/eligibility';

type Props = {
  item: ContestAnnouncementCard;
  isFollowed: boolean;
  busy?: boolean;
  onToggleFollow: () => void;
  onOpenLink: () => void;
  /** Ouvre la page détail de l'annonce. Si non fourni, la card n'est pas cliquable globalement. */
  onPress?: () => void;
};

export function AnnouncementCard({
  item,
  isFollowed,
  busy,
  onToggleFollow,
  onOpenLink,
  onPress,
}: Props) {
  const { t, locale, isRTL } = useLocale();
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const eligibility = evaluateEligibility(
    {
      filieresAcceptees: item.filieresAcceptees,
      specialitesBacMissionAcceptees: item.specialitesBacMissionAcceptees,
      anneesBacAcceptees: item.anneesBacAcceptees,
    },
    eligibilityProfile,
  );
  const est = item.establishment;

  const { primary: estNamePrimary, secondary: estNameSecondary } = pickEstablishmentNamesPair(
    est,
    locale,
  );
  const villes = (est?.villes ?? []).filter(Boolean);
  const villeMain = est?.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.slice(0, 3).join(' · ') : villeMain;

  // Logo : URL absolue → utilisée telle quelle ; chemin relatif → préfixé par l'URL API ;
  // sinon avatar UI-Avatars sur fond brand avec initiales (sigle ou nom).
  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ??
    fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  const deadline = formatDaysUntilClose(item.daysUntilClose, locale);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && { opacity: 0.92 }]}
    >
      {item.ogImage ? (
        <Image source={{ uri: item.ogImage }} style={styles.cover} resizeMode="cover" />
      ) : null}

      <View style={styles.body}>
        {/* ── Établissement (logo + nom + sigle + type) ── */}
        <View style={[styles.estRow, isRTL && styles.rowRtl]}>
          <Image
            source={{ uri: logoUri }}
            style={styles.estLogo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.estName, isRTL && styles.rtl]}>
              {estNamePrimary}
            </Text>
            {estNameSecondary ? (
              <Text style={[styles.estNameAlt, isRTL && styles.rtl]}>
                {estNameSecondary}
              </Text>
            ) : null}
            <View style={[styles.estMetaRow, isRTL && styles.rowRtl]}>
              {est?.sigle ? (
                <View style={styles.siglePill}>
                  <Text style={styles.siglePillTxt}>{est.sigle}</Text>
                </View>
              ) : null}
              {est?.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
            </View>
          </View>
          <View style={[styles.typePill]}>
            <Text style={styles.typePillTxt} numberOfLines={1}>
              {item.announcementType}
            </Text>
          </View>
        </View>

        {/* ── Titre annonce (priorité AR si dispo selon locale) ── */}
        <Text style={[styles.title, isRTL && styles.rtl]} numberOfLines={2}>
          {pickAnnouncementTitle(item, locale) || item.title}
        </Text>

        {/* ── Villes ── */}
        {villesShort ? (
          <View style={[styles.villeRow, isRTL && styles.rowRtl]}>
            <FontAwesome name="map-marker" size={11} color={brand.textMuted} />
            <Text style={[styles.villeTxt, isRTL && styles.rtl]} numberOfLines={1}>
              {villesShort}
              {villes.length > 3 ? ` +${villes.length - 3}` : ''}
            </Text>
          </View>
        ) : null}

        {/* ── Dates + countdown ── */}
        <View style={[styles.datesRow, isRTL && styles.rowRtl]}>
          <View style={styles.datePill}>
            <FontAwesome name="play-circle" size={10} color={brand.success} />
            <Text style={styles.datePillTxt}>
              {t('inscDateOpens')}: {formatShortDate(item.dateStart, locale)}
            </Text>
          </View>
          <View style={styles.datePill}>
            <FontAwesome name="stop-circle" size={10} color={brand.textMuted} />
            <Text style={styles.datePillTxt}>
              {t('inscDateCloses')}: {formatShortDate(item.dateEnd, locale)}
            </Text>
          </View>
        </View>

        {/* ── Liens utiles personnalisés (label + URL) ── */}
        {Array.isArray(item.liensUtiles) && item.liensUtiles.length > 0 ? (
          <View style={[styles.linksWrap, isRTL && styles.rowRtl]}>
            {item.liensUtiles.slice(0, 6).map((l, i) => (
              <Pressable
                key={`${l.url}-${i}`}
                onPress={() => {
                  void Linking.openURL(l.url).catch(() => undefined);
                }}
                style={({ pressed }) => [styles.linkChip, pressed && { opacity: 0.85 }]}
              >
                <FontAwesome name="link" size={10} color={brand.primary} />
                <Text style={styles.linkChipTxt} numberOfLines={1}>
                  {l.titre || l.url}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* ── Eligibilité personnalisée (basée sur le profil étudiant) ── */}
        <View style={[styles.eligibilityRow, isRTL && styles.rowRtl]}>
          <EligibilityBadge result={eligibility} size="xs" />
        </View>

        {deadline.label ? (
          <View
            style={[
              styles.countdown,
              deadline.kind === 'closed' && styles.countdownClosed,
              deadline.kind === 'today' && styles.countdownToday,
              deadline.kind === 'soon' && styles.countdownSoon,
              deadline.kind === 'normal' && styles.countdownOpen,
            ]}
          >
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
                deadline.kind === 'closed' && styles.countdownClosedTxt,
                deadline.kind === 'today' && styles.countdownTodayTxt,
                deadline.kind === 'soon' && styles.countdownSoonTxt,
                deadline.kind === 'normal' && styles.countdownOpenTxt,
              ]}
            >
              {deadline.label}
            </Text>
          </View>
        ) : null}

        {/* ── Actions ── */}
        <View style={[styles.actions, isRTL && styles.rowRtl]}>
          <Pressable
            onPress={onToggleFollow}
            disabled={busy}
            style={({ pressed }) => [
              styles.btn,
              isFollowed ? styles.btnFollowed : styles.btnFollow,
              pressed && { opacity: 0.85 },
              busy && { opacity: 0.5 },
            ]}
          >
            <FontAwesome
              name={isFollowed ? 'check' : 'plus'}
              size={11}
              color={isFollowed ? brand.primary : brand.white}
            />
            <Text style={isFollowed ? styles.btnFollowedTxt : styles.btnFollowTxt}>
              {isFollowed ? t('inscAnnouncementsFollowing') : t('inscAnnouncementsFollow')}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenLink}
            disabled={!item.registrationUrl}
            style={({ pressed }) => [
              styles.btn,
              styles.btnLink,
              !item.registrationUrl && styles.btnDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            <FontAwesome name="external-link" size={11} color={brand.primary} />
            <Text style={styles.btnLinkTxt} numberOfLines={1}>
              {pickRegistrationUrlLabel(
                item.registrationUrlLabel,
                item.announcementType,
                t,
              )}
            </Text>
          </Pressable>
        </View>
      </View>
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
  },
  cover: { width: '100%', height: 110, backgroundColor: brand.borderLight },
  body: { padding: spacing.md, gap: spacing.sm },
  estRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowRtl: { flexDirection: 'row-reverse' },
  estLogo: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: brand.borderLight },
  estLogoFallback: { alignItems: 'center', justifyContent: 'center' },
  estName: { fontWeight: '800', color: brand.text, fontSize: fontSize.md, lineHeight: 19 },
  /** Nom dans l'autre langue (FR pour locale AR, AR pour locale FR). */
  estNameAlt: {
    fontWeight: '600',
    color: brand.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 17,
    marginTop: 2,
  },
  estMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
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
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  typePillTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.xs },
  title: { color: brand.text, fontWeight: '700', fontSize: fontSize.md, lineHeight: 21 },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  villeTxt: { color: brand.textSecondary, fontSize: fontSize.xs, fontWeight: '600', flex: 1 },
  datesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: brand.borderLight,
  },
  datePillTxt: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },

  /* Eligibilité (badge calculé selon le profil) */
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    minHeight: 0,
  },

  /* Countdown bandeau */
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  countdownTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.xs },
  /* Inscription en cours (> 7 jours) — vert */
  countdownOpen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  countdownOpenTxt: { color: '#15803D' },
  /* Bientôt clos (≤ 7 jours) — orange */
  countdownSoon: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  countdownSoonTxt: { color: '#9A3412' },
  /* Clôture aujourd'hui / J-1 — ambre */
  countdownToday: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  countdownTodayTxt: { color: '#B45309' },
  /* Inscriptions fermées — rouge */
  countdownClosed: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  countdownClosedTxt: { color: '#B91C1C' },

  /* Liens utiles personnalisés (chips) */
  linksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
    maxWidth: 220,
  },
  linkChipTxt: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    flexShrink: 1,
  },

  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    flex: 1,
  },
  btnFollow: { backgroundColor: brand.primary },
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
  btnLinkTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
