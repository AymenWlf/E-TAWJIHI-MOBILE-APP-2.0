import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { PRACTICAL_LINK_DEFS } from '@/constants/practicalLinks';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type PracticalInfoItem = {
  id: string;
  label: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
  accent: string;
};

/** Tuile carrée compacte (scroll horizontal type stories / notifs). */
const CARD = 112;
const ICON_BOX = 38;
const ICON_GLYPH = 18;

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
  items?: PracticalInfoItem[];
  onPressItem?: (id: string) => void;
};

export function HomePracticalInfoSection({ width, items: itemsOverride, onPressItem }: Props) {
  const { t, isRTL } = useLocale();

  const items = useMemo((): PracticalInfoItem[] => {
    if (itemsOverride?.length) return itemsOverride;
    return PRACTICAL_LINK_DEFS.map((d) => ({
      id: d.id,
      label: t(d.labelKey),
      icon: d.icon,
      accent: d.accent,
    }));
  }, [itemsOverride, t]);

  return (
    <View style={[styles.wrap, { width }]}>
      <View style={[styles.titleRow, isRTL && styles.titleRowRtl]}>
        <View style={styles.titleAccent} />
        <Text style={[styles.title, isRTL && styles.titleTxtRtl]}>{t('practicalTitle')}</Text>
      </View>
      <Text style={[styles.subtitle, isRTL && styles.subtitleRtl]}>{t('practicalSubtitle')}</Text>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollTrack, isRTL && styles.scrollRtl]}
        contentContainerStyle={styles.hScroll}
        accessibilityLabel={t('practicalSectionA11y')}>
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => onPressItem?.(item.id)}
            style={({ pressed }) => [
              styles.card,
              shadowCard,
              {
                width: CARD,
                height: CARD,
                borderTopColor: item.accent,
                marginEnd: index < items.length - 1 ? spacing.md : 0,
              },
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.label}>
            <View style={[styles.iconWrap, { backgroundColor: withAlpha(item.accent, 0.13) }]}>
              <FontAwesome name={item.icon} size={ICON_GLYPH} color={item.accent} />
            </View>
            <Text style={[styles.label, isRTL && styles.labelRtl]} numberOfLines={3}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(51,62,143,${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(51,62,143,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  /** Pleine largeur : obligatoire pour le scroll horizontal (évite le rétrécissement avec alignItems sur un parent RTL). */
  scrollTrack: {
    width: '100%',
    /**
     * Full-bleed : annule le padding horizontal de la page,
     * puis on ré-applique le padding uniquement côté start dans `hScroll`.
     */
    marginHorizontal: -spacing.xl,
    /** Les ombres des cards ne doivent pas être coupées par le scroll. */
    overflow: 'visible',
  },
  scrollRtl: {
    direction: 'rtl',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  titleRowRtl: {
    flexDirection: 'row-reverse',
  },
  titleAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: homeShell.blue,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  titleTxtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.12,
    marginBottom: spacing.md,
    paddingStart: 4 + spacing.sm,
    lineHeight: 16,
  },
  subtitleRtl: {
    textAlign: 'right',
    paddingStart: 0,
    paddingEnd: 4 + spacing.sm,
    alignSelf: 'stretch',
  },
  hScroll: {
    flexDirection: 'row',
    alignItems: 'stretch',
    /** Donne de la place aux ombres (sinon clip en haut/bas). */
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    /** Aligne au début (start) mais pas de marge côté fin (end). */
    paddingStart: spacing.xl,
    paddingEnd: 0,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
    borderTopWidth: 3,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginEnd: 0,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    width: '100%',
    textAlign: 'center',
    color: brand.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    lineHeight: 13.5,
    letterSpacing: -0.1,
  },
  labelRtl: {
    writingDirection: 'rtl',
  },
});
