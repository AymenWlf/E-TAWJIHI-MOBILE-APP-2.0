import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useHeaderHeight } from '@react-navigation/elements';
import { Link, Redirect, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { ModalSearchWithApply } from '@/components/search/ModalSearchWithApply';
import { useAppliedTextSearch } from '@/hooks/useAppliedTextSearch';
import {
  CHAT_WALLPAPER_BG,
  ChatConversationBackground,
} from '@/components/chatbot/ChatConversationBackground';
import { GlobalWallAttachedPagePreview } from '@/components/global/GlobalWallAttachedPagePreview';
import { GlobalWallMessageAttachment } from '@/components/global/GlobalWallMessageAttachment';
import { GlobalWallMessageReactions } from '@/components/global/GlobalWallMessageReactions';
import { GlobalWallSenderReceipts } from '@/components/global/GlobalWallSenderReceipts';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import {
  LoadingCardStack,
  LoadingContentCardSkeleton,
  LoadingScreenPlaceholder,
} from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import {
  GLOBAL_WALL_ATTACH_MAIN_ENTRIES,
  type GlobalWallAttachSubmenu,
} from '@/constants/globalWallAttachPages';
import { GLOBAL_WALL_MOBILE_ENABLED } from '@/constants/mobileFeatureFlags';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalWallUnread } from '@/contexts/GlobalWallUnreadContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useGlobalWallLiveSync } from '@/hooks/useGlobalWallLiveSync';
import {
  collectGlobalWallSeenPayload,
  fetchGlobalWallPosts,
  GLOBAL_WALL_PAGE_SIZE,
  markGlobalWallSeen,
  mergeGlobalWallPage1,
  postGlobalWallPostReaction,
  postGlobalWallReply,
  postGlobalWallReplyReaction,
  postGlobalWallUserPost,
  type GlobalWallPost,
  type GlobalWallReactionSummary,
  type GlobalWallReply,
} from '@/services/globalWall';
import { normalizeDocumentPickerAsset, uploadGlobalWallAttachment } from '@/services/globalWallAttachments';
import {
  fetchContestAnnouncements,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import { listEstablishments, type EstablishmentNormalized } from '@/services/establishments';
import { fetchShopProducts } from '@/services/shop';
import { fetchPlatformEvents, type PlatformEventBrief } from '@/services/platformEvents';
import type { ShopProductListItem } from '@/types/shop';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { pickAnnouncementTypeLabel } from '@/utils/announcementTypeLabel';
import { webPathBoutiqueProduct, webPathContestAnnouncement, webPathEstablishment, webPathEvent } from '@/utils/sharePublicUrls';
import { resolvePlatformEventCoverUri } from '@/utils/platformEventCover';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { countNewGlobalWallMessages } from '@/utils/countNewGlobalWallMessages';
import { pickDocumentIcon } from '@/utils/documents';
import { getUserFacingApiFailureMessage } from '@/utils/apiError';
import { WhatsAppStyleOfficialBody } from '@/utils/whatsappStyleBody';

function dayKey(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toDateString();
  } catch {
    return '';
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDayLabel(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Ne pas ouvrir ImagePicker / DocumentPicker tant que le Modal « Pièce jointe » est visible :
 * sur iOS (souvent) et parfois Android, présenter le picker natif pendant la fermeture du Modal fait crasher l’app.
 */
function runAfterAttachModalDismissed(run: () => void) {
  InteractionManager.runAfterInteractions(() => {
    /** iOS : laisser le Modal se fermer avant le picker natif (sinon crash fréquent). */
    setTimeout(run, Platform.OS === 'ios' ? 480 : 160);
  });
}

function globalWallBodySnippet(body: string, maxLen = 52): string {
  const single = body.replace(/\s+/g, ' ').trim();
  if (!single) return '…';
  if (single.length <= maxLen) return single;
  return `${single.slice(0, maxLen)}…`;
}

function CommunauteScreenContent() {
  const { t, isRTL, locale } = useLocale();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { width: windowW, height: windowH } = useWindowDimensions();
  const [wallpaperSize, setWallpaperSize] = useState({ width: windowW, height: windowH });
  const { user, getValidAccessToken } = useAuth();
  const { registerGlobalWallPage1Seen } = useGlobalWallUnread();
  const [posts, setPosts] = useState<GlobalWallPost[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composerBody, setComposerBody] = useState('');
  const [composerLink, setComposerLink] = useState<{ path: string; label: string } | null>(null);
  const [composerPhoto, setComposerPhoto] = useState<{ uri: string; name: string; mime: string; size: number } | null>(null);
  const [composerDoc, setComposerDoc] = useState<{ uri: string; name: string; mime: string; size: number } | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [pickPageOpen, setPickPageOpen] = useState(false);
  const [attachModalStep, setAttachModalStep] = useState<'main' | GlobalWallAttachSubmenu>('main');
  const schoolSearch = useAppliedTextSearch();
  const [establishments, setEstablishments] = useState<EstablishmentNormalized[]>([]);
  const [establishmentsLoading, setEstablishmentsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<ContestAnnouncementCard[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [boutiqueProducts, setBoutiqueProducts] = useState<ShopProductListItem[]>([]);
  const [boutiqueLoading, setBoutiqueLoading] = useState(false);
  const boutiqueSearch = useAppliedTextSearch();
  const [platformEventsAll, setPlatformEventsAll] = useState<PlatformEventBrief[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const eventSearch = useAppliedTextSearch();
  const announcementSearch = useAppliedTextSearch();
  const [composerBusy, setComposerBusy] = useState(false);
  /** `null` = nouvelle publication sur le fil ; sinon réponse sous le post choisi (« Répondre ici »). */
  const [replyTargetPostId, setReplyTargetPostId] = useState<number | null>(null);

  const flatListRef = useRef<FlatList<GlobalWallPost>>(null);
  const postsRef = useRef<GlobalWallPost[]>([]);
  const nearBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false);
  const lastListContentHeightRef = useRef(0);
  const [nearBottom, setNearBottom] = useState(true);
  const [pendingBelowCount, setPendingBelowCount] = useState(0);
  const [reactionBusyKey, setReactionBusyKey] = useState<string | null>(null);

  const orderedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      return a.id - b.id;
    });
  }, [posts]);

  const replyTargetPost = useMemo(() => {
    if (replyTargetPostId == null) return null;
    return orderedPosts.find((x) => x.id === replyTargetPostId) ?? null;
  }, [orderedPosts, replyTargetPostId]);

  const filteredPlatformEvents = useMemo(() => {
    const q = eventSearch.applied.trim().toLowerCase();
    if (!q) return platformEventsAll;
    return platformEventsAll.filter((ev) => {
      const a = (ev.title ?? '').toLowerCase();
      const b = (ev.titleAr ?? '').toLowerCase();
      return a.includes(q) || b.includes(q);
    });
  }, [platformEventsAll, eventSearch.applied]);

  const filteredAnnouncements = useMemo(() => {
    const q = announcementSearch.applied.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter((c) => {
      const tit = (c.title ?? '').toLowerCase();
      const titAr = (c.titleAr ?? '').toLowerCase();
      const est = (c.establishment?.nom ?? '').toLowerCase();
      const typ = (c.announcementType ?? '').toLowerCase();
      return tit.includes(q) || titAr.includes(q) || est.includes(q) || typ.includes(q);
    });
  }, [announcements, announcementSearch.applied]);

  useEffect(() => {
    if (replyTargetPostId == null) return;
    if (!orderedPosts.some((p) => p.id === replyTargetPostId)) {
      setReplyTargetPostId(null);
    }
  }, [orderedPosts, replyTargetPostId]);

  useEffect(() => {
    if (loading || posts.length === 0 || didInitialScrollRef.current) {
      return;
    }
    didInitialScrollRef.current = true;
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        });
      });
    });
  }, [loading, posts.length]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    if (posts.length === 0) {
      lastListContentHeightRef.current = 0;
    }
  }, [posts.length]);

  const scrollToLatestEnd = useCallback(() => {
    nearBottomRef.current = true;
    setNearBottom(true);
    setPendingBelowCount(0);
    const scroll = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      });
    };
    InteractionManager.runAfterInteractions(scroll);
  }, []);

  /** Amène à la vue la publication (et son fil de réponses) après une réponse — pas le bas du fil global. */
  const scrollToPostAtIndex = useCallback((index: number) => {
    if (index < 0) return;
    nearBottomRef.current = false;
    setNearBottom(false);
    const scroll = () => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.06,
      });
    };
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(scroll);
      });
    });
  }, []);

  /**
   * Scroll vers le bas quand le contenu grandit (nouveau message) — uniquement si la hauteur augmente
   * pour éviter les scrollToEnd erratiques avec flexGrow / mesures progressives sur mobile.
   */
  const handleListContentSizeChange = useCallback((_w: number, h: number) => {
    if (!nearBottomRef.current) return;
    if (h <= lastListContentHeightRef.current) return;
    lastListContentHeightRef.current = h;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  const handleListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const threshold = 100;
    const atBottom =
      contentSize.height > 0 &&
      contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;
    nearBottomRef.current = atBottom;
    setNearBottom(atBottom);
    if (atBottom) {
      setPendingBelowCount(0);
    }
  }, []);

  const patchPostReactions = useCallback((postId: number, reactions: GlobalWallReactionSummary[]) => {
    setPosts((prev) => prev.map((x) => (x.id === postId ? { ...x, reactions } : x)));
  }, []);

  const patchReplyReactions = useCallback((postId: number, replyId: number, reactions: GlobalWallReactionSummary[]) => {
    setPosts((prev) =>
      prev.map((x) =>
        x.id === postId
          ? {
              ...x,
              replies: x.replies.map((r) => (r.id === replyId ? { ...r, reactions } : r)),
            }
          : x,
      ),
    );
  }, []);

  const submitPostReaction = useCallback(
    async (postId: number, emoji: string) => {
      if (postId <= 0) return;
      const token = await getValidAccessToken();
      if (!token) {
        Alert.alert('', t('globalWallLoginToReply'));
        return;
      }
      setReactionBusyKey(`p-${postId}`);
      try {
        const res = await postGlobalWallPostReaction(postId, emoji, token);
        if (res.success && res.data?.reactions) {
          patchPostReactions(postId, res.data.reactions);
        } else {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        }
      } catch {
        Alert.alert('', t('globalWallError'));
      } finally {
        setReactionBusyKey(null);
      }
    },
    [getValidAccessToken, patchPostReactions, t],
  );

  const submitReplyReaction = useCallback(
    async (postId: number, replyId: number, emoji: string) => {
      if (replyId <= 0) return;
      const token = await getValidAccessToken();
      if (!token) {
        Alert.alert('', t('globalWallLoginToReply'));
        return;
      }
      setReactionBusyKey(`r-${replyId}`);
      try {
        const res = await postGlobalWallReplyReaction(replyId, emoji, token);
        if (res.success && res.data?.reactions) {
          patchReplyReactions(postId, replyId, res.data.reactions);
        } else {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        }
      } catch {
        Alert.alert('', t('globalWallError'));
      } finally {
        setReactionBusyKey(null);
      }
    },
    [getValidAccessToken, patchReplyReactions, t],
  );

  useEffect(() => {
    if (!pickPageOpen) {
      setAttachModalStep('main');
      schoolSearch.clear();
      boutiqueSearch.clear();
      eventSearch.clear();
      announcementSearch.clear();
      setBoutiqueProducts([]);
      setPlatformEventsAll([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickPageOpen]);

  useEffect(() => {
    if (!attachMenuOpen) return;
    // Rien à faire pour l'instant, mais on garde ce hook pour d'éventuels resets.
  }, [attachMenuOpen]);

  useEffect(() => {
    if (!pickPageOpen || attachModalStep !== 'establishments') return;
    let cancelled = false;
    setEstablishmentsLoading(true);
    void listEstablishments({
      page: 1,
      limit: 60,
      search: schoolSearch.applied || undefined,
    })
      .then((res) => {
        if (!cancelled) setEstablishments(res.data);
      })
      .catch(() => {
        if (!cancelled) setEstablishments([]);
      })
      .finally(() => {
        if (!cancelled) setEstablishmentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickPageOpen, attachModalStep, debouncedSchoolSearch]);

  useEffect(() => {
    if (!pickPageOpen || attachModalStep !== 'announcements') return;
    let cancelled = false;
    setAnnouncementsLoading(true);
    void fetchContestAnnouncements()
      .then((result) => {
        if (!cancelled) setAnnouncements(result.items);
      })
      .catch(() => {
        if (!cancelled) setAnnouncements([]);
      })
      .finally(() => {
        if (!cancelled) setAnnouncementsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickPageOpen, attachModalStep]);

  useEffect(() => {
    if (!pickPageOpen || attachModalStep !== 'boutique') return;
    let cancelled = false;
    setBoutiqueLoading(true);
    void fetchShopProducts({
      page: 1,
      limit: 40,
      search: debouncedBoutiqueSearch || undefined,
    })
      .then(({ items }) => {
        if (!cancelled) setBoutiqueProducts(items);
      })
      .catch(() => {
        if (!cancelled) setBoutiqueProducts([]);
      })
      .finally(() => {
        if (!cancelled) setBoutiqueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickPageOpen, attachModalStep, boutiqueSearch.applied]);

  useEffect(() => {
    if (!pickPageOpen || attachModalStep !== 'events') return;
    let cancelled = false;
    setEventsLoading(true);
    void (async () => {
      try {
        const token = await getValidAccessToken();
        const rows = await fetchPlatformEvents(token ?? undefined, 'all');
        if (!cancelled) setPlatformEventsAll(rows);
      } catch {
        if (!cancelled) setPlatformEventsAll([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickPageOpen, attachModalStep, getValidAccessToken]);

  const load = useCallback(
    async (p: number, append: boolean) => {
      try {
        const token = await getValidAccessToken();
        const res = await fetchGlobalWallPosts(p, GLOBAL_WALL_PAGE_SIZE, token);
        if (res.success && res.data) {
          setPosts((prev) => {
            if (!append) {
              return res.data!.items;
            }
            const ids = new Set(prev.map((p) => p.id));
            const extra = res.data!.items.filter((p) => !ids.has(p.id));
            return [...prev, ...extra];
          });
          setTotal(res.data.total);
          setPage(res.data.page);
          if (!append && res.data.items.length > 0) {
            void registerGlobalWallPage1Seen(res.data.items);
          }
          if (token && res.data.items.some((it) => it.id > 0)) {
            const { postIds, replyIds } = collectGlobalWallSeenPayload(res.data.items);
            void markGlobalWallSeen({ postIds, replyIds }, token).catch(() => {});
          }
        } else {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        }
      } catch {
        Alert.alert('', t('globalWallError'));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [getValidAccessToken, registerGlobalWallPage1Seen, t],
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  const syncFirstPage = useCallback(async () => {
    const before = postsRef.current;
    try {
      const token = await getValidAccessToken();
      const res = await fetchGlobalWallPosts(1, GLOBAL_WALL_PAGE_SIZE, token);
      if (res.success && res.data) {
        const merged = mergeGlobalWallPage1(before, res.data.items);
        const added = countNewGlobalWallMessages(before, merged);
        setPosts(merged);
        setTotal(res.data.total);
        setPage(1);
        if (nearBottomRef.current && added > 0) {
          requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
        } else if (!nearBottomRef.current && added > 0) {
          setPendingBelowCount((c) => c + added);
        }
        if (res.data.items.length > 0) {
          void registerGlobalWallPage1Seen(res.data.items);
        }
        if (token && res.data.items.some((it) => it.id > 0)) {
          const { postIds, replyIds } = collectGlobalWallSeenPayload(res.data.items);
          void markGlobalWallSeen({ postIds, replyIds }, token).catch(() => {});
        }
      }
    } catch {
      // silencieux : prochain poll / refresh manuel
    }
  }, [getValidAccessToken, registerGlobalWallPage1Seen]);

  useGlobalWallLiveSync({
    enabled: !loading,
    syncFirstPage,
  });

  const onRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    void load(1, false);
  }, [load, refreshing]);

  /** Pages API = plus anciennes ; déclenché en scroll vers le haut (pas en bas). */
  const onLoadOlder = useCallback(() => {
    if (loading || loadingMore) return;
    if (posts.length === 0 || posts.length >= total) return;
    if (nearBottomRef.current) return;
    setLoadingMore(true);
    void load(page + 1, true);
  }, [load, loading, loadingMore, page, posts.length, total]);

  const communauteStackOptions = useMemo(
    () => ({
      title: t('globalWallTitle'),
      headerShown: true as const,
      headerBackTitle: t('tabHome'),
      headerStyle: { backgroundColor: brand.primary },
      headerTintColor: brand.white,
      headerTitleStyle: { color: brand.white, fontWeight: '700' as const },
      headerShadowVisible: false,
    }),
    [t],
  );

  const maxAttachmentBytes = 2 * 1024 * 1024;

  const pickPhoto = useCallback(async () => {
    if (composerBusy) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('', t('globalWallError'));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.92,
        /** iOS : images uniquement iCloud — sinon URI parfois illisible pour l’upload. */
        ...(Platform.OS === 'ios' ? { shouldDownloadFromNetwork: true } : {}),
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      const size = typeof a.fileSize === 'number' && a.fileSize > 0 ? a.fileSize : 0;
      /** iOS / certains URI ne fournissent pas la taille avant lecture ; on laisse passer et l’API peut refuser si trop gros. */
      if (size > maxAttachmentBytes) {
        Alert.alert('', 'Fichier trop volumineux (max 2MB).');
        return;
      }
      const uri = typeof a.uri === 'string' ? a.uri : '';
      if (!uri) {
        Alert.alert('', t('globalWallError'));
        return;
      }
      const name = (a.fileName ?? 'photo.jpg').trim() || 'photo.jpg';
      const mime = (a.mimeType ?? 'image/jpeg').trim() || 'image/jpeg';
      setComposerPhoto({ uri, name, mime, size });
    } catch {
      Alert.alert('', t('globalWallError'));
    }
  }, [composerBusy, t]);

  const pickDoc = useCallback(async () => {
    if (composerBusy) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true,
      });
      const a = normalizeDocumentPickerAsset(res);
      if (!a) return;
      const size = typeof a.size === 'number' ? a.size : 0;
      if (size > maxAttachmentBytes) {
        Alert.alert('', 'Fichier trop volumineux (max 2MB).');
        return;
      }
      const uri = typeof a.uri === 'string' ? a.uri.trim() : '';
      if (!uri) {
        Alert.alert('', t('globalWallError'));
        return;
      }
      const name = (a.name ?? 'document.pdf').trim() || 'document.pdf';
      const mime = (a.mimeType ?? 'application/pdf').trim() || 'application/pdf';
      setComposerDoc({ uri, name, mime, size });
    } catch {
      Alert.alert('', t('globalWallError'));
    }
  }, [composerBusy, t]);

  const onSendComposer = async () => {
    const text = composerBody.trim();
    const hasLink = composerLink != null;
    const hasAttachment = composerPhoto != null || composerDoc != null;
    if (!text && !hasLink && !hasAttachment) return;

    const token = await getValidAccessToken();
    if (!token) {
      Alert.alert('', t('globalWallLoginToReply'));
      return;
    }

    if (replyTargetPostId != null) {
      if (replyTargetPost == null) {
        return;
      }
      const targetPostId = replyTargetPostId;
      setComposerBusy(true);
      try {
        const photo =
          composerPhoto != null
            ? await uploadGlobalWallAttachment({
                kind: 'photo',
                uri: composerPhoto.uri,
                name: composerPhoto.name,
                mime: composerPhoto.mime,
                accessToken: token,
              })
            : null;
        if (photo && !photo.success) {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
          return;
        }
        const document =
          composerDoc != null
            ? await uploadGlobalWallAttachment({
                kind: 'document',
                uri: composerDoc.uri,
                name: composerDoc.name,
                mime: composerDoc.mime,
                accessToken: token,
              })
            : null;
        if (document && !document.success) {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
          return;
        }
        const res = await postGlobalWallReply(
          targetPostId,
          {
            body: text,
            linkUrl: composerLink?.path ?? undefined,
            linkLabel: composerLink?.label ?? undefined,
            photo: photo?.data ? { url: photo.data.url, name: photo.data.name, mime: photo.data.mime, size: photo.data.size ?? undefined } : null,
            document: document?.data ? { url: document.data.url, name: document.data.name, mime: document.data.mime, size: document.data.size ?? undefined } : null,
          },
          token,
        );
        if (res.success && res.data) {
          const postIndex = orderedPosts.findIndex((p) => p.id === targetPostId);
          setComposerBody('');
          setComposerLink(null);
          setComposerPhoto(null);
          setComposerDoc(null);
          setReplyTargetPostId(null);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === targetPostId
                ? { ...p, replies: [...p.replies, res.data!], replyCount: p.replyCount + 1 }
                : p,
            ),
          );
          if (postIndex >= 0) {
            scrollToPostAtIndex(postIndex);
          } else {
            scrollToLatestEnd();
          }
        } else {
          Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        }
      } catch {
        Alert.alert('', t('globalWallError'));
      } finally {
        setComposerBusy(false);
      }
      return;
    }

    setComposerBusy(true);
    try {
      const photo =
        composerPhoto != null
          ? await uploadGlobalWallAttachment({
              kind: 'photo',
              uri: composerPhoto.uri,
              name: composerPhoto.name,
              mime: composerPhoto.mime,
              accessToken: token,
            })
          : null;
      if (photo && !photo.success) {
        Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        return;
      }
      const document =
        composerDoc != null
          ? await uploadGlobalWallAttachment({
              kind: 'document',
              uri: composerDoc.uri,
              name: composerDoc.name,
              mime: composerDoc.mime,
              accessToken: token,
            })
          : null;
      if (document && !document.success) {
        Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
        return;
      }
      const res = await postGlobalWallUserPost(
        {
          body: text,
          linkUrl: composerLink?.path ?? undefined,
          linkLabel: composerLink?.label ?? undefined,
          photo: photo?.data ? { url: photo.data.url, name: photo.data.name, mime: photo.data.mime, size: photo.data.size ?? undefined } : null,
          document: document?.data ? { url: document.data.url, name: document.data.name, mime: document.data.mime, size: document.data.size ?? undefined } : null,
        },
        token,
      );
      if (res.success && res.data) {
        setComposerBody('');
        setComposerLink(null);
        setComposerPhoto(null);
        setComposerDoc(null);
        setPosts((prev) => [...prev, res.data!]);
        setTotal((n) => n + 1);
        scrollToLatestEnd();
      } else {
        Alert.alert('', getUserFacingApiFailureMessage(t, { context: 'globalWall' }));
      }
    } catch {
      Alert.alert('', t('globalWallError'));
    } finally {
      setComposerBusy(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <>
        <Stack.Screen options={communauteStackOptions} />
        <SafeAreaView style={[styles.center, { backgroundColor: CHAT_WALLPAPER_BG }]} edges={['bottom']}>
          <LoadingScreenPlaceholder count={4} isRTL={isRTL} />
        </SafeAreaView>
      </>
    );
  }

  /** Léger dégagement sous le dernier message (le composer est déjà en dessous de la liste). */
  const listBottomPad = spacing.sm + spacing.md;
  const hasComposerContent =
    composerBody.trim().length > 0 ||
    composerLink != null ||
    composerPhoto != null ||
    composerDoc != null;
  const replyTargetStillPresent =
    replyTargetPostId == null || orderedPosts.some((p) => p.id === replyTargetPostId);
  const canSendComposer = hasComposerContent && replyTargetStillPresent;

  return (
    <>
      <Stack.Screen options={communauteStackOptions} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <View
          style={styles.wallpaperSlot}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setWallpaperSize({ width, height });
          }}
        >
          <View style={styles.wallpaperLayer} pointerEvents="none">
            <ChatConversationBackground width={wallpaperSize.width} height={wallpaperSize.height} />
          </View>
        <FlatList
          ref={flatListRef}
          data={orderedPosts}
          keyExtractor={(item) => `gw-${item.id}`}
          onScrollToIndexFailed={(info) => {
            const offset = Math.max(0, info.averageItemLength * info.index);
            flatListRef.current?.scrollToOffset({ offset, animated: true });
          }}
          style={styles.flatTransparent}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: listBottomPad },
            orderedPosts.length === 0 && styles.listContentGrow,
          ]}
          // iOS : bounce même si le fil est court → pull-to-refresh utilisable
          alwaysBounceVertical
          {...(Platform.OS === 'android' ? { overScrollMode: 'always' as const } : {})}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onScroll={handleListScroll}
          onContentSizeChange={handleListContentSizeChange}
          removeClippedSubviews={false}
          initialNumToRender={16}
          maxToRenderPerBatch={12}
          windowSize={21}
          scrollEventThrottle={16}
          refreshControl={
            <AppRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              title={Platform.OS === 'ios' ? t('globalWallPullToRefresh') : undefined}
            />
          }
          onStartReachedThreshold={0.25}
          onStartReached={() => {
            if (refreshing || loading || loadingMore) return;
            if (posts.length > 0 && posts.length < total) void onLoadOlder();
          }}
          ListHeaderComponent={
            loadingMore ? (
              <LoadingContentCardSkeleton isRTL={isRTL} style={styles.historyLoader} />
            ) : null
          }
          ListEmptyComponent={
            !loading && posts.length === 0 ? (
              <View style={styles.listEmptyWrap}>
                <Text style={styles.listEmptyTitle}>{t('globalWallEmpty')}</Text>
                <Text style={styles.listEmptySub}>{t('globalWallIntro')}</Text>
              </View>
            ) : null
          }
          renderItem={({ item: p, index }) => {
              const prev = index > 0 ? orderedPosts[index - 1] : null;
              const showDay = !prev || dayKey(p.createdAt) !== dayKey(prev.createdAt);
              const uid = user?.id;
              const postMine = uid != null && p.author != null && uid === p.author.id;
              const authorLabel = p.author?.displayName ?? 'E‑TAWJIHI';
              const avatarLetter = authorLabel.trim().charAt(0).toUpperCase() || '?';

              return (
                <View>
                  {showDay ? (
                    <View style={styles.dayPillWrap}>
                      <View style={styles.dayPill}>
                        <Text style={styles.dayPillTxt}>{formatDayLabel(p.createdAt)}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View
                    style={[styles.postWrap, replyTargetPostId === p.id ? styles.postWrapReplyTarget : undefined]}
                  >
                    <View style={postMine ? styles.postRowMine : styles.postRowOther}>
                      {!postMine ? (
                        <View style={styles.avatarOther}>
                          <Text style={styles.avatarOtherTxt}>{avatarLetter}</Text>
                        </View>
                      ) : null}
                      <View style={styles.postColumn}>
                        <View
                          style={
                            Platform.OS === 'web'
                              ? [styles.postBubbleRow, postMine && styles.postBubbleRowMine]
                              : undefined
                          }
                        >
                          <View style={Platform.OS === 'web' ? styles.bubbleOuterWeb : undefined}>
                            <View
                              style={[
                                styles.officialBubble,
                                postMine ? styles.officialBubbleMine : styles.officialBubbleOther,
                              ]}
                            >
                          <View style={[styles.officialMeta, isRTL && styles.rowRtl]}>
                            <Text style={[styles.officialName, postMine && styles.officialNameMine]}>{authorLabel}</Text>
                            <View style={[styles.officialMetaRight, isRTL && styles.rowRtl]}>
                              <Text style={[styles.timeMuted, postMine && styles.timeMutedMine]}>
                                {formatTime(p.createdAt)}
                              </Text>
                              {postMine && p.senderStats ? (
                                <GlobalWallSenderReceipts
                                  stats={p.senderStats}
                                  variant="mine"
                                  viewsLabel={t('globalWallSenderViews').replace(
                                    '{{count}}',
                                    String(p.senderStats.viewCount),
                                  )}
                                />
                              ) : null}
                            </View>
                          </View>
                          {p.linkUrl ? (
                            <GlobalWallAttachedPagePreview
                              href={p.linkUrl}
                              fallbackTitle={p.linkLabel ?? p.linkUrl}
                              inMineBubble={postMine}
                            />
                          ) : null}
                          {Array.isArray(p.attachments) && p.attachments.length > 0 ? (
                            <View style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
                              {p.attachments.map((a) => (
                                <GlobalWallMessageAttachment
                                  key={`${a.kind}-${a.url}`}
                                  attachment={a}
                                  isRTL={isRTL}
                                  errorLabel={t('globalWallError')}
                                />
                              ))}
                            </View>
                          ) : null}
                          <WhatsAppStyleOfficialBody
                            text={p.body}
                            baseStyle={StyleSheet.flatten([
                              styles.officialBody,
                              postMine && styles.officialBodyMine,
                            ])}
                            isRTL={isRTL}
                            inMineBubble={postMine}
                          />
                          {p.share ? (
                            <Link href={p.share.path as never} asChild>
                              <Pressable
                                style={({ pressed }) => [
                                  styles.shareChip,
                                  postMine && styles.shareChipMine,
                                  pressed && { opacity: 0.9 },
                                ]}
                              >
                                <FontAwesome
                                  name={p.share.type === 'establishment' ? 'university' : 'bullhorn'}
                                  size={12}
                                  color={
                                    postMine
                                      ? 'rgba(255,255,255,0.92)'
                                      : p.share.type === 'establishment'
                                        ? brand.primary
                                        : brand.emerald
                                  }
                                />
                                <Text
                                  style={[
                                    styles.shareChipTxt,
                                    postMine && styles.shareChipTxtMine,
                                    isRTL && styles.rtl,
                                  ]}
                                  numberOfLines={2}
                                >
                                  {p.share.title}
                                </Text>
                                <FontAwesome
                                  name="chevron-right"
                                  size={10}
                                  color={postMine ? 'rgba(255,255,255,0.65)' : brand.textMuted}
                                />
                              </Pressable>
                            </Link>
                          ) : null}
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('globalWallReplyHere')}
                            onPress={() => setReplyTargetPostId(p.id)}
                            style={({ pressed }) => [
                              styles.replyHereRow,
                              postMine && styles.replyHereRowMine,
                              pressed && { opacity: 0.85 },
                              isRTL && styles.rowRtl,
                            ]}
                          >
                            <FontAwesome
                              name="reply"
                              size={12}
                              color={
                                postMine
                                  ? replyTargetPostId === p.id
                                    ? brand.white
                                    : 'rgba(255,255,255,0.82)'
                                  : replyTargetPostId === p.id
                                    ? brand.primary
                                    : brand.textMuted
                              }
                            />
                            <Text
                              style={[
                                styles.replyHereTxt,
                                postMine && styles.replyHereTxtMine,
                                replyTargetPostId === p.id &&
                                  (postMine ? styles.replyHereTxtSelectedMine : styles.replyHereTxtSelected),
                                isRTL && styles.rtl,
                              ]}
                            >
                              {t('globalWallReplyHere')}
                            </Text>
                          </Pressable>
                          <GlobalWallMessageReactions
                            reactions={p.reactions ?? []}
                            mineBubble={postMine}
                            disabled={p.id < 0}
                            busy={reactionBusyKey === `p-${p.id}`}
                            addLabel={t('globalWallReactionPick')}
                            onPick={(emoji) => void submitPostReaction(p.id, emoji)}
                            variant="main"
                            isRTL={isRTL}
                          />
                            </View>
                          </View>

                        </View>

                      <View style={[styles.threadBox, postMine && styles.threadBoxMine]}>
                        <Text style={styles.threadTitle}>
                          {t('globalWallReplies')} · {p.replyCount}
                        </Text>
                        {p.replies.map((r: GlobalWallReply) => {
                          const mine = uid != null && r.author.id === uid;
                          const lu = r.linkUrl ?? null;
                          const ll = r.linkLabel ?? null;
                          return (
                            <View
                              key={r.id}
                              style={[styles.replyAlign, mine ? styles.replyAlignEnd : styles.replyAlignStart]}
                            >
                              <View
                                style={[
                                  styles.replyStack,
                                  Platform.OS === 'web' && styles.replyBubbleRow,
                                  Platform.OS === 'web' && mine && styles.replyBubbleRowMine,
                                ]}
                              >
                                <View style={Platform.OS === 'web' ? styles.bubbleOuterWeb : undefined}>
                                  <View style={[styles.replyBubble, mine ? styles.replyBubbleMine : styles.replyBubbleOther]}>
                                  {!mine ? <Text style={styles.replyAuthor}>{r.author.displayName}</Text> : null}
                                  {lu ? (
                                    <GlobalWallAttachedPagePreview
                                      href={lu}
                                      fallbackTitle={ll ?? lu}
                                      inMineBubble={mine}
                                    />
                                  ) : null}
                                  {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                                    <View style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
                                      {r.attachments.map((a) => (
                                        <GlobalWallMessageAttachment
                                          key={`${a.kind}-${a.url}`}
                                          attachment={a}
                                          isRTL={isRTL}
                                          errorLabel={t('globalWallError')}
                                        />
                                      ))}
                                    </View>
                                  ) : null}
                                  {r.body ? (
                                    <WhatsAppStyleOfficialBody
                                      text={r.body}
                                      baseStyle={StyleSheet.flatten([
                                        styles.replyBody,
                                        mine && styles.replyBodyMine,
                                      ])}
                                      isRTL={isRTL}
                                      inMineBubble={mine}
                                    />
                                  ) : null}
                                  <View style={[styles.replyFooterRow, mine && styles.replyFooterRowMine, isRTL && styles.rowRtl]}>
                                    <Text style={[styles.replyTime, mine && styles.replyTimeMine]}>{formatTime(r.createdAt)}</Text>
                                    {mine && r.senderStats ? (
                                      <GlobalWallSenderReceipts
                                        stats={r.senderStats}
                                        variant="mine"
                                        viewsLabel={t('globalWallSenderViews').replace(
                                          '{{count}}',
                                          String(r.senderStats.viewCount),
                                        )}
                                      />
                                    ) : null}
                                  </View>
                                  <GlobalWallMessageReactions
                                    reactions={r.reactions ?? []}
                                    mineBubble={mine}
                                    disabled={r.id < 0}
                                    busy={reactionBusyKey === `r-${r.id}`}
                                    addLabel={t('globalWallReactionPick')}
                                    onPick={(emoji) => void submitReplyReaction(p.id, r.id, emoji)}
                                    variant="reply"
                                    isRTL={isRTL}
                                  />
                                </View>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                      </View>
                      {postMine ? (
                        <View style={styles.avatarMine}>
                          <Text style={styles.avatarMineTxt}>{avatarLetter}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            }}
        />
        </View>

        {orderedPosts.length > 0 && (!nearBottom || pendingBelowCount > 0) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              pendingBelowCount > 0
                ? t('globalWallNewMessagesCount').replace('{{count}}', String(pendingBelowCount))
                : t('globalWallScrollToBottom')
            }
            onPress={scrollToLatestEnd}
            style={({ pressed }) => [
              styles.jumpFab,
              { bottom: 148 + insets.bottom },
              pressed && { opacity: 0.92 },
            ]}
          >
            <FontAwesome name="chevron-down" size={15} color={brand.white} />
            {pendingBelowCount > 0 ? (
              <Text style={styles.jumpFabBadgeTxt}>
                {pendingBelowCount > 99 ? '99+' : pendingBelowCount}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        <View style={[styles.dockOuter, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {replyTargetPost != null ? (
            <View style={[styles.replyTargetBanner, isRTL && styles.rowRtl]}>
              <FontAwesome name="reply" size={13} color={brand.primary} style={styles.replyTargetBannerIcon} />
              <Text style={[styles.replyTargetBannerTxt, isRTL && styles.rtl]} numberOfLines={2}>
                {t('globalWallReplyingToBanner').replace('{{snippet}}', globalWallBodySnippet(replyTargetPost.body))}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('globalWallCancelReplyTarget')}
                onPress={() => setReplyTargetPostId(null)}
                hitSlop={10}
                style={({ pressed }) => [styles.replyTargetBannerClear, pressed && { opacity: 0.75 }]}
              >
                <FontAwesome name="times" size={16} color={brand.textMuted} />
              </Pressable>
            </View>
          ) : null}
          <View style={[styles.dockInner, isRTL && styles.rowRtl]}>
            <Pressable
              onPress={() => setAttachMenuOpen(true)}
              style={({ pressed }) => [styles.dockAttach, pressed && { opacity: 0.88 }]}
              accessibilityLabel="Attacher"
            >
              <FontAwesome name="paperclip" size={18} color={brand.primary} />
            </Pressable>
            <View style={styles.dockFieldCol}>
              {composerLink ? (
                <Pressable onPress={() => setComposerLink(null)} style={styles.dockAttachedPill}>
                  <FontAwesome name="link" size={11} color={brand.primary} />
                  <Text style={styles.dockAttachedPillTxt} numberOfLines={1}>
                    {composerLink.label}
                  </Text>
                  <Text style={styles.dockAttachedClear}>{t('globalWallClearAttachedPage')}</Text>
                </Pressable>
              ) : null}
              {composerPhoto ? (
                <Pressable onPress={() => setComposerPhoto(null)} style={styles.dockAttachedPill}>
                  <FontAwesome name="image" size={11} color={brand.primary} />
                  <Text style={styles.dockAttachedPillTxt} numberOfLines={1}>
                    {composerPhoto.name}
                  </Text>
                  <Text style={styles.dockAttachedClear}>×</Text>
                </Pressable>
              ) : null}
              {composerDoc ? (
                <Pressable onPress={() => setComposerDoc(null)} style={styles.dockAttachedPill}>
                  <FontAwesome name={pickDocumentIcon(composerDoc.name)} size={11} color={brand.primary} />
                  <Text style={styles.dockAttachedPillTxt} numberOfLines={1}>
                    {composerDoc.name}
                  </Text>
                  <Text style={styles.dockAttachedClear}>×</Text>
                </Pressable>
              ) : null}
              <TextInput
                style={[styles.dockInput, isRTL && styles.rtlInput]}
                placeholder={
                  replyTargetPostId != null ? t('globalWallReplyPlaceholder') : t('globalWallComposerPlaceholder')
                }
                placeholderTextColor={brand.textMuted}
                value={composerBody}
                onChangeText={setComposerBody}
                multiline
                maxLength={2000}
                editable={!composerBusy}
              />
            </View>
            <Pressable
              onPress={() => void onSendComposer()}
              disabled={composerBusy || !canSendComposer}
              style={({ pressed }) => [
                styles.sendFab,
                pressed && { opacity: 0.9 },
                (composerBusy || !canSendComposer) && { opacity: 0.45 },
              ]}
            >
              {composerBusy ? (
                <ActivityIndicator color={brand.white} size="small" />
              ) : (
                <FontAwesome name="send" size={15} color={brand.white} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={pickPageOpen} animationType="slide" transparent onRequestClose={() => setPickPageOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickPageOpen(false)} accessibilityLabel={t('modalClose')} />
          <SafeAreaView edges={['bottom']} style={styles.modalCard}>
            <View
              style={[
                styles.modalHeaderTri,
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <View style={styles.modalHeaderSlot}>
                {attachModalStep !== 'main' ? (
                  <Pressable onPress={() => setAttachModalStep('main')} hitSlop={12}>
                    <Text style={styles.modalBack}>{t('globalWallAttachBack')}</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={[styles.modalTitleCenter, isRTL && styles.rtl]} numberOfLines={1}>
                {t('globalWallPickPageTitle')}
              </Text>
              <View style={[styles.modalHeaderSlot, styles.modalHeaderSlotEnd]}>
                <Pressable onPress={() => setPickPageOpen(false)} hitSlop={12}>
                  <Text style={styles.modalClose}>{t('globalWallPickClose')}</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalScroll}>
              {attachModalStep === 'main' ? (
                <>
                  <Text style={[styles.attachSectionTitle, isRTL && styles.rtl]}>
                    {t('globalWallAttachMainPagesSection')}
                  </Text>
                  {GLOBAL_WALL_ATTACH_MAIN_ENTRIES.flatMap((entry) => {
                    if (entry.kind === 'leaf') {
                      return [
                        <Pressable
                          key={entry.path}
                          onPress={() => {
                            setComposerLink({ path: entry.path, label: t(entry.labelKey) });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t(entry.labelKey)}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                      ];
                    }

                    // Branch = 2 accès : page listing + sous-sélection (recherche)
                    if (entry.submenu === 'establishments') {
                      return [
                        <Pressable
                          key="main-establishments-listing"
                          onPress={() => {
                            setComposerLink({
                              path: '/etablissements',
                              label: t('globalWallAttachSchoolsListing'),
                            });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachSchoolsListing')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                        <Pressable
                          key="main-establishments-sub"
                          onPress={() => setAttachModalStep('establishments')}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachSeeDetails')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                      ];
                    }

                    if (entry.submenu === 'announcements') {
                      return [
                        <Pressable
                          key="main-announcements-listing"
                          onPress={() => {
                            setComposerLink({
                              path: '/annonces-concours',
                              label: t('globalWallAttachAnnouncementsListing'),
                            });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachAnnouncementsListing')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                        <Pressable
                          key="main-announcements-sub"
                          onPress={() => setAttachModalStep('announcements')}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachSeeDetails')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                      ];
                    }

                    if (entry.submenu === 'boutique') {
                      return [
                        <Pressable
                          key="main-boutique-listing"
                          onPress={() => {
                            setComposerLink({
                              path: '/boutique',
                              label: t('globalWallAttachBoutiqueListing'),
                            });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachBoutiqueListing')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                        <Pressable
                          key="main-boutique-sub"
                          onPress={() => setAttachModalStep('boutique')}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachSeeDetails')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                      ];
                    }

                    if (entry.submenu === 'events') {
                      return [
                        <Pressable
                          key="main-events-listing"
                          onPress={() => {
                            setComposerLink({
                              path: '/evenements',
                              label: t('globalWallAttachEventsListing'),
                            });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachEventsListing')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                        <Pressable
                          key="main-events-sub"
                          onPress={() => setAttachModalStep('events')}
                          style={({ pressed }) => [
                            styles.attachRow,
                            isRTL && styles.rowRtl,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                            {t('globalWallAttachSeeDetails')}
                          </Text>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>,
                      ];
                    }

                    return [];
                  })}
                </>
              ) : attachModalStep === 'establishments' ? (
                <>
                  <Text style={[styles.attachSectionTitle, isRTL && styles.rtl]}>
                    {t('globalWallPickSchoolsSection')}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setComposerLink({
                        path: '/etablissements',
                        label: t('globalWallAttachSchoolsListing'),
                      });
                      setPickPageOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.attachRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                      {t('globalWallAttachSchoolsListing')}
                    </Text>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                  <ModalSearchWithApply
                    value={schoolSearch.draft}
                    onChangeText={schoolSearch.setDraft}
                    onApply={schoolSearch.apply}
                    placeholder={t('globalWallSearchSchoolsPlaceholder')}
                    applyLabel={t('schoolsApply')}
                    showApply={schoolSearch.hasPending || schoolSearch.draft.trim().length > 0}
                    isRTL={isRTL}
                  />
                  {establishmentsLoading ? (
                    <LoadingCardStack count={2} isRTL={isRTL} style={{ marginVertical: spacing.md }} />
                  ) : establishments.length === 0 ? (
                    <Text style={[styles.attachEmpty, isRTL && styles.rtl]}>{t('globalWallEmpty')}</Text>
                  ) : (
                    establishments.map((e) => (
                      <Pressable
                        key={e.id}
                        onPress={() => {
                          const slug = String(e.slug ?? '').trim() || 'fiche';
                          setComposerLink({
                            path: webPathEstablishment(e.id, slug),
                            label: e.sigle ? `${e.nom} (${e.sigle})` : e.nom,
                          });
                          setPickPageOpen(false);
                        }}
                        style={({ pressed }) => [styles.attachRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                      >
                        <Image source={{ uri: e.displayLogoUrl }} style={styles.attachRowLogo} resizeMode="contain" />
                        <View style={styles.attachRowTxtCol}>
                          <Text style={[styles.attachRowTitle, isRTL && styles.rtl]} numberOfLines={2}>
                            {e.sigle ? `${e.nom} (${e.sigle})` : e.nom}
                          </Text>
                          {e.villesListe?.length ? (
                            <Text style={[styles.attachRowSub, isRTL && styles.rtl]} numberOfLines={1}>
                              {e.villesListe.join(' · ')}
                            </Text>
                          ) : null}
                        </View>
                        <FontAwesome
                          name={isRTL ? 'chevron-left' : 'chevron-right'}
                          size={12}
                          color={brand.textMuted}
                        />
                      </Pressable>
                    ))
                  )}
                </>
              ) : attachModalStep === 'boutique' ? (
                <>
                  <Text style={[styles.attachSectionTitle, isRTL && styles.rtl]}>
                    {t('globalWallPickBoutiqueSection')}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setComposerLink({
                        path: '/boutique',
                        label: t('globalWallAttachBoutiqueListing'),
                      });
                      setPickPageOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.attachRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                      {t('globalWallAttachBoutiqueListing')}
                    </Text>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                  <ModalSearchWithApply
                    value={boutiqueSearch.draft}
                    onChangeText={boutiqueSearch.setDraft}
                    onApply={boutiqueSearch.apply}
                    placeholder={t('globalWallSearchBoutiquePlaceholder')}
                    applyLabel={t('schoolsApply')}
                    showApply={boutiqueSearch.hasPending || boutiqueSearch.draft.trim().length > 0}
                    isRTL={isRTL}
                  />
                  {boutiqueLoading ? (
                    <LoadingCardStack count={2} isRTL={isRTL} style={{ marginVertical: spacing.md }} />
                  ) : boutiqueProducts.length === 0 ? (
                    <Text style={[styles.attachEmpty, isRTL && styles.rtl]}>{t('globalWallEmpty')}</Text>
                  ) : (
                    boutiqueProducts.map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => {
                          setComposerLink({
                            path: webPathBoutiqueProduct(p.slug),
                            label: p.title,
                          });
                          setPickPageOpen(false);
                        }}
                        style={({ pressed }) => [styles.attachRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                      >
                        <Image
                          source={{ uri: shopProductPrimaryImage(p.images) }}
                          style={styles.attachRowLogo}
                          resizeMode="contain"
                        />
                        <View style={styles.attachRowTxtCol}>
                          <Text style={[styles.attachRowTitle, isRTL && styles.rtl]} numberOfLines={2}>
                            {p.title}
                          </Text>
                          <Text style={[styles.attachRowSub, isRTL && styles.rtl]} numberOfLines={1}>
                            {p.price}
                            {p.currency ? ` ${p.currency}` : ''}
                          </Text>
                        </View>
                        <FontAwesome
                          name={isRTL ? 'chevron-left' : 'chevron-right'}
                          size={12}
                          color={brand.textMuted}
                        />
                      </Pressable>
                    ))
                  )}
                </>
              ) : attachModalStep === 'events' ? (
                <>
                  <Text style={[styles.attachSectionTitle, isRTL && styles.rtl]}>
                    {t('globalWallPickEventsSection')}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setComposerLink({
                        path: '/evenements',
                        label: t('globalWallAttachEventsListing'),
                      });
                      setPickPageOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.attachRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                      {t('globalWallAttachEventsListing')}
                    </Text>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                  <ModalSearchWithApply
                    value={eventSearch.draft}
                    onChangeText={eventSearch.setDraft}
                    onApply={eventSearch.apply}
                    placeholder={t('globalWallSearchEventsPlaceholder')}
                    applyLabel={t('schoolsApply')}
                    showApply={eventSearch.hasPending || eventSearch.draft.trim().length > 0}
                    isRTL={isRTL}
                  />
                  {eventsLoading ? (
                    <LoadingCardStack count={2} isRTL={isRTL} style={{ marginVertical: spacing.md }} />
                  ) : filteredPlatformEvents.length === 0 ? (
                    <Text style={[styles.attachEmpty, isRTL && styles.rtl]}>{t('globalWallEmpty')}</Text>
                  ) : (
                    filteredPlatformEvents.map((ev) => {
                      const title = locale === 'ar' && ev.titleAr?.trim() ? ev.titleAr.trim() : ev.title;
                      let sub = '';
                      try {
                        sub = new Date(ev.startsAt).toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        sub = ev.startsAt;
                      }
                      return (
                        <Pressable
                          key={ev.id}
                          onPress={() => {
                            setComposerLink({
                              path: webPathEvent(ev.id),
                              label: title,
                            });
                            setPickPageOpen(false);
                          }}
                          style={({ pressed }) => [styles.attachRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                        >
                          <Image
                            source={{ uri: resolvePlatformEventCoverUri(ev) }}
                            style={styles.attachRowLogo}
                            resizeMode="cover"
                          />
                          <View style={styles.attachRowTxtCol}>
                            <Text style={[styles.attachRowTitle, isRTL && styles.rtl]} numberOfLines={2}>
                              {title}
                            </Text>
                            {sub ? (
                              <Text style={[styles.attachRowSub, isRTL && styles.rtl]} numberOfLines={1}>
                                {sub}
                              </Text>
                            ) : null}
                          </View>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.attachSectionTitle, isRTL && styles.rtl]}>
                    {t('globalWallPickAnnouncementsSection')}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setComposerLink({
                        path: '/annonces-concours',
                        label: t('globalWallAttachAnnouncementsListing'),
                      });
                      setPickPageOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.attachRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={[styles.attachRowTitle, styles.attachMainLeafLabel, isRTL && styles.rtl]}>
                      {t('globalWallAttachAnnouncementsListing')}
                    </Text>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                  {announcementsLoading ? (
                    <LoadingCardStack count={2} isRTL={isRTL} style={{ marginVertical: spacing.md }} />
                  ) : announcements.length === 0 ? (
                    <Text style={[styles.attachEmpty, isRTL && styles.rtl]}>{t('globalWallEmpty')}</Text>
                  ) : (
                    announcements.map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => {
                          const estNom = c.establishment?.nom ?? '';
                          setComposerLink({
                            path: webPathContestAnnouncement(c.id, c.title, estNom),
                            label: c.title,
                          });
                          setPickPageOpen(false);
                        }}
                        style={({ pressed }) => [styles.attachRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                      >
                        <View style={styles.attachAnnIcon}>
                          <FontAwesome name="bullhorn" size={16} color={brand.emerald} />
                        </View>
                        <View style={styles.attachRowTxtCol}>
                          <Text style={[styles.attachRowTitle, isRTL && styles.rtl]} numberOfLines={2}>
                            {c.title}
                          </Text>
                          {c.establishment?.nom ? (
                            <Text style={[styles.attachRowSub, isRTL && styles.rtl]} numberOfLines={1}>
                              {c.establishment.nom}
                            </Text>
                          ) : null}
                          <Text style={[styles.attachAnnType, isRTL && styles.rtl]} numberOfLines={1}>
                            {pickAnnouncementTypeLabel(c.announcementType, t)}
                          </Text>
                        </View>
                        <FontAwesome
                          name={isRTL ? 'chevron-left' : 'chevron-right'}
                          size={12}
                          color={brand.textMuted}
                        />
                      </Pressable>
                    ))
                  )}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={attachMenuOpen} animationType="fade" transparent onRequestClose={() => setAttachMenuOpen(false)}>
        <View style={styles.menuRoot}>
          <Pressable style={styles.menuBackdrop} onPress={() => setAttachMenuOpen(false)} accessibilityLabel={t('modalClose')} />
          <SafeAreaView edges={['bottom']} style={styles.menuCard}>
            <Text style={[styles.menuTitle, isRTL && styles.rtl]}>{t('globalWallAttachPage')}</Text>
            <Pressable
              onPress={() => {
                setAttachMenuOpen(false);
                setPickPageOpen(true);
              }}
              style={({ pressed }) => [styles.menuRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
            >
              <FontAwesome name="link" size={16} color={brand.primary} />
              <Text style={[styles.menuRowTxt, isRTL && styles.rtl]} numberOfLines={1}>
                {t('globalWallAttachPage')}
              </Text>
              <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.textMuted} />
            </Pressable>
            <Pressable
              onPress={() => {
                setAttachMenuOpen(false);
                runAfterAttachModalDismissed(() => void pickPhoto());
              }}
              style={({ pressed }) => [styles.menuRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
            >
              <FontAwesome name="camera" size={16} color={brand.primary} />
              <Text style={[styles.menuRowTxt, isRTL && styles.rtl]} numberOfLines={1}>
                Ajouter une photo
              </Text>
              <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.textMuted} />
            </Pressable>
            <Pressable
              onPress={() => {
                setAttachMenuOpen(false);
                runAfterAttachModalDismissed(() => void pickDoc());
              }}
              style={({ pressed }) => [styles.menuRow, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
            >
              <FontAwesome name="file-text-o" size={16} color={brand.primary} />
              <Text style={[styles.menuRowTxt, isRTL && styles.rtl]} numberOfLines={1}>
                Ajouter un document
              </Text>
              <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.textMuted} />
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export default function CommunauteScreen() {
  if (!GLOBAL_WALL_MOBILE_ENABLED) {
    return <Redirect href="/(tabs)" />;
  }
  return <CommunauteScreenContent />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CHAT_WALLPAPER_BG },
  wallpaperSlot: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  wallpaperLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  flatTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CHAT_WALLPAPER_BG },
  /** flexGrow uniquement quand le fil est vide : évite un « vide » géant entre messages sur iOS/Android. */
  list: { padding: spacing.md },
  listContentGrow: { flexGrow: 1 },
  listEmptyWrap: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listEmptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  listEmptySub: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  dayPillWrap: { alignItems: 'center', marginVertical: spacing.sm },
  dayPill: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  dayPillTxt: { fontSize: 10, fontWeight: '700', color: brand.textMuted },
  rowRtl: { flexDirection: 'row-reverse' },
  /** Fil principal type WhatsApp : autres à gauche, vous à droite */
  postWrap: { width: '100%', marginBottom: spacing.md },
  postWrapReplyTarget: {
    backgroundColor: 'rgba(51, 62, 143, 0.07)',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  postRowOther: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  postRowMine: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  postColumn: { flexShrink: 1, maxWidth: '92%', minWidth: 0 },
  /** Web : bulle + barre de réactions sur une même ligne */
  bubbleOuterWeb: { flexShrink: 1, minWidth: 0 },
  postBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  postBubbleRowMine: { flexDirection: 'row-reverse' },
  avatarOther: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarOtherTxt: { color: brand.white, fontSize: 11, fontWeight: '800' },
  avatarMine: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarMineTxt: { color: brand.white, fontSize: 11, fontWeight: '800' },
  officialBubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  officialBubbleOther: {
    backgroundColor: brand.white,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  officialBubbleMine: {
    backgroundColor: brand.primary,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: radius.lg,
    borderWidth: 0,
  },
  officialMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  officialMetaRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  officialName: { fontSize: 11, fontWeight: '800', color: brand.primary },
  officialNameMine: { color: 'rgba(255,255,255,0.95)' },
  timeMuted: { fontSize: 10, color: brand.textMuted },
  timeMutedMine: { color: 'rgba(255,255,255,0.75)' },
  officialBody: { fontSize: fontSize.md, color: brand.text, lineHeight: 22 },
  officialBodyMine: { color: brand.white },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { textAlign: 'right' },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: brand.linkChipBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  linkChipTxt: { fontSize: fontSize.xs, fontWeight: '700', color: brand.primary },
  shareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  shareChipTxt: { flex: 1, fontSize: fontSize.xs, fontWeight: '700', color: brand.text },
  shareChipMine: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  shareChipTxtMine: { color: brand.white },
  threadBox: {
    marginTop: 4,
    marginLeft: 2,
    borderRadius: radius.lg,
    borderTopLeftRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    padding: spacing.sm,
  },
  threadBoxMine: {
    marginLeft: 0,
    alignSelf: 'stretch',
  },
  threadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  replyAlign: { marginBottom: 4 },
  replyAlignStart: { alignItems: 'flex-start' },
  replyAlignEnd: { alignItems: 'flex-end' },
  replyStack: { maxWidth: '92%', alignSelf: 'stretch' },
  replyBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyBubbleRowMine: { flexDirection: 'row-reverse' },
  replyBubble: {
    maxWidth: '92%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  replyBubbleOther: {
    backgroundColor: brand.white,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  replyBubbleMine: {
    backgroundColor: brand.primary,
    borderBottomRightRadius: 6,
  },
  replyAuthor: { fontSize: 11, fontWeight: '800', color: brand.primary, marginBottom: 2 },
  replyBody: { fontSize: fontSize.md, color: brand.text, lineHeight: 22 },
  replyBodyMine: { color: brand.white },
  replyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  replyFooterRowMine: { justifyContent: 'flex-end' },
  replyTime: { fontSize: 10, color: brand.textMuted, textAlign: 'right' },
  replyTimeMine: { color: 'rgba(255,255,255,0.75)' },
  dockOuter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    backgroundColor: CHAT_WALLPAPER_BG,
  },
  replyTargetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 6,
  },
  replyTargetBannerIcon: { marginTop: 1 },
  replyTargetBannerTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
  },
  replyTargetBannerClear: {
    padding: 4,
    marginStart: 4,
  },
  replyHereRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  replyHereRowMine: {
    alignSelf: 'flex-end',
  },
  replyHereTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.textMuted,
  },
  replyHereTxtMine: {
    color: 'rgba(255,255,255,0.92)',
  },
  replyHereTxtSelected: {
    color: brand.primary,
  },
  replyHereTxtSelectedMine: {
    color: brand.white,
  },
  dockInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  dockAttach: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dockFieldCol: { flex: 1, minWidth: 0 },
  dockAttachedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  dockAttachedPillTxt: { flex: 1, fontSize: fontSize.xs, fontWeight: '700', color: brand.text },
  dockAttachedClear: { fontSize: 9, fontWeight: '700', color: brand.primary },
  dockInput: {
    minHeight: 40,
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: fontSize.md,
    color: brand.text,
    backgroundColor: brand.white,
  },
  sendFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLoader: { marginVertical: spacing.md },
  jumpFab: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  jumpFabBadgeTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  modalCard: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '78%',
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  modalHeaderTri: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  modalHeaderSlot: { width: 76, justifyContent: 'flex-start' },
  modalHeaderSlotEnd: { alignItems: 'flex-end' },
  modalTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  modalTitleCenter: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  modalBack: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary },
  modalClose: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary },
  attachMainLeafLabel: { flex: 1 },
  modalScroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  attachSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  attachSectionTitleSp: { marginTop: spacing.lg },
  attachSearchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: fontSize.xs,
    color: brand.text,
    marginBottom: spacing.sm,
    backgroundColor: brand.backgroundSoft,
  },
  attachEmpty: { fontSize: fontSize.xs, color: brand.textMuted, marginBottom: spacing.sm },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  attachRowLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  attachAnnIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachRowTxtCol: { flex: 1, minWidth: 0 },
  attachRowTitle: { fontSize: fontSize.sm, fontWeight: '700', color: brand.text },
  attachRowSub: { fontSize: 10, color: brand.textMuted, marginTop: 2 },
  attachAnnType: { fontSize: 9, fontWeight: '700', color: brand.emerald, marginTop: 2 },
  menuRoot: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end' },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  menuCard: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  menuTitle: { fontSize: 12, fontWeight: '800', color: brand.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    backgroundColor: brand.backgroundSoft,
  },
  menuRowTxt: { flex: 1, minWidth: 0, fontSize: fontSize.sm, fontWeight: '700', color: brand.text },
});
