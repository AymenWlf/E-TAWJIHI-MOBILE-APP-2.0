import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { buildPublicPageUrl } from '@/constants/publicWeb';
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchLinkPreview } from '@/services/linkPreview';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type SharePreviewPayload = {
  /** Clé i18n pour le pastille « type » dans l’aperçu */
  kindLabelKey: HomeCopyKey;
  title: string;
  subtitle?: string;
  /** Chemin absolu sur le site (ex. `/etablissements/12/ensa`) */
  webPath: string;
  /** Vignette (cover, logo) — URL https pour un aperçu plus lisible */
  thumbUrl?: string | null;
};

type SharePreviewContextValue = {
  presentShare: (payload: SharePreviewPayload) => void;
  dismiss: () => void;
};

const SharePreviewContext = createContext<SharePreviewContextValue | null>(null);

function isHttpUrl(s: string | null | undefined): boolean {
  return typeof s === 'string' && /^https?:\/\//i.test(s.trim());
}

type OgPayload = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

export function useSharePreview(): SharePreviewContextValue {
  const ctx = useContext(SharePreviewContext);
  if (!ctx) {
    throw new Error('useSharePreview must be used within SharePreviewProvider');
  }
  return ctx;
}

export function SharePreviewProvider({ children }: { children: ReactNode }) {
  const { t, isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<SharePreviewPayload | null>(null);
  const [og, setOg] = useState<OgPayload | null>(null);
  const [ogLoading, setOgLoading] = useState(false);

  const dismiss = useCallback(() => {
    setOpen(false);
    setPayload(null);
    setOg(null);
    setOgLoading(false);
  }, []);

  const presentShare = useCallback((p: SharePreviewPayload) => {
    setPayload(p);
    setOg(null);
    setOgLoading(false);
    setOpen(true);
  }, []);

  const fullUrl = useMemo(
    () => (payload ? buildPublicPageUrl(payload.webPath) : ''),
    [payload],
  );

  const hostLabel = useMemo(() => {
    try {
      return new URL(fullUrl).host;
    } catch {
      return 'e-tawjihi.ma';
    }
  }, [fullUrl]);

  useEffect(() => {
    if (!open || !fullUrl) {
      setOg(null);
      setOgLoading(false);
      return;
    }
    let cancelled = false;
    setOgLoading(true);
    setOg(null);
    void (async () => {
      const res = await fetchLinkPreview(fullUrl);
      if (cancelled) return;
      setOgLoading(false);
      if (
        res &&
        res.success &&
        (res.title?.trim() || res.description?.trim() || res.imageUrl?.trim() || res.siteName?.trim())
      ) {
        setOg({
          title: res.title ?? null,
          description: res.description ?? null,
          imageUrl: res.imageUrl ?? null,
          siteName: res.siteName ?? null,
        });
      } else {
        setOg(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, fullUrl]);

  const displayImage = useMemo(() => {
    if (!payload) return null;
    if (isHttpUrl(og?.imageUrl ?? undefined)) return (og!.imageUrl as string).trim();
    if (isHttpUrl(payload.thumbUrl ?? undefined)) return (payload.thumbUrl as string).trim();
    return null;
  }, [payload, og]);

  const displayTitle = useMemo(() => {
    const fromOg = og?.title?.trim();
    if (fromOg) return fromOg;
    return payload?.title ?? '';
  }, [og, payload]);

  const displayDesc = useMemo(() => {
    const fromOg = og?.description?.trim();
    if (fromOg) return fromOg;
    return payload?.subtitle?.trim() ?? '';
  }, [og, payload]);

  const displaySite = useMemo(() => {
    const fromOg = og?.siteName?.trim();
    if (fromOg) return fromOg;
    return hostLabel;
  }, [og, hostLabel]);

  const onCopy = useCallback(() => {
    if (!fullUrl) return;
    Clipboard.setString(fullUrl);
    Alert.alert('', t('shareCopiedFeedback'));
  }, [fullUrl, t]);

  const onNativeShare = useCallback(async () => {
    if (!payload || !fullUrl) return;
    const lines = [payload.title, payload.subtitle?.trim(), fullUrl].filter(Boolean) as string[];
    const message = lines.join('\n\n');
    try {
      await Share.share(
        Platform.select({
          ios: { title: payload.title, url: fullUrl, message },
          default: { title: payload.title, message },
        }) ?? { message },
      );
    } catch {
      /* annulation utilisateur : ignorer */
    }
  }, [fullUrl, payload]);

  const value = useMemo(
    () => ({
      presentShare,
      dismiss,
    }),
    [presentShare, dismiss],
  );

  return (
    <SharePreviewContext.Provider value={value}>
      {children}
      <Modal visible={open} animationType="slide" transparent onRequestClose={dismiss}>
        <Pressable style={styles.backdrop} onPress={dismiss}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, isRTL && styles.rtl]}>{t('shareSheetTitle')}</Text>
            <Text style={[styles.sheetHint, isRTL && styles.rtl]}>{t('shareSheetPreviewHint')}</Text>

            {payload ? (
              <View style={styles.previewCard}>
                <View style={styles.waHero}>
                  {displayImage ? (
                    <Image
                      source={{ uri: displayImage }}
                      style={styles.waHeroImage}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : ogLoading ? (
                    <View
                      style={styles.waHeroPlaceholder}
                      accessibilityLabel={t('shareLinkPreviewLoading')}
                    >
                      <ActivityIndicator color={brand.primary} />
                    </View>
                  ) : (
                    <View style={styles.waHeroPlaceholder}>
                      <FontAwesome name="link" size={28} color={brand.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.waBody}>
                  <View style={[styles.previewTop, isRTL && styles.rowRtl]}>
                    <View style={styles.previewHostPill}>
                      <FontAwesome name="globe" size={11} color={brand.textMuted} />
                      <Text style={styles.previewHostTxt} numberOfLines={1}>
                        {displaySite}
                      </Text>
                    </View>
                    <View style={styles.kindPill}>
                      <Text style={styles.kindPillTxt} numberOfLines={1}>
                        {t(payload.kindLabelKey)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.previewTitle, isRTL && styles.rtl]} numberOfLines={4}>
                    {displayTitle}
                  </Text>
                  {displayDesc ? (
                    <Text style={[styles.previewSub, isRTL && styles.rtl]} numberOfLines={6}>
                      {displayDesc}
                    </Text>
                  ) : null}
                  <View style={styles.urlBox}>
                    <Text style={styles.urlDomain} numberOfLines={1}>
                      {hostLabel}
                    </Text>
                    <Text style={styles.urlTxt} selectable numberOfLines={3}>
                      {fullUrl}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={[styles.actions, isRTL && styles.rowRtl]}>
              <Pressable
                onPress={onCopy}
                style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.88 }]}
                accessibilityRole="button"
                accessibilityLabel={t('shareCopyLink')}
              >
                <>
                  <FontAwesome name="link" size={14} color={brand.primary} />
                  <Text style={styles.btnSecondaryTxt}>{t('shareCopyLink')}</Text>
                </>
              </Pressable>
              <Pressable
                onPress={() => void onNativeShare()}
                style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={t('shareNativeShare')}
              >
                <FontAwesome name="share-alt" size={14} color={brand.white} />
                <Text style={styles.btnPrimaryTxt}>{t('shareNativeShare')}</Text>
              </Pressable>
            </View>

            <Pressable onPress={dismiss} style={styles.closeTxtWrap}>
              <Text style={styles.closeTxt}>{t('accountLogoutCancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SharePreviewContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: brand.text,
    marginBottom: spacing.xs,
  },
  sheetHint: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  previewCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  waHero: {
    width: '100%',
    backgroundColor: brand.backgroundSoft,
  },
  waHeroImage: {
    width: '100%',
    height: 176,
    backgroundColor: brand.borderLight,
  },
  waHeroPlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
  },
  waBody: {
    padding: spacing.md,
    backgroundColor: brand.backgroundSoft,
  },
  previewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewHostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    maxWidth: '58%',
  },
  previewHostTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: brand.textMuted,
  },
  kindPill: {
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    maxWidth: '42%',
  },
  kindPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  previewSub: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  urlBox: {
    backgroundColor: brand.white,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  urlDomain: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  urlTxt: {
    fontSize: fontSize.xs,
    color: brand.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
    minHeight: 48,
  },
  btnSecondaryTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    minHeight: 48,
  },
  btnPrimaryTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.white,
  },
  closeTxtWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  closeTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.textMuted,
  },
});
