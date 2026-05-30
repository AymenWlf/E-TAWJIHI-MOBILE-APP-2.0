import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RenderHTML from 'react-native-render-html';

import {
  ChatMiniAnnouncementCard,
  ChatMiniCardLoading,
  ChatMiniEstablishmentCard,
  ChatMiniNavCard,
  ChatMiniProductCard,
} from '@/components/chatbot/ChatMiniCards';
import {
  CHAT_WALLPAPER_BG,
  ChatConversationBackground,
} from '@/components/chatbot/ChatConversationBackground';
import { ChatbotThinkingSteps } from '@/components/chatbot/ChatbotThinkingSteps';
import { LoadingCardStack } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  getChatbotSessionMessages,
  getChatbotSessions,
  getAnonymousSessionId,
  sendChatbotMessage,
  type ChatbotSession,
} from '@/services/chatbot';
import { listEstablishments, type EstablishmentNormalized } from '@/services/establishments';
import {
  contestDetailToListCard,
  fetchContestAnnouncementsCached,
  fetchContestAnnouncementDetail,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import { fetchShopProductBySlug } from '@/services/shop';
import { getEstablishmentLogoUrl } from '@/constants/establishmentMedia';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  extractBoutiqueProductSlugsFromText,
  extractChatbotLinksFromText,
  extractInscriptionAnnouncementIdsFromText,
  resolveChatbotUrl,
  sortRecommendationsMobileFirst,
  stripChatbotInternalPathsFromDisplay,
  stripStandaloneBoutiqueUrlLines,
  type ChatbotNavRecommendation,
} from '@/utils/chatbotInternalRoutes';
import { chatbotMarkdownToHtml } from '@/utils/chatbotMarkdown';
import { safeOpenUrl } from '@/utils/safeOpenUrl';
import {
  matchContestAnnouncementFromList,
  parseContestAnnouncementQueriesFromChatReply,
  shouldAttemptContestAnnouncementCards,
  stripContestAnnouncementBulletLines,
} from '@/utils/chatbotContestAnnouncementLines';
import {
  parseEstablishmentQueriesFromChatReply,
  stripEstablishmentBulletLines,
} from '@/utils/chatbotEstablishmentLines';
import { homeShell } from '@/theme/homeShell';
import { CAIRO } from '@/theme/arabicTypography';
import type { ShopProductDetail } from '@/types/shop';
import {
  formatShopPrice,
  shopHasPromotionalPrice,
  shopPriceFormatOptsForCatalogOrCartLine,
} from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { parseAssistantQuickReplies } from '@/utils/chatbotQuickReplies';

const TAB_BAR_EXTRA = 56;
const TOOLTIP_STORAGE_KEY = 'e-mowajih-mobile-chat-tooltip-dismissed';
/** Limite de messages (user+assistant) par conversation côté mobile. */
const MAX_MESSAGES_PER_CONVERSATION = 60;
type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function getBoutiqueProductSlugFromPathname(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0]?.toLowerCase() !== 'boutique' || parts.length < 2) return null;
  const slug = parts[1];
  if (['cart', 'checkout', 'thank-you'].includes(slug.toLowerCase())) return null;
  return slug;
}

function dedupeRecommendations(list: ChatbotNavRecommendation[]): ChatbotNavRecommendation[] {
  const seen = new Set<string>();
  const out: ChatbotNavRecommendation[] = [];
  for (const r of list) {
    const key =
      r.mobileHref != null ? `app:${String(r.mobileHref)}` : r.webUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function recommendationHrefPath(href: ChatbotNavRecommendation['mobileHref']): string {
  if (href == null) return '';
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && href !== null && 'pathname' in href && typeof (href as { pathname: string }).pathname === 'string') {
    return (href as { pathname: string }).pathname;
  }
  return '';
}

function recoSortKey(href: ChatbotNavRecommendation['mobileHref']): number {
  const h = recommendationHrefPath(href);
  if (/\/boutique\/[^/]+/i.test(h) && !/\/boutique\/(?:cart|checkout)\b/i.test(h)) return 0;
  if (/\/etablissements\/\d+/i.test(h)) return 2;
  return 1;
}

function recommendationsForText(content: string): ChatbotNavRecommendation[] {
  const links = extractChatbotLinksFromText(content);
  const resolved = links
    .map((u) => resolveChatbotUrl(u))
    .filter((x): x is ChatbotNavRecommendation => x != null);
  const ranked = sortRecommendationsMobileFirst(resolved).sort(
    (a, b) => recoSortKey(a.mobileHref) - recoSortKey(b.mobileHref),
  );
  return dedupeRecommendations(ranked);
}

/**
 * Réponses centrées boutique (liens/slugs produits) sans lien vers une fiche école :
 * ne pas charger les cartes établissement — les puces `- … — …` sont souvent confondues avec des packs.
 */
function messageShouldSkipEstablishmentCards(content: string): boolean {
  const links = extractChatbotLinksFromText(content);
  const hasSchoolLink = links.some((u) => /\/etablissements\/\d+/i.test(u));
  if (hasSchoolLink) return false;
  if (extractBoutiqueProductSlugsFromText(content).length > 0) return true;
  if (/\/boutique\/[a-z0-9][a-z0-9_-]*/i.test(content)) return true;
  if (/\(tabs\)\/boutique\/[a-z0-9]/i.test(content)) return true;
  if (/https?:\/\/(?:www\.)?e-tawjihi\.ma\/boutique\//i.test(content)) return true;
  return false;
}

function splitSchoolLinesIntoSeparateMessages(reply: string): { head: string; schoolLines: string[]; tail: string } {
  const lines = reply.split('\n');
  const schoolIdx: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith('- ') && t.includes(' — ')) schoolIdx.push(i);
  }
  if (schoolIdx.length < 2) {
    return { head: reply, schoolLines: [], tail: '' };
  }
  const first = schoolIdx[0];
  const last = schoolIdx[schoolIdx.length - 1];
  const head = lines.slice(0, first).join('\n').trim();
  const schoolLines = schoolIdx.map((i) => lines[i].trim()).filter(Boolean);
  const tail = lines.slice(last + 1).join('\n').trim();
  return { head, schoolLines, tail };
}

const RESERVED_BOUTIQUE_SLUGS = new Set(['panier', 'checkout', 'cart', 'thank-you', 'commande']);

/** Slug produit si `href` est `/boutique/{slug}` ou `/(tabs)/boutique/{slug}` (hors réservés). */
function boutiqueProductSlugFromHref(href: string): string | null {
  const tab = href.match(/^\/\(tabs\)\/boutique\/([^/]+)$/i);
  if (tab) {
    const slug = tab[1];
    if (RESERVED_BOUTIQUE_SLUGS.has(slug.toLowerCase())) return null;
    return slug;
  }
  const m = href.match(/^\/boutique\/([^/]+)$/i);
  if (!m) return null;
  const slug = m[1];
  if (RESERVED_BOUTIQUE_SLUGS.has(slug.toLowerCase())) return null;
  return slug;
}

/** Slugs produits uniques : d’abord les recos (liens boutique), puis les mentions dans le texte. */
function orderedBoutiqueProductSlugsFromMessage(
  content: string,
  recosFiltered: ChatbotNavRecommendation[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of recosFiltered) {
    const href = r.mobileHref ? String(r.mobileHref) : '';
    const ps = boutiqueProductSlugFromHref(href);
    if (ps) {
      const k = ps.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(ps);
      }
    }
  }
  for (const s of extractBoutiqueProductSlugsFromText(content)) {
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

function iconForMobileHref(href: string): React.ComponentProps<typeof FontAwesome>['name'] {
  // Tabs
  if (href === '/(tabs)' || href === '/') return 'home';
  if (href.startsWith('/(tabs)/boutique')) return 'shopping-cart';
  if (href.startsWith('/(tabs)/ecoles')) return 'university';
  if (href.startsWith('/(tabs)/inscriptions')) return 'calendar';
  if (href.startsWith('/(tabs)/evenements')) return 'calendar-o';
  if (href.startsWith('/(tabs)/compte')) return 'user-o';

  // Standalone routes
  if (href.startsWith('/communaute')) return 'comments';
  if (href.startsWith('/login')) return 'sign-in';
  if (href.startsWith('/register')) return 'user-plus';
  if (href.startsWith('/boutique/cart')) return 'shopping-bag';
  if (href.startsWith('/boutique/checkout')) return 'check-circle';
  if (href.startsWith('/boutique/')) return 'shopping-cart';
  if (href.startsWith('/etablissements/')) return 'university';
  if (href.startsWith('/evenements/')) return 'calendar';
  if (href.startsWith('/inscriptions/')) return 'calendar';

  return 'chevron-right';
}

function extractActionOptions(text: string): { cleaned: string; options: { key: string; label: string }[] } {
  const parsed = parseAssistantQuickReplies(text);
  if (!parsed) return { cleaned: text, options: [] };
  return {
    cleaned: parsed.mainContent,
    options: parsed.options.map((o) => ({ key: o.letter, label: o.label })),
  };
}

export function ChatbotFloatingBubble({ hideLauncher }: { hideLauncher?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const { user, getValidAccessToken } = useAuth();
  const { width: screenW } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  /** `true` = masquer le hint ; lecture AsyncStorage au montage pour éviter un flash pour les anciens utilisateurs. */
  const [tooltipDismissed, setTooltipDismissed] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    { id: 'welcome', role: 'assistant', content: t('chatbotWelcome') },
  ]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [anonymousSessionId, setAnonymousSessionId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [chatBodyLayout, setChatBodyLayout] = useState<{ width: number; height: number }>(() => ({
    width: screenW,
    height: 0,
  }));
  const [schoolsByMessageId, setSchoolsByMessageId] = useState<Record<string, EstablishmentNormalized[]>>({});
  const [schoolsLoadingByMessageId, setSchoolsLoadingByMessageId] = useState<Record<string, boolean>>({});
  const schoolsLoadingRef = useRef<Set<string>>(new Set());
  const [contestMetaById, setContestMetaById] = useState<
    Record<string, { title: string; titleAr: string | null; establishmentName: string | null; establishmentLogoUrl: string | null }>
  >({});
  const [contestLoadingById, setContestLoadingById] = useState<Record<string, boolean>>({});
  const contestLoadingRef = useRef<Set<string>>(new Set());
  const [contestAnnouncementCardsByMessageId, setContestAnnouncementCardsByMessageId] = useState<
    Record<string, ContestAnnouncementCard[]>
  >({});
  const [contestAnnouncementCardsLoadingByMessageId, setContestAnnouncementCardsLoadingByMessageId] = useState<
    Record<string, boolean>
  >({});
  const contestAnnouncementCardsFetchedRef = useRef<Set<string>>(new Set());
  const contestAnnouncementCardsLoadingRef = useRef<Set<string>>(new Set());
  const [productMetaBySlug, setProductMetaBySlug] = useState<Record<string, ShopProductDetail>>({});
  const [productLoadingBySlug, setProductLoadingBySlug] = useState<Record<string, boolean>>({});
  const productLoadingRef = useRef<Set<string>>(new Set());

  const boutiqueSlug = useMemo(() => getBoutiqueProductSlugFromPathname(pathname), [pathname]);

  const bottom = TAB_BAR_EXTRA + Math.max(insets.bottom, spacing.sm) + spacing.sm;

  useEffect(() => {
    let cancelled = false;
    if (user?.id) {
      setAnonymousSessionId(null);
      return;
    }
    void (async () => {
      try {
        const id = await getAnonymousSessionId();
        if (!cancelled) setAnonymousSessionId(id);
      } catch {
        if (!cancelled) setAnonymousSessionId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const v = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
        if (!cancelled && v !== '1') setTooltipDismissed(false);
      } catch {
        if (!cancelled) setTooltipDismissed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismissTooltip = useCallback(async () => {
    setTooltipDismissed(true);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem(TOOLTIP_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('chatbot:open', () => {
      void dismissTooltip();
      setOpen(true);
    });
    return () => sub.remove();
  }, [dismissTooltip]);

  /** Liste des conversations passées (menu historique), sans charger le fil affiché. */
  const refreshSessionsList = useCallback(async () => {
    try {
      const token = await getValidAccessToken();
      const list = await getChatbotSessions(token, user?.id ? null : anonymousSessionId);
      setSessions(list);
    } catch {
      /* ignore */
    }
  }, [anonymousSessionId, getValidAccessToken, user?.id]);

  /** Alias : anciens bundles / fast refresh pouvaient encore référencer `loadHistory`. */
  const loadHistory = refreshSessionsList;

  const loadSessionById = useCallback(
    async (sid: number) => {
      setHistoryLoading(true);
      try {
        const token = await getValidAccessToken();
        const rows = await getChatbotSessionMessages(sid, token, user?.id ? null : anonymousSessionId);
        if (rows.length === 0) {
          setMessages([{ id: 'welcome', role: 'assistant', content: t('chatbotWelcome') }]);
          setSessionId(null);
          return;
        }
        setContestAnnouncementCardsByMessageId({});
        setContestAnnouncementCardsLoadingByMessageId({});
        contestAnnouncementCardsFetchedRef.current.clear();
        contestAnnouncementCardsLoadingRef.current.clear();
        setSessionId(sid);
        setMessages(
          rows.map((m) => ({
            id: `m-${m.id}`,
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        );
      } catch {
        // ignore
      } finally {
        setHistoryLoading(false);
      }
    },
    [anonymousSessionId, getValidAccessToken, t, user?.id],
  );

  /** À chaque ouverture : nouvelle conversation vide (le premier message crée une session côté API). */
  useEffect(() => {
    if (!open) return;
    setSessionId(null);
    setMessages([{ id: 'welcome', role: 'assistant', content: t('chatbotWelcome') }]);
    void refreshSessionsList();
  }, [open, refreshSessionsList, t]);

  useEffect(() => {
    const id = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    return () => cancelAnimationFrame(id);
  }, [messages, open, loading]);

  const chatbotPrepHints = useMemo(
    () =>
      [t('chatbotPrepHint1'), t('chatbotPrepHint2'), t('chatbotPrepHint3'), t('chatbotPrepHint4')] as const,
    [t],
  );

  const pushNav = useCallback(
    (href: Href) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const contentWidth = useMemo(() => Math.max(140, screenW - spacing.xl * 3), [screenW]);
  const htmlTagsStyles = useMemo(() => {
    const ar = (family: keyof typeof CAIRO) => (isRTL ? { fontFamily: CAIRO[family] } : {});
    return {
      p: {
        color: homeShell.cardText,
        fontSize: fontSize.md,
        lineHeight: 22,
        fontWeight: '600' as const,
        marginTop: 0,
        marginBottom: spacing.sm,
        ...ar('semibold'),
      },
      strong: { fontWeight: '900' as const, color: homeShell.cardText, ...ar('black') },
      b: { fontWeight: '900' as const, color: homeShell.cardText, ...ar('black') },
      em: { fontStyle: 'italic' as const },
      del: { textDecorationLine: 'line-through' as const, color: homeShell.cardText, opacity: 0.9 },
      code: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
        fontSize: 13,
        color: homeShell.blueDeep,
      },
      pre: {
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 10,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        overflow: 'hidden' as const,
      },
      a: {
        color: homeShell.blue,
        textDecorationLine: 'underline' as const,
        fontWeight: '800' as const,
        ...ar('bold'),
      },
      br: { marginBottom: 4 },
      div: { color: homeShell.cardText, ...ar('semibold') },
    };
  }, [isRTL]);

  const loadSchoolsForMessage = useCallback(
    async (messageId: string, fullText: string) => {
      if (schoolsByMessageId[messageId]) return;
      if (schoolsLoadingRef.current.has(messageId)) return;

      const queries = parseEstablishmentQueriesFromChatReply(fullText);
      if (queries.length === 0) return;

      schoolsLoadingRef.current.add(messageId);
      setSchoolsLoadingByMessageId((prev) => ({ ...prev, [messageId]: true }));
      try {
        const results = await Promise.all(
          queries.map(async (q) => {
            const r = await listEstablishments({ search: q.query, limit: 1, page: 1 });
            return r.data?.[0] ?? null;
          }),
        );
        const unique = new Map<number, EstablishmentNormalized>();
        for (const e of results) {
          if (!e) continue;
          unique.set(e.id, e);
        }
        const list = [...unique.values()];
        if (list.length > 0) {
          setSchoolsByMessageId((prev) => ({ ...prev, [messageId]: list }));
        }
      } catch {
        // ignore
      } finally {
        schoolsLoadingRef.current.delete(messageId);
        setSchoolsLoadingByMessageId((prev) => ({ ...prev, [messageId]: false }));
      }
    },
    [schoolsByMessageId],
  );

  const loadContestTitleIfNeeded = useCallback(async (contestId: number) => {
    const key = String(contestId);
    if (contestMetaById[key]) return;
    if (contestLoadingRef.current.has(key)) return;
    contestLoadingRef.current.add(key);
    setContestLoadingById((prev) => ({ ...prev, [key]: true }));
    try {
      const payload = await fetchContestAnnouncementDetail(contestId);
      const d = payload?.detail;
      if (d && d.title) {
        const estName = d.establishment?.nom ? String(d.establishment.nom) : null;
        const estLogo = d.establishment?.logo ? getEstablishmentLogoUrl(d.establishment.logo) : null;
        setContestMetaById((prev) => ({
          ...prev,
          [key]: { title: d.title, titleAr: d.titleAr, establishmentName: estName, establishmentLogoUrl: estLogo },
        }));
      }
    } finally {
      contestLoadingRef.current.delete(key);
      setContestLoadingById((prev) => ({ ...prev, [key]: false }));
    }
  }, [contestMetaById]);

  const loadContestAnnouncementCardsForMessage = useCallback(async (messageId: string, fullText: string) => {
    if (contestAnnouncementCardsFetchedRef.current.has(messageId)) return;
    if (!shouldAttemptContestAnnouncementCards(fullText)) return;

    const urlIds = extractInscriptionAnnouncementIdsFromText(fullText);
    const bulletQueries = parseContestAnnouncementQueriesFromChatReply(fullText);
    if (urlIds.length === 0 && bulletQueries.length === 0) return;

    contestAnnouncementCardsFetchedRef.current.add(messageId);
    contestAnnouncementCardsLoadingRef.current.add(messageId);
    setContestAnnouncementCardsLoadingByMessageId((prev) => ({ ...prev, [messageId]: true }));

    try {
      const { items: list } = await fetchContestAnnouncementsCached();
      const byId = new Map<number, ContestAnnouncementCard>();
      const order: number[] = [];

      for (const id of urlIds) {
        const fromList = list.find((c) => c.id === id);
        if (fromList) {
          byId.set(id, fromList);
          order.push(id);
        } else {
          const detailPayload = await fetchContestAnnouncementDetail(id);
          const detail = detailPayload?.detail;
          if (detail?.title) {
            byId.set(id, contestDetailToListCard(detail));
            order.push(id);
          }
        }
      }

      const used = new Set(order);
      for (const { query } of bulletQueries) {
        const matched = matchContestAnnouncementFromList(list, query, used);
        if (matched) {
          byId.set(matched.id, matched);
          used.add(matched.id);
          order.push(matched.id);
        }
      }

      const cards = order.map((id) => byId.get(id)).filter((c): c is ContestAnnouncementCard => c != null);
      setContestAnnouncementCardsByMessageId((prev) => ({ ...prev, [messageId]: cards }));
    } catch {
      setContestAnnouncementCardsByMessageId((prev) => ({ ...prev, [messageId]: [] }));
    } finally {
      contestAnnouncementCardsLoadingRef.current.delete(messageId);
      setContestAnnouncementCardsLoadingByMessageId((prev) => ({ ...prev, [messageId]: false }));
    }
  }, []);

  const loadProductMetaIfNeeded = useCallback(async (slug: string) => {
    if (productMetaBySlug[slug]) return;
    if (productLoadingRef.current.has(slug)) return;
    productLoadingRef.current.add(slug);
    setProductLoadingBySlug((prev) => ({ ...prev, [slug]: true }));
    try {
      const d = await fetchShopProductBySlug(slug);
      if (d) {
        setProductMetaBySlug((prev) => ({ ...prev, [slug]: d }));
      }
    } finally {
      productLoadingRef.current.delete(slug);
      setProductLoadingBySlug((prev) => ({ ...prev, [slug]: false }));
    }
  }, [productMetaBySlug]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      const uid = `u-${Date.now()}`;
      const aid = `a-${Date.now()}`;
      // Si la conversation est trop longue, on démarre une nouvelle session
      // (on garde l'ancienne dans l'historique serveur).
      const nonWelcomeCount = messages.filter((m) => m.id !== 'welcome').length;
      const shouldStartNew = nonWelcomeCount >= MAX_MESSAGES_PER_CONVERSATION;
      const nextSessionId = shouldStartNew ? null : sessionId;
      if (shouldStartNew) {
        setSchoolsByMessageId({});
        setSchoolsLoadingByMessageId({});
        setContestMetaById({});
        setContestLoadingById({});
        setContestAnnouncementCardsByMessageId({});
        setContestAnnouncementCardsLoadingByMessageId({});
        setProductMetaBySlug({});
        setProductLoadingBySlug({});
        schoolsLoadingRef.current.clear();
        contestLoadingRef.current.clear();
        contestAnnouncementCardsFetchedRef.current.clear();
        contestAnnouncementCardsLoadingRef.current.clear();
        productLoadingRef.current.clear();
        setSessionId(null);
        setMessages([{ id: 'welcome', role: 'assistant', content: t('chatbotWelcome') }]);
      }
      setMessages((prev) => [...prev, { id: uid, role: 'user', content: trimmed }]);
      setInput('');
      try {
        const token = await getValidAccessToken();
        const res = await sendChatbotMessage(trimmed, token, {
          userId: user?.id ?? null,
          sessionId: nextSessionId,
          anonymousSessionId: user?.id ? null : anonymousSessionId,
          boutiqueProductSlug: boutiqueSlug,
        });
        setSessionId(res.sessionId);
        const split = splitSchoolLinesIntoSeparateMessages(res.reply);
        const newMsgs: ChatMsg[] = [];
        if (split.head) newMsgs.push({ id: aid, role: 'assistant', content: split.head });
        // Un message par école pour afficher card par card
        for (let i = 0; i < split.schoolLines.length; i++) {
          newMsgs.push({ id: `${aid}-school-${i + 1}`, role: 'assistant', content: split.schoolLines[i] });
        }
        if (split.tail) newMsgs.push({ id: `${aid}-tail`, role: 'assistant', content: split.tail });
        if (newMsgs.length === 0) newMsgs.push({ id: aid, role: 'assistant', content: res.reply });
        setMessages((prev) => [...prev, ...newMsgs]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: aid,
            role: 'assistant',
            content: t('chatbotError'),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      anonymousSessionId,
      boutiqueSlug,
      getValidAccessToken,
      loading,
      messages,
      sessionId,
      t,
      user?.id,
    ],
  );

  const newChat = useCallback(() => {
    setSchoolsByMessageId({});
    setSchoolsLoadingByMessageId({});
    setContestMetaById({});
    setContestLoadingById({});
    setContestAnnouncementCardsByMessageId({});
    setContestAnnouncementCardsLoadingByMessageId({});
    setProductMetaBySlug({});
    setProductLoadingBySlug({});
    schoolsLoadingRef.current.clear();
    contestLoadingRef.current.clear();
    contestAnnouncementCardsFetchedRef.current.clear();
    contestAnnouncementCardsLoadingRef.current.clear();
    productLoadingRef.current.clear();
    setSessionId(null);
    setMessages([{ id: 'welcome', role: 'assistant', content: t('chatbotWelcome') }]);
  }, [t]);

  const suggestionRows = useMemo(
    () =>
      [
        { labelKey: 'chatbotSuggEcoles' as const, msgKey: 'chatbotShortcutMsgEcoles' as const },
        {
          labelKey: 'chatbotSuggContestAnnouncements' as const,
          msgKey: 'chatbotShortcutMsgContestAnnouncements' as const,
        },
        { labelKey: 'chatbotSuggBoutique' as const, msgKey: 'chatbotShortcutMsgBoutique' as const },
      ] as const,
    [],
  );

  return (
    <>
      {!hideLauncher ? (
        <View
          style={[styles.wrap, isRTL ? { right: spacing.md } : { left: spacing.md }, { bottom }]}
          pointerEvents="box-none"
        >
          {!tooltipDismissed ? (
            <Pressable
              onPress={() => dismissTooltip()}
              style={[styles.tooltip, isRTL ? styles.tooltipRtl : styles.tooltipLtr]}
            >
              <Text style={styles.tooltipTxt}>{t('chatbotTooltip')}</Text>
              <Text style={styles.tooltipDismiss}>×</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chatbotBubbleA11y')}
            onPress={() => {
              dismissTooltip();
              setOpen(true);
            }}
            style={({ pressed }) => [styles.bubble, pressed && styles.bubblePressed]}
          >
            <MaterialCommunityIcons name="robot" size={24} color={brand.white} />
          </Pressable>
        </View>
      ) : null}

      <Modal visible={open} animationType="slide" transparent={false} onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Accueil"
                onPress={() => pushNav('/(tabs)' as Href)}
                style={styles.headerBackBtn}
                hitSlop={8}
              >
                <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={18} color={brand.white} />
              </Pressable>
              <MaterialCommunityIcons name="robot" size={22} color={brand.white} />
              <Text style={styles.headerTitle}>{t('chatbotTitle')}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Historique"
                onPress={() => setSessionsOpen(true)}
                style={styles.headerIconBtn}
              >
                <FontAwesome name="history" size={18} color={brand.white} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatbotNewChat')}
                onPress={newChat}
                style={styles.headerIconBtn}
              >
                <FontAwesome name="plus" size={18} color={brand.white} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatbotCloseA11y')}
                onPress={() => setOpen(false)}
                style={styles.headerIconBtn}
              >
                <FontAwesome name="times" size={22} color={brand.white} />
              </Pressable>
            </View>
          </View>

          <View
            style={styles.chatBody}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setChatBodyLayout({ width, height });
            }}
          >
            <ChatConversationBackground width={chatBodyLayout.width} height={chatBodyLayout.height} />

          {historyLoading ? (
            <LoadingCardStack count={2} isRTL={isRTL} style={styles.historyLoading} />
          ) : null}

          <Modal
            visible={sessionsOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setSessionsOpen(false)}
          >
            <View style={styles.sessionsBackdrop}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setSessionsOpen(false)} />
              <View style={[styles.sessionsSheet, { marginTop: Math.max(insets.top, spacing.lg) }]}>
                <View style={styles.sessionsHeader}>
                  <Text style={styles.sessionsTitle}>Conversations</Text>
                  <Pressable onPress={() => setSessionsOpen(false)} style={styles.sessionsClose}>
                    <FontAwesome name="times" size={20} color={brand.textMuted} />
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={styles.sessionsList}>
                  {sessions.length === 0 ? (
                    <Text style={styles.sessionsEmpty}>Aucune conversation.</Text>
                  ) : (
                    sessions.map((s) => {
                      const active = sessionId === s.id;
                      const label = (s.title && s.title.trim()) ? s.title.trim() : `#${s.id} · ${s.messageCount} msg`;
                      const date = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '';
                      return (
                        <Pressable
                          key={s.id}
                          onPress={() => {
                            setSessionsOpen(false);
                            void loadSessionById(s.id);
                          }}
                          style={({ pressed }) => [
                            styles.sessionRow,
                            active && styles.sessionRowActive,
                            pressed && { opacity: 0.9 },
                          ]}
                        >
                          <View style={styles.sessionRowMain}>
                            <Text style={styles.sessionRowTitle} numberOfLines={1}>
                              {label}
                            </Text>
                            <Text style={styles.sessionRowSub} numberOfLines={1}>
                              {date}
                            </Text>
                          </View>
                          <FontAwesome
                            name={active ? 'check' : 'chevron-right'}
                            size={14}
                            color={active ? brand.primary : brand.textMuted}
                          />
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* minHeight:0 évite le collapse du ScrollView dans KeyboardAvoidingView (Android / flex). */}
          <View style={styles.scrollOuter}>
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
            {messages.map((m) => {
              const displayContent = m.content;
              const opts = m.role === 'assistant' ? extractActionOptions(m.content) : null;
              const displayForRender =
                m.role === 'assistant'
                  ? stripChatbotInternalPathsFromDisplay(opts ? opts.cleaned : displayContent)
                  : displayContent;
              const recos = m.role === 'assistant' ? recommendationsForText(m.content) : [];
              const parsedAnnouncementIds =
                m.role === 'assistant' ? extractInscriptionAnnouncementIdsFromText(m.content) : [];
              const announcementIdFilter =
                parsedAnnouncementIds.length > 0 ? new Set(parsedAnnouncementIds) : null;
              const recosFiltered =
                m.role === 'assistant' && announcementIdFilter
                  ? recos.filter((r) => {
                      const href = r.mobileHref ? String(r.mobileHref) : '';
                      const mm = href.match(/^\/inscriptions\/(\d+)$/);
                      if (!mm) return true;
                      const id = Number(mm[1]);
                      return !announcementIdFilter.has(id);
                    })
                  : recos;
              const orderedProductSlugs =
                m.role === 'assistant'
                  ? orderedBoutiqueProductSlugsFromMessage(m.content, recosFiltered)
                  : [];
              const recosForAllerPlusLoin =
                m.role === 'assistant' && orderedProductSlugs.length > 0
                  ? recosFiltered.filter((r) => {
                      const href = r.mobileHref ? String(r.mobileHref) : '';
                      return boutiqueProductSlugFromHref(href) == null;
                    })
                  : recosFiltered;
              const skipEstablishmentCards =
                m.role === 'assistant' && messageShouldSkipEstablishmentCards(m.content);
              const showSchools = m.role === 'assistant' && !skipEstablishmentCards;
              const schools = showSchools ? schoolsByMessageId[m.id] ?? [] : [];
              if (showSchools && schools.length === 0) {
                void loadSchoolsForMessage(m.id, m.content);
              }
              const establishmentQueries =
                m.role === 'assistant' && !skipEstablishmentCards
                  ? parseEstablishmentQueriesFromChatReply(m.content)
                  : [];
              const contestBulletQueries =
                m.role === 'assistant' ? parseContestAnnouncementQueriesFromChatReply(m.content) : [];
              if (m.role === 'assistant' && shouldAttemptContestAnnouncementCards(m.content)) {
                void loadContestAnnouncementCardsForMessage(m.id, m.content);
              }
              const contestCardsRow = contestAnnouncementCardsByMessageId[m.id];
              const contestCardsLoadingRow = !!contestAnnouncementCardsLoadingByMessageId[m.id];
              let assistantDisplayForBubble = displayForRender;
              if (m.role === 'assistant') {
                if (establishmentQueries.length > 0) {
                  assistantDisplayForBubble = stripEstablishmentBulletLines(assistantDisplayForBubble);
                }
                const stripContestBulletsFromBubble =
                  (contestBulletQueries.length > 0 || parsedAnnouncementIds.length > 0) &&
                  ((contestCardsRow?.length ?? 0) > 0 || contestCardsLoadingRow);
                if (stripContestBulletsFromBubble) {
                  assistantDisplayForBubble = stripContestAnnouncementBulletLines(assistantDisplayForBubble);
                }
                const hasBoutiqueCards = orderedProductSlugs.length > 0;
                if (hasBoutiqueCards) {
                  assistantDisplayForBubble = stripStandaloneBoutiqueUrlLines(assistantDisplayForBubble);
                }
              }
              const showAssistantTextBubble =
                m.role !== 'assistant' || assistantDisplayForBubble.trim().length > 0;
              const schoolSkeletonCount = Math.min(4, Math.max(1, establishmentQueries.length));
              const contestSkeletonCount = Math.min(
                6,
                Math.max(1, parsedAnnouncementIds.length + contestBulletQueries.length),
              );
              return (
              <View
                key={m.id}
                style={[styles.msgRow, m.role === 'user' ? styles.msgRowUser : styles.msgRowAssistant]}
              >
                {showAssistantTextBubble ? (
                <View style={[styles.bubbleMsg, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                  {m.role === 'assistant' ? (
                    <RenderHTML
                      contentWidth={contentWidth}
                      source={{ html: chatbotMarkdownToHtml(assistantDisplayForBubble) }}
                      baseStyle={{
                        color: homeShell.cardText,
                        fontSize: fontSize.md,
                        lineHeight: 22,
                        ...(isRTL ? { fontFamily: CAIRO.semibold } : {}),
                      }}
                      tagsStyles={htmlTagsStyles}
                      defaultTextProps={{ selectable: true }}
                      ignoredDomTags={['script', 'iframe', 'object', 'embed', 'style', 'form', 'button', 'input']}
                      renderersProps={{
                        a: {
                          onPress(_, href) {
                            if (!href) return;
                            const rec = resolveChatbotUrl(href);
                            if (rec?.mobileHref) {
                              pushNav(rec.mobileHref);
                              return;
                            }
                            // Lien externe (WhatsApp, Maps, etc.)
                            void safeOpenUrl(href);
                          },
                        },
                      }}
                      enableExperimentalGhostLinesPrevention
                    />
                  ) : (
                    <Text style={styles.msgTxt}>{displayContent}</Text>
                  )}
                </View>
                ) : null}

                {opts && opts.options.length > 0 ? (
                  <View style={styles.actionOptionsWrap}>
                    {opts.options.map((o) => (
                      <Pressable
                        key={`${m.id}-${o.key}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${o.key}) ${o.label}`}
                        onPress={() => void submit(o.label)}
                        style={({ pressed }) => [
                          styles.actionOptionBtn,
                          isRTL && styles.actionOptionBtnRtl,
                          pressed && { opacity: 0.88 },
                        ]}
                      >
                        <Text style={styles.actionOptionLetter}>{o.key})</Text>
                        <Text style={[styles.actionOptionTxt, isRTL && styles.txtRtl]} numberOfLines={3}>
                          {o.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {schools.length > 0 ? (
                  <View style={styles.schoolCardsWrap}>
                    {schools.map((e) => (
                      <View key={e.id} style={styles.schoolCardItem}>
                        <ChatMiniEstablishmentCard item={e} onPress={() => pushNav(`/etablissements/${e.id}/${e.slug}` as Href)} />
                      </View>
                    ))}
                  </View>
                ) : establishmentQueries.length > 0 && schoolsLoadingByMessageId[m.id] ? (
                  <View style={styles.schoolCardsWrap}>
                    {Array.from({ length: schoolSkeletonCount }, (_, i) => (
                      <View key={`sk-school-${m.id}-${i}`} style={styles.schoolCardItem}>
                        <ChatMiniCardLoading />
                      </View>
                    ))}
                  </View>
                ) : null}

                {m.role === 'assistant' &&
                shouldAttemptContestAnnouncementCards(m.content) &&
                (((contestCardsRow?.length ?? 0) > 0) || contestCardsLoadingRow) ? (
                  <View style={styles.recoBlock}>
                    <Text style={styles.recoHeading}>{t('shareKindAnnouncements')}</Text>
                    {(contestCardsRow?.length ?? 0) > 0
                      ? contestCardsRow!.map((card: ContestAnnouncementCard) => (
                          <View key={`ca-${m.id}-${card.id}`} style={styles.schoolCardItem}>
                            <ChatMiniAnnouncementCard
                              title={isRTL && card.titleAr ? card.titleAr : card.title}
                              subtitle={card.establishment?.nom ?? null}
                              logoUrl={
                                card.establishment?.logo
                                  ? getEstablishmentLogoUrl(card.establishment.logo)
                                  : null
                              }
                              onPress={() => pushNav(`/inscriptions/${card.id}` as Href)}
                            />
                          </View>
                        ))
                      : contestCardsLoadingRow
                        ? Array.from({ length: contestSkeletonCount }, (_, i) => (
                            <View key={`sk-ca-${m.id}-${i}`} style={styles.schoolCardItem}>
                              <ChatMiniCardLoading />
                            </View>
                          ))
                        : null}
                  </View>
                ) : null}

                {m.role === 'assistant' && orderedProductSlugs.length > 0 ? (
                  <View style={styles.recoBlock}>
                    <Text style={styles.recoHeading}>{t('chatbotBoutiqueCardsHeading')}</Text>
                    {orderedProductSlugs.map((slug) => {
                      void loadProductMetaIfNeeded(slug);
                      const pm = productMetaBySlug[slug];
                      const packLoading = !!productLoadingBySlug[slug];
                      const opts = shopPriceFormatOptsForCatalogOrCartLine(pm ?? undefined);
                      const href = `/boutique/${slug}` as Href;
                      if (packLoading && !pm) {
                        return (
                          <View key={`boutique-${m.id}-${slug}`} style={styles.schoolCardItem}>
                            <ChatMiniCardLoading />
                          </View>
                        );
                      }
                      if (pm) {
                        const priceLabel = formatShopPrice(pm.price, pm.currency, opts);
                        const compareRaw =
                          shopHasPromotionalPrice(pm.price, pm.compareAtPrice) && pm.compareAtPrice
                            ? formatShopPrice(pm.compareAtPrice, pm.currency, opts)
                            : null;
                        return (
                          <View key={`boutique-${m.id}-${slug}`} style={styles.schoolCardItem}>
                            <ChatMiniProductCard
                              title={pm.title}
                              priceLabel={priceLabel}
                              compareAtLabel={compareRaw}
                              imageUri={shopProductPrimaryImage(pm.images)}
                              onPress={() => pushNav(href)}
                            />
                          </View>
                        );
                      }
                      return (
                        <View key={`boutique-${m.id}-${slug}`} style={styles.schoolCardItem}>
                          <ChatMiniNavCard
                            icon="shopping-cart"
                            title={t('tabBoutique')}
                            onPress={() => pushNav(href)}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : null}

                {recosForAllerPlusLoin.length > 0 ? (
                  <View style={styles.recoBlock}>
                    <Text style={styles.recoHeading}>{t('chatbotRecoHeading')}</Text>
                    {recosForAllerPlusLoin.map((r) => (
                      <View key={r.webUrl} style={styles.recoRow}>
                        {r.mobileHref ? (
                          (() => {
                            const href = String(r.mobileHref);
                            const productSlug = boutiqueProductSlugFromHref(href);
                            if (productSlug) {
                              void loadProductMetaIfNeeded(productSlug);
                              const pm = productMetaBySlug[productSlug];
                              const productLoading = !!productLoadingBySlug[productSlug];
                              const opts = shopPriceFormatOptsForCatalogOrCartLine(pm ?? undefined);
                              if (productLoading && !pm) {
                                return <ChatMiniCardLoading />;
                              }
                              if (pm) {
                                const priceLabel = formatShopPrice(pm.price, pm.currency, opts);
                                const compareRaw =
                                  shopHasPromotionalPrice(pm.price, pm.compareAtPrice) && pm.compareAtPrice
                                    ? formatShopPrice(pm.compareAtPrice, pm.currency, opts)
                                    : null;
                                return (
                                  <ChatMiniProductCard
                                    title={pm.title}
                                    priceLabel={priceLabel}
                                    compareAtLabel={compareRaw}
                                    imageUri={shopProductPrimaryImage(pm.images)}
                                    onPress={() => pushNav(r.mobileHref!)}
                                  />
                                );
                              }
                              return (
                                <ChatMiniNavCard
                                  icon="shopping-cart"
                                  title={t(r.destLabelKey)}
                                  onPress={() => pushNav(r.mobileHref!)}
                                />
                              );
                            }
                            const mContest = href.match(/^\/inscriptions\/(\d+)/);
                            const contestId = mContest?.[1] ? Number(mContest[1]) : null;
                            if (contestId && Number.isFinite(contestId)) {
                              void loadContestTitleIfNeeded(contestId);
                            }
                            const contestKey = contestId ? String(contestId) : '';
                            const meta = contestKey ? contestMetaById[contestKey] : undefined;
                            const contestLoading = contestKey ? !!contestLoadingById[contestKey] : false;
                            const displayTitle =
                              meta ? (isRTL && meta.titleAr ? meta.titleAr : meta.title) : t(r.destLabelKey);
                            const subtitle = meta?.establishmentName ?? null;
                            const icon = iconForMobileHref(href);
                            if (contestId && contestLoading && !meta) {
                              return <ChatMiniCardLoading />;
                            }
                            return (
                              contestId ? (
                                <ChatMiniAnnouncementCard
                                  title={displayTitle}
                                  subtitle={subtitle}
                                  logoUrl={meta?.establishmentLogoUrl ?? null}
                                  onPress={() => pushNav(r.mobileHref!)}
                                />
                              ) : (
                                <ChatMiniNavCard
                                  icon={icon}
                                  title={t(r.destLabelKey)}
                                  onPress={() => pushNav(r.mobileHref!)}
                                />
                              )
                            );
                          })()
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
            })}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.thinkingDock}>
              <ChatbotThinkingSteps
                title={t('chatbotThinkingHeader')}
                subtitle={t('chatbotLoadingSubtitle')}
                prepHints={chatbotPrepHints}
              />
            </View>
          ) : null}

          <View style={[styles.suggestions, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggScroll}>
              {suggestionRows.map((s) => (
                <Pressable
                  key={s.labelKey}
                  onPress={() => void submit(t(s.msgKey))}
                  style={({ pressed }) => [styles.suggChip, pressed && styles.suggChipPressed]}
                >
                  <Text style={styles.suggChipTxt}>{t(s.labelKey)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, isRTL && styles.inputRtl]}
                placeholder={t('chatbotPlaceholder')}
                placeholderTextColor={brand.textMuted}
                value={input}
                onChangeText={setInput}
                editable={!loading}
                multiline
                maxLength={4000}
                textAlignVertical="center"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatbotSendA11y')}
                onPress={() => void submit(input)}
                disabled={loading || !input.trim()}
                style={({ pressed }) => [
                  styles.sendBtn,
                  (!input.trim() || loading) && styles.sendBtnDisabled,
                  pressed && styles.sendBtnPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={brand.white} size="small" />
                ) : (
                  <FontAwesome name="send" size={16} color={brand.white} />
                )}
              </Pressable>
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const BUBBLE = 56;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 41,
  },
  tooltip: {
    position: 'absolute',
    bottom: BUBBLE + 8,
    maxWidth: 220,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  tooltipLtr: { left: 0 },
  tooltipRtl: { right: 0 },
  tooltipTxt: {
    flex: 1,
    color: brand.white,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  tooltipDismiss: {
    color: brand.white,
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.85,
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bubblePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  modalRoot: {
    flex: 1,
    backgroundColor: CHAT_WALLPAPER_BG,
  },
  chatBody: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    backgroundColor: CHAT_WALLPAPER_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: brand.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBackBtn: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
    borderRadius: radius.full,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.white,
  },
  sessionsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
  },
  sessionsSheet: {
    backgroundColor: brand.background,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    overflow: 'hidden',
    maxHeight: '78%',
  },
  sessionsHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionsTitle: {
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '900',
  },
  sessionsClose: {
    padding: spacing.sm,
  },
  sessionsList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sessionsEmpty: {
    color: brand.textMuted,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  sessionRowActive: {
    backgroundColor: 'rgba(51, 62, 143, 0.10)',
    borderColor: 'rgba(51, 62, 143, 0.35)',
  },
  sessionRowMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  sessionRowTitle: {
    color: brand.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  sessionRowSub: {
    marginTop: 2,
    color: brand.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBtn: {
    padding: spacing.sm,
  },
  historyLoading: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  scrollOuter: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  msgRow: {
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
  },
  /** Pleine largeur du fil : sinon les cartes (flex:1) peuvent se replier à 0 px sur Android. */
  msgRowAssistant: {
    alignSelf: 'stretch',
    width: '100%',
  },
  bubbleMsg: {
    maxWidth: '92%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  bubbleUser: {
    borderBottomRightRadius: 8,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 8,
  },
  msgTxt: {
    fontSize: fontSize.md,
    lineHeight: 22,
    color: brand.text,
  },
  schoolCardsWrap: {
    marginTop: spacing.sm,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
  },
  schoolCardItem: {
    maxWidth: '100%',
    width: '100%',
    marginBottom: spacing.md,
  },
  actionOptionsWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    maxWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  actionOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  actionOptionBtnRtl: {
    flexDirection: 'row-reverse',
  },
  actionOptionLetter: {
    color: brand.primary,
    fontWeight: '900',
    fontSize: fontSize.sm,
  },
  actionOptionTxt: {
    flex: 1,
    minWidth: 0,
    color: brand.text,
    fontWeight: '700',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  recoBlock: {
    marginTop: spacing.sm,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
  },
  recoHeading: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  recoRow: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  recoPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  recoPrimaryTxt: {
    color: brand.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  recoSecondary: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  recoSecondaryTxt: {
    color: brand.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  recoWebOnly: {
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  recoWebOnlyTxt: {
    color: brand.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  recoPressed: {
    opacity: 0.88,
  },
  /** Bloc chargement fixé entre la liste et la zone de saisie (visible sans scroller). */
  thinkingDock: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'stretch',
  },
  suggestions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: CHAT_WALLPAPER_BG,
  },
  suggScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
  },
  suggChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  suggChipPressed: {
    opacity: 0.85,
  },
  suggChipTxt: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: fontSize.md,
    color: brand.text,
    backgroundColor: brand.white,
  },
  inputRtl: {
    textAlign: 'right',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnPressed: {
    opacity: 0.88,
  },
});
