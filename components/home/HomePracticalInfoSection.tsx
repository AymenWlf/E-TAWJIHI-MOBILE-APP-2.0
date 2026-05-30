import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { HomeFeedHorizontalScroll } from '@/components/home/HomeFeedHorizontalScroll';
import { practicalLinkCardShadow } from '@/components/home/HomeFeedSection';
import { HomePracticalInfoSectionSkeleton } from '@/components/home/HomePracticalInfoSectionSkeleton';
import { Text } from '@/components/ui/Text';
import { homeSectionHeaderStyles as header } from '@/components/home/homeSectionHeaderStyles';
import { PRACTICAL_LINK_DEFS } from '@/constants/practicalLinks';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type PracticalInfoItem = {
  id: string;
  label: string;
  description: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
  accent: string;
};

const CARD_W = 144;
const CARD_H = 112;
const ICON_BOX = 48;
const ICON_GLYPH = 21;

const androidTextFix =
  Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : ({} as const);

type Props = {
  width: number;
  items?: PracticalInfoItem[];
  onPressItem?: (id: string) => void;
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

function PracticalLinkCard({
  item,
  isRTL,
  onPress,
}: {
  item: PracticalInfoItem;
  isRTL: boolean;
  onPress: () => void;
}) {
  const iconBg = withAlpha(item.accent, 0.14);
  const iconRing = withAlpha(item.accent, 0.28);
  const glow = withAlpha(item.accent, 0.11);
  const footerBg = withAlpha(item.accent, 0.06);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderTopColor: item.accent },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.label}>
      <View style={[styles.glowOrb, { backgroundColor: glow }]} pointerEvents="none" />
      <View style={[styles.cardBody, isRTL && styles.cardBodyRtl]}>
        <View style={styles.heroRow}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg, borderColor: iconRing }]}>
            <FontAwesome name={item.icon} size={ICON_GLYPH} color={item.accent} />
          </View>
          <View style={[styles.arrowChip, { backgroundColor: footerBg, borderColor: iconRing }]}>
            <FontAwesome
              name={isRTL ? 'chevron-left' : 'chevron-right'}
              size={10}
              color={item.accent}
            />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.label, isRTL && styles.labelRtl]} numberOfLines={3}>
            {item.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HomePracticalInfoSection({
  width,
  items: itemsOverride,
  onPressItem,
  loading = false,
}: Props) {
  const { t, isRTL } = useLocale();

  const items = useMemo((): PracticalInfoItem[] => {
    if (itemsOverride?.length) return itemsOverride;
    return PRACTICAL_LINK_DEFS.map((d) => ({
      id: d.id,
      label: t(d.labelKey),
      description: '',
      icon: d.icon,
      accent: d.accent,
    }));
  }, [itemsOverride, t]);

  if (loading) {
    return <HomePracticalInfoSectionSkeleton width={width} isRTL={isRTL} />;
  }

  return (
    <View style={[header.sectionWrap, { width }, isRTL && header.sectionWrapRtl]}>
      <View style={[header.titleRow, isRTL && header.titleRowRtl]}>
        <View style={[header.titleLeft, isRTL && header.titleLeftRtl]}>
          <View style={header.titleAccent} />
          <View style={[header.titleTextCol, isRTL && header.titleTextColRtl]}>
            <Text style={[header.title, isRTL && header.titleRtl]}>{t('practicalTitle')}</Text>
          </View>
        </View>
      </View>
      <Text style={[header.subtitle, isRTL && header.subtitleRtl]}>{t('practicalSubtitle')}</Text>

      <View accessibilityLabel={t('practicalSectionA11y')} accessible>
        <HomeFeedHorizontalScroll isRTL={isRTL}>
          {items.map((item) => (
            <View key={item.id} style={[styles.cardSlot, styles.cardShadowHost, practicalLinkCardShadow]}>
              <PracticalLinkCard
                item={item}
                isRTL={isRTL}
                onPress={() => onPressItem?.(item.id)}
              />
            </View>
          ))}
        </HomeFeedHorizontalScroll>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSlot: {
    width: CARD_W,
    height: CARD_H,
    marginVertical: 2,
  },
  cardShadowHost: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderTopWidth: 3,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  glowOrb: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    top: -18,
    end: -14,
    opacity: 0.95,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardBodyRtl: {
    direction: 'rtl',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  iconWrap: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  arrowChip: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
    flexShrink: 0,
  },
  textBlock: {
    gap: 4,
    minHeight: 0,
  },
  label: {
    color: brand.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
    lineHeight: 17,
    letterSpacing: -0.25,
    ...androidTextFix,
  },
  labelRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
});
