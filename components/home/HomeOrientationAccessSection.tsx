import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { HomeOrientationAccessSectionSkeleton } from '@/components/home/HomeOrientationAccessSectionSkeleton';
import { homeSectionHeaderStyles as header } from '@/components/home/homeSectionHeaderStyles';
import { Text } from '@/components/ui/Text';
import { ORIENTATION_PRACTICAL_LINK_DEFS } from '@/constants/practicalLinks';
import type { PlanParcoursCompletion } from '@/constants/orientationParcours';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import {
  getOrientationPracticalLinkLock,
  type OrientationPracticalLinkId,
} from '@/utils/practicalLinkParcoursLock';

const CARD_GAP = spacing.sm;
/** Aligné sur les tuiles « Liens pratiques », légèrement plus grand (cartes 2×2). */
const ICON_BOX = 52;
const ICON_GLYPH = 26;

const shadowCard =
  Platform.OS === 'android'
    ? { elevation: 6 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      };

type Props = {
  width: number;
  onPressItem: (id: string) => void;
  planParcoursCompletion?: PlanParcoursCompletion | null;
  planParcoursLoading?: boolean;
  onOpenOrientationParcours?: () => void;
  hasTawjihPlusAccess?: boolean;
  tawjihPlusLoading?: boolean;
  onOpenTawjihPlusProduct?: () => void;
  loading?: boolean;
};

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(51,62,143,${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(51,62,143,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function HomeOrientationAccessSection({
  width,
  onPressItem,
  planParcoursCompletion,
  planParcoursLoading = false,
  onOpenOrientationParcours,
  hasTawjihPlusAccess = true,
  tawjihPlusLoading = false,
  onOpenTawjihPlusProduct,
  loading = false,
}: Props) {
  const { t, isRTL } = useLocale();

  const completion = planParcoursCompletion ?? {
    accountSetupComplete: false,
    orientationDiagnosticComplete: false,
    recommendationComplete: false,
    recommendationFollowCount: 0,
    feedbackComplete: false,
    applyToSchoolsComplete: false,
    inviteFriendComplete: false,
    inviteFriendQualifiedCount: 0,
  };

  const links = useMemo(() => {
    return ORIENTATION_PRACTICAL_LINK_DEFS.map((def) => {
      const lock = getOrientationPracticalLinkLock(def.id, completion, {
        loading: planParcoursLoading,
        tawjihPlusLoading,
        hasTawjihPlusAccess,
      });
      return {
        ...def,
        label: t(def.labelKey),
        locked: lock.locked,
        done: lock.done,
        lockReasonKey: lock.reasonKey,
      };
    });
  }, [completion, hasTawjihPlusAccess, planParcoursLoading, t, tawjihPlusLoading]);

  const cardSize =
    links.length <= 1 ? width : (width - CARD_GAP) / 2;

  if (loading || planParcoursLoading) {
    return (
      <HomeOrientationAccessSectionSkeleton
        width={width}
        isRTL={isRTL}
        showParcoursBtn={Boolean(onOpenOrientationParcours)}
      />
    );
  }

  const handlePress = (id: OrientationPracticalLinkId) => {
    const item = links.find((x) => x.id === id);
    if (item?.locked && item.lockReasonKey) {
      const tawjihPlusLock = item.lockReasonKey === 'inscTawjihPlusLockHint';
      Alert.alert(
        tawjihPlusLock ? t('inscTawjihPlusLockTitle') : t('practical_orientation_locked_title'),
        t(item.lockReasonKey),
        [
          { text: t('closeOverlayA11y'), style: 'cancel' },
          ...(tawjihPlusLock && onOpenTawjihPlusProduct
            ? [{ text: t('inscTawjihPlusUpgradeCta'), onPress: onOpenTawjihPlusProduct }]
            : onOpenOrientationParcours
              ? [{ text: t('orientationProgressLabel'), onPress: onOpenOrientationParcours }]
              : []),
        ],
      );
      return;
    }
    onPressItem(id);
  };

  return (
    <View style={[header.sectionWrap, { width }, isRTL && header.sectionWrapRtl]}>
      <View
        style={[
          header.titleRow,
          header.titleRowWithTrailing,
          isRTL && header.titleRowRtl,
        ]}>
        <View style={[header.titleLeft, isRTL && header.titleLeftRtl]}>
          <View style={header.titleAccent} />
          <View style={[header.titleTextCol, isRTL && header.titleTextColRtl]}>
            <Text style={[header.title, isRTL && header.titleRtl]}>{t('home_orientation_access_title')}</Text>
          </View>
        </View>
        {onOpenOrientationParcours ? (
          <Pressable
            onPress={onOpenOrientationParcours}
            hitSlop={8}
            style={({ pressed }) => [styles.parcoursBtn, pressed && { opacity: 0.88 }]}
            accessibilityRole="button"
            accessibilityLabel={t('orientationProgressLabel')}>
            <FontAwesome name="map-signs" size={13} color={brand.primary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[header.subtitle, isRTL && header.subtitleRtl]}>{t('home_orientation_access_eyebrow')}</Text>

      <View style={[styles.grid, isRTL && styles.gridRtl]}>
        {links.map((link) => (
          <Pressable
            key={link.id}
            onPress={() => handlePress(link.id)}
            style={({ pressed }) => [
              styles.tile,
              isRTL && styles.tileRtl,
              shadowCard,
              {
                width: cardSize,
                height: cardSize,
                borderTopColor: link.locked ? brand.textMuted : link.accent,
              },
              link.locked && styles.tileLocked,
              pressed && !link.locked && styles.tilePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={link.label}
            accessibilityState={{ disabled: link.locked }}>
            {link.done && !link.locked ? (
              <View style={styles.doneBadge}>
                <FontAwesome name="check" size={8} color={homeShell.greenDark} />
              </View>
            ) : null}

            <View style={[styles.tileContent, isRTL && styles.tileContentRtl]}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: link.locked
                      ? 'rgba(148,163,184,0.12)'
                      : withAlpha(link.accent, 0.13),
                  },
                ]}>
                <FontAwesome
                  name={link.locked ? 'lock' : link.icon}
                  size={ICON_GLYPH}
                  color={link.locked ? brand.textMuted : link.accent}
                />
              </View>

              <Text
                style={[
                  styles.tileLabel,
                  isRTL && styles.tileLabelRtl,
                  link.locked && styles.tileLabelLocked,
                ]}
                numberOfLines={3}>
                {link.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parcoursBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: CARD_GAP,
  },
  gridRtl: {
    direction: 'rtl',
  },
  tile: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
    borderTopWidth: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileRtl: {
    direction: 'rtl',
  },
  tileContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  tileContentRtl: {
    direction: 'rtl',
  },
  tileLocked: {
    backgroundColor: '#F8FAFC',
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  doneBadge: {
    position: 'absolute',
    top: spacing.sm,
    end: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: homeShell.greenAlpha18,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    width: '100%',
    textAlign: 'center',
    alignSelf: 'center',
    color: brand.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    lineHeight: 13.5,
    letterSpacing: -0.1,
  },
  tileLabelRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  tileLabelLocked: {
    color: brand.textMuted,
  },
});
