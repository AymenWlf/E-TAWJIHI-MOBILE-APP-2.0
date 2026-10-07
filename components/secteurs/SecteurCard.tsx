import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { SecteurCard as SecteurCardModel } from '@/services/secteurs';
import { pickSecteurTitle } from '@/services/secteurs';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { stripHtmlToText } from '@/utils/sanitizeRichHtml';

type Props = {
  item: SecteurCardModel;
  locale: 'fr' | 'ar';
  isRTL: boolean;
  onPress: () => void;
  matchLabel: string;
  isFavorite?: boolean;
  favoriteBusy?: boolean;
  onToggleFavorite?: () => void;
  addFavoriteA11y?: string;
  removeFavoriteA11y?: string;
};

export function SecteurCard({
  item,
  locale,
  isRTL,
  onPress,
  matchLabel,
  isFavorite,
  favoriteBusy,
  onToggleFavorite,
  addFavoriteA11y,
  removeFavoriteA11y,
}: Props) {
  const title = pickSecteurTitle(item, locale);
  const desc = stripHtmlToText(item.description, 140);
  const skills = item.softSkills.slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.coverWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverFallback}>
            <FontAwesome name="briefcase" size={36} color={brand.white} />
          </View>
        )}
        {onToggleFavorite ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              if (!favoriteBusy) onToggleFavorite();
            }}
            hitSlop={8}
            disabled={favoriteBusy}
            style={({ pressed }) => [
              styles.favBtn,
              isRTL && styles.favBtnRtl,
              isFavorite && styles.favBtnOn,
              (pressed || favoriteBusy) && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: !!isFavorite, disabled: !!favoriteBusy }}
            accessibilityLabel={isFavorite ? removeFavoriteA11y : addFavoriteA11y}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={14}
              color={isFavorite ? '#DC2626' : brand.textMuted}
            />
          </Pressable>
        ) : null}
        {item.recommendationScore != null ? (
          <View style={[styles.matchBadge, isRTL && styles.matchBadgeRtl]}>
            <FontAwesome name="bullseye" size={11} color={brand.white} />
            <Text style={styles.matchTxt}>
              {item.recommendationScore}% {matchLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.body, isRTL && styles.bodyRtl]}>
        <Text style={[styles.title, isRTL && styles.rtl]} numberOfLines={2}>
          {title}
        </Text>
        {item.code ? (
          <Text style={[styles.code, isRTL && styles.rtl]} numberOfLines={1}>
            {item.code}
          </Text>
        ) : null}
        {desc ? (
          <Text style={[styles.desc, isRTL && styles.rtl]} numberOfLines={2}>
            {desc}
          </Text>
        ) : null}

        {item.salaireLabel ? (
          <View style={[styles.salaryRow, isRTL && styles.rowRtl]}>
            <FontAwesome name="money" size={12} color="#15803D" />
            <Text style={[styles.salaryTxt, isRTL && styles.rtl]} numberOfLines={1}>
              {item.salaireLabel}
            </Text>
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View style={[styles.chips, isRTL && styles.chipsRtl]}>
            {skills.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipTxt} numberOfLines={1}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.94 },
  coverWrap: {
    height: 148,
    backgroundColor: brand.borderLight,
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
  },
  favBtn: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  favBtnRtl: { left: undefined, right: spacing.sm },
  favBtnOn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  matchBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  matchBadgeRtl: { right: undefined, left: spacing.sm },
  matchTxt: { color: brand.white, fontSize: 11, fontWeight: '800' },
  body: { padding: spacing.md, gap: 6 },
  bodyRtl: { alignItems: 'stretch' },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 22,
  },
  code: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    fontWeight: '600',
  },
  desc: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  salaryTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#166534',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chipsRtl: { flexDirection: 'row-reverse' },
  chip: {
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  chipTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: brand.primary,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
