import { Children, isValidElement, type ReactNode } from 'react';
import { Platform, ScrollView, View, type StyleProp, ViewStyle } from 'react-native';

import { homeFeedHorizontalScrollStyles } from '@/components/home/homeFeedHorizontalScrollStyles';

type Props = {
  isRTL: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Carrousel horizontal accueil (écoles, annonces, liens pratiques…).
 * — iOS RTL : `direction: 'rtl'` ancre le contenu à droite.
 * — Android RTL : miroir `scaleX` (ScrollView + enfants), car `direction: 'rtl'` est peu fiable.
 */
export function HomeFeedHorizontalScroll({ isRTL, children, style }: Props) {
  const scroll = homeFeedHorizontalScrollStyles();
  const useAndroidRtlMirror = isRTL && Platform.OS === 'android';
  const useIosDirectionRtl = isRTL && Platform.OS !== 'android';

  const content = useAndroidRtlMirror
    ? Children.map(Children.toArray(children), (child, index) => {
        if (!isValidElement(child)) {
          return child;
        }
        return (
          <View
            key={child.key ?? `home-hscroll-${index}`}
            style={scroll.androidRtlMirrorChild}>
            {child}
          </View>
        );
      })
    : children;

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={[
        scroll.scrollTrack,
        useIosDirectionRtl && scroll.scrollTrackRtl,
        useAndroidRtlMirror && scroll.scrollTrackAndroidRtlMirror,
        style,
      ]}
      contentContainerStyle={[
        scroll.contentContainer,
        useIosDirectionRtl && scroll.contentContainerRtl,
        useAndroidRtlMirror && scroll.contentContainerAndroidRtl,
      ]}>
      {content}
    </ScrollView>
  );
}
