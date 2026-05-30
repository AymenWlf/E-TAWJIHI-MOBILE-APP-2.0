import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import type { StoryChannel } from '@/data/mock/homeFeed';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppColors } from '@/hooks/useAppColors';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, spacing } from '@/theme/tokens';

const RING = 72;
const AVATAR = RING - 12;

const READ_RING = '#CBD5E1';
const READ_RING_W = 2;
const UNREAD_RING_W = 3;
/** Anneau « non lu » : vert charte unique (pas de couleur par chaîne). */
const UNREAD_RING = homeShell.green;

type Props = {
  channels: StoryChannel[];
  /** Ids des chaises entièrement vues (dernière slide atteinte). */
  readChannelIds: ReadonlySet<string>;
  onOpenChannel: (channelIndex: number) => void;
  /** Style type référence (fond sombre) */
  tone?: 'light' | 'dark';
  /** Chargement des chaînes depuis l’API. */
  loading?: boolean;
};

const LOADING_PLACEHOLDER_COUNT = 5;

export function StoriesRow({
  channels,
  readChannelIds,
  onOpenChannel,
  tone = 'light',
  loading = false,
}: Props) {
  const c = useAppColors();
  const { t, isRTL } = useLocale();
  const dark = tone === 'dark';

  return (
    <View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollTrack, isRTL && styles.scrollRtl]}
        contentContainerStyle={styles.scroll}
        accessibilityLabel={t('storiesA11y')}>
        {loading
          ? Array.from({ length: LOADING_PLACEHOLDER_COUNT }, (_, index) => (
              <View key={`story-loading-${index}`} style={styles.item} accessibilityElementsHidden>
                <View style={[styles.ring, styles.ringLoading]}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : c.primaryMuted },
                    ]}>
                    <ActivityIndicator
                      size="small"
                      color={dark ? homeShell.green : brand.primary}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.labelPlaceholder,
                    { backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(51,62,143,0.12)' },
                  ]}
                />
              </View>
            ))
          : null}
        {!loading
          ? channels.map((ch, index) => {
          const read = readChannelIds.has(ch.id);
          const cover = ch.coverUri ?? ch.slides[0]?.uri;
          const a11y =
            `${ch.label}${read ? t('storyRingSuffixRead') : t('storyRingSuffixUnread')}`;
          return (
            <Pressable
              key={ch.id}
              onPress={() => onOpenChannel(index)}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.88 }]}
              accessibilityRole="button"
              accessibilityLabel={a11y}>
              <View
                style={[
                  styles.ring,
                  {
                    borderWidth: read ? READ_RING_W : UNREAD_RING_W,
                    borderColor: read ? READ_RING : UNREAD_RING,
                  },
                ]}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : c.primaryMuted },
                  ]}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={styles.coverImg} resizeMode="cover" />
                  ) : (
                    <Text style={[styles.initial, { color: read ? READ_RING : UNREAD_RING }]}>
                      {ch.label.charAt(0)}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.label,
                  isRTL && styles.labelRtl,
                  { color: dark ? homeShell.text : c.textSecondary },
                  dark && styles.labelOnBrand,
                ]}
                numberOfLines={1}>
                {ch.label}
              </Text>
            </Pressable>
          );
        })
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** RTL : ordre des vignettes depuis la droite (inline-start). */
  scrollRtl: {
    direction: 'rtl',
  },
  /** Retire le gutter côté fin (droite LTR / gauche RTL) appliqué par le parent. */
  scrollTrack: {
    marginEnd: -spacing.xl,
  },
  scroll: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    /** Le parent (hero) applique déjà le padding horizontal ; évite le « déchirement » / double marge sur les côtés */
    paddingHorizontal: 0,
  },
  item: {
    width: RING + 4,
    alignItems: 'center',
    marginEnd: spacing.lg,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLoading: {
    borderWidth: UNREAD_RING_W,
    borderColor: UNREAD_RING,
    opacity: 0.65,
  },
  labelPlaceholder: {
    marginTop: spacing.sm,
    width: RING,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImg: {
    width: AVATAR,
    height: AVATAR,
  },
  initial: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  label: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: RING + 8,
  },
  labelRtl: {
    writingDirection: 'rtl',
  },
  /** Lisible sur le bleu marque (#333E8F) du hero */
  labelOnBrand: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
