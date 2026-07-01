import { Image, Pressable, StyleSheet } from 'react-native';

import { EstablishmentSnapCarousel } from '@/components/schools/EstablishmentSnapCarousel';
import type { HomeCopyKey } from '@/constants/i18n';
import { radius } from '@/theme/tokens';

const PHOTO_HEIGHT = 168;

type Props = {
  uris: string[];
  rtl?: boolean;
  t: (key: HomeCopyKey) => string;
  onPhotoPress: (index: number) => void;
};

export function EstablishmentPhotosCarousel({ uris, rtl = false, t, onPhotoPress }: Props) {
  if (!uris.length) return null;

  return (
    <EstablishmentSnapCarousel
      data={uris}
      keyExtractor={(uri, index) => `${uri}-${index}`}
      rtl={rtl}
      prevAccessibilityLabel={t('estDetailPhotoGalleryPrev')}
      nextAccessibilityLabel={t('estDetailPhotoGalleryNext')}
      cardsPerView={() => 1}
      renderSlide={(uri, { cardWidth, index }) => (
        <Pressable
          onPress={() => onPhotoPress(index)}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${index + 1} / ${uris.length}`}
        >
          <Image
            source={{ uri }}
            style={[styles.photo, { width: cardWidth, height: PHOTO_HEIGHT }]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  photo: {
    borderRadius: radius.lg,
    backgroundColor: '#E2E8F0',
  },
});
