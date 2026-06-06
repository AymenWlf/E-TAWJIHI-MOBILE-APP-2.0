import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import type { HomeCopyKey } from '@/constants/i18n';
import {
  GLOBAL_WALL_MOBILE_ENABLED,
  ORIENTATION_1BAC_SIDEBAR_ENABLED,
} from '@/constants/mobileFeatureFlags';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import { navigateToSchoolDiagnosticWizard } from '@/utils/navigateToSchoolDiagnosticEntry';
import { hasLegacyTassjilAccess } from '@/utils/tassjilPracticalLinkLock';
import type { TawjihPlusParcoursGate } from '@/utils/tawjihPlusParcoursGate';
import { CAIRO } from '@/theme/arabicTypography';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { heroShellHeaderUi, useHeroShellHeaderWide } from '@/utils/heroShellHeaderUi';

type IconKind = 'fa' | 'mci';

type SidebarLink = {
  id: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconKind: IconKind;
  labelKey: HomeCopyKey;
  href?: string;
  onPress?: () => void;
  iconBg: string;
  iconColor: string;
  badgeCount?: number;
};

type SidebarSection = {
  id: string;
  titleKey: HomeCopyKey;
  links: SidebarLink[];
};

const BACKDROP_OPACITY = 0.52;

function SidebarSectionBlock({
  section,
  isRTL,
  t,
  onNavigate,
}: {
  section: SidebarSection;
  isRTL: boolean;
  t: (k: HomeCopyKey) => string;
  onNavigate: (link: SidebarLink) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>{t(section.titleKey)}</Text>
      <View style={styles.sectionCard}>
        {section.links.map((link, index) => (
          <Pressable
            key={link.id}
            onPress={() => onNavigate(link)}
            style={({ pressed }): ViewStyle[] => [
              styles.linkRow,
              ...(isRTL ? [styles.linkRowRtl] : []),
              ...(index > 0 ? [styles.linkRowBorder] : []),
              ...(index === section.links.length - 1 ? [styles.linkRowLast] : []),
              ...(pressed ? [styles.linkRowPressed] : []),
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(link.labelKey)}
          >
            <View style={[styles.linkIconWrap, { backgroundColor: link.iconBg }]}>
              {link.iconKind === 'mci' ? (
                <MaterialCommunityIcons
                  name={link.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={18}
                  color={link.iconColor}
                />
              ) : (
                <FontAwesome
                  name={link.icon as React.ComponentProps<typeof FontAwesome>['name']}
                  size={16}
                  color={link.iconColor}
                />
              )}
            </View>
            <Text style={[styles.linkLabel, isRTL && styles.textRtl]} numberOfLines={2}>
              {t(link.labelKey)}
            </Text>
            {link.badgeCount != null && link.badgeCount > 0 ? (
              <View style={styles.linkBadge}>
                <Text style={styles.linkBadgeTxt}>
                  {link.badgeCount > 99 ? '99+' : link.badgeCount}
                </Text>
              </View>
            ) : null}
            <FontAwesome
              name={isRTL ? 'angle-left' : 'angle-right'}
              size={14}
              color={brand.textMuted}
              style={styles.chevron}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function AppSidebarPanel() {
  const { visible: ctxVisible, close } = useAppSidebar();
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { user, getValidAccessToken } = useAuth();
  const { count: cartCount } = useShopCart();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  const { width: windowWidth } = useWindowDimensions();

  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [sheetMounted, setSheetMounted] = useState(false);

  const panelWidth = useMemo(() => {
    if (windowWidth >= 1024) return Math.min(380, Math.round(windowWidth * 0.32));
    if (windowWidth >= 600) return Math.min(360, Math.round(windowWidth * 0.38));
    if (windowWidth >= 420) return Math.round(windowWidth * 0.84);
    return Math.round(windowWidth * 0.9);
  }, [windowWidth]);

  const isWideHeader = useHeroShellHeaderWide(windowWidth);

  const closedTranslate = isRTL ? panelWidth : -panelWidth;

  const sections = useMemo((): SidebarSection[] => {
    const discover: SidebarLink[] = [
      {
        id: 'events',
        href: '/(tabs)/evenements',
        icon: 'calendar-o',
        iconKind: 'fa',
        labelKey: 'sidebarEvents',
        iconBg: 'rgba(47, 206, 148, 0.14)',
        iconColor: homeShell.greenDark,
      },
      {
        id: 'daily',
        href: '/daily-challenge',
        icon: 'bolt',
        iconKind: 'fa',
        labelKey: 'dailyChallengeTitle',
        iconBg: 'rgba(51, 62, 143, 0.1)',
        iconColor: brand.primary,
      },
      ...(GLOBAL_WALL_MOBILE_ENABLED
        ? ([
            {
              id: 'community',
              href: '/communaute',
              icon: 'bullhorn',
              iconKind: 'fa' as const,
              labelKey: 'globalWallTitle' as const,
              iconBg: 'rgba(4, 120, 87, 0.12)',
              iconColor: brand.emerald,
            },
          ] satisfies SidebarLink[])
        : []),
    ];

    const tools: SidebarLink[] = [
      {
        id: 'diagnostic',
        icon: 'graduation-cap',
        iconKind: 'fa',
        labelKey: 'practical_diagnostic_ecoles',
        iconBg: 'rgba(14, 116, 144, 0.12)',
        iconColor: brand.cyan,
      },
      ...(ORIENTATION_1BAC_SIDEBAR_ENABLED
        ? ([
            {
              id: 'orientation-1bac',
              href: '/orientation-1bac',
              icon: 'compass',
              iconKind: 'fa' as const,
              labelKey: 'sidebarOrientation1Bac' as const,
              iconBg: 'rgba(51, 62, 143, 0.12)',
              iconColor: homeShell.blue,
            },
          ] satisfies SidebarLink[])
        : []),
    ];

    const shop: SidebarLink[] = [
      {
        id: 'cart',
        href: '/boutique/cart',
        icon: 'shopping-bag',
        iconKind: 'fa',
        labelKey: 'sidebarCart',
        iconBg: 'rgba(245, 158, 11, 0.14)',
        iconColor: '#B45309',
        badgeCount: cartCount,
      },
    ];

    const account: SidebarLink[] = [
      ...(hasLegacyTassjilAccess(user?.legacyLink)
        ? ([
            {
              id: 'tassjil-schools',
              href: '/tassjil-school-choices',
              icon: 'list-alt',
              iconKind: 'fa' as const,
              labelKey: 'sidebarTassjilSchools' as const,
              iconBg: 'rgba(51, 62, 143, 0.12)',
              iconColor: brand.primary,
            },
          ] satisfies SidebarLink[])
        : []),
      {
        id: 'loyalty',
        href: '/compte/fidelite',
        icon: 'gift',
        iconKind: 'fa',
        labelKey: 'referralPageTitle',
        iconBg: 'rgba(47, 206, 148, 0.14)',
        iconColor: homeShell.greenDark,
      },
    ];

    const out: SidebarSection[] = [
      { id: 'discover', titleKey: 'sidebarSectionDiscover', links: discover },
      { id: 'tools', titleKey: 'sidebarSectionTools', links: tools },
      { id: 'shop', titleKey: 'sidebarSectionShop', links: shop },
    ];

    if (user) {
      out.push({ id: 'account', titleKey: 'sidebarSectionAccount', links: account });
    }

    return out;
  }, [cartCount, user]);

  useEffect(() => {
    if (!ctxVisible) return;
    setSheetMounted(true);
    slide.setValue(closedTranslate);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: BACKDROP_OPACITY,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        stiffness: 380,
        damping: 32,
        mass: 0.85,
        overshootClamping: true,
        useNativeDriver: true,
      }),
    ]).start();
  }, [ctxVisible, closedTranslate, slide, backdropOpacity]);

  useEffect(() => {
    if (ctxVisible || !sheetMounted) return;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: closedTranslate,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setSheetMounted(false);
    });
  }, [ctxVisible, sheetMounted, closedTranslate, slide, backdropOpacity]);

  const tawjihPlusGate = useMemo<TawjihPlusParcoursGate>(
    () => ({
      hasAccess: hasTawjihPlusAccess,
      loading: tawjihPlusLoading,
      openProduct: () => router.push(TAWJIH_PLUS_PRODUCT_PATH as Href),
      t,
    }),
    [hasTawjihPlusAccess, router, t, tawjihPlusLoading],
  );

  const diagnosticNavAuth = useMemo(
    () => ({
      getValidAccessToken,
      userId: user?.id ?? null,
      uiLocale: (isRTL ? 'ar' : 'fr') as 'fr' | 'ar',
    }),
    [getValidAccessToken, isRTL, user?.id],
  );

  const onNavigate = (link: SidebarLink) => {
    close();
    if (link.onPress) {
      link.onPress();
      return;
    }
    if (link.id === 'diagnostic') {
      void navigateToSchoolDiagnosticWizard(diagnosticNavAuth, (href) => router.push(href as Href), tawjihPlusGate);
      return;
    }
    if (link.href) router.push(link.href as Href);
  };

  const safePadTop = Math.max(insets.top, spacing.md);
  const safePadBottom =
    Platform.OS === 'android' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom, spacing.md);
  const overlayVisible = ctxVisible || sheetMounted;
  const titleFont = isRTL ? CAIRO.extrabold : undefined;
  const subtitleFont = isRTL ? CAIRO.semibold : undefined;

  return (
    <PlatformSheetOverlay visible={overlayVisible} zIndex={8000} onRequestClose={close}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdropFill, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('sidebarClose')}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panelOuter,
            isRTL ? styles.panelOuterRtl : styles.panelOuterLtr,
            {
              width: panelWidth,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <View style={[styles.panelCard, isRTL ? styles.panelCardRtl : styles.panelCardLtr]}>
            <View style={[styles.heroHeader, { paddingTop: safePadTop }]}>
              <View style={[styles.heroTopRow, isRTL && styles.rowRtl]}>
                <View style={styles.brandMark}>
                  <Text style={[styles.brandLetter, titleFont && { fontFamily: titleFont }]}>E</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.brandName, titleFont && { fontFamily: titleFont }]}>E-TAWJIHI</Text>
                  <Text style={[styles.heroSubtitle, subtitleFont && { fontFamily: subtitleFont }, isRTL && styles.textRtl]}>
                    {t('sidebarSubtitle')}
                  </Text>
                </View>
                <Pressable
                  onPress={close}
                  hitSlop={16}
                  style={({ pressed }): ViewStyle[] => [
                    isWideHeader ? heroShellHeaderUi.iconBtn : styles.closeBtn,
                    ...(pressed
                      ? [isWideHeader ? heroShellHeaderUi.iconBtnPressed : styles.closeBtnPressed]
                      : []),
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('sidebarClose')}
                >
                  <FontAwesome
                    name="times"
                    size={isWideHeader ? 20 : 18}
                    color={isWideHeader ? homeShell.text : homeShell.textMuted}
                  />
                </Pressable>
              </View>
              <View style={[styles.heroAccentBar, isRTL && styles.heroAccentBarRtl]} />
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: safePadBottom + spacing.lg }]}
              showsVerticalScrollIndicator={false}
              bounces={Platform.OS === 'ios'}
            >
              <Text style={[styles.menuEyebrow, isRTL && styles.textRtl]}>{t('sidebarTitle')}</Text>
              {sections.map((section) => (
                <SidebarSectionBlock
                  key={section.id}
                  section={section}
                  isRTL={isRTL}
                  t={t}
                  onNavigate={onNavigate}
                />
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  panelOuter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    maxHeight: '100%',
    zIndex: 1,
    elevation: 18,
  },
  panelOuterLtr: {
    left: 0,
  },
  panelOuterRtl: {
    right: 0,
  },
  panelCard: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
    overflow: 'hidden',
    shadowColor: brand.primary,
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 16,
  },
  panelCardLtr: {
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  panelCardRtl: {
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  heroHeader: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    color: homeShell.text,
    fontSize: fontSize.xl,
    fontWeight: '900',
  },
  brandName: {
    color: homeShell.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroSubtitle: {
    marginTop: 2,
    color: homeShell.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    lineHeight: 16,
  },
  heroAccentBar: {
    marginTop: spacing.md,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
    width: 48,
    alignSelf: 'flex-start',
  },
  heroAccentBarRtl: {
    alignSelf: 'flex-end',
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  closeBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  menuEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.textSecondary,
    marginBottom: spacing.sm,
    marginStart: 2,
  },
  sectionCard: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    minHeight: 54,
  },
  linkRowRtl: {
    flexDirection: 'row-reverse',
  },
  linkRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
  },
  linkRowLast: {},
  linkRowPressed: {
    backgroundColor: brand.backgroundSoft,
  },
  linkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: brand.text,
    lineHeight: Platform.OS === 'android' ? 22 : 20,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  linkBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    backgroundColor: brand.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBadgeTxt: {
    color: brand.white,
    fontSize: 10,
    fontWeight: '800',
  },
  chevron: {
    opacity: 0.55,
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
