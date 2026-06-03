import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  PARTNER_BANNER_SQUARE,
  PARTNER_BANNER_WIDE,
} from '@/constants/partnerBannerDimensions';
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

/** Marge horizontale minimale pour ne pas déborder sur petits écrans. */
const HORIZONTAL_SAFE = spacing.lg * 2;

/**
 * Bandeau publicitaire — créatives API, KPI comptés comme **app mobile native**
 * (`clientSurface: native_app`). Dimensions fixes (320×100 ou 300×300), centrées
 * sur iPad pour éviter l’étirement pleine largeur.
 */
export function AppBannerSlot({ zone, analyticsPage, style }: Props) {
  const isSquare = zone === 'mid_square';
  const { width: screenWidth } = useWindowDimensions();
  const layout = useMemo(() => {
    const maxUsable = Math.max(0, screenWidth - HORIZONTAL_SAFE);
    if (isSquare) {
      const side = Math.min(PARTNER_BANNER_SQUARE.size, maxUsable || PARTNER_BANNER_SQUARE.size);
      return { wideW: 0, wideH: 0, squareSide: side };
    }
    const wideW = Math.min(PARTNER_BANNER_WIDE.width, maxUsable || PARTNER_BANNER_WIDE.width);
    const wideH = Math.round((PARTNER_BANNER_WIDE.height * wideW) / PARTNER_BANNER_WIDE.width);
    return { wideW, wideH, squareSide: PARTNER_BANNER_SQUARE.size };
  }, [isSquare, screenWidth]);

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

  const shellStyle = useMemo(
    () => [
      styles.shell,
      isSquare
        ? { width: layout.squareSide, alignSelf: 'center' as const }
        : { width: layout.wideW, alignSelf: 'center' as const },
      style,
    ],
    [isSquare, layout.squareSide, layout.wideW, style],
  );

  const imgWrapStyle = useMemo(
    () =>
      isSquare
        ? { width: layout.squareSide, height: layout.squareSide }
        : { width: layout.wideW, height: layout.wideH },
    [isSquare, layout.squareSide, layout.wideH, layout.wideW],
  );

  const loadingBoxStyle = useMemo(
    () => [
      styles.loadingBox,
      isSquare
        ? { width: layout.squareSide, height: layout.squareSide }
        : { width: layout.wideW, height: layout.wideH },
    ],
    [isSquare, layout.squareSide, layout.wideH, layout.wideW],
  );

  if (loading) {
    return (
      <View style={shellStyle}>
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
    <View style={shellStyle} accessibilityRole="summary">
      <View style={styles.partnerRow}>
        <Text style={styles.partnerTxt}>Publicité partenaire</Text>
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.imgWrap, imgWrapStyle, pressed && { opacity: 0.92 }]}
      >
        <Image
          source={{ uri: imgUrl }}
          style={styles.img}
          resizeMode="contain"
          accessibilityLabel={creative.label || 'Publicité'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    backgroundColor: '#fff',
    marginBottom: spacing.md,
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
  imgWrap: {
    alignSelf: 'center',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  loadingBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
});
