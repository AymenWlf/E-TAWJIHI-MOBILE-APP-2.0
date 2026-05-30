import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import type { EstablishmentNormalized } from '@/services/establishments';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

/** Skeleton commun aux cartes du chat pendant le chargement des métadonnées / listes. */
export function ChatMiniCardLoading() {
  return (
    <View
      style={[styles.card, styles.cardLoading]}
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement"
    >
      <View style={styles.row}>
        <View style={styles.loadingThumb} />
        <View style={styles.loadingTextCol}>
          <View style={styles.loadingLine} />
          <View style={[styles.loadingLine, styles.loadingLineShort]} />
        </View>
      </View>
      <View style={styles.loadingFooter}>
        <View style={styles.loadingFooterPill} />
      </View>
    </View>
  );
}

export function ChatMiniEstablishmentCard({
  item,
  onPress,
}: {
  item: EstablishmentNormalized;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}>
      <View style={styles.row}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: item.displayLogoUrl }}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={styles.main}>
          <Text style={styles.title} numberOfLines={2}>
            {item.nom}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {[item.sigle, item.ville].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color={brand.textMuted} style={{ marginLeft: spacing.sm }} />
      </View>
      <View style={styles.metaRow}>
        <EstablishmentTypeBadge type={item.type} size="xs" hideIfUnknown={false} />
        {item.dureeLabel ? (
          <View style={styles.pill}>
            <FontAwesome name="clock-o" size={12} color={brand.primary} />
            <Text style={styles.pillTxt} numberOfLines={1}>
              {item.dureeLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ChatMiniNavCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}>
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <FontAwesome name={icon} size={16} color={brand.white} />
        </View>
        <View style={styles.main}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.sub} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <FontAwesome name="chevron-right" size={14} color={brand.textMuted} style={{ marginLeft: spacing.sm }} />
      </View>
    </Pressable>
  );
}

/** Carte produit / pack boutique (aperçu catalogue). */
export function ChatMiniProductCard({
  title,
  priceLabel,
  compareAtLabel,
  imageUri,
  onPress,
}: {
  title: string;
  priceLabel: string;
  compareAtLabel?: string | null;
  imageUri: string;
  onPress: () => void;
}) {
  const showCompare = Boolean(compareAtLabel && compareAtLabel.trim() !== '');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}>
      <View style={styles.row}>
        <View style={styles.productThumbWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.productThumb}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={styles.main}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>{priceLabel}</Text>
            {showCompare ? (
              <Text style={styles.productCompare}>{compareAtLabel}</Text>
            ) : null}
          </View>
        </View>
        <FontAwesome name="chevron-right" size={14} color={brand.textMuted} style={{ marginLeft: spacing.sm }} />
      </View>
    </Pressable>
  );
}

export function ChatMiniAnnouncementCard({
  title,
  subtitle,
  logoUrl,
  onPress,
}: {
  title: string;
  subtitle?: string | null;
  logoUrl?: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}>
      <View style={styles.row}>
        <View style={styles.logoWrap}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.iconBadge}>
              <FontAwesome name="calendar" size={16} color={brand.white} />
            </View>
          )}
        </View>
        <View style={styles.main}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.sub} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <FontAwesome name="chevron-right" size={14} color={brand.textMuted} style={{ marginLeft: spacing.sm }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: brand.background,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.md,
  },
  cardLoading: {
    opacity: 0.96,
  },
  loadingThumb: {
    width: 44,
    height: 44,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.borderLight,
  },
  loadingTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    justifyContent: 'center',
  },
  loadingLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: brand.borderLight,
    width: '100%',
  },
  loadingLineShort: {
    width: '62%',
  },
  loadingFooter: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  loadingFooterPill: {
    width: 72,
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  logoWrap: {
    width: 34,
    height: 34,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 26,
    height: 26,
  },
  productThumbWrap: {
    width: 44,
    height: 44,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    overflow: 'hidden',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    width: 30,
    height: 30,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.sm + 1,
    fontWeight: '900',
    lineHeight: 18,
  },
  sub: {
    marginTop: 2,
    color: brand.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 17,
  },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  pillTxt: {
    marginLeft: 6,
    color: brand.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  productPriceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productPrice: {
    color: brand.primary,
    fontSize: fontSize.sm + 1,
    fontWeight: '900',
  },
  productCompare: {
    marginLeft: 8,
    color: brand.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
});

