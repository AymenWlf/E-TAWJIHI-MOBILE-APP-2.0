/**
 * Composants UI d'éligibilité (badge compact + résumé riche).
 *
 * Affiche un statut « éligible / non éligible / profil à compléter » calculé via
 * `evaluateEligibility` à partir des critères publiés par l'école/annonce et du
 * profil utilisateur. Les composants ne rendent rien lorsque le verdict est
 * 'unknown' (pas de critère défini) ou 'no_user' (utilisateur non connecté),
 * pour ne pas créer de bruit visuel.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { EligibilityCheck, EligibilityResult } from '@/utils/eligibility';

type Tone = 'success' | 'danger' | 'warning' | 'neutral';

const TONE_STYLES: Record<Tone, { bg: string; border: string; fg: string; iconBg: string }> = {
  success: { bg: '#DCFCE7', border: '#BBF7D0', fg: '#15803D', iconBg: '#86EFAC' },
  danger: { bg: '#FEE2E2', border: '#FECACA', fg: '#B91C1C', iconBg: '#FCA5A5' },
  warning: { bg: '#FEF3C7', border: '#FDE68A', fg: '#B45309', iconBg: '#FCD34D' },
  neutral: { bg: '#F1F5F9', border: '#E2E8F0', fg: '#334155', iconBg: '#CBD5E1' },
};

function pickTone(verdict: EligibilityResult['verdict']): Tone | null {
  switch (verdict) {
    case 'eligible':
      return 'success';
    case 'not_eligible':
      return 'danger';
    case 'profile_missing':
      return 'warning';
    case 'unknown':
    case 'no_user':
    default:
      return null;
  }
}

function pickIcon(verdict: EligibilityResult['verdict']): React.ComponentProps<typeof FontAwesome>['name'] {
  if (verdict === 'eligible') return 'check-circle';
  if (verdict === 'not_eligible') return 'times-circle';
  return 'info-circle';
}

/**
 * Badge compact (chip) utilisé dans les cartes (annonce / école).
 * Hauteur ~22-24 px, ne casse pas la mise en page.
 */
export function EligibilityBadge({
  result,
  size = 'sm',
}: {
  result: EligibilityResult;
  size?: 'xs' | 'sm';
}) {
  const { t, isRTL } = useLocale();
  const tone = pickTone(result.verdict);
  if (!tone) return null;

  const palette = TONE_STYLES[tone];
  const small = size === 'xs';
  const label =
    result.verdict === 'eligible'
      ? t('eligibilityBadgeEligible')
      : result.verdict === 'not_eligible'
        ? t('eligibilityBadgeNotEligible')
        : t('eligibilityBadgeIncomplete');

  return (
    <View
      style={[
        styles.badge,
        isRTL && styles.rowRtl,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingHorizontal: small ? 7 : 9,
          paddingVertical: small ? 2 : 4,
        },
      ]}
    >
      <FontAwesome name={pickIcon(result.verdict)} size={small ? 10 : 12} color={palette.fg} />
      <Text
        style={[
          styles.badgeTxt,
          { color: palette.fg, fontSize: small ? 10.5 : fontSize.xs },
          isRTL && styles.rtl,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Résumé riche affiché dans la section « Critères d'éligibilité » du détail
 * annonce. Affiche le verdict + détail par critère (filière / spécialités / année).
 *
 * Si `onCompleteProfile` est fourni, propose un CTA en cas de profil incomplet.
 */
export function EligibilitySummary({
  result,
  onCompleteProfile,
  onLogin,
}: {
  result: EligibilityResult;
  onCompleteProfile?: () => void;
  onLogin?: () => void;
}) {
  const { t, isRTL } = useLocale();

  if (result.verdict === 'no_user') {
    return (
      <View style={[styles.summaryWrap, isRTL && styles.rtlWrap]}>
        <View
          style={[
            styles.summaryHeader,
            isRTL && styles.rowRtl,
            {
              backgroundColor: TONE_STYLES.neutral.bg,
              borderColor: TONE_STYLES.neutral.border,
            },
          ]}
        >
          <FontAwesome name="user-plus" size={16} color={TONE_STYLES.neutral.fg} />
          <Text
            style={[styles.summaryTitle, { color: TONE_STYLES.neutral.fg }, isRTL && styles.rtl]}
            numberOfLines={2}
          >
            {t('eligibilityLoginCta')}
          </Text>
        </View>
        {onLogin ? (
          <Pressable
            onPress={onLogin}
            style={({ pressed }) => [
              styles.cta,
              isRTL && styles.rowRtl,
              pressed && { opacity: 0.85 },
            ]}
          >
            <FontAwesome name="sign-in" size={12} color={brand.white} />
            <Text style={styles.ctaTxt}>{t('eligibilityLoginCta')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const tone = pickTone(result.verdict);
  if (!tone) {
    // 'unknown' (pas de critère défini) → on n'affiche rien, le parent gère
    // le fallback "Annonce ouverte à tous".
    return null;
  }

  const palette = TONE_STYLES[tone];
  const verdictLabel =
    result.verdict === 'eligible'
      ? t('eligibilityYouEligible')
      : result.verdict === 'not_eligible'
        ? t('eligibilityYouNotEligible')
        : t('eligibilityProfileIncomplete');

  return (
    <View style={[styles.summaryWrap, isRTL && styles.rtlWrap]}>
      <View
        style={[
          styles.summaryHeader,
          isRTL && styles.rowRtl,
          { backgroundColor: palette.bg, borderColor: palette.border },
        ]}
      >
        <FontAwesome name={pickIcon(result.verdict)} size={18} color={palette.fg} />
        <Text
          style={[styles.summaryTitle, { color: palette.fg }, isRTL && styles.rtl]}
          numberOfLines={3}
        >
          {verdictLabel}
        </Text>
      </View>

      {result.checks.length > 0 ? (
        <View style={styles.checksWrap}>
          {result.checks.map((c) => (
            <CheckRow key={c.key} check={c} rtl={isRTL} />
          ))}
        </View>
      ) : null}

      {result.verdict === 'profile_missing' && onCompleteProfile ? (
        <Pressable
          onPress={onCompleteProfile}
          style={({ pressed }) => [
            styles.cta,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.85 },
          ]}
        >
          <FontAwesome name="user" size={12} color={brand.white} />
          <Text style={styles.ctaTxt}>{t('eligibilityProfileIncompleteCta')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CheckRow({ check, rtl }: { check: EligibilityCheck; rtl: boolean }) {
  const { t } = useLocale();

  const labelMap = {
    filiere: {
      label: t('eligibilityYourFiliere'),
      ok: t('eligibilityFiliereAccepted'),
      ko: t('eligibilityFiliereNotAccepted'),
    },
    specialiteBacMission: {
      label: t('eligibilityYourSpecialites'),
      ok: t('eligibilitySpecialiteAccepted'),
      ko: t('eligibilitySpecialiteNotAccepted'),
    },
    anneeBac: {
      label: t('eligibilityYourYear'),
      ok: t('eligibilityYearAccepted'),
      ko: t('eligibilityYearNotAccepted'),
    },
    bacTypeMismatch: {
      label: t('eligibilityBacTypeMismatchLabel'),
      ok: '',
      ko:
        check.acceptedBacType === 'mission'
          ? t('eligibilityBacTypeOnlyMission')
          : t('eligibilityBacTypeOnlyNormal'),
    },
  } as const;

  const meta = labelMap[check.key];
  const isOk = check.ok === true;
  const isKo = check.ok === false;
  const tone: Tone = isOk ? 'success' : isKo ? 'danger' : 'warning';
  const palette = TONE_STYLES[tone];

  /**
   * Pour `bacTypeMismatch`, on n'affiche pas la ligne « Votre … : valeur » car
   * il n'y a pas de valeur utilisateur pertinente — uniquement le verdict
   * descriptif ("Cette annonce s'adresse aux Bac Mission").
   */
  const isMismatch = check.key === 'bacTypeMismatch';
  const userValue =
    check.userValues.length === 0 ? t('eligibilityNotProvided') : check.userValues.join(' · ');

  return (
    <View style={[styles.checkRow, rtl && styles.rowRtl]}>
      <View
        style={[
          styles.checkIcon,
          { backgroundColor: palette.iconBg },
        ]}
      >
        <FontAwesome
          name={isOk ? 'check' : isKo ? 'times' : 'minus'}
          size={11}
          color={palette.fg}
        />
      </View>
      <View style={styles.checkBody}>
        <Text style={[styles.checkLbl, rtl && styles.rtl]} numberOfLines={1}>
          {meta.label}
          {isMismatch ? null : (
            <Text style={styles.checkLblValue}>
              {' '}
              : {userValue}
            </Text>
          )}
        </Text>
        <Text
          style={[styles.checkVerdict, { color: palette.fg }, rtl && styles.rtl]}
          numberOfLines={2}
        >
          {isOk ? meta.ok : isKo ? meta.ko : t('eligibilityProfileIncomplete')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Badge compact */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  badgeTxt: { fontWeight: '800' },

  /* Summary riche */
  summaryWrap: { gap: spacing.md },
  rtlWrap: {},
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryTitle: { fontWeight: '800', fontSize: fontSize.sm, flex: 1, lineHeight: 19 },

  checksWrap: { gap: spacing.sm },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkBody: { flex: 1, gap: 2 },
  checkLbl: { color: brand.text, fontSize: fontSize.xs, fontWeight: '700' },
  checkLblValue: { color: brand.textMuted, fontWeight: '600' },
  checkVerdict: { fontSize: 11, fontWeight: '700' },

  /* CTA */
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: brand.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  ctaTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.xs },

  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
