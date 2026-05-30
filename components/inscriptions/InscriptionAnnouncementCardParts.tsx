import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps, ReactNode } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AnnouncementTypeChip } from '@/components/inscriptions/AnnouncementTypeChip';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import type { CustomLink } from '@/types/inscriptions';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType } from '@/types/inscriptions';
import type { formatDaysUntilClose } from '@/utils/candidacyStatus';

type FaName = ComponentProps<typeof FontAwesome>['name'];

export type DeadlineUi = ReturnType<typeof formatDaysUntilClose>;

export const inscriptionCardStyles = StyleSheet.create({
  cardShell: {
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
  headerTrailing: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: spacing.xs,
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
  titleEmphasis: {
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
  metaPanelInset: {
    marginTop: 2,
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
  btnPrimary: { backgroundColor: brand.primary },
  btnPrimaryTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  btnSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  btnSecondaryTxt: { color: brand.primary, fontSize: fontSize.sm, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export function InscriptionCardInfoLine({
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
    <View style={inscriptionCardStyles.infoLine}>
      <View style={inscriptionCardStyles.infoIconWrap}>
        <FontAwesome name={icon} size={11} color={iconColor} />
      </View>
      <View style={inscriptionCardStyles.infoTextCol}>
        <Text style={[inscriptionCardStyles.infoLabel, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[inscriptionCardStyles.infoValue, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={2} latinDigits>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function InscriptionCardSchoolBlock({
  logoUri,
  estNamePrimary,
  estNameSecondary,
  sigle,
  establishmentType,
  isRTL,
}: {
  logoUri: string;
  estNamePrimary: string;
  estNameSecondary: string | null;
  sigle?: string | null;
  establishmentType?: string | null;
  isRTL: boolean;
}) {
  return (
    <View style={inscriptionCardStyles.schoolBlock}>
      <Image
        source={{ uri: logoUri }}
        style={inscriptionCardStyles.estLogo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={inscriptionCardStyles.estTexts}>
        <Text style={[inscriptionCardStyles.estName, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={3}>
          {estNamePrimary}
        </Text>
        {estNameSecondary ? (
          <Text style={[inscriptionCardStyles.estNameAlt, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={2}>
            {estNameSecondary}
          </Text>
        ) : null}
        {(sigle || establishmentType) ? (
          <View style={inscriptionCardStyles.estMetaRow}>
            {sigle ? (
              <View style={inscriptionCardStyles.siglePill}>
                <Text style={inscriptionCardStyles.siglePillTxt}>{sigle}</Text>
              </View>
            ) : null}
            {establishmentType ? <EstablishmentTypeBadge type={establishmentType} size="xs" /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function InscriptionCardMetaPanel({
  children,
  inset,
}: {
  children: ReactNode;
  inset?: boolean;
}) {
  if (!children) return null;
  return (
    <View style={[inscriptionCardStyles.metaPanel, inset && inscriptionCardStyles.metaPanelInset]}>{children}</View>
  );
}

export function InscriptionCardCountdown({
  deadline,
  isRTL,
}: {
  deadline: DeadlineUi;
  isRTL: boolean;
}) {
  if (!deadline.label) return null;
  return (
    <View
      style={[
        inscriptionCardStyles.countdown,
        deadline.kind === 'closed' && inscriptionCardStyles.countdownClosed,
        deadline.kind === 'today' && inscriptionCardStyles.countdownToday,
        deadline.kind === 'soon' && inscriptionCardStyles.countdownSoon,
        deadline.kind === 'normal' && inscriptionCardStyles.countdownOpen,
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
          inscriptionCardStyles.countdownTxt,
          isRTL && inscriptionCardStyles.rtlText,
          deadline.kind === 'closed' && inscriptionCardStyles.countdownClosedTxt,
          deadline.kind === 'today' && inscriptionCardStyles.countdownTodayTxt,
          deadline.kind === 'soon' && inscriptionCardStyles.countdownSoonTxt,
          deadline.kind === 'normal' && inscriptionCardStyles.countdownOpenTxt,
        ]}>
        {deadline.label}
      </Text>
    </View>
  );
}

export function InscriptionCardUsefulLinks({
  links,
  title,
  isRTL,
}: {
  links: CustomLink[];
  title: string;
  isRTL: boolean;
}) {
  const rows = links.filter((l) => Boolean(l?.url?.trim())).slice(0, 6);
  if (rows.length === 0) return null;
  return (
    <View style={inscriptionCardStyles.linksPanel}>
      <Text style={[inscriptionCardStyles.linksPanelTitle, isRTL && inscriptionCardStyles.rtlText]}>{title}</Text>
      <View style={inscriptionCardStyles.linksWrap}>
        {rows.map((l, i) => (
          <Pressable
            key={`${l.url}-${i}`}
            onPress={() => {
              void Linking.openURL(l.url).catch(() => undefined);
            }}
            style={({ pressed }) => [inscriptionCardStyles.linkChip, pressed && { opacity: 0.85 }]}>
            <FontAwesome name="link" size={10} color={brand.primary} />
            <Text style={[inscriptionCardStyles.linkChipTxt, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={1}>
              {l.titre || l.url}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function InscriptionCardStatusPanel({
  status,
  updateLabel,
  onUpdateStatus,
  isRTL,
}: {
  status: CandidacyStatusType | null;
  updateLabel: string;
  onUpdateStatus?: () => void;
  isRTL: boolean;
}) {
  if (!onUpdateStatus) return null;
  return (
    <View style={inscriptionCardStyles.statusPanel}>
      <View style={inscriptionCardStyles.statusPanelTop}>
        <StatusBadge status={status} size="sm" />
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onUpdateStatus();
          }}
          style={({ pressed }) => [inscriptionCardStyles.statusEditBtn, pressed && { opacity: 0.85 }]}>
          <FontAwesome name="pencil" size={11} color={brand.primary} />
          <Text style={[inscriptionCardStyles.statusEditBtnTxt, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={1}>
            {updateLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function InscriptionCardTypeHeader({
  announcementType,
  isRTL,
  trailing,
}: {
  announcementType: string | null | undefined;
  isRTL: boolean;
  trailing?: ReactNode;
}) {
  return (
    <View style={inscriptionCardStyles.headerRow}>
      <View style={inscriptionCardStyles.headerTypeWrap}>
        <AnnouncementTypeChip type={announcementType} variant="banner" isRTL={isRTL} />
      </View>
      {trailing ? <View style={inscriptionCardStyles.headerTrailing}>{trailing}</View> : null}
    </View>
  );
}
