import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';

type PhotoGalleryModalProps = {
  visible: boolean;
  uris: string[];
  initialIndex?: number;
  onClose: () => void;
  isRTL?: boolean;
  closeLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
};

export function PhotoGalleryModal({
  visible,
  uris,
  initialIndex = 0,
  onClose,
  isRTL = false,
  closeLabel = 'Fermer',
  prevLabel = 'Photo précédente',
  nextLabel = 'Photo suivante',
}: PhotoGalleryModalProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (uris.length === 0) {
    return null;
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + uris.length) % uris.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % uris.length);
  };

  const prevIcon = isRTL ? 'chevron-right' : 'chevron-left';
  const nextIcon = isRTL ? 'chevron-left' : 'chevron-right';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
          >
            <FontAwesome name="times" size={22} color="#FFFFFF" />
          </Pressable>
          {uris.length > 1 ? (
            <Text style={styles.counter}>
              {currentIndex + 1} / {uris.length}
            </Text>
          ) : (
            <View style={styles.counterSpacer} />
          )}
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={{ uri: uris[currentIndex] }}
            style={styles.image}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        {uris.length > 1 ? (
          <>
            <Pressable
              onPress={goPrev}
              hitSlop={12}
              style={[styles.navBtn, isRTL ? styles.navRight : styles.navLeft]}
              accessibilityRole="button"
              accessibilityLabel={prevLabel}
            >
              <FontAwesome name={prevIcon} size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={goNext}
              hitSlop={12}
              style={[styles.navBtn, isRTL ? styles.navLeft : styles.navRight]}
              accessibilityRole="button"
              accessibilityLabel={nextLabel}
            >
              <FontAwesome name={nextIcon} size={24} color="#FFFFFF" />
            </Pressable>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  counterSpacer: {
    width: 44,
  },
  imageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
  },
  navLeft: {
    left: 12,
  },
  navRight: {
    right: 12,
  },
});
