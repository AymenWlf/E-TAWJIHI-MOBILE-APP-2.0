import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { LoadingMiniIconSkeleton } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { getEstablishmentLogoUrl } from '@/constants/establishmentMedia';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { fetchLinkPreview } from '@/services/linkPreview';
import { getEstablishmentByIdSlug } from '@/services/establishments';
import { fetchContestAnnouncementDetail } from '@/services/contestAnnouncements';
import { globalWallLinkAbsoluteUrl } from '@/utils/globalWallLinkAbsoluteUrl';

type Props = {
  href: string;
  fallbackTitle: string;
  /** Bulle utilisateur (fond bleu) : carte plus contrastée */
  inMineBubble?: boolean;
};

type InternalKind = 'establishment' | 'contest_announcement' | 'generic';

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'e-tawjihi.ma';
  }
}

function parseInternalLink(href: string): { kind: InternalKind; id?: number; slug?: string } {
  const h = href.trim();
  // École: /etablissements/{id}/{slug}
  const est = h.match(/^\/etablissements\/(\d+)\/([^/?#]+)\b/i);
  if (est) {
    return { kind: 'establishment', id: Number(est[1]), slug: decodeURIComponent(est[2]) };
  }
  // Annonce concours: /annonces-concours/{id}-{slug...}
  const ann = h.match(/^\/annonces-concours\/(\d+)(?:\b|[-/])/i);
  if (ann) {
    return { kind: 'contest_announcement', id: Number(ann[1]) };
  }
  return { kind: 'generic' };
}

function faviconUrlFromHref(href: string): string | null {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, '');
    if (!host) return null;
    // Favicon service stable (retourne un PNG). Si bloqué, on retombe sur l'icône globe.
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

export function GlobalWallAttachedPagePreview({ href, fallbackTitle, inMineBubble }: Props) {
  const { locale, isRTL } = useLocale();
  const isWeb = href.startsWith('http://') || href.startsWith('https://');
  const absolutePreviewUrl = useMemo(() => (isWeb ? href : globalWallLinkAbsoluteUrl(href)), [href, isWeb]);
  const internal = useMemo(() => (isWeb ? { kind: 'generic' as const } : parseInternalLink(href)), [href, isWeb]);

  const [loading, setLoading] = useState(true);
  // Web preview
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);
  // Internal preview
  const [internalTitleFr, setInternalTitleFr] = useState<string | null>(null);
  const [internalTitleAr, setInternalTitleAr] = useState<string | null>(null);
  const [internalLogoUrl, setInternalLogoUrl] = useState<string | null>(null);
  const [logoBroken, setLogoBroken] = useState(false);
  const [faviconBroken, setFaviconBroken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (isWeb) {
      if (!absolutePreviewUrl) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setImgBroken(false);
      void fetchLinkPreview(absolutePreviewUrl).then((res) => {
        if (cancelled) return;
        if (res?.success) {
          setTitle(res.title?.trim() || null);
          setDescription(res.description?.trim() || null);
          setImageUrl(res.imageUrl?.trim() || null);
          setSiteName(res.siteName?.trim() || null);
        }
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    // Internal routes: no web preview fetch. We fetch specific data for école / annonce.
    setLoading(true);
    setLogoBroken(false);
    setInternalLogoUrl(null);
    setInternalTitleFr(null);
    setInternalTitleAr(null);
    if (internal.kind === 'establishment' && internal.id && internal.slug) {
      void getEstablishmentByIdSlug(internal.id, internal.slug)
        .then((e) => {
          if (cancelled) return;
          setInternalTitleFr(e.nom?.trim() || null);
          setInternalTitleAr(e.nomArabe?.trim() || null);
          setInternalLogoUrl(e.displayLogoUrl?.trim() || null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
    if (internal.kind === 'contest_announcement' && internal.id) {
      void fetchContestAnnouncementDetail(internal.id)
        .then((payload) => {
          if (cancelled) return;
          const d = payload?.detail;
          setInternalTitleFr(d?.title?.trim() || null);
          setInternalTitleAr(d?.titleAr?.trim() || null);
          const rawLogo = d?.establishment?.logo ?? null;
          setInternalLogoUrl(getEstablishmentLogoUrl(rawLogo) ?? null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    // Generic internal path
    setLoading(false);
    return () => {
      cancelled = true;
    };
  }, [absolutePreviewUrl, internal.id, internal.kind, internal.slug, isWeb]);

  const displayTitle = (title && title.length > 0 ? title : fallbackTitle).trim();
  const displaySite = (siteName && siteName.length > 0 ? siteName : hostLabel(absolutePreviewUrl)).trim();
  const displayInternalTitle =
    (locale === 'ar' ? internalTitleAr : internalTitleFr)?.trim() ||
    internalTitleFr?.trim() ||
    internalTitleAr?.trim() ||
    fallbackTitle.trim();

  if (isWeb) {
    const favicon = faviconUrlFromHref(href);
    const cardInner = (
      <View style={[styles.card, inMineBubble && styles.cardInMine]}>
        <View style={styles.rowBody}>
          <View style={styles.squareMedia}>
            {loading ? (
              <View style={styles.squarePlaceholder}>
                <LoadingMiniIconSkeleton size={28} />
              </View>
            ) : favicon && !faviconBroken ? (
              <Image
                source={{ uri: favicon }}
                style={styles.faviconImg}
                resizeMode="contain"
                onError={() => setFaviconBroken(true)}
              />
            ) : (
              <View style={styles.squareFallback}>
                <FontAwesome name="globe" size={20} color={brand.primary} />
              </View>
            )}
          </View>
          <View style={styles.cardBodyTight}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]} numberOfLines={2}>
              {displayTitle}
            </Text>
            {description && !loading ? (
              <Text style={[styles.cardDesc, isRTL && styles.rtl]} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
            <View style={styles.cardFooter}>
              <FontAwesome name="link" size={10} color={brand.textMuted} />
              <Text style={[styles.cardHost, isRTL && styles.rtl]} numberOfLines={1}>
                {displaySite}
              </Text>
              <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={10} color={brand.textMuted} />
            </View>
          </View>
        </View>
        {!loading && imageUrl && !imgBroken ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.ogImg}
            resizeMode="cover"
            onError={() => setImgBroken(true)}
          />
        ) : null}
      </View>
    );
    return (
      <Pressable
        onPress={() => void Linking.openURL(href)}
        style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.92 }]}
        accessibilityRole="link"
        accessibilityLabel={displayTitle}
      >
        {cardInner}
      </Pressable>
    );
  }

  const cardInner = (
    <View style={[styles.card, inMineBubble && styles.cardInMine]}>
      <View style={styles.rowBody}>
        <View style={styles.squareMedia}>
          {loading ? (
            <View style={styles.squarePlaceholder}>
              <LoadingMiniIconSkeleton size={28} />
            </View>
          ) : internalLogoUrl && !logoBroken ? (
            <Image
              source={{ uri: internalLogoUrl }}
              style={styles.logoImg}
              resizeMode="contain"
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <View style={styles.squareFallback}>
              <FontAwesome
                name={internal.kind === 'contest_announcement' ? 'bullhorn' : internal.kind === 'establishment' ? 'university' : 'file-text-o'}
                size={18}
                color={brand.primary}
              />
            </View>
          )}
        </View>
        <View style={styles.cardBodyTight}>
          <Text style={[styles.cardTitle, isRTL && styles.rtl]} numberOfLines={2}>
            {displayInternalTitle}
          </Text>
          <View style={styles.cardFooter}>
            <FontAwesome name="link" size={10} color={brand.textMuted} />
            <Text style={[styles.cardHost, isRTL && styles.rtl]} numberOfLines={1}>
              e-tawjihi.ma
            </Text>
            <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={10} color={brand.textMuted} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Link href={href as never} asChild>
      <Pressable style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.92 }]} accessibilityRole="link">
        {cardInner}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', marginBottom: spacing.sm },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInMine: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  rowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  squareMedia: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squarePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  squareFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  faviconImg: { width: 22, height: 22 },
  logoImg: { width: '100%', height: '100%' },
  cardBodyTight: { flex: 1, minWidth: 0, gap: 4 },
  ogImg: { width: '100%', height: 140, backgroundColor: brand.backgroundSoft },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardHost: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
});
