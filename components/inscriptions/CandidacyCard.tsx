import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AnnouncementTypeChip } from '@/components/inscriptions/AnnouncementTypeChip';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { Candidacy } from '@/types/inscriptions';
import {
  formatDaysUntilClose,
  formatShortDate,
  pickAnnouncementTitle,
  pickEstablishmentNamesPair,
  pickRegistrationUrlLabel,
} from '@/utils/candidacyStatus';

import { StatusBadge } from './StatusBadge';

type Props = {
  candidacy: Candidacy;
  onPress?: () => void;
  onUpdateStatus?: () => void;
  onOpenLink?: () => void;
  onOpenTimeline?: () => void;
};

export function CandidacyCard({ candidacy, onPress, onUpdateStatus, onOpenLink, onOpenTimeline }: Props) {
  const { t, locale, isRTL } = useLocale();
  const a = candidacy.announcement;
  const est = a?.establishment;

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

  const deadline = formatDaysUntilClose(a?.daysUntilClose, locale);

  // Coloration de la carte selon le statut courant. `null` ⇒ palette
  // neutre (l'utilisateur n'a pas encore choisi d'action).
  const status = candidacy.status;
  const cardBg = status?.colorBg ?? brand.white;
  const cardBorder = status?.colorBorder ?? brand.border;
  const accentColor = status?.colorFg ?? brand.primary;
  const hasUpdateAction = (a?.availableStatuses?.length ?? 0) > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
        pressed && { opacity: 0.92 },
      ]}
    >
      {/* Barre d'accent verticale (couleur statut) — passe à droite en RTL */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: accentColor },
          isRTL && styles.accentBarRtl,
        ]}
      />

      {/* ── Header établissement ── */}
      <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
        <Image
          source={{ uri: logoUri }}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.headerTexts}>
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
        <StatusBadge status={candidacy.status} size="sm" />
      </View>

      {/* ── Titre annonce (priorité AR si dispo selon locale) ── */}
      <Text style={[styles.title, isRTL && styles.rtl]} numberOfLines={2}>
        {pickAnnouncementTitle(a, locale) || '—'}
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

      {/* ── Type annonce + dates ── */}
      <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
        <AnnouncementTypeChip type={a?.announcementType ?? null} variant="pill" isRTL={isRTL} />
        {a?.dateEnd ? (
          <View style={styles.deadline}>
            <FontAwesome name="calendar" size={10} color={brand.textMuted} />
            <Text style={styles.deadlineTxt}>
              {t('inscDateCloses')}: {formatShortDate(a.dateEnd, locale)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Liens utiles personnalisés (label + URL) ── */}
      {Array.isArray(a?.liensUtiles) && a!.liensUtiles!.length > 0 ? (
        <View style={[styles.linksWrap, isRTL && styles.rowRtl]}>
          {a!.liensUtiles!.slice(0, 6).map((l, i) => (
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

      {/* ── Countdown ── */}
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
      <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={onOpenLink}
          disabled={!a?.registrationUrl}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            !a?.registrationUrl && styles.btnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <FontAwesome name="external-link" size={11} color={brand.white} />
          <Text style={styles.btnPrimaryTxt} numberOfLines={1}>
            {pickRegistrationUrlLabel(
              a?.registrationUrlLabel,
              a?.announcementType,
              t,
            )}
          </Text>
        </Pressable>

        {hasUpdateAction && onUpdateStatus ? (
          <Pressable
            onPress={onUpdateStatus}
            style={({ pressed }) => [
              styles.btn,
              styles.btnSecondary,
              pressed && { opacity: 0.85 },
            ]}
          >
            <FontAwesome name="pencil" size={11} color={brand.primary} />
            <Text style={styles.btnSecondaryTxt}>{t('inscStatusActionUpdate')}</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onOpenTimeline}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          accessibilityLabel={t('inscViewTimeline')}
        >
          <FontAwesome name="history" size={14} color={brand.primary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingStart: spacing.md + 6,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  /* Barre d'accent verticale qui colore la carte selon le statut */
  accentBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  accentBarRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: brand.borderLight,
  },
  logoFallback: { alignItems: 'center', justifyContent: 'center' },
  headerTexts: { flex: 1, gap: 3 },
  estName: { fontWeight: '800', color: brand.text, fontSize: fontSize.md, lineHeight: 19 },
  /** Nom dans l'autre langue (FR pour locale AR, AR pour locale FR). */
  estNameAlt: {
    fontWeight: '600',
    color: brand.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 17,
    marginTop: 1,
  },
  estMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
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
  title: { color: brand.text, fontSize: fontSize.md, fontWeight: '700', lineHeight: 21 },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  villeTxt: { color: brand.textSecondary, fontSize: fontSize.xs, fontWeight: '600', flex: 1 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: brand.borderLight,
    borderRadius: radius.full,
  },
  deadlineTxt: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },

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
  countdownOpen: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
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

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
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
  btnPrimary: { backgroundColor: brand.primary },
  btnPrimaryTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  btnSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  btnSecondaryTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700' },
  btnDisabled: { backgroundColor: brand.textMuted, opacity: 0.5 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
