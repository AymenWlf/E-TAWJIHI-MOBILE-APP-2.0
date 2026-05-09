import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { useLocale } from '@/contexts/LocaleContext';
import { useAppColors } from '@/hooks/useAppColors';
import { fontSize, radius, spacing } from '@/theme/tokens';

export type NewsItem = { id: string; title: string; date: string; tag: string };

type Props = {
  items: NewsItem[];
  onPressItem?: (id: string) => void;
};

const CARD_W = 220;

const newsCardShadow =
  Platform.OS === 'android'
    ? { elevation: 5 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      };

export function NewsCarousel({ items, onPressItem }: Props) {
  const c = useAppColors();
  const { t } = useLocale();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollTrack}
      contentContainerStyle={styles.scroll}
      accessibilityLabel={t('newsCarouselA11y')}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem?.(item.id)}
          style={({ pressed }) => [
            styles.card,
            newsCardShadow,
            index < items.length - 1 && styles.cardSpacing,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
            },
            pressed && { opacity: 0.92 },
          ]}>
          <View style={[styles.tag, { backgroundColor: c.primaryMuted }]}>
            <Text style={[styles.tagText, { color: c.primary }]}>{item.tag}</Text>
          </View>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={[styles.date, { color: c.textMuted }]}>{item.date}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /** Retire le gutter côté fin (droite LTR / gauche RTL) appliqué par le parent page. */
  scrollTrack: {
    marginHorizontal: -spacing.xl,
    overflow: 'visible',
  },
  scroll: {
    paddingVertical: 2,
    /** Aligne au début (start) mais pas de marge côté fin (end). */
    paddingStart: spacing.xl,
    paddingEnd: 0,
  },
  cardSpacing: {
    marginEnd: spacing.md,
  },
  card: {
    width: CARD_W,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    minHeight: 120,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '700',
    lineHeight: 22,
    flex: 1,
  },
  date: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
