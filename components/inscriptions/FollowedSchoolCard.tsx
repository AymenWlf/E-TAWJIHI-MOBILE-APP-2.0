import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { TourFocusWrap } from '@/components/inscriptions/TourFocusWrap';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { EstablishmentFollow } from '@/types/inscriptions';
import type { ApplyToSchoolsTourGate } from '@/utils/applyToSchoolsTourProgress';
import { pickEstablishmentName } from '@/utils/candidacyStatus';

type Props = {
  follow: EstablishmentFollow;
  actionRequired?: boolean;
  onPress?: () => void;
  onUnfollow?: () => void;
  onOpenLatest?: () => void;
  onOpenSchool?: () => void;
  onUpdateStatus?: () => void;
  tourFocusStatus?: boolean;
  tourFocusLabel?: string;
  tourFocusPulse?: boolean;
  tourGate?: ApplyToSchoolsTourGate;
  tourSuppressUpdatePulse?: boolean;
  /** Changement de statut réservé TAWJIH PLUS. */
  statusUpdateLocked?: boolean;
};

export function FollowedSchoolCard({
  follow,
  actionRequired = false,
  onPress,
  onUnfollow,
  onUpdateStatus,
  tourFocusStatus = false,
  tourFocusLabel,
  tourFocusPulse = true,
  tourGate,
  tourSuppressUpdatePulse = false,
  statusUpdateLocked = false,
}: Props) {
  const { t, locale, isRTL } = useLocale();
  const est = follow.establishment;
  const status = follow.status;
  const cardBg = actionRequired ? '#FFF1F2' : status?.colorBg ?? brand.white;
  const cardBorder = actionRequired ? '#FECACA' : status?.colorBorder ?? brand.border;
  const accentColor = actionRequired ? '#DC2626' : status?.colorFg ?? brand.primary;
  const hasUpdateAction = (follow.availableStatuses?.length ?? 0) > 0;
  const statusInteractionEnabled = !tourGate || tourGate === 'status';
  const secondaryActionsEnabled = !tourGate;

  const schoolName = pickEstablishmentName(est, locale);
  const sigle = (est?.sigle ?? '').trim();
  const showSigle = Boolean(sigle) && sigle.toLowerCase() !== schoolName.trim().toLowerCase();

  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ?? fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const pulseUpdate = Boolean(
    actionRequired &&
      hasUpdateAction &&
      onUpdateStatus &&
      !tourSuppressUpdatePulse &&
      !statusUpdateLocked,
  );

  useEffect(() => {
    if (!pulseUpdate) {
      pulseScale.setValue(1);
      pulseOpacity.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.04,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.72,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    anim.start();
    return () => {
      anim.stop();
      pulseScale.setValue(1);
      pulseOpacity.setValue(1);
    };
  }, [pulseUpdate, pulseScale, pulseOpacity]);

  return (
    <Pressable
      onPress={tourGate ? undefined : onPress}
      disabled={Boolean(tourGate)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderStartColor: accentColor,
        },
        actionRequired && styles.cardActionRequired,
        pressed && !tourGate && { opacity: 0.92 },
      ]}>
      {actionRequired ? (
        <Animated.View
          style={[
            styles.actionRequiredChip,
            isRTL && styles.rowRtl,
            pulseUpdate ? { opacity: pulseOpacity } : null,
          ]}>
          <FontAwesome name="exclamation-circle" size={11} color="#B91C1C" />
          <Text style={[styles.actionRequiredChipTxt, isRTL && styles.rtlText]}>
            {t('inscCandidaciesAttentionFilterRequired')}
          </Text>
        </Animated.View>
      ) : null}

      <View style={[styles.body, isRTL && styles.bodyRtl]}>
        <View style={[styles.topRow, isRTL && styles.rowRtl]}>
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.schoolCol}>
            <Text style={[styles.schoolName, isRTL && styles.rtlText]} numberOfLines={2}>
              {schoolName}
            </Text>
            {(showSigle || est?.type) ? (
              <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
                {showSigle ? (
                  <View style={styles.siglePill}>
                    <Text style={styles.siglePillTxt} numberOfLines={1}>
                      {sigle}
                    </Text>
                  </View>
                ) : null}
                {est?.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
              </View>
            ) : null}
            <View style={[styles.statusRow, isRTL && styles.rowRtl]}>
              <StatusBadge status={follow.status} size="sm" />
            </View>
          </View>

          {onUnfollow && secondaryActionsEnabled ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onUnfollow();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('followSchoolUnfollowBtn')}
              style={({ pressed }) => [styles.unfollowBtn, pressed && { opacity: 0.75 }]}>
              <FontAwesome name="trash-o" size={14} color="#B91C1C" />
            </Pressable>
          ) : null}
        </View>

        {hasUpdateAction && onUpdateStatus ? (
          <TourFocusWrap
            active={tourFocusStatus}
            pulse={tourFocusPulse}
            label={tourFocusStatus ? tourFocusLabel : undefined}
            style={styles.updateWrap}>
            <Animated.View
              style={[
                styles.updateWrap,
                pulseUpdate && !tourFocusStatus ? { transform: [{ scale: pulseScale }] } : null,
              ]}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (!statusInteractionEnabled) return;
                  onUpdateStatus();
                }}
                disabled={!statusInteractionEnabled}
                accessibilityRole="button"
                accessibilityLabel={
                  statusUpdateLocked ? t('inscTawjihPlusUpgradeCta') : t('inscStatusActionUpdate')
                }
                style={({ pressed }) => [
                  styles.updateBtn,
                  statusUpdateLocked && styles.updateBtnLocked,
                  actionRequired && !statusUpdateLocked && styles.updateBtnUrgent,
                  pressed && statusInteractionEnabled && { opacity: 0.88 },
                  tourFocusStatus && styles.updateBtnTourFocus,
                  !statusInteractionEnabled && styles.tourActionDisabled,
                ]}>
                <FontAwesome
                  name={statusUpdateLocked ? 'lock' : 'pencil'}
                  size={12}
                  color={brand.white}
                />
                <Text style={styles.updateBtnTxt} numberOfLines={2}>
                  {statusUpdateLocked ? t('inscTawjihPlusUpgradeCta') : t('inscStatusActionUpdate')}
                </Text>
              </Pressable>
            </Animated.View>
          </TourFocusWrap>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStartWidth: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActionRequired: {
    borderWidth: 1.5,
  },
  actionRequiredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FEE2E2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FECACA',
  },
  actionRequiredChipTxt: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  bodyRtl: {
    direction: 'rtl',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
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
    gap: 4,
  },
  schoolName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 20,
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
  statusRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  unfollowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECACA',
  },
  updateWrap: {
    width: '100%',
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  updateBtnUrgent: {
    backgroundColor: '#DC2626',
  },
  updateBtnLocked: {
    backgroundColor: '#475569',
  },
  updateBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  updateBtnTourFocus: {
    borderWidth: 2,
    borderColor: homeShell.green,
  },
  tourActionDisabled: {
    opacity: 0.38,
  },
});
