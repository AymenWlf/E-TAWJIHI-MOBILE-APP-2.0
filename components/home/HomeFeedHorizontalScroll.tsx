import { type ReactNode } from 'react';
import { ScrollView, type StyleProp, ViewStyle } from 'react-native';

import { homeFeedHorizontalScrollStyles } from '@/components/home/homeFeedHorizontalScrollStyles';

type Props = {
  isRTL: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Carrousel horizontal accueil : en RTL, `direction: 'rtl'` ancre le contenu à droite
 * et le geste de scroll va vers la gauche (comme stories / offres).
 */
export function HomeFeedHorizontalScroll({ isRTL, children, style }: Props) {
  const scroll = homeFeedHorizontalScrollStyles();

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={[scroll.scrollTrack, isRTL && scroll.scrollTrackRtl, style]}
      contentContainerStyle={[scroll.contentContainer, isRTL && scroll.contentContainerRtl]}>
      {children}
    </ScrollView>
  );
}
