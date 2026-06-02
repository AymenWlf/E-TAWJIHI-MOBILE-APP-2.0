import { Platform, StyleSheet } from 'react-native';

import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';
import { HOME_HERO_WIDE_MIN_WIDTH } from '@/utils/homeTopBackdropLayout';

/** Layout en-tête hero / shell sur tablette et grands écrans (≥ 600px). */
export function useHeroShellHeaderWide(screenWidth: number): boolean {
  return screenWidth >= HOME_HERO_WIDE_MIN_WIDTH;
}

/** Styles partagés des boutons et rangées d’en-tête hero (accueil, onglets, chatbot, sidebar). */
export const heroShellHeaderUi = StyleSheet.create({
  headerRowWide: {
    gap: spacing.md,
    minHeight: 44,
    alignItems: 'center',
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnCompact: {
    minWidth: 40,
    minHeight: 40,
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnPressed: {
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.16)',
  },
  langSwitchWide: {
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.hairline,
  },
});
