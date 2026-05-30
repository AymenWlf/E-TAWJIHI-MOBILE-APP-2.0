import { Platform, StyleSheet } from 'react-native';

import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, spacing } from '@/theme/tokens';

/** Espace entre la ligne de titre et le sous-titre (référence : liens pratiques). */
export const HOME_SECTION_TITLE_TO_SUBTITLE_GAP = 4;

const subtitlePaddingStart = 4 + spacing.sm;

export const homeSectionHeaderStyles = StyleSheet.create({
  sectionWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionWrapRtl: {
    alignSelf: 'stretch',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: HOME_SECTION_TITLE_TO_SUBTITLE_GAP,
    alignSelf: 'stretch',
  },
  /** Voir plus à gauche, bloc titre à droite (arabe). */
  titleRowRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  /** Ligne titre + action (Voir plus, parcours…) */
  titleRowWithTrailing: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  /** Trait vertical à droite du titre. */
  titleLeftRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  titleTextCol: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  /** Aligné sur DiagnosticStepHeader (textes à droite en arabe). */
  titleTextColRtl: {
    alignItems: 'flex-end',
  },
  titleAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: homeShell.blue,
    flexShrink: 0,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.35,
    alignSelf: 'stretch',
  },
  titleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  subtitle: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.12,
    marginBottom: spacing.md,
    paddingStart: subtitlePaddingStart,
    lineHeight: 16,
  },
  subtitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingStart: 0,
    paddingEnd: subtitlePaddingStart,
    alignSelf: 'stretch',
    lineHeight: 18,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  titleAccentSk: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: 'rgba(51, 62, 143, 0.2)',
    flexShrink: 0,
  },
  titleSk: {
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
    width: '65%',
    maxWidth: '100%',
  },
  subtitleSk: {
    width: '52%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.14)',
    marginBottom: spacing.md,
    marginStart: subtitlePaddingStart,
  },
  subtitleSkRtl: {
    marginStart: 0,
    marginEnd: subtitlePaddingStart,
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
});
