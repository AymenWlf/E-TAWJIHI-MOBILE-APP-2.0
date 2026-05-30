import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

/** Styles partagés pour carrousels horizontaux des sections accueil. */
export function homeFeedHorizontalScrollStyles() {
  return {
    scrollTrack: styles.scrollTrack,
    scrollTrackRtl: styles.scrollTrackRtl,
    contentContainer: styles.hScroll,
    /** Marge « début de liste » à gauche (dernières cartes), pas à droite (premières cartes). */
    contentContainerRtl: styles.hScrollRtl,
  };
}

const styles = StyleSheet.create({
  scrollTrack: {
    width: '100%',
    marginHorizontal: -spacing.xl,
    overflow: 'visible',
  },
  /** Défilement de droite vers la gauche : premier élément ancré à droite. */
  scrollTrackRtl: {
    direction: 'rtl',
  },
  hScroll: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingStart: spacing.xl,
    paddingEnd: spacing.xs,
  },
  hScrollRtl: {
    paddingStart: spacing.xs,
    paddingEnd: spacing.xl,
  },
});
