import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { fontSize, radius, spacing } from '@/theme/tokens';
import {
  fetchBannersByZone,
  pickBannerCreativeImageUrl,
  recordBannerClickNative,
  recordBannerImpressionNative,
  type BannerCreativePublic,
  type BannerZoneCode,
} from '@/services/publicBanners';
import { fireAndForget } from '@/utils/fireAndForget';

type Props = {
  /** `mid_square` = créatives carrées (300×300), aligné fiches détail web. */
  zone: Exclude<BannerZoneCode, 'bottom'>;
  analyticsPage: string;
  style?: ViewStyle;
};

function resolveClickUrl(c: BannerCreativePublic): string | null {
  const raw = (c.linkUrl || c.destinationUrl || '').trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

const SQUARE_BANNER_MAX = 300;

/**
 * Bandeau publicitaire — créatives API, KPI comptés comme **app mobile native**
 * (`clientSurface: native_app`). `mid_square` = encart carré centré (300×300).
 */
export function AppBannerSlot({ zone, analyticsPage, style }: Props) {
  const isSquare = zone === 'mid_square';
  const [creatives, setCreatives] = useState<BannerCreativePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const impRecorded = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchBannersByZone(zone)
      .then((list) => {
        if (!cancelled) setCreatives(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setCreatives([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zone]);

  const creative = creatives[index] ?? null;
  const imgUrl = useMemo(() => (creative ? pickBannerCreativeImageUrl(creative) : ''), [creative]);

  useEffect(() => {
    if (!creative?.id) return;
    const key = `${creative.id}|${analyticsPage}|${index}`;
    if (impRecorded.current.has(key)) return;
    impRecorded.current.add(key);
    fireAndForget(
      recordBannerImpressionNative({
        slotId: creative.id,
        page: analyticsPage,
        position: index + 1,
      }),
    );
  }, [creative, analyticsPage, index]);

  useEffect(() => {
    if (creatives.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % creatives.length);
    }, 10_000);
    return () => clearInterval(t);
  }, [creatives.length]);

  const onPress = useCallback(() => {
    if (!creative?.id) return;
    fireAndForget(
      recordBannerClickNative({
        slotId: creative.id,
        page: analyticsPage,
        position: index + 1,
      }),
    );
    const url = resolveClickUrl(creative);
    if (url) void Linking.openURL(url);
  }, [creative, analyticsPage, index]);

  const loadingBoxStyle = isSquare ? styles.loadingBoxSquare : styles.loadingBoxWide;
  const imgWrapStyle = isSquare ? styles.imgWrapSquare : styles.imgWrapWide;

  if (loading) {
    return (
      <View style={[styles.shell, isSquare && styles.shellSquare, style]}>
        <View style={loadingBoxStyle}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (!creative || !imgUrl) {
    return null;
  }

  return (
    <View style={[styles.shell, isSquare && styles.shellSquare, style]} accessibilityRole="summary">
      <View style={styles.partnerRow}>
        <Text style={styles.partnerTxt}>Publicité partenaire</Text>
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [imgWrapStyle, pressed && { opacity: 0.92 }]}
      >
        <Image
          source={{ uri: imgUrl }}
          style={styles.img}
          resizeMode={isSquare ? 'contain' : 'cover'}
          accessibilityLabel={creative.label || 'Publicité'}
        />
      </Pressable>
    </View>
  );
}

const BANNER_H = 100;

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  shellSquare: {
    maxWidth: SQUARE_BANNER_MAX,
    alignSelf: 'center',
    width: '100%',
  },
  partnerRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.1)',
  },
  partnerTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#6b7280',
  },
  imgWrapWide: {
    width: '100%',
    height: BANNER_H,
    backgroundColor: '#f1f5f9',
  },
  imgWrapSquare: {
    width: '100%',
    maxWidth: SQUARE_BANNER_MAX,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: '#f1f5f9',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  loadingBoxWide: {
    height: BANNER_H + 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBoxSquare: {
    width: '100%',
    maxWidth: SQUARE_BANNER_MAX,
    aspectRatio: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
