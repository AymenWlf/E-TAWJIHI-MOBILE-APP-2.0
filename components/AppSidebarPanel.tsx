import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
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
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type SidebarLink = {
  href: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  labelKey: HomeCopyKey;
};

const SIDEBAR_LINKS: SidebarLink[] = [
  { href: '/', icon: 'home', labelKey: 'tabHome' },
  { href: '/(tabs)/ecoles', icon: 'university', labelKey: 'tabEcoles' },
  { href: '/(tabs)/inscriptions', icon: 'calendar', labelKey: 'tabInscriptions' },
  { href: '/(tabs)/boutique', icon: 'shopping-cart', labelKey: 'tabBoutique' },
  { href: '/(tabs)/compte', icon: 'user-o', labelKey: 'tabCompte' },
  { href: '/boutique/cart', icon: 'shopping-bag', labelKey: 'sidebarCart' },
  { href: '/(tabs)/evenements', icon: 'calendar-o', labelKey: 'sidebarEvents' },
];

const BACKDROP_OPACITY = 0.48;

export function AppSidebarPanel() {
  const { visible: ctxVisible, close } = useAppSidebar();
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { width: windowWidth } = useWindowDimensions();

  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  /** Reste true jusqu’à la fin de l’animation de fermeture (le Modal reste visible). */
  const [sheetMounted, setSheetMounted] = useState(false);

  const panelWidth = useMemo(() => {
    const pct = windowWidth >= 600 ? 0.4 : windowWidth >= 420 ? 0.82 : 0.88;
    return Math.min(336, Math.round(windowWidth * pct));
  }, [windowWidth]);

  const closedTranslate = isRTL ? panelWidth : -panelWidth;

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
        stiffness: 400,
        damping: 30,
        mass: 0.82,
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

  const go = (href: string) => {
    close();
    router.push(href as Href);
  };

  /** Toujours sous la barre d’état / Dynamic Island — ne pas empiéter sur la zone système. */
  const safePadTop = Math.max(insets.top, spacing.md);
  const safePadBottom = Math.max(insets.bottom, spacing.md);

  return (
    <Modal
      visible={ctxVisible || sheetMounted}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent={false}
      onRequestClose={close}
    >
      <View style={viewStyles.modalRoot} accessibilityViewIsModal>
        {/* Plein écran : tap hors volet ferme (pas de calque plein écran au-dessus). */}
        <Animated.View style={[viewStyles.backdropFill, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('sidebarClose')}
          />
        </Animated.View>

        <Animated.View
          style={[
            viewStyles.panelOuter,
            isRTL ? viewStyles.panelOuterRtl : viewStyles.panelOuterLtr,
            {
              width: panelWidth,
              transform: [{ translateX: slide }],
              paddingTop: safePadTop,
              paddingBottom: safePadBottom,
            },
          ]}
        >
            <View style={[viewStyles.panelCard, isRTL ? viewStyles.panelCardRtl : viewStyles.panelCardLtr]}>
              <View style={[viewStyles.panelHeader, isRTL && viewStyles.rowRtl]}>
                <Text style={[textStyles.panelTitle, isRTL && textStyles.textRtl]}>{t('sidebarTitle')}</Text>
                <Pressable
                  onPress={close}
                  hitSlop={16}
                  style={({ pressed }): ViewStyle[] => [
                    viewStyles.closeBtn,
                    ...(pressed ? [viewStyles.closeBtnPressed] : []),
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('sidebarClose')}
                >
                  <FontAwesome name="times" size={20} color={brand.textMuted} />
                </Pressable>
              </View>

              <ScrollView
                style={viewStyles.scroll}
                contentContainerStyle={viewStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={Platform.OS === 'ios'}
              >
                {SIDEBAR_LINKS.map((link, index) => (
                  <Pressable
                    key={link.href}
                    onPress={() => go(link.href)}
                    style={({ pressed }): ViewStyle[] => [
                      viewStyles.linkRow,
                      ...(index === 0 ? [viewStyles.linkRowFirst] : []),
                      ...(index === SIDEBAR_LINKS.length - 1 ? [viewStyles.linkRowLast] : []),
                      ...(pressed ? [viewStyles.linkRowPressed] : []),
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t(link.labelKey)}
                  >
                    <View style={viewStyles.linkIconCircle}>
                      <FontAwesome name={link.icon} size={17} color={brand.primary} />
                    </View>
                    <Text style={[textStyles.linkLabel, isRTL && textStyles.textRtl]}>{t(link.labelKey)}</Text>
                    <FontAwesome
                      name={isRTL ? 'angle-left' : 'angle-right'}
                      size={14}
                      color={brand.textMuted}
                      style={viewStyles.chevron}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const viewStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
  panelOuter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    maxHeight: '100%',
    zIndex: 1,
    elevation: 16,
  },
  panelOuterLtr: {
    left: 0,
  },
  panelOuterRtl: {
    right: 0,
  },
  panelCard: {
    flex: 1,
    backgroundColor: brand.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 14,
    overflow: 'hidden',
  },
  panelCardLtr: {
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  panelCardRtl: {
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'transparent',
  },
  closeBtnPressed: {
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  linkRowFirst: {
    marginTop: spacing.sm,
  },
  linkRowLast: {
    marginBottom: spacing.sm,
  },
  linkRowPressed: {
    backgroundColor: 'rgba(51, 62, 143, 0.09)',
  },
  linkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  chevron: {
    opacity: 0.65,
  },
});

const textStyles = StyleSheet.create({
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  panelTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: brand.text,
    flex: 1,
    letterSpacing: Platform.OS === 'ios' ? -0.35 : 0,
  },
  linkLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: brand.text,
    lineHeight: 22,
  },
});
