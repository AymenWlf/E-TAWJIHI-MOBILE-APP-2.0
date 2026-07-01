import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View, type ComponentProps } from 'react-native';

import { EstablishmentSnapCarousel } from '@/components/schools/EstablishmentSnapCarousel';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import type { EstablishmentNormalized, EstablishmentProgramme } from '@/services/establishments';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { formatEstablishmentStudyDuration, formatEstablishmentStudyDurationYears } from '@/utils/establishmentFormat';
import { formatProgrammeReconnaissanceLabel } from '@/utils/establishmentReconnaissance';
import {
  formatProgrammeFeeLabel,
  programmeDisplayName,
  programmeSecteursLabel,
} from '@/utils/establishmentProgrammes';

type Props = {
  programmes: EstablishmentProgramme[];
  establishment: EstablishmentNormalized;
  rtl?: boolean;
  t: (key: HomeCopyKey) => string;
};

function ProgrammeInfoRow({
  icon,
  label,
  value,
  rtl,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  rtl: boolean;
}) {
  return (
    <View style={[styles.infoRow, rtl && styles.infoRowRtl]}>
      <View style={[styles.infoLabelWrap, rtl && styles.infoLabelWrapRtl]}>
        <FontAwesome name={icon} size={12} color={brand.textMuted} />
        <Text style={[styles.infoLabel, rtl && styles.rtlText]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, rtl && styles.rtlText]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

function formatProgrammeDuration(
  raw: string | null | undefined,
  establishment: EstablishmentNormalized,
  rtl: boolean,
): string {
  const lang = rtl ? 'ar' : 'fr';
  const trimmed = String(raw ?? '').trim();
  if (trimmed) {
    if (trimmed.includes('ans') || trimmed.includes('سنة')) return trimmed;
    const n = parseInt(trimmed, 10);
    if (Number.isFinite(n)) {
      return formatEstablishmentStudyDurationYears(n, lang);
    }
    return trimmed;
  }
  return formatEstablishmentStudyDuration(establishment, lang) || establishment.dureeLabel || '—';
}

function ProgrammeCard({
  programme,
  establishment,
  rtl,
  t,
  width,
}: {
  programme: EstablishmentProgramme;
  establishment: EstablishmentNormalized;
  rtl: boolean;
  t: (key: HomeCopyKey) => string;
  width: number;
}) {
  const notSpecified = t('estDetailProgrammeNotSpecified');

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        {programme.diplome ? (
          <View style={styles.diplomePill}>
            <FontAwesome name="graduation-cap" size={11} color={brand.primary} />
            <Text style={styles.diplomeTxt} numberOfLines={1}>
              {programme.diplome}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.title, rtl && styles.rtlText]} numberOfLines={3}>
          {programmeDisplayName(programme, rtl)}
        </Text>
        <View style={styles.infoList}>
          <ProgrammeInfoRow
            rtl={rtl}
            icon="calendar"
            label={t('estDetailProgrammeDuration')}
            value={formatProgrammeDuration(programme.nombreAnnees, establishment, rtl) || notSpecified}
          />
          <ProgrammeInfoRow
            rtl={rtl}
            icon="briefcase"
            label={t('estDetailProgrammeSector')}
            value={programmeSecteursLabel(programme.secteurs, rtl, notSpecified)}
          />
          <ProgrammeInfoRow
            rtl={rtl}
            icon="file-text-o"
            label={t('estDetailProgrammeEnrollmentFee')}
            value={formatProgrammeFeeLabel(programme.fraisInscription, notSpecified)}
          />
          <ProgrammeInfoRow
            rtl={rtl}
            icon="money"
            label={t('estDetailProgrammeTuitionFee')}
            value={formatProgrammeFeeLabel(programme.fraisScolarite, notSpecified)}
          />
          <ProgrammeInfoRow
            rtl={rtl}
            icon="certificate"
            label={t('estDetailProgrammeDegree')}
            value={programme.diplome?.trim() || notSpecified}
          />
          <ProgrammeInfoRow
            rtl={rtl}
            icon="shield"
            label={t('estDetailProgrammeAccreditation')}
            value={formatProgrammeReconnaissanceLabel(programme.reconnaissance) || notSpecified}
          />
        </View>
      </View>
    </View>
  );
}

export function EstablishmentProgrammesCarousel({
  programmes,
  establishment,
  rtl = false,
  t,
}: Props) {
  if (!programmes.length) return null;

  return (
    <EstablishmentSnapCarousel
      data={programmes}
      keyExtractor={(programme) => String(programme.id)}
      rtl={rtl}
      prevAccessibilityLabel={t('estDetailProgrammesPrev')}
      nextAccessibilityLabel={t('estDetailProgrammesNext')}
      renderSlide={(programme, { cardWidth }) => (
        <ProgrammeCard
          programme={programme}
          establishment={establishment}
          rtl={rtl}
          t={t}
          width={cardWidth}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    height: 4,
    backgroundColor: brand.primary,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  diplomePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  diplomeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.primary,
    flexShrink: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
    lineHeight: 22,
  },
  infoList: {
    marginTop: spacing.xs,
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(51,62,143,0.08)',
  },
  infoRowRtl: {
    flexDirection: 'row-reverse',
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    maxWidth: '48%',
  },
  infoLabelWrapRtl: {
    flexDirection: 'row-reverse',
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'right',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
