import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EstablishmentDescriptionHtml } from '@/components/schools/EstablishmentDescriptionHtml';
import { SecteurDetailLoadingSkeleton } from '@/components/secteurs/SecteurDetailLoadingSkeleton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { LoadErrorState, loadErrorRetryLabel } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchFavoriteSecteurIds, toggleSecteurFavorite } from '@/services/favoris';
import {
  fetchSecteurDetail,
  pickSecteurTitle,
  type SecteurDetail,
} from '@/services/secteurs';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { getUserFacingLoadError } from '@/utils/apiError';

function ChipList({ items, isRTL }: { items: string[]; isRTL: boolean }) {
  if (items.length === 0) return null;
  return (
    <View style={[styles.chips, isRTL && styles.chipsRtl]}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipTxt}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function BulletList({
  items,
  tone,
  isRTL,
}: {
  items: string[];
  tone: 'plus' | 'minus';
  isRTL: boolean;
}) {
  if (items.length === 0) return null;
  const color = tone === 'plus' ? '#15803D' : '#B91C1C';
  const icon = tone === 'plus' ? 'check-circle' : 'times-circle';
  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={[styles.bulletRow, isRTL && styles.rowRtl]}>
          <FontAwesome name={icon as 'check-circle'} size={14} color={color} />
          <Text style={[styles.bulletTxt, isRTL && styles.rtl]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function SecteurDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
  const uiLocale = (locale === 'ar' ? 'ar' : 'fr') as 'fr' | 'ar';
  const { user, getValidAccessToken } = useAuth();
  const isLoggedIn = !!user;
  const params = useLocalSearchParams<{ id?: string; title?: string }>();
  const id = Number(params.id);

  const [data, setData] = useState<SecteurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const loadFavorite = useCallback(async () => {
    if (!isLoggedIn || !Number.isFinite(id) || id < 1) {
      setIsFavorite(false);
      return;
    }
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setIsFavorite(false);
        return;
      }
      const ids = await fetchFavoriteSecteurIds(token);
      setIsFavorite(ids.has(id));
    } catch {
      setIsFavorite(false);
    }
  }, [getValidAccessToken, id, isLoggedIn]);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      setLoadError(t('secteursDetailNotFound'));
      setData(null);
      return;
    }
    setLoadError(null);
    const token = await getValidAccessToken();
    try {
      const detail = await fetchSecteurDetail(id, { token });
      if (!detail) {
        setData(null);
        setLoadError(t('secteursDetailNotFound'));
        return;
      }
      setData(detail);
    } catch (e) {
      setData(null);
      setLoadError(getUserFacingLoadError(e, t, { context: 'generic' }));
    }
  }, [getValidAccessToken, id, t]);

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

  useEffect(() => {
    void loadFavorite();
  }, [loadFavorite]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([load(), loadFavorite()]);
    } finally {
      setRefreshing(false);
    }
  }, [load, loadFavorite]);

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      Alert.alert(t('inscRequireLogin'), undefined, [
        { text: t('accountLogoutCancel'), style: 'cancel' },
        { text: t('accountLoginCta'), onPress: () => router.push('/login' as never) },
      ]);
      return;
    }
    if (!Number.isFinite(id) || id < 1 || favoriteBusy) return;
    setFavoriteBusy(true);
    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setIsFavorite(wasFavorite);
        return;
      }
      const action = await toggleSecteurFavorite(token, id);
      if (!action) {
        setIsFavorite(wasFavorite);
        Alert.alert('', t('secteursFavoriteError'));
      } else {
        setIsFavorite(action === 'added');
      }
    } finally {
      setFavoriteBusy(false);
    }
  }, [favoriteBusy, getValidAccessToken, id, isFavorite, isLoggedIn, router, t]);

  const title = useMemo(() => {
    if (data) return pickSecteurTitle(data, uiLocale);
    if (typeof params.title === 'string' && params.title.trim()) return params.title.trim();
    return t('secteursTitle');
  }, [data, params.title, t, uiLocale]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, title: '', header: () => null }} />
      <StatusBar style="light" />
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={[styles.topBar, isRTL && styles.rowRtl]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.85 }]}
            accessibilityLabel="Back"
          >
            <FontAwesome
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={16}
              color={brand.white}
            />
          </Pressable>
          <Text style={[styles.topTitle, isRTL && styles.rtl]} numberOfLines={1}>
            {title}
          </Text>
          <Pressable
            onPress={() => void handleToggleFavorite()}
            disabled={favoriteBusy}
            style={({ pressed }) => [
              styles.iconBtn,
              isFavorite && styles.favBtnOn,
              (pressed || favoriteBusy) && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            accessibilityLabel={isFavorite ? t('secteursRemoveFavorite') : t('secteursAddFavorite')}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={16}
              color={isFavorite ? '#FCA5A5' : brand.white}
            />
          </Pressable>
          <HeroLangSwitch />
        </View>
      </View>

      {loading && !data ? (
        <SecteurDetailLoadingSkeleton isRTL={isRTL} bottomInset={insets.bottom} />
      ) : loadError && !data ? (
        <ScrollView
          contentContainerStyle={styles.errorWrap}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <LoadErrorState
            message={loadError}
            onRetry={() => void load()}
            retryLabel={loadErrorRetryLabel(t)}
            isRTL={isRTL}
          />
        </ScrollView>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.coverWrap}>
            {data.imageUrl ? (
              <Image source={{ uri: data.imageUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={styles.coverFallback}>
                <FontAwesome name="briefcase" size={48} color={brand.white} />
              </View>
            )}
          </View>

          <View style={styles.headerCard}>
            <Text style={[styles.h1, isRTL && styles.rtl]}>{pickSecteurTitle(data, uiLocale)}</Text>
            {data.code ? (
              <Text style={[styles.code, isRTL && styles.rtl]}>{data.code}</Text>
            ) : null}
            {data.recommendationScore != null ? (
              <View style={[styles.matchPill, isRTL && styles.rowRtl]}>
                <FontAwesome name="bullseye" size={12} color={brand.primary} />
                <Text style={styles.matchPillTxt}>
                  {data.recommendationScore}% {t('secteursMatch')}
                </Text>
              </View>
            ) : null}

            <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
              <StatBox value={data.nbEcoles} label={t('secteursStatSchools')} isRTL={isRTL} />
              <StatBox value={data.nbFilieres} label={t('secteursStatPrograms')} isRTL={isRTL} />
              <StatBox value={data.nbMetiers} label={t('secteursStatJobs')} isRTL={isRTL} />
            </View>
          </View>

          {data.salaireLabel ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursSalary')}
              </Text>
              <View style={[styles.salaryBox, isRTL && styles.rowRtl]}>
                <FontAwesome name="money" size={16} color="#15803D" />
                <Text style={[styles.salaryTxt, isRTL && styles.rtl]}>{data.salaireLabel}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
              {t('secteursAbout')}
            </Text>
            <EstablishmentDescriptionHtml
              description={data.description}
              emptyLabel={t('secteursNoDescription')}
              forceRtl={isRTL}
            />
          </View>

          {data.softSkills.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursSoftSkills')}
              </Text>
              <ChipList items={data.softSkills} isRTL={isRTL} />
            </View>
          ) : null}

          {data.personnalites.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursPersonalities')}
              </Text>
              <ChipList items={data.personnalites} isRTL={isRTL} />
            </View>
          ) : null}

          {(data.bacs.length > 0 || data.typeBacs.length > 0) ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursBac')}
              </Text>
              <ChipList items={[...data.typeBacs, ...data.bacs]} isRTL={isRTL} />
            </View>
          ) : null}

          {data.metiers.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursJobs')}
              </Text>
              <ChipList items={data.metiers} isRTL={isRTL} />
            </View>
          ) : null}

          {data.avantages.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursPros')}
              </Text>
              <BulletList items={data.avantages} tone="plus" isRTL={isRTL} />
            </View>
          ) : null}

          {data.inconvenients.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('secteursCons')}
              </Text>
              <BulletList items={data.inconvenients} tone="minus" isRTL={isRTL} />
            </View>
          ) : null}

          <Pressable
            onPress={() => router.push('/(tabs)/ecoles' as never)}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
          >
            <FontAwesome name="university" size={16} color={brand.white} />
            <Text style={styles.ctaTxt}>{t('secteursCtaSchools')}</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );
}

function StatBox({
  value,
  label,
  isRTL,
}: {
  value: number;
  label: string;
  isRTL: boolean;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal} latinDigits>
        {value}
      </Text>
      <Text style={[styles.statLabel, isRTL && styles.rtl]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: homeShell.bg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  favBtnOn: {
    backgroundColor: 'rgba(220,38,38,0.28)',
  },
  topTitle: {
    flex: 1,
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.md,
  },
  errorWrap: {
    flexGrow: 1,
    backgroundColor: brand.backgroundSoft,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  scroll: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
  },
  scrollContent: {
    gap: spacing.md,
  },
  coverWrap: {
    height: 200,
    backgroundColor: brand.borderLight,
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
  },
  headerCard: {
    marginTop: -28,
    marginHorizontal: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: 6,
  },
  h1: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 28,
  },
  code: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    fontWeight: '600',
  },
  matchPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.1)',
  },
  matchPillTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statVal: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.primary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: brand.textMuted,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
  },
  salaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  salaryTxt: {
    flex: 1,
    fontWeight: '700',
    color: '#166534',
    fontSize: fontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsRtl: { flexDirection: 'row-reverse' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(51,62,143,0.08)',
  },
  chipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.primary,
  },
  bulletList: { gap: 8 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    lineHeight: 20,
  },
  cta: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
  },
  ctaTxt: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
