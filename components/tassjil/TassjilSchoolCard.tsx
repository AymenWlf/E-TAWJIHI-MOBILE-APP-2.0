import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import {
  getEffectiveRegistrationStatus,
  getRegistrationStatusInfo,
  getStatutDisplay,
} from '@/constants/tassjilInscriptionStatus';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { TassjilSchool } from '@/types/tassjilSchoolChoices';
import { formatShortDate, pickEstablishmentNamesPair } from '@/utils/candidacyStatus';

type Props = {
  school: TassjilSchool;
};

type StatutBadgeProps = {
  label: string;
  color: string;
  bgColor: string;
  borderColor?: string;
};

function StatutBadge({ label, color, bgColor, borderColor }: StatutBadgeProps) {
  return (
    <View style={[styles.statutBadge, { backgroundColor: bgColor, borderColor: borderColor ?? bgColor }]}>
      <Text style={[styles.statutBadgeTxt, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export function TassjilSchoolCard({ school }: Props) {
  const router = useRouter();
  const { t, locale, isRTL } = useLocale();
  const isArabic = locale === 'ar';
  const registrationStatus = getEffectiveRegistrationStatus(school);
  const registrationInfo = getRegistrationStatusInfo(registrationStatus, isArabic);
  const statutInscriptionDisplay = getStatutDisplay(school.statut_inscription ?? undefined, isArabic);
  const statutSuiviDisplay = getStatutDisplay(school.statut_suivi ?? undefined, isArabic);
  const defaultDisplay = { label: '—', color: brand.textMuted, bgColor: brand.backgroundSoft };

  const establishmentId = school.etablissementId ?? school.schoolId;
  const estForName = {
    nom: (school.nom ?? school.schoolName ?? '').trim() || null,
    nomArabe: (school.nomArabe ?? school.schoolNameArabic ?? '').trim() || null,
  };
  const { primary: estNamePrimary, secondary: estNameSecondary } = pickEstablishmentNamesPair(
    estForName,
    locale,
  );
  const programLabel = isArabic ? school.programArabic || school.program : school.program;
  const sigle = (school.sigle ?? '').trim();
  const showSigle =
    Boolean(sigle) &&
    !estNamePrimary.toLowerCase().includes(sigle.toLowerCase()) &&
    !(estNameSecondary ?? '').toLowerCase().includes(sigle.toLowerCase());
  const logoUri =
    getEstablishmentLogoUrl(school.logo) ??
    fallbackEstablishmentAvatarName(estForName.nom ?? school.schoolName, school.sigle);

  const registrationAccent =
    registrationStatus === 'open'
      ? homeShell.green
      : registrationStatus === 'closed'
        ? brand.error
        : brand.textMuted;

  const registrationPillBg =
    registrationStatus === 'open'
      ? homeShell.greenAlpha11
      : registrationStatus === 'closed'
        ? '#FEE2E2'
        : brand.backgroundSoft;

  const hasRegistrationDates = Boolean(school.dateDebutInscription && school.dateFinInscription);
  const registrationDatesLabel = hasRegistrationDates
    ? t('tassjilRegistrationWindow')
        .replace('{start}', formatShortDate(school.dateDebutInscription, locale))
        .replace('{end}', formatShortDate(school.dateFinInscription, locale))
    : null;

  const openDetail = () => {
    if (establishmentId) {
      const id = Number(establishmentId);
      if (!Number.isFinite(id) || id <= 0) return;
      const slug = (school.slug ?? '').trim() || 'fiche';
      router.push(`/etablissements/${id}/${slug}` as never);
      return;
    }
    if (school.websiteUrl) {
      void Linking.openURL(school.websiteUrl);
    }
  };

  return (
    <View style={[styles.card, { borderStartColor: registrationAccent }]}>
      <View style={styles.body}>
        <View style={[styles.topRow, isArabic && styles.rowRtl]}>
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.schoolCol}>
            <Text style={[styles.schoolName, isRTL && styles.rtlText]} numberOfLines={3}>
              {estNamePrimary}
            </Text>
            {estNameSecondary ? (
              <Text style={[styles.schoolNameAlt, isRTL && styles.rtlText]} numberOfLines={2}>
                {estNameSecondary}
              </Text>
            ) : null}
            <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
              {showSigle ? (
                <View style={styles.siglePill}>
                  <Text style={styles.siglePillTxt} numberOfLines={1}>
                    {sigle}
                  </Text>
                </View>
              ) : null}
              {school.schoolType ? <EstablishmentTypeBadge type={school.schoolType} size="xs" /> : null}
            </View>
          </View>
          <View style={[styles.registrationPill, { backgroundColor: registrationPillBg }]}>
            <FontAwesome name={registrationInfo.icon} size={11} color={registrationInfo.color} />
            <Text style={[styles.registrationPillTxt, { color: registrationInfo.color }]} numberOfLines={1}>
              {registrationInfo.text}
            </Text>
          </View>
        </View>

        {school.city ? (
          <View style={[styles.cityRow, isArabic && styles.rowRtl]}>
            <FontAwesome name="map-marker" size={12} color={brand.textMuted} />
            <Text style={[styles.cityTxt, isArabic && styles.rtlText]}>{school.city}</Text>
          </View>
        ) : null}

        {programLabel ? (
          <View style={[styles.programRow, isArabic && styles.rowRtl]}>
            <FontAwesome name="book" size={11} color={brand.primary} />
            <Text style={[styles.programTxt, isArabic && styles.rtlText]} numberOfLines={2}>
              {programLabel}
            </Text>
          </View>
        ) : null}

        {registrationDatesLabel ? (
          <View style={[styles.datesRow, isArabic && styles.rowRtl]}>
            <FontAwesome name="calendar" size={11} color={brand.textMuted} />
            <Text style={[styles.datesTxt, isArabic && styles.rtlText]}>{registrationDatesLabel}</Text>
          </View>
        ) : null}

        <View style={styles.statusSection}>
          <View style={[styles.statusBlock, isArabic && styles.statusBlockRtl]}>
            <Text style={[styles.statusLabel, isArabic && styles.rtlText]}>{t('tassjilStatInscription')}</Text>
            <StatutBadge
              label={(statutInscriptionDisplay || defaultDisplay).label}
              color={(statutInscriptionDisplay || defaultDisplay).color}
              bgColor={(statutInscriptionDisplay || defaultDisplay).bgColor}
            />
          </View>
          <View style={[styles.statusBlock, isArabic && styles.statusBlockRtl]}>
            <Text style={[styles.statusLabel, isArabic && styles.rtlText]}>{t('tassjilStatSuivi')}</Text>
            <StatutBadge
              label={(statutSuiviDisplay || defaultDisplay).label}
              color={(statutSuiviDisplay || defaultDisplay).color}
              bgColor={(statutSuiviDisplay || defaultDisplay).bgColor}
            />
          </View>
        </View>

        {school.acceptedCity && school.acceptedProgram ? (
          <View style={styles.acceptanceBox}>
            <View style={[styles.acceptanceHeader, isArabic && styles.rowRtl]}>
              <FontAwesome name="check-circle" size={13} color={homeShell.greenDark} />
              <Text style={[styles.acceptanceTitle, isArabic && styles.rtlText]}>{t('tassjilAcceptanceTitle')}</Text>
            </View>
            <Text style={[styles.acceptanceLine, isArabic && styles.rtlText]}>{school.acceptedProgram}</Text>
            <View style={[styles.acceptanceCityRow, isArabic && styles.rowRtl]}>
              <FontAwesome name="map-marker" size={11} color={homeShell.greenDark} />
              <Text style={[styles.acceptanceCity, isArabic && styles.rtlText]}>{school.acceptedCity}</Text>
            </View>
          </View>
        ) : null}

        {establishmentId || school.websiteUrl ? (
          <Pressable
            accessibilityRole="button"
            onPress={openDetail}
            style={({ pressed }) => [styles.linkBtn, isArabic && styles.rowRtl, pressed && { opacity: 0.88 }]}
          >
            <FontAwesome name="external-link" size={12} color={brand.white} />
            <Text style={styles.linkBtnText}>{t('tassjilLearnMore')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderStartWidth: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  schoolCol: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  schoolName: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 21,
  },
  schoolNameAlt: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  siglePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.14)',
    maxWidth: '100%',
  },
  siglePillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: 0.3,
  },
  registrationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    maxWidth: 96,
  },
  registrationPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    flexShrink: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityTxt: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    fontWeight: '600',
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.05)',
  },
  programTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datesTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    color: brand.textMuted,
    fontWeight: '600',
  },
  statusSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
    gap: spacing.sm,
  },
  statusBlock: {
    gap: 6,
  },
  statusBlockRtl: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  statutBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
  },
  statutBadgeTxt: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  acceptanceBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: homeShell.greenSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.greenBorder,
    gap: 4,
  },
  acceptanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  acceptanceTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  acceptanceLine: {
    fontSize: fontSize.sm,
    color: brand.text,
    fontWeight: '600',
  },
  acceptanceCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  acceptanceCity: {
    fontSize: fontSize.sm,
    color: homeShell.greenDark,
    fontWeight: '600',
  },
  linkBtn: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  linkBtnText: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
