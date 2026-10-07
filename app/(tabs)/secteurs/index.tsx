import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInputWithApply } from '@/components/search/SearchInputWithApply';
import { SecteurCard } from '@/components/secteurs/SecteurCard';
import { SecteurCardSkeletonStack } from '@/components/secteurs/SecteurCardSkeleton';
import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { LoadErrorState, loadErrorRetryLabel } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppliedTextSearch } from '@/hooks/useAppliedTextSearch';
import { fetchFavoriteSecteurIds, toggleSecteurFavorite } from '@/services/favoris';
import {
  fetchSecteursCatalog,
  pickSecteurTitle,
  type SecteurCard as SecteurCardModel,
} from '@/services/secteurs';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { getUserFacingLoadError } from '@/utils/apiError';

import { DIR_LTR, DIR_RTL } from '@/utils/layoutDirection';
export default function SecteursScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
  const uiLocale = (locale === 'ar' ? 'ar' : 'fr') as 'fr' | 'ar';
  const { user, getValidAccessToken } = useAuth();
  const isLoggedIn = !!user;

  const [items, setItems] = useState<SecteurCardModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const listRef = useRef<FlatList<SecteurCardModel>>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteBusyIds, setFavoriteBusyIds] = useState<Set<number>>(() => new Set());

  const {
    draft: q,
    setDraft: setQ,
    applied: appliedQ,
    apply: applySearch,
    clear: clearSearch,
    hasPending: searchPending,
  } = useAppliedTextSearch();

  const reloadFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setFavoriteIds(new Set());
        return;
      }
      setFavoriteIds(await fetchFavoriteSecteurIds(token));
    } catch {
      setFavoriteIds(new Set());
    }
  }, [getValidAccessToken, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setFavoritesOnly(false);
      setFavoriteIds(new Set());
      return;
    }
    void reloadFavorites();
  }, [isLoggedIn, reloadFavorites, user?.id]);

  const load = useCallback(async () => {
    setLoadError(null);
    const token = await getValidAccessToken();
    try {
      const res = await fetchSecteursCatalog({
        search: appliedQ,
        token,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setLoadError(getUserFacingLoadError(e, t, { context: 'generic' }));
    }
  }, [appliedQ, getValidAccessToken, t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([load(), reloadFavorites()]);
    } finally {
      setRefreshing(false);
    }
  }, [load, reloadFavorites]);

  const onApplySearch = useCallback(() => {
    applySearch();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [applySearch]);

  const onPressFavoritesOnlyToggle = useCallback(() => {
    if (!isLoggedIn) {
      Alert.alert(t('inscRequireLogin'), undefined, [
        { text: t('accountLogoutCancel'), style: 'cancel' },
        { text: t('accountLoginCta'), onPress: () => router.push('/login' as never) },
      ]);
      return;
    }
    setFavoritesOnly((v) => !v);
  }, [isLoggedIn, router, t]);

  const handleToggleFavorite = useCallback(
    async (secteurId: number) => {
      if (!isLoggedIn) {
        Alert.alert(t('inscRequireLogin'), undefined, [
          { text: t('accountLogoutCancel'), style: 'cancel' },
          { text: t('accountLoginCta'), onPress: () => router.push('/login' as never) },
        ]);
        return;
      }
      if (!Number.isFinite(secteurId) || secteurId <= 0) return;
      if (favoriteBusyIds.has(secteurId)) return;

      setFavoriteBusyIds((prev) => {
        const next = new Set(prev);
        next.add(secteurId);
        return next;
      });
      const wasFavorite = favoriteIds.has(secteurId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(secteurId);
        else next.add(secteurId);
        return next;
      });

      try {
        const token = await getValidAccessToken();
        if (!token) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (wasFavorite) next.add(secteurId);
            else next.delete(secteurId);
            return next;
          });
          return;
        }
        const action = await toggleSecteurFavorite(token, secteurId);
        if (!action) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (wasFavorite) next.add(secteurId);
            else next.delete(secteurId);
            return next;
          });
          Alert.alert('', t('secteursFavoriteError'));
        }
      } finally {
        setFavoriteBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(secteurId);
          return next;
        });
      }
    },
    [favoriteBusyIds, favoriteIds, getValidAccessToken, isLoggedIn, router, t],
  );

  const displayedItems = useMemo(() => {
    if (!favoritesOnly || !isLoggedIn) return items;
    return items.filter((it) => favoriteIds.has(it.id));
  }, [favoriteIds, favoritesOnly, isLoggedIn, items]);

  const resultsLabel = useMemo(() => {
    const n = displayedItems.length;
    if (uiLocale === 'ar') return `${n} قطاع`;
    return `${n} secteur${n > 1 ? 's' : ''}`;
  }, [displayedItems.length, uiLocale]);

  const emptyIsFavorites =
    !loading && !loadError && favoritesOnly && items.length > 0 && displayedItems.length === 0;

  return (
    <View style={[styles.root, isRTL ? styles.rtlDir : styles.ltrDir]}>
      <Stack.Screen options={{ headerShown: false, title: '', header: () => null }} />
      <StatusBar style="light" />
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.hero}>
          <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
            <SidebarMenuIconButton color={homeShell.text} />
            <View style={styles.heroTitles}>
              <Text style={[styles.heroTitle, isRTL && styles.rtl]} numberOfLines={2}>
                {t('secteursTitle')}
              </Text>
              <Text style={[styles.heroSub, isRTL && styles.rtl]} numberOfLines={2}>
                {t('secteursSubtitle')}
              </Text>
            </View>
            <HeroLangSwitch />
          </View>

          <View style={styles.searchCard}>
            <SearchInputWithApply
              value={q}
              onChangeText={setQ}
              onApply={onApplySearch}
              onClear={clearSearch}
              placeholder={t('secteursSearchPlaceholder')}
              applyLabel={t('secteursApplySearch')}
              showApply={searchPending || q.trim().length > 0}
              isRTL={isRTL}
              compact
            />
            <View style={[styles.filterBarRow, isRTL && styles.rowRtl]}>
              <Pressable
                onPress={onPressFavoritesOnlyToggle}
                style={({ pressed }) => [
                  styles.favoritesOnlyBtn,
                  favoritesOnly && styles.favoritesOnlyBtnOn,
                  pressed && { opacity: 0.88 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: favoritesOnly }}
                accessibilityLabel={t('secteursFavoritesOnlyA11y')}
              >
                <FontAwesome
                  name={favoritesOnly ? 'heart' : 'heart-o'}
                  size={16}
                  color={favoritesOnly ? homeShell.blue : homeShell.cardMuted}
                />
                <Text
                  style={[
                    styles.favoritesOnlyTxt,
                    favoritesOnly && styles.favoritesOnlyTxtOn,
                  ]}
                  numberOfLines={1}
                >
                  {t('secteursFavoritesOnlyA11y')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {!loading && !loadError ? (
          <View style={[styles.resultsBar, isRTL && styles.rowRtl]}>
            <Text style={[styles.resultsTxt, isRTL && styles.rtl]} latinDigits>
              {resultsLabel}
              {appliedQ.trim() ? ` · « ${appliedQ.trim()} »` : ''}
              {favoritesOnly ? ' · ♥' : ''}
            </Text>
            {!favoritesOnly && total > 0 && total !== items.length ? (
              <Text style={styles.resultsMuted} latinDigits>
                / {total}
              </Text>
            ) : null}
          </View>
        ) : null}

        {loading ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.listLoading}
            keyboardShouldPersistTaps="handled"
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <SecteurCardSkeletonStack count={3} isRTL={isRTL} />
          </ScrollView>
        ) : loadError ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.centerGrow}
            keyboardShouldPersistTaps="handled"
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <LoadErrorState
              message={loadError}
              onRetry={() => void load()}
              retryLabel={loadErrorRetryLabel(t)}
              isRTL={isRTL}
            />
          </ScrollView>
        ) : displayedItems.length === 0 ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.emptyWrap}
            keyboardShouldPersistTaps="handled"
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <FontAwesome
              name={emptyIsFavorites ? 'heart-o' : 'briefcase'}
              size={40}
              color={brand.border}
            />
            <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>
              {emptyIsFavorites ? t('secteursFavoritesEmptyTitle') : t('secteursEmptyTitle')}
            </Text>
            <Text style={[styles.emptyBody, isRTL && styles.rtl]}>
              {emptyIsFavorites ? t('secteursFavoritesEmptyBody') : t('secteursEmptyBody')}
            </Text>
            {emptyIsFavorites ? (
              <Pressable onPress={() => setFavoritesOnly(false)} style={styles.clearBtn}>
                <Text style={styles.clearBtnTxt}>{t('secteursShowAll')}</Text>
              </Pressable>
            ) : appliedQ.trim() ? (
              <Pressable onPress={clearSearch} style={styles.clearBtn}>
                <Text style={styles.clearBtnTxt}>{t('secteursClearSearch')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={displayedItems}
            keyExtractor={(item) => `secteur-${item.id}`}
            style={[styles.fill, isRTL ? DIR_RTL : undefined]}
            contentContainerStyle={styles.list}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            keyboardShouldPersistTaps="handled"
            extraData={favoriteIds}
            renderItem={({ item }) => (
              <SecteurCard
                item={item}
                locale={uiLocale}
                isRTL={isRTL}
                matchLabel={t('secteursMatch')}
                isFavorite={favoriteIds.has(item.id)}
                favoriteBusy={favoriteBusyIds.has(item.id)}
                onToggleFavorite={() => void handleToggleFavorite(item.id)}
                addFavoriteA11y={t('secteursAddFavorite')}
                removeFavoriteA11y={t('secteursRemoveFavorite')}
                onPress={() =>
                  router.push({
                    pathname: '/secteurs/[id]',
                    params: {
                      id: String(item.id),
                      title: pickSecteurTitle(item, uiLocale),
                    },
                  })
                }
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
  },
  ltrDir: DIR_LTR,
  rtlDir: DIR_RTL,
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 10,
  },
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  heroTitles: { flex: 1, minWidth: 0, gap: 4 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: homeShell.text,
    letterSpacing: 0,
  },
  heroSub: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.textMuted,
    lineHeight: 18,
  },
  searchCard: {
    marginTop: spacing.md,
    backgroundColor: homeShell.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.18)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  favoritesOnlyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  favoritesOnlyBtnOn: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: 'rgba(51,62,143,0.28)',
  },
  favoritesOnlyTxt: {
    flexShrink: 1,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.cardMuted,
  },
  favoritesOnlyTxtOn: {
    color: homeShell.blueDeep,
  },
  body: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
  },
  fill: { flex: 1 },
  centerGrow: { flexGrow: 1 },
  /** Même padding que la liste réelle (comme écoles / annonces). */
  listLoading: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  resultsTxt: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
  },
  resultsMuted: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    opacity: 0.7,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.1)',
  },
  clearBtnTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
