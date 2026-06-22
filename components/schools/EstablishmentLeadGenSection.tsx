import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ReactNode } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import type { EstablishmentNormalized } from '@/services/establishments';
import type { ListingPlacementInfo } from '@/services/referencingAds';
import { placementIsActivelySponsored } from '@/utils/referencingPlacementUi';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  establishment: Pick<EstablishmentNormalized, 'id' | 'nom' | 'sigle' | 'nomArabe'>;
  placement: ListingPlacementInfo;
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Poignée du bottom sheet (modal uniquement). */
  showHandle?: boolean;
  /** Bouton fermer (modal uniquement). */
  showClose?: boolean;
  onClose?: () => void;
  /** Limite la hauteur du formulaire (modal). Sur la fiche détail, le scroll est celui de la page. */
  formScrollMaxHeight?: number;
  /** `inline` = fiche détail ; `sheet` = corps du bottom sheet modal. */
  mode?: 'inline' | 'sheet';
  /** Scroll + espaceur clavier (modal bottom sheet). */
  keyboardAware?: boolean;
  /** Masque le texte d’intro au-dessus du formulaire (ex. écran succès). */
  hideFormIntro?: boolean;
};

export function establishmentLeadGenSubtitle(
  establishment: Pick<EstablishmentNormalized, 'nom' | 'sigle'>,
): string {
  return establishment.sigle && establishment.nom
    ? `${establishment.sigle} · ${establishment.nom}`
    : establishment.nom;
}

/** En-tête + corps du formulaire leadgen — même charte que la modal « Nous contacter ». */
export function EstablishmentLeadGenSection({
  establishment,
  placement,
  children,
  onLayout,
  showHandle = false,
  showClose = false,
  onClose,
  formScrollMaxHeight,
  mode = 'inline',
  keyboardAware = false,
  hideFormIntro = false,
}: Props) {
  const { isRTL, t } = useLocale();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const subtitle = establishmentLeadGenSubtitle(establishment);
  const isSheet = mode === 'sheet';
  const dismissKeyboard = () => Keyboard.dismiss();

  const formBlock = (
    <Pressable
      onPress={keyboardAware ? dismissKeyboard : undefined}
      accessibilityRole={keyboardAware ? 'none' : undefined}
      style={styles.formBlock}>
      {!hideFormIntro ? (
        <Text style={[styles.formHint, isRTL && styles.txtRtl]}>{t('estLeadgenTitle')}</Text>
      ) : null}
      {children}
    </Pressable>
  );

  return (
    <View style={[styles.outer, isSheet && styles.outerSheet]} onLayout={onLayout}>
      <View style={[styles.card, isSheet && styles.cardSheet]}>
        {showHandle ? (
          <Pressable onPress={keyboardAware ? dismissKeyboard : undefined} accessibilityRole="none">
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
          </Pressable>
        ) : null}

        <View style={[styles.brandHeader, isRTL && styles.brandHeaderRtl]}>
          <Pressable
            onPress={keyboardAware ? dismissKeyboard : undefined}
            accessibilityRole="none"
            style={[styles.brandHeaderMain, isRTL && styles.brandHeaderMainRtl]}>
            <View style={styles.brandHeaderIcon}>
              <FontAwesome name="comment" size={18} color={brand.white} />
            </View>
            <View style={styles.brandHeaderText}>
              <Text style={[styles.brandTitle, isRTL && styles.txtRtl]}>{t('estCardBtnContact')}</Text>
              <Text style={[styles.brandSubtitle, isRTL && styles.txtRtl]} numberOfLines={2}>
                {subtitle}
              </Text>
              {establishment.nomArabe ? (
                <Text style={[styles.brandSubtitleAr, isRTL && styles.txtRtl]} numberOfLines={1}>
                  {establishment.nomArabe}
                </Text>
              ) : null}
            </View>
          </Pressable>
          {showClose && onClose ? (
            <Pressable
              onPress={() => {
                dismissKeyboard();
                onClose();
              }}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('closeOverlayA11y')}>
              <FontAwesome name="times" size={15} color={brand.white} />
            </Pressable>
          ) : null}
        </View>

        {placementIsActivelySponsored(placement) ? (
          <Pressable
            onPress={keyboardAware ? dismissKeyboard : undefined}
            accessibilityRole="none"
            style={[styles.sponsorRibbonPress, isRTL && styles.sponsorRibbonPressRtl]}>
            <View style={[styles.sponsorRibbon, isRTL && styles.sponsorRibbonRtl]}>
              <FontAwesome name="star" size={10} color={homeShell.blue} />
              <Text style={styles.sponsorRibbonTxt}>{t('estLeadgenPartnerSponsored')}</Text>
            </View>
          </Pressable>
        ) : null}

        {formScrollMaxHeight != null ? (
          <ScrollView
            style={{ maxHeight: formScrollMaxHeight }}
            contentContainerStyle={styles.formScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets
            onScrollBeginDrag={keyboardAware ? dismissKeyboard : undefined}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled>
            {formBlock}
            {keyboardAware ? (
              <KeyboardAwareBottomSpacer minPaddingWhenKeyboardClosed={safeBottom + spacing.lg} />
            ) : null}
          </ScrollView>
        ) : (
          formBlock
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  outerSheet: {
    marginTop: 0,
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardSheet: {
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: brand.primary,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: brand.primary,
  },
  brandHeaderRtl: {
    flexDirection: 'row-reverse',
  },
  brandHeaderMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minWidth: 0,
  },
  brandHeaderMainRtl: {
    flexDirection: 'row-reverse',
  },
  brandHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  brandHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  brandTitle: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: brand.white,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  brandSubtitleAr: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 18,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  sponsorRibbonPress: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sponsorRibbonPressRtl: {
    alignSelf: 'flex-end',
  },
  sponsorRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
  },
  sponsorRibbonRtl: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  sponsorRibbonTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.blue,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  formBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  formScrollContent: {
    paddingBottom: spacing.sm,
  },
  formHint: {
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
