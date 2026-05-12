import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  createCommunityQnaAnswer,
  createCommunityQnaQuestion,
  fetchCommunityQnaList,
  formatCommunityQnaApiError,
  setCommunityQnaMeToo,
  type CommunityQnaContextType,
  type CommunityQnaQuestion,
  type CommunityQnaVerdict,
  type CommunityQnaVisibility,
} from '@/services/communityQna';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const QNA_ANSWERS_FIRST_BATCH = 5;

type SectionVariant = 'standalone' | 'embedded';

type Props = {
  contextType: CommunityQnaContextType;
  contextId: number;
  /** `standalone` : carte avec marges ; `embedded` : à placer dans un SectionCard parent. */
  variant?: SectionVariant;
  /** Marges horizontales pour `standalone` (fiche école plus large). */
  marginHorizontal?: number;
  /** Mise en évidence + défilement (deep link `qnaQ`). */
  highlightQuestionId?: number | null;
  /** Liste parente en `ScrollView` pour `scrollTo` vers la question. */
  scrollParentRef?: React.RefObject<ScrollView | null>;
  /** Liste parente en `FlatList` (ex. suivi école) + offset courant pour ajuster le scroll. */
  flatListRef?: React.RefObject<FlatList<any> | null>;
  listScrollOffsetY?: number;
  /**
   * `instagram` : saisie des réponses en dock au-dessus du clavier (Reanimated) ; la question reste un champ inline.
   * Sans `instagramAnchoredDock` : liste interne scrollable — prévoir un parent à hauteur bornée (`flex:1` + `minHeight:0`).
   * Avec `instagramAnchoredDock` : la section défile dans le `scrollParentRef` ; le dock réponse passe en `Modal` plein écran.
   * `scroll` (défaut) : tout inline + espaceur clavier classique.
   */
  composerLayout?: 'scroll' | 'instagram';
  /**
   * À activer lorsque la section est dans un `ScrollView` parent (ex. fiche établissement) : docks en overlay plein écran.
   * Sinon `position: absolute` est relative au bloc et ne suit pas le clavier correctement.
   */
  instagramAnchoredDock?: boolean;
};

export function CommunityQnaSection({
  contextType,
  contextId,
  variant = 'standalone',
  marginHorizontal,
  highlightQuestionId = null,
  scrollParentRef,
  flatListRef,
  listScrollOffsetY,
  composerLayout = 'scroll',
  instagramAnchoredDock = false,
}: Props) {
  const router = useRouter();
  const { t, locale, isRTL } = useLocale();
  const { user, getValidAccessToken } = useAuth();
  const isLoggedIn = Boolean(user);
  const insets = useSafeAreaInsets();
  const isInstagram = composerLayout === 'instagram';
  const useInnerIgScroll = isInstagram && !instagramAnchoredDock;

  const [rows, setRows] = useState<CommunityQnaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listErr, setListErr] = useState<string | null>(null);

  const [compose, setCompose] = useState('');
  const [composeVis, setComposeVis] = useState<CommunityQnaVisibility>('public');
  const [sendingQ, setSendingQ] = useState(false);

  const [replyById, setReplyById] = useState<Record<number, string>>({});
  const [replyBusyId, setReplyBusyId] = useState<number | null>(null);
  /** Réponses masquées par défaut ; `partial` = 5 premières, `all` = tout. */
  const [answerRevealByQid, setAnswerRevealByQid] = useState<Record<number, 'hidden' | 'partial' | 'all'>>({});

  const innerScrollRef = useRef<ScrollView>(null);
  const dockReplyInputRef = useRef<TextInput>(null);
  const [igReplyOpenFor, setIgReplyOpenFor] = useState<number | null>(null);

  const keyboard = useAnimatedKeyboard();
  const dockAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: keyboard.height.value,
  }));

  const blockRefs = useRef<Map<number, View>>(new Map());
  const registerBlockRef = useCallback((qid: number) => (node: View | null) => {
    if (node) blockRefs.current.set(qid, node);
    else blockRefs.current.delete(qid);
  }, []);

  /** Invalide les réponses réseau obsolètes si le contexte change ou le composant démonte. */
  const fetchGenRef = useRef(0);

  const mh = marginHorizontal ?? (variant === 'embedded' ? 0 : spacing.lg);

  const canUseContext = useMemo(() => {
    if (!Number.isFinite(contextId) || contextId <= 0) return false;
    if (contextType === 'establishment_follow' && !isLoggedIn) return false;
    return true;
  }, [contextId, contextType, isLoggedIn]);

  const load = useCallback(
    async (expectedGen: number) => {
      if (!canUseContext) {
        setRows([]);
        setListErr(null);
        if (fetchGenRef.current === expectedGen) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }
      setListErr(null);
      const token = isLoggedIn ? await getValidAccessToken() : null;
      if (fetchGenRef.current !== expectedGen) {
        return;
      }
      try {
        const data = await fetchCommunityQnaList(contextType, contextId, token);
        if (fetchGenRef.current !== expectedGen) {
          return;
        }
        setRows(data);
      } catch (e) {
        if (fetchGenRef.current !== expectedGen) {
          return;
        }
        setListErr(formatCommunityQnaApiError(e));
        setRows([]);
      } finally {
        if (fetchGenRef.current === expectedGen) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [canUseContext, contextId, contextType, getValidAccessToken, isLoggedIn],
  );

  useEffect(() => {
    if (!canUseContext) {
      fetchGenRef.current += 1;
      setRows([]);
      setLoading(false);
      setListErr(null);
      return;
    }
    const gen = ++fetchGenRef.current;
    setLoading(true);
    const task = InteractionManager.runAfterInteractions(() => {
      void load(gen);
    });
    return () => {
      fetchGenRef.current += 1;
      task.cancel?.();
    };
  }, [canUseContext, contextId, contextType, isLoggedIn, load]);

  useEffect(() => {
    setAnswerRevealByQid({});
  }, [contextType, contextId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load(fetchGenRef.current);
  }, [load]);

  const onSubmitQuestion = useCallback(async () => {
    const text = compose.trim();
    if (text.length < 3) {
      Alert.alert('', t('qnaBodyTooShort'));
      return;
    }
    if (!isLoggedIn) {
      router.push('/login' as never);
      return;
    }
    setSendingQ(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        router.push('/login' as never);
        return;
      }
      await createCommunityQnaQuestion(token, {
        contextType,
        contextId,
        visibility: composeVis,
        body: text,
      });
      setCompose('');
      await load(fetchGenRef.current);
    } catch (e) {
      Alert.alert('', formatCommunityQnaApiError(e));
    } finally {
      setSendingQ(false);
    }
  }, [compose, composeVis, contextId, contextType, getValidAccessToken, isLoggedIn, load, router, t]);

  const onToggleMeToo = useCallback(
    async (q: CommunityQnaQuestion) => {
      if (q.visibility !== 'public') return;
      if (!isLoggedIn) {
        router.push('/login' as never);
        return;
      }
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const next = await setCommunityQnaMeToo(token, q.id, !q.viewerMeToo);
        setRows((prev) =>
          prev.map((row) =>
            row.id === q.id ? { ...row, meTooCount: next.meTooCount, viewerMeToo: next.viewerMeToo } : row,
          ),
        );
      } catch (e) {
        Alert.alert('', formatCommunityQnaApiError(e));
      }
    },
    [getValidAccessToken, isLoggedIn, router],
  );

  const onSendReply = useCallback(
    async (qid: number) => {
      const text = (replyById[qid] ?? '').trim();
      if (text.length < 3) {
        Alert.alert('', t('qnaBodyTooShort'));
        return;
      }
      if (!isLoggedIn) {
        router.push('/login' as never);
        return;
      }
      setReplyBusyId(qid);
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        await createCommunityQnaAnswer(token, qid, text);
        setReplyById((prev) => ({ ...prev, [qid]: '' }));
        await load(fetchGenRef.current);
        setAnswerRevealByQid((prev) => ({ ...prev, [qid]: 'all' }));
        if (isInstagram) {
          setIgReplyOpenFor(null);
          Keyboard.dismiss();
        }
      } catch (e) {
        Alert.alert('', formatCommunityQnaApiError(e));
      } finally {
        setReplyBusyId(null);
      }
    },
    [getValidAccessToken, isInstagram, isLoggedIn, load, replyById, router, t],
  );

  useEffect(() => {
    const hid = highlightQuestionId;
    if (!canUseContext || hid == null || hid <= 0 || loading || listErr) return;
    if (!rows.some((r) => r.id === hid)) return;

    setAnswerRevealByQid((prev) => ({ ...prev, [hid]: 'all' }));

    const scroll = isInstagram
      ? instagramAnchoredDock
        ? scrollParentRef?.current ?? null
        : innerScrollRef.current
      : scrollParentRef?.current ?? null;
    const list = flatListRef?.current;
    const yOffset = listScrollOffsetY;

    const task = InteractionManager.runAfterInteractions(() => {
      const tryScroll = () => {
        const node = blockRefs.current.get(hid);
        if (!node) return;

        if (scroll) {
          node.measureLayout(
            scroll as never,
            (_x: number, y: number) => {
              scroll.scrollTo({ y: Math.max(0, y - 28), animated: true });
            },
            () => undefined,
          );
          return;
        }

        if (list && typeof yOffset === 'number') {
          const listView = list as unknown as {
            measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void;
          };
          node.measureInWindow((_nx: number, ny: number, _nw: number, _nh: number) => {
            listView.measureInWindow((_lx: number, ly: number, _lw: number, lh: number) => {
              const relTop = ny - ly;
              const topMargin = 80;
              const bottomGuard = lh - 120;
              if (relTop < topMargin || relTop > bottomGuard) {
                const delta = relTop - topMargin;
                list.scrollToOffset({ offset: Math.max(0, yOffset + delta), animated: true });
              }
            });
          });
        }
      };

      requestAnimationFrame(() => {
        tryScroll();
        setTimeout(tryScroll, 380);
      });
    });

    return () => {
      task.cancel?.();
    };
  }, [
    canUseContext,
    composerLayout,
    flatListRef,
    highlightQuestionId,
    instagramAnchoredDock,
    isInstagram,
    listScrollOffsetY,
    loading,
    listErr,
    rows,
    scrollParentRef,
  ]);

  useEffect(() => {
    if (!isInstagram || igReplyOpenFor == null) return;
    const id = requestAnimationFrame(() => dockReplyInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [igReplyOpenFor, isInstagram]);

  /** Remonte le fil ciblé dans la zone scroll pour garder le contexte au-dessus du clavier (style apps sociales). */
  useEffect(() => {
    if (!isInstagram || igReplyOpenFor == null) return;
    const qid = igReplyOpenFor;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        const scroll = instagramAnchoredDock ? scrollParentRef?.current ?? null : innerScrollRef.current;
        const node = blockRefs.current.get(qid);
        if (!scroll || !node) return;
        node.measureLayout(
          scroll as never,
          (_x: number, y: number) => {
            scroll.scrollTo({ y: Math.max(0, y - 20), animated: true });
          },
          () => undefined,
        );
      });
    });
    return () => {
      task.cancel?.();
    };
  }, [igReplyOpenFor, instagramAnchoredDock, isInstagram, scrollParentRef]);

  const dismissReplyDock = useCallback(() => {
    setIgReplyOpenFor(null);
    Keyboard.dismiss();
  }, []);

  const wrapStyle = useMemo(() => {
    if (isInstagram) {
      if (instagramAnchoredDock) {
        return variant === 'embedded' ? [styles.embedRoot] : [styles.card, { marginHorizontal: mh, marginTop: spacing.lg }];
      }
      if (variant === 'embedded') return [styles.instagramShell];
      return [styles.card, styles.instagramShell, { marginHorizontal: mh, marginTop: spacing.lg }];
    }
    return variant === 'embedded' ? [styles.embedRoot] : [styles.card, { marginHorizontal: mh, marginTop: spacing.lg }];
  }, [instagramAnchoredDock, isInstagram, mh, variant]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  const formatIso = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return dateFmt.format(new Date(iso));
    } catch {
      return '—';
    }
  };

  const verdictLabel = (v: CommunityQnaVerdict) => {
    if (v === 'correct') return t('qnaVerdictCorrect');
    if (v === 'incorrect') return t('qnaVerdictIncorrect');
    return t('qnaVerdictIncomplete');
  };

  const questionTime = useCallback((iso: string | null) => {
    if (!iso) return 0;
    const t0 = new Date(iso).getTime();
    return Number.isFinite(t0) ? t0 : 0;
  }, []);

  /** Clé `YYYY-MM` pour regrouper / trier par mois calendaire (plus récent en premier). */
  const monthKeyDesc = useCallback((iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const t = d.getTime();
    if (!Number.isFinite(t)) return '';
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${m < 10 ? `0${m}` : m}`;
  }, []);

  /**
   * Tri : mois les plus récents d’abord, puis plus de réponses, puis « moi aussi »,
   * puis date exacte (même mois).
   */
  const sortedRows = useMemo(() => {
    const replyN = (q: CommunityQnaQuestion) =>
      typeof q.replyCount === 'number' && Number.isFinite(q.replyCount)
        ? q.replyCount
        : q.answers?.length ?? 0;
    return [...rows].sort((a, b) => {
      const ka = monthKeyDesc(a.createdAt);
      const kb = monthKeyDesc(b.createdAt);
      const monthCmp = kb.localeCompare(ka);
      if (monthCmp !== 0) return monthCmp;
      const rc = replyN(b) - replyN(a);
      if (rc !== 0) return rc;
      const mc = (b.meTooCount ?? 0) - (a.meTooCount ?? 0);
      if (mc !== 0) return mc;
      return questionTime(b.createdAt) - questionTime(a.createdAt);
    });
  }, [monthKeyDesc, questionTime, rows]);

  if (!canUseContext) {
    return null;
  }

  const renderMain = () => (
    <>
      <View style={[styles.titleRow, isRTL && styles.rowRtl]}>
        <FontAwesome name="comments-o" size={16} color={brand.primary} />
        <Text style={[styles.title, isRTL && styles.rtl]}>{t('qnaSectionTitle')}</Text>
        <Pressable
          onPress={() => onRefresh()}
          disabled={loading || refreshing}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconGhost,
            pressed && !loading && !refreshing && { opacity: 0.75 },
            (loading || refreshing) && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('qnaRefresh')}
        >
          {loading || refreshing ? (
            <ActivityIndicator size="small" color={brand.primary} />
          ) : (
            <FontAwesome name="refresh" size={14} color={brand.primary} />
          )}
        </Pressable>
      </View>

      <Text style={[styles.intro, isRTL && styles.rtl]}>{t('qnaIntro')}</Text>

      <View style={styles.composeBlock}>
        <Text style={[styles.composeLabel, isRTL && styles.rtl]}>{t('qnaAskTitle')}</Text>
        {!isLoggedIn ? (
          <Pressable
            onPress={() => router.push('/login' as never)}
            style={({ pressed }) => [styles.loginCta, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.loginCtaTxt}>{t('qnaLoginToParticipate')}</Text>
          </Pressable>
        ) : (
          <View style={styles.composeKav}>
            <View style={styles.composeInner}>
              <View style={[styles.visRow, isRTL && styles.rowRtl]}>
                <Pressable
                  onPress={() => setComposeVis('public')}
                  style={({ pressed }) => [
                    styles.visChip,
                    composeVis === 'public' && styles.visChipOn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <FontAwesome
                    name="globe"
                    size={12}
                    color={composeVis === 'public' ? brand.white : brand.primary}
                  />
                  <Text style={[styles.visChipTxt, composeVis === 'public' && styles.visChipTxtOn]}>
                    {t('qnaVisibilityPublic')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setComposeVis('private')}
                  style={({ pressed }) => [
                    styles.visChip,
                    composeVis === 'private' && styles.visChipOn,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <FontAwesome
                    name="lock"
                    size={12}
                    color={composeVis === 'private' ? brand.white : brand.primary}
                  />
                  <Text style={[styles.visChipTxt, composeVis === 'private' && styles.visChipTxtOn]}>
                    {t('qnaVisibilityPrivate')}
                  </Text>
                </Pressable>
              </View>
              <Text style={[styles.visHint, isRTL && styles.rtl]}>
                {composeVis === 'public' ? t('qnaHintPublic') : t('qnaHintPrivate')}
              </Text>
              <TextInput
                value={compose}
                onChangeText={setCompose}
                placeholder={t('qnaPlaceholder')}
                placeholderTextColor={brand.textMuted}
                multiline
                style={[styles.inputLg, isRTL && styles.rtlInput]}
                textAlignVertical="top"
              />
              <Pressable
                onPress={() => void onSubmitQuestion()}
                disabled={sendingQ}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  isRTL && styles.rowRtl,
                  pressed && { opacity: 0.92 },
                  sendingQ && { opacity: 0.65 },
                ]}
              >
                {sendingQ ? (
                  <ActivityIndicator size="small" color={brand.white} />
                ) : (
                  <FontAwesome name="paper-plane" size={13} color={brand.white} />
                )}
                <Text style={styles.primaryBtnTxt}>{t('qnaSubmit')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {loading && rows.length === 0 ? (
        <View style={styles.listLoading}>
          <ActivityIndicator color={brand.primary} />
          <Text style={[styles.listLoadingTxt, isRTL && styles.rtl]}>{t('qnaLoadingComments')}</Text>
        </View>
      ) : null}

      {refreshing && rows.length > 0 ? (
        <View style={[styles.listLoading, styles.listLoadingRefreshing]}>
          <ActivityIndicator color={brand.primary} />
          <Text style={[styles.listLoadingTxt, isRTL && styles.rtl]}>{t('qnaLoadingComments')}</Text>
        </View>
      ) : null}

      {!loading && listErr ? <Text style={[styles.err, isRTL && styles.rtl]}>{listErr}</Text> : null}

      {!loading && !listErr && rows.length === 0 ? (
        <Text style={[styles.muted, isRTL && styles.rtl]}>{t('qnaEmpty')}</Text>
      ) : null}

      {!loading && !listErr
        ? sortedRows.map((q) => (
            <View
              key={q.id}
              ref={registerBlockRef(q.id)}
              collapsable={false}
              style={[styles.qBlock, highlightQuestionId === q.id && styles.qBlockHighlight]}
            >
              <View style={[styles.qHead, isRTL && styles.rowRtl]}>
                <Text style={[styles.author, isRTL && styles.rtl]} numberOfLines={1}>
                  {q.author?.displayName ?? '—'}
                </Text>
                <Text style={[styles.dateMini, isRTL && styles.rtl]}>{formatIso(q.createdAt)}</Text>
              </View>
              {q.visibility === 'private' ? (
                <View style={[styles.privatePill, isRTL && styles.rowRtl]}>
                  <FontAwesome name="lock" size={11} color="#92400E" />
                  <Text style={styles.privatePillTxt}>{t('qnaPrivateBadge')}</Text>
                </View>
              ) : null}
              <Text style={[styles.qBody, isRTL && styles.rtl]}>{q.body}</Text>

              {q.visibility === 'public' ? (
                <Pressable
                  onPress={() => void onToggleMeToo(q)}
                  disabled={!isLoggedIn}
                  style={({ pressed }) => [
                    styles.meTooBtn,
                    isRTL && styles.rowRtl,
                    q.viewerMeToo && styles.meTooBtnOn,
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <FontAwesome name="hand-o-up" size={13} color={q.viewerMeToo ? brand.white : brand.primary} />
                  <Text style={[styles.meTooTxt, q.viewerMeToo && styles.meTooTxtOn]}>
                    {t('qnaMeToo')} {q.meTooCount > 0 ? `(${q.meTooCount})` : ''}
                  </Text>
                </Pressable>
              ) : (
                <Text style={[styles.privateHint, isRTL && styles.rtl]}>{t('qnaPrivateHint')}</Text>
              )}

              {(() => {
                const answersSorted = [...q.answers].sort(
                  (a, b) => questionTime(a.createdAt) - questionTime(b.createdAt),
                );
                const total = answersSorted.length;
                if (total === 0) return null;

                const reveal = answerRevealByQid[q.id] ?? 'hidden';
                const firstBatch = QNA_ANSWERS_FIRST_BATCH;
                const visible =
                  reveal === 'hidden'
                    ? []
                    : reveal === 'partial'
                      ? answersSorted.slice(0, firstBatch)
                      : answersSorted;
                const remaining =
                  reveal === 'partial' ? Math.max(0, total - firstBatch) : 0;

                const showRepliesLabel =
                  total === 1
                    ? t('qnaShowRepliesOne')
                    : t('qnaShowRepliesMany').replace('{{count}}', String(total));
                const remainingLabel =
                  remaining === 1
                    ? t('qnaShowRemainingRepliesOne')
                    : t('qnaShowRemainingRepliesMany').replace('{{count}}', String(remaining));

                return (
                  <View>
                    {reveal === 'hidden' ? (
                      <Pressable
                        onPress={() =>
                          setAnswerRevealByQid((prev) => ({
                            ...prev,
                            [q.id]: total <= firstBatch ? 'all' : 'partial',
                          }))
                        }
                        style={({ pressed }) => [
                          styles.showRepliesBtn,
                          isRTL && styles.rowRtl,
                          pressed && { opacity: 0.88 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={showRepliesLabel}
                      >
                        <FontAwesome name="comment-o" size={14} color={brand.primary} />
                        <Text style={[styles.showRepliesTxt, styles.showRepliesTxtGrow, isRTL && styles.rtl]}>
                          {showRepliesLabel}
                        </Text>
                        <FontAwesome
                          name={isRTL ? 'chevron-left' : 'chevron-right'}
                          size={11}
                          color={brand.textMuted}
                        />
                      </Pressable>
                    ) : null}
                    {visible.length > 0 ? (
                      <View style={styles.answersWrap}>
                        {visible.map((a) => (
                          <View key={a.id} style={[styles.answerCard, isRTL && styles.answerCardRtl]}>
                            <View style={[styles.answerTop, isRTL && styles.rowRtl]}>
                              <View style={[styles.answerAuthorRow, isRTL && styles.answerAuthorRowRtl]}>
                                <Text style={[styles.answerAuthor, isRTL && styles.rtl]} numberOfLines={1}>
                                  {a.author.displayName}
                                </Text>
                              </View>
                              <View style={[styles.answerBadges, isRTL && styles.answerBadgesRtl]}>
                                {a.isOfficial ? (
                                  <View
                                    style={[styles.officialBadgeWrap, isRTL && styles.rowRtl]}
                                    accessibilityRole="text"
                                    accessibilityLabel={t('qnaOfficialBadge')}
                                  >
                                    <View style={styles.metaVerifyBlue} accessibilityRole="image">
                                      <FontAwesome name="check" size={8} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.officialBadgeLabel} numberOfLines={1}>
                                      {t('qnaOfficialBadge')}
                                    </Text>
                                  </View>
                                ) : (
                                  <View
                                    style={[styles.communityPill, isRTL && styles.rowRtl]}
                                    accessibilityRole="text"
                                    accessibilityLabel={t('qnaCommunityAnswerBadge')}
                                  >
                                    <FontAwesome name="graduation-cap" size={10} color="#1E3A8A" />
                                    <Text style={styles.communityPillTxt}>{t('qnaCommunityAnswerBadge')}</Text>
                                  </View>
                                )}
                                {a.communityVerdict ? (
                                  a.communityVerdict === 'correct' ? (
                                    <View
                                      style={[styles.verdictPill, styles.verdictCorrect, isRTL && styles.rowRtl]}
                                      accessibilityRole="text"
                                    >
                                      <View style={styles.correctVerifyGreen} accessibilityRole="image">
                                        <FontAwesome name="check" size={9} color="#FFFFFF" />
                                      </View>
                                      <Text style={[styles.verdictPillTxt, styles.verdictTxtCorrect]} numberOfLines={1}>
                                        {verdictLabel(a.communityVerdict)}
                                      </Text>
                                    </View>
                                  ) : (
                                    <View
                                      style={[
                                        styles.verdictPill,
                                        a.communityVerdict === 'incorrect' && styles.verdictIncorrect,
                                        a.communityVerdict === 'incomplete' && styles.verdictIncomplete,
                                        isRTL && styles.rowRtl,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.verdictPillTxt,
                                          a.communityVerdict === 'incorrect' && styles.verdictTxtIncorrect,
                                          a.communityVerdict === 'incomplete' && styles.verdictTxtIncomplete,
                                        ]}
                                        numberOfLines={1}
                                      >
                                        {verdictLabel(a.communityVerdict)}
                                      </Text>
                                    </View>
                                  )
                                ) : null}
                              </View>
                            </View>
                            <Text style={[styles.answerBody, isRTL && styles.rtl]}>{a.body}</Text>
                            <Text style={[styles.dateMini, isRTL && styles.rtl]}>{formatIso(a.createdAt)}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {reveal === 'partial' && remaining > 0 ? (
                      <Pressable
                        onPress={() => setAnswerRevealByQid((prev) => ({ ...prev, [q.id]: 'all' }))}
                        style={({ pressed }) => [
                          styles.showRepliesBtn,
                          styles.showRepliesBtnAfter,
                          isRTL && styles.rowRtl,
                          pressed && { opacity: 0.88 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={remainingLabel}
                      >
                        <FontAwesome name="angle-double-down" size={14} color={brand.primary} />
                        <Text style={[styles.showRepliesTxt, isRTL && styles.rtl]}>{remainingLabel}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })()}

              {isLoggedIn && q.visibility === 'public' ? (
                isInstagram ? (
                  <Pressable
                    onPress={() => setIgReplyOpenFor(q.id)}
                    style={({ pressed }) => [styles.igReplyEntry, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                    accessibilityRole="button"
                    accessibilityLabel={t('qnaTapToReply')}>
                    <FontAwesome name="comment-o" size={16} color={brand.primary} />
                    <Text style={[styles.igReplyEntryTxt, isRTL && styles.rtl]}>{t('qnaTapToReply')}</Text>
                    {replyById[q.id]?.trim() ? (
                      <Text style={[styles.igReplyDraftPreview, isRTL && styles.rtl]} numberOfLines={1}>
                        {replyById[q.id]}
                      </Text>
                    ) : null}
                  </Pressable>
                ) : (
                  <View style={styles.replyBox}>
                    <TextInput
                      value={replyById[q.id] ?? ''}
                      onChangeText={(txt) => setReplyById((prev) => ({ ...prev, [q.id]: txt }))}
                      placeholder={t('qnaAnswerPlaceholder')}
                      placeholderTextColor={brand.textMuted}
                      multiline
                      style={[styles.input, isRTL && styles.rtlInput]}
                      textAlignVertical="top"
                    />
                    <Pressable
                      onPress={() => void onSendReply(q.id)}
                      disabled={replyBusyId === q.id}
                      style={({ pressed }) => [
                        styles.sendBtn,
                        isRTL && styles.rowRtl,
                        pressed && { opacity: 0.9 },
                        replyBusyId === q.id && { opacity: 0.6 },
                      ]}
                    >
                      {replyBusyId === q.id ? (
                        <ActivityIndicator size="small" color={brand.white} />
                      ) : (
                        <FontAwesome name="send" size={12} color={brand.white} />
                      )}
                      <Text style={styles.sendBtnTxt}>{t('qnaSendAnswer')}</Text>
                    </Pressable>
                  </View>
                )
              ) : null}
            </View>
          ))
        : null}
    </>
  );

  const igReplyQuestion = igReplyOpenFor != null ? sortedRows.find((r) => r.id === igReplyOpenFor) : undefined;
  const igModalVisible = isInstagram && instagramAnchoredDock && isLoggedIn && igReplyOpenFor != null;
  const dockPadBottom = insets.bottom + spacing.sm;

  const replyDock = igReplyOpenFor != null && (
    <>
      <View style={[styles.igDockTop, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => {
            setIgReplyOpenFor(null);
            Keyboard.dismiss();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('modalClose')}>
          <FontAwesome name="times" size={18} color={brand.textMuted} />
        </Pressable>
        <Text style={[styles.igDockTitle, isRTL && styles.rtl]} numberOfLines={1}>
          {igReplyQuestion
            ? `${t('qnaReplyDockTitle')} · ${igReplyQuestion.body.slice(0, 42)}${igReplyQuestion.body.length > 42 ? '…' : ''}`
            : t('qnaReplyDockTitle')}
        </Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={[styles.igDockInputRow, isRTL && styles.rowRtl]}>
        <TextInput
          ref={dockReplyInputRef}
          value={replyById[igReplyOpenFor] ?? ''}
          onChangeText={(txt) => setReplyById((prev) => ({ ...prev, [igReplyOpenFor]: txt }))}
          placeholder={t('qnaAnswerPlaceholder')}
          placeholderTextColor={brand.textMuted}
          multiline
          style={[styles.igDockInput, isRTL && styles.rtlInput]}
          textAlignVertical="top"
        />
        <Pressable
          onPress={() => void onSendReply(igReplyOpenFor)}
          disabled={replyBusyId === igReplyOpenFor}
          style={({ pressed }) => [
            styles.igDockSend,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.9 },
            replyBusyId === igReplyOpenFor && { opacity: 0.6 },
          ]}>
          {replyBusyId === igReplyOpenFor ? (
            <ActivityIndicator size="small" color={brand.white} />
          ) : (
            <FontAwesome name="send" size={16} color={brand.white} />
          )}
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={wrapStyle}>
      {useInnerIgScroll ? (
        <ScrollView
          ref={innerScrollRef}
          style={styles.instagramScroll}
          contentContainerStyle={igReplyOpenFor != null ? styles.instagramScrollDockPad : undefined}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          {renderMain()}
        </ScrollView>
      ) : (
        renderMain()
      )}

      {isInstagram && instagramAnchoredDock ? (
        <Modal visible={igModalVisible} transparent animationType="fade" onRequestClose={dismissReplyDock}>
          <View style={styles.igModalRoot} pointerEvents="box-none">
            <Pressable
              style={styles.igModalBackdrop}
              onPress={dismissReplyDock}
              accessibilityRole="button"
              accessibilityLabel={t('closeOverlayA11y')}
            />
            <Animated.View style={[dockAnimatedStyle, styles.igDockShell, { paddingBottom: dockPadBottom }]}>
              {replyDock}
            </Animated.View>
          </View>
        </Modal>
      ) : null}

      {!instagramAnchoredDock && isInstagram && isLoggedIn && igReplyOpenFor != null ? (
        <Animated.View style={[dockAnimatedStyle, styles.igDockShell, { paddingBottom: dockPadBottom }]}>
          {replyDock}
        </Animated.View>
      ) : null}

      {!isInstagram || instagramAnchoredDock ? <KeyboardAwareBottomSpacer /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: spacing.sm,
  },
  embedRoot: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
  },
  intro: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 17,
    marginBottom: spacing.xs,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { textAlign: 'right', writingDirection: 'rtl' },
  iconGhost: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  listLoading: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  listLoadingRefreshing: {
    paddingVertical: spacing.sm,
  },
  listLoadingTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    textAlign: 'center',
  },
  err: { color: '#B91C1C', fontSize: fontSize.sm, fontWeight: '600' },
  muted: { color: brand.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  qBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
    gap: spacing.xs,
  },
  qBlockHighlight: {
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(51, 62, 143, 0.35)',
  },
  qHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  author: { flex: 1, fontSize: fontSize.xs, fontWeight: '800', color: brand.textMuted },
  dateMini: { fontSize: 10, fontWeight: '600', color: brand.textMuted },
  privatePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  privatePillTxt: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  qBody: { fontSize: fontSize.sm, fontWeight: '600', color: brand.text, lineHeight: 20 },
  meTooBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.25)',
    backgroundColor: 'rgba(51,62,143,0.06)',
  },
  meTooBtnOn: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  meTooTxt: { fontSize: 11, fontWeight: '800', color: brand.primary },
  meTooTxtOn: { color: brand.white },
  privateHint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  answersWrap: { gap: spacing.sm, marginTop: spacing.sm },
  showRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.2)',
  },
  showRepliesBtnAfter: {
    marginTop: spacing.sm,
  },
  showRepliesTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
  },
  showRepliesTxtGrow: { flex: 1 },
  answerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    gap: 4,
  },
  answerCardRtl: { alignItems: 'stretch' },
  answerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  answerAuthorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    maxWidth: '58%',
  },
  answerAuthorRowRtl: { flexDirection: 'row-reverse' },
  answerBadges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 6, maxWidth: '62%' },
  answerBadgesRtl: { flexDirection: 'row-reverse', justifyContent: 'flex-start' },
  answerAuthor: { flexShrink: 1, fontSize: 11, fontWeight: '800', color: brand.textMuted },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(30,58,138,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(30,58,138,0.22)',
  },
  communityPillTxt: { fontSize: 10, fontWeight: '800', color: '#1E3A8A' },
  verdictPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
    maxWidth: '100%',
    borderWidth: 1,
  },
  correctVerifyGreen: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verdictCorrect: { backgroundColor: '#D1FAE5', borderColor: '#86EFAC' },
  verdictIncorrect: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  verdictIncomplete: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  verdictPillTxt: { fontSize: 10, fontWeight: '800', flexShrink: 1 },
  verdictTxtCorrect: { color: '#065F46' },
  verdictTxtIncorrect: { color: '#991B1B' },
  verdictTxtIncomplete: { color: '#92400E' },
  /** Badge E-Tawjihi : conteneur pilule + pastille vérifiée bleue (style Meta). */
  officialBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(24, 119, 242, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(24, 119, 242, 0.38)',
  },
  metaVerifyBlue: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  officialBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0C4A9E',
  },
  answerBody: { fontSize: fontSize.sm, fontWeight: '600', color: brand.text, lineHeight: 19 },
  replyBox: { marginTop: spacing.sm, gap: spacing.xs },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.sm,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: brand.white,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
  },
  sendBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.xs },
  composeBlock: {
    marginTop: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
    gap: spacing.sm,
  },
  composeKav: {
    alignSelf: 'stretch',
  },
  composeInner: {
    gap: spacing.sm,
  },
  composeLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  loginCta: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.22)',
    alignItems: 'center',
  },
  loginCtaTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  visRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  visChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  visChipOn: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  visChipTxt: { fontSize: fontSize.xs, fontWeight: '800', color: brand.primary },
  visChipTxtOn: { color: brand.white },
  visHint: { fontSize: fontSize.xs, fontWeight: '600', color: brand.textMuted, lineHeight: 16 },
  inputLg: {
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: '#FAFBFC',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  primaryBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  instagramShell: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  instagramScroll: {
    flex: 1,
    minHeight: 0,
  },
  instagramScrollDockPad: {
    paddingBottom: 140,
  },
  igReplyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: '#FAFBFC',
  },
  igReplyEntryTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
  },
  igReplyDraftPreview: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    minWidth: 0,
  },
  igDockShell: {
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  igDockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  igDockTitle: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
    minWidth: 0,
  },
  igDockInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  igDockInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: '#F8FAFC',
  },
  igDockSend: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
  },
  igModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  igModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.42)',
  },
});
