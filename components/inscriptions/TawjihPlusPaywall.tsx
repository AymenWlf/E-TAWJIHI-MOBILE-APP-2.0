import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccessContextOptional } from '@/contexts/TawjihPlusAccessContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type PaywallCtx = {
  isInscriptionsAccessPending: boolean;
  isInscriptionsLocked: boolean;
  openTawjihPlusProduct: () => void;
};

function usePaywall(): PaywallCtx | null {
  const ctx = useTawjihPlusAccessContextOptional();
  if (!ctx) return null;
  return {
    isInscriptionsAccessPending: ctx.isInscriptionsAccessPending,
    isInscriptionsLocked: ctx.isInscriptionsLocked,
    openTawjihPlusProduct: ctx.openTawjihPlusProduct,
  };
}

function shouldShowInscriptionsPaywall(paywall: PaywallCtx | null): boolean {
  return Boolean(
    paywall && !paywall.isInscriptionsAccessPending && paywall.isInscriptionsLocked,
  );
}

type CtaProps = {
  onPress?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Bouton principal « Passer à TAWJIH PLUS ». */
export function TawjihPlusUpgradeCta({ onPress, compact = false, style }: CtaProps) {
  const { t, isRTL } = useLocale();
  const paywall = usePaywall();

  return (
    <Pressable
      onPress={onPress ?? paywall?.openTawjihPlusProduct}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.cta,
        compact && styles.ctaCompact,
        style,
        pressed && { opacity: 0.88 },
      ]}
    >
      <FontAwesome name="unlock-alt" size={compact ? 12 : 14} color={brand.white} />
      <Text style={[styles.ctaTxt, compact && styles.ctaTxtCompact, isRTL && styles.rtl]} numberOfLines={2}>
        {t('inscTawjihPlusUpgradeCta')}
      </Text>
    </Pressable>
  );
}

type OverlayProps = {
  locked: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
};

function LockPanelContent({ compact = false }: { compact?: boolean }) {
  const { t, isRTL } = useLocale();
  const paywall = usePaywall();
  if (!paywall) return null;

  return (
    <>
      <View style={[styles.lockIconWrap, compact && styles.lockIconWrapCompact]}>
        <FontAwesome name="lock" size={compact ? 18 : 22} color={brand.primary} />
      </View>
      <Text style={[styles.overlayTitle, isRTL && styles.rtl]}>{t('inscTawjihPlusLockTitle')}</Text>
      <Text style={[styles.overlayHint, isRTL && styles.rtl]}>{t('inscTawjihPlusLockHint')}</Text>
      <TawjihPlusUpgradeCta compact={compact} onPress={paywall.openTawjihPlusProduct} style={styles.ctaFullWidth} />
    </>
  );
}

/** Panneau verrou visible dans les cartes annonces (preview) — pas de position absolue. */
export function TawjihPlusPreviewLockPanel({
  style,
  locked,
}: {
  style?: StyleProp<ViewStyle>;
  /** Si défini, prime sur `isInscriptionsLocked` du contexte (ex. `previewOnly` sur la carte). */
  locked?: boolean;
}) {
  const paywall = usePaywall();
  const show = locked ?? paywall?.isInscriptionsLocked;
  if (!show) return null;

  return (
    <View style={[styles.previewPanel, style]}>
      <LockPanelContent compact />
    </View>
  );
}

/**
 * Affiche le contenu estompé + bandeau verrou (fiche détail).
 * Layout en colonne pour éviter le clipping du CTA dans un conteneur trop bas.
 */
export function TawjihPlusLockOverlay({ locked, children, style, minHeight = 200 }: OverlayProps) {
  const paywall = usePaywall();

  if (!locked || !paywall?.isInscriptionsLocked) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.overlayWrap, style]}>
      {children ? (
        <View style={styles.overlayContent} pointerEvents="none">
          {children}
        </View>
      ) : null}
      <View style={[styles.overlayVeil, { minHeight }]}>
        <LockPanelContent />
      </View>
    </View>
  );
}

type SectionLockProps = {
  locked: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
};

/** Verrou compact par section (fiche détail annonce) — le contenu reste visible en filigrane. */
export function TawjihPlusSectionLock({
  locked,
  children,
  style,
  minHeight = 96,
}: SectionLockProps) {
  const { t, isRTL } = useLocale();
  const paywall = usePaywall();

  if (!locked || !paywall) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.sectionLockWrap, { minHeight }, style]}>
      {children ? (
        <View style={styles.sectionLockContent} pointerEvents="none">
          {children}
        </View>
      ) : null}
      <Pressable
        onPress={paywall.openTawjihPlusProduct}
        accessibilityRole="button"
        style={({ pressed }) => [styles.sectionLockVeil, pressed && { opacity: 0.94 }]}
      >
        <View style={styles.lockIconWrapCompact}>
          <FontAwesome name="lock" size={16} color={brand.primary} />
        </View>
        <Text style={[styles.sectionLockTitle, isRTL && styles.rtl]} numberOfLines={2}>
          {t('inscTawjihPlusLockTitle')}
        </Text>
        <Text style={[styles.sectionLockHint, isRTL && styles.rtl]} numberOfLines={3}>
          {t('inscTawjihPlusLockHint')}
        </Text>
      </Pressable>
    </View>
  );
}

type BannerProps = {
  locked: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Bandeau compact (barre de filtres, statut candidature…). */
export function TawjihPlusLockBanner({ locked, style }: BannerProps) {
  const { t, isRTL } = useLocale();
  const paywall = usePaywall();

  if (!locked || !shouldShowInscriptionsPaywall(paywall)) return null;

  return (
    <Pressable
      onPress={paywall.openTawjihPlusProduct}
      accessibilityRole="button"
      style={({ pressed }) => [styles.banner, style, pressed && { opacity: 0.92 }]}
    >
      <FontAwesome name="lock" size={16} color={brand.primary} />
      <View style={styles.bannerTextCol}>
        <Text style={[styles.bannerTitle, isRTL && styles.rtl]}>{t('inscTawjihPlusLockTitle')}</Text>
        <Text style={[styles.bannerHint, isRTL && styles.rtl]} numberOfLines={2}>
          {t('inscTawjihPlusLockHint')}
        </Text>
      </View>
      <TawjihPlusUpgradeCta compact onPress={paywall.openTawjihPlusProduct} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  previewPanel: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 188,
  },
  overlayWrap: {
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'visible',
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  overlayContent: {
    opacity: 0.35,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  overlayVeil: {
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  lockIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconWrapCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ctaFullWidth: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    width: '100%',
  },
  overlayTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  overlayHint: {
    fontSize: fontSize.xs,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    maxWidth: '100%',
  },
  ctaCompact: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  ctaTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
    flexShrink: 1,
  },
  ctaTxtCompact: {
    fontSize: fontSize.xs,
  },
  rtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  bannerHint: {
    fontSize: fontSize.xs,
    color: brand.textSecondary,
  },
  sectionLockWrap: {
    position: 'relative',
    alignSelf: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  sectionLockContent: {
    opacity: 0.3,
  },
  sectionLockVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  sectionLockTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  sectionLockHint: {
    fontSize: 11,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
