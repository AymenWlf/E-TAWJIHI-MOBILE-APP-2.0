import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { EstablishmentFollow } from '@/types/inscriptions';
import {
  formatDaysUntilClose,
  formatTimeAgo,
  pickAnnouncementTitle,
  pickEstablishmentNamesPair,
  STATUS_VISUALS,
} from '@/utils/candidacyStatus';

import { StatusBadge } from './StatusBadge';

type Props = {
  follow: EstablishmentFollow;
  onPress?: () => void;
  onUpdateStatus?: () => void;
  onUnfollow?: () => void;
  onOpenLatest?: () => void;
  /**
   * Ouvre la fiche école. Affiché en CTA secondaire dans l'état « aucune annonce »
   * pour proposer une action utile à l'utilisateur.
   */
  onOpenSchool?: () => void;
};

export function FollowedSchoolCard({
  follow,
  onPress,
  onUpdateStatus,
  onUnfollow,
  onOpenLatest,
  onOpenSchool,
}: Props) {
  const { t, locale, isRTL } = useLocale();
  const est = follow.establishment;
  const stats = follow.stats;
  const latest = follow.latestAnnouncement;
  const visual = STATUS_VISUALS[follow.status];

  const { primary: estNamePrimary, secondary: estNameSecondary } = pickEstablishmentNamesPair(
    est,
    locale,
  );
  const villes = (est?.villes ?? []).filter(Boolean);
  const villeMain = est?.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.slice(0, 3).join(' · ') : villeMain;

  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ?? fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  const deadline = latest ? formatDaysUntilClose(latest.daysUntilClose, locale) : { label: '', kind: 'normal' as const };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: visual.bg, borderColor: visual.border },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View
        style={[
          styles.accentBar,
          { backgroundColor: visual.fg },
          isRTL && styles.accentBarRtl,
        ]}
      />

      {/* Header (logo + nom + statut) */}
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
        <StatusBadge status={follow.status} size="sm" />
      </View>

      {villesShort ? (
        <View style={[styles.villeRow, isRTL && styles.rowRtl]}>
          <FontAwesome name="map-marker" size={11} color={brand.textMuted} />
          <Text style={[styles.villeTxt, isRTL && styles.rtl]} numberOfLines={1}>
            {villesShort}
            {villes.length > 3 ? ` +${villes.length - 3}` : ''}
          </Text>
        </View>
      ) : null}

      {/* Stats */}
      <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
        <View style={styles.statPill}>
          <FontAwesome name="bullhorn" size={11} color={brand.primary} />
          <Text style={styles.statPillTxt}>
            {stats.totalAnnouncements} {t('followedSchoolStatTotalAnnouncements')}
          </Text>
        </View>
        {stats.openAnnouncements > 0 ? (
          <View style={[styles.statPill, styles.statPillOpen]}>
            <FontAwesome name="play-circle" size={11} color="#15803D" />
            <Text style={[styles.statPillTxt, { color: '#15803D' }]}>
              {stats.openAnnouncements} {t('followedSchoolStatOpenAnnouncements')}
            </Text>
          </View>
        ) : null}
        {stats.candidaciesCount > 0 ? (
          <View style={styles.statPill}>
            <FontAwesome name="flag-checkered" size={11} color={brand.primary} />
            <Text style={styles.statPillTxt}>
              {stats.candidaciesCount} {t('followedSchoolStatCandidacies')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Latest announcement */}
      {latest ? (
        <Pressable
          onPress={onOpenLatest}
          style={({ pressed }) => [
            styles.latestBox,
            pressed && onOpenLatest ? { opacity: 0.85 } : null,
          ]}
        >
          <View style={[styles.latestHeader, isRTL && styles.rowRtl]}>
            <FontAwesome name="bookmark" size={10} color={brand.primary} />
            <Text style={styles.latestEyebrow}>{t('followedSchoolLatestAnnouncement')}</Text>
          </View>
          <Text style={[styles.latestTitle, isRTL && styles.rtl]} numberOfLines={2}>
            {pickAnnouncementTitle(latest, locale) || latest.title}
          </Text>
          {deadline.label ? (
            <View style={[styles.latestMeta, isRTL && styles.rowRtl]}>
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
                  size={10}
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
                    deadline.kind === 'closed' && { color: '#B91C1C' },
                    deadline.kind === 'today' && { color: '#B45309' },
                    deadline.kind === 'soon' && { color: '#9A3412' },
                    deadline.kind === 'normal' && { color: '#15803D' },
                  ]}
                >
                  {deadline.label}
                </Text>
              </View>
            </View>
          ) : null}
        </Pressable>
      ) : (
        <View style={styles.emptyBox}>
          <View style={[styles.emptyHeader, isRTL && styles.rowRtl]}>
            <View style={styles.emptyIcon}>
              <FontAwesome name="bell-o" size={14} color={brand.primary} />
            </View>
            <View style={styles.emptyTextBlock}>
              <Text style={[styles.emptyTitle, isRTL && styles.rtl]} numberOfLines={2}>
                {t('followedSchoolNoAnnouncementsTitle')}
              </Text>
              <Text style={[styles.emptyHint, isRTL && styles.rtl]} numberOfLines={3}>
                {t('followedSchoolNoAnnouncementsHint')}
              </Text>
            </View>
          </View>
          {onOpenSchool ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onOpenSchool();
              }}
              style={({ pressed }) => [
                styles.emptyCta,
                isRTL && styles.rowRtl,
                pressed && { opacity: 0.85 },
              ]}
            >
              <FontAwesome name="external-link" size={11} color={brand.primary} />
              <Text style={styles.emptyCtaTxt}>{t('followedSchoolViewSchoolBtn')}</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Latest event hint */}
      {follow.latestEvent ? (
        <Text style={[styles.eventHint, isRTL && styles.rtl]} numberOfLines={1}>
          <FontAwesome name="history" size={10} color={brand.textMuted} />{' '}
          {follow.latestEvent.message ?? '—'} · {formatTimeAgo(follow.latestEvent.createdAt, locale)}
        </Text>
      ) : null}

      {/* Actions */}
      <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={onUpdateStatus}
          style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.85 }]}
        >
          <FontAwesome name="pencil" size={11} color={brand.primary} />
          <Text style={styles.btnSecondaryTxt}>{t('inscStatusActionUpdate')}</Text>
        </Pressable>
        <Pressable
          onPress={onUnfollow}
          style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && { opacity: 0.85 }]}
        >
          <FontAwesome name="trash-o" size={11} color="#B91C1C" />
          <Text style={styles.btnDangerTxt}>{t('followSchoolUnfollowBtn')}</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowRtl: { flexDirection: 'row-reverse' },
  logo: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: brand.borderLight },
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
  estMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  siglePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderRadius: radius.sm,
  },
  siglePillTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.xs, letterSpacing: 0.4 },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  villeTxt: { color: brand.textSecondary, fontSize: fontSize.xs, fontWeight: '600', flex: 1 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: brand.borderLight,
  },
  statPillOpen: { backgroundColor: '#DCFCE7' },
  statPillTxt: { fontSize: fontSize.xs, color: brand.text, fontWeight: '700' },

  latestBox: {
    backgroundColor: brand.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: 4,
  },
  latestHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  latestEyebrow: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  latestTitle: { color: brand.text, fontWeight: '700', fontSize: fontSize.sm, lineHeight: 18 },
  latestMeta: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },

  /* Countdown */
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  countdownTxt: { fontWeight: '800', fontSize: fontSize.xs },
  countdownOpen: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  countdownSoon: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  countdownToday: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  countdownClosed: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },

  muted: { color: brand.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
  eventHint: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '600' },

  /* État « pas encore d'annonce » : panneau dédié, plus visuel qu'un texte muted */
  emptyBox: {
    backgroundColor: '#F8FAFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: 'rgba(51,62,143,0.30)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  emptyHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  emptyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(51,62,143,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextBlock: { flex: 1, gap: 2 },
  emptyTitle: { color: brand.text, fontWeight: '800', fontSize: fontSize.sm, lineHeight: 18 },
  emptyHint: { color: brand.textMuted, fontWeight: '600', fontSize: 11.5, lineHeight: 16 },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    alignSelf: 'flex-start',
  },
  emptyCtaTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.xs },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
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
  btnSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  btnSecondaryTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700' },
  btnDanger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  btnDangerTxt: { color: '#B91C1C', fontSize: fontSize.sm, fontWeight: '700' },

  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
