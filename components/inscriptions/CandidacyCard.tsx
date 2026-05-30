import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  InscriptionCardCountdown,
  InscriptionCardInfoLine,
  InscriptionCardMetaPanel,
  InscriptionCardSchoolBlock,
  InscriptionCardStatusPanel,
  InscriptionCardTypeHeader,
  InscriptionCardUsefulLinks,
  inscriptionCardStyles,
} from '@/components/inscriptions/InscriptionAnnouncementCardParts';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { brand } from '@/theme/tokens';
import type { Candidacy } from '@/types/inscriptions';
import {
  formatDaysUntilClose,
  formatShortDate,
  pickAnnouncementTitle,
  pickEstablishmentNamesPair,
  pickRegistrationUrlLabel,
} from '@/utils/candidacyStatus';

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

  const { primary: estNamePrimary, secondary: estNameSecondary } = pickEstablishmentNamesPair(est, locale);
  const villes = (est?.villes ?? []).filter(Boolean);
  const villeMain = est?.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.slice(0, 3).join(' · ') : villeMain;
  const villesExtra = villes.length > 3 ? villes.length - 3 : 0;

  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ?? fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  const deadline = formatDaysUntilClose(a?.daysUntilClose, locale);
  const status = candidacy.status;
  const cardBg = status?.colorBg ?? brand.white;
  const cardBorder = status?.colorBorder ?? brand.border;
  const accentColor = status?.colorFg ?? brand.primary;
  const hasUpdateAction = (a?.availableStatuses?.length ?? 0) > 0;
  const hasMetaPanel = Boolean(villesShort || a?.dateStart || a?.dateEnd);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        inscriptionCardStyles.cardShell,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderStartColor: accentColor,
          borderStartWidth: 4,
        },
        pressed && { opacity: 0.92 },
      ]}>
      <View style={[inscriptionCardStyles.body, isRTL && inscriptionCardStyles.bodyRtl]}>
        <InscriptionCardTypeHeader
          announcementType={a?.announcementType ?? null}
          isRTL={isRTL}
          trailing={<StatusBadge status={candidacy.status} size="sm" />}
        />

        <InscriptionCardSchoolBlock
          logoUri={logoUri}
          estNamePrimary={estNamePrimary}
          estNameSecondary={estNameSecondary}
          sigle={est?.sigle}
          establishmentType={est?.type}
          isRTL={isRTL}
        />

        <Text style={[inscriptionCardStyles.title, isRTL && inscriptionCardStyles.rtlText]} numberOfLines={3}>
          {pickAnnouncementTitle(a, locale) || '—'}
        </Text>

        {hasMetaPanel ? (
          <InscriptionCardMetaPanel>
            {villesShort ? (
              <InscriptionCardInfoLine
                icon="map-marker"
                iconColor={brand.textMuted}
                label={t('schoolsCityLabel')}
                value={villesExtra > 0 ? `${villesShort} +${villesExtra}` : villesShort}
                isRTL={isRTL}
              />
            ) : null}
            {a?.dateStart ? (
              <InscriptionCardInfoLine
                icon="play-circle"
                iconColor={brand.success}
                label={t('inscDateOpens')}
                value={formatShortDate(a.dateStart, locale)}
                isRTL={isRTL}
              />
            ) : null}
            {a?.dateEnd ? (
              <InscriptionCardInfoLine
                icon="stop-circle"
                iconColor={brand.textMuted}
                label={t('inscDateCloses')}
                value={formatShortDate(a.dateEnd, locale)}
                isRTL={isRTL}
              />
            ) : null}
          </InscriptionCardMetaPanel>
        ) : null}

        <InscriptionCardCountdown deadline={deadline} isRTL={isRTL} />

        {Array.isArray(a?.liensUtiles) && a.liensUtiles.length > 0 ? (
          <InscriptionCardUsefulLinks links={a.liensUtiles} title={t('inscDetailUsefulLinks')} isRTL={isRTL} />
        ) : null}

        {hasUpdateAction && onUpdateStatus ? (
          <InscriptionCardStatusPanel
            status={candidacy.status}
            updateLabel={t('inscStatusActionUpdate')}
            onUpdateStatus={onUpdateStatus}
            isRTL={isRTL}
          />
        ) : null}

        <View style={inscriptionCardStyles.actionsCol}>
          <View style={inscriptionCardStyles.actionsRow}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onOpenLink?.();
              }}
              disabled={!a?.registrationUrl}
              style={({ pressed }) => [
                inscriptionCardStyles.btn,
                inscriptionCardStyles.btnFlex,
                inscriptionCardStyles.btnPrimary,
                !a?.registrationUrl && inscriptionCardStyles.btnDisabled,
                pressed && { opacity: 0.85 },
              ]}>
              <FontAwesome name="external-link" size={11} color={brand.white} />
              <Text style={inscriptionCardStyles.btnPrimaryTxt} numberOfLines={1}>
                {pickRegistrationUrlLabel(a?.registrationUrlLabel, a?.announcementType, t, locale)}
              </Text>
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onOpenTimeline?.();
              }}
              style={({ pressed }) => [
                inscriptionCardStyles.iconBtn,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel={t('inscViewTimeline')}>
              <FontAwesome name="history" size={14} color={brand.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
