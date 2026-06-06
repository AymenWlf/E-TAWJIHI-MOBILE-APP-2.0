import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

/** Styles partagés pour carrousels horizontaux des sections accueil. */
export function homeFeedHorizontalScrollStyles() {
  return {
    scrollTrack: styles.scrollTrack,
    scrollTrackRtl: styles.scrollTrackRtl,
    scrollTrackAndroidRtlMirror: styles.scrollTrackAndroidRtlMirror,
    androidRtlMirrorChild: styles.androidRtlMirrorChild,
    contentContainer: styles.hScroll,
    /** Marge « début de liste » à gauche (dernières cartes), pas à droite (premières cartes). */
    contentContainerRtl: styles.hScrollRtl,
    /** Android RTL miroir : même marge que iOS RTL (première carte côté droit). */
    contentContainerAndroidRtl: styles.hScrollAndroidRtl,
  };
}

const styles = StyleSheet.create({
  scrollTrack: {
    width: '100%',
    marginHorizontal: -spacing.xl,
    overflow: 'visible',
  },
  /** iOS : défilement de droite vers la gauche, premier élément ancré à droite. */
  scrollTrackRtl: {
    direction: 'rtl',
  },
  /**
   * Android : `direction: 'rtl'` est ignoré sur ScrollView horizontal — miroir horizontal
   * (scroll + enfants) pour aligner le premier item à droite comme sur iOS.
   */
  scrollTrackAndroidRtlMirror: {
    transform: [{ scaleX: -1 }],
  },
  androidRtlMirrorChild: {
    transform: [{ scaleX: -1 }],
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
  hScrollAndroidRtl: {
    paddingStart: spacing.xs,
    paddingEnd: spacing.xl,
  },
});
