import type { ReactNode } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';

type Props = {
  visible: boolean;
  /** Garde l’overlay monté pendant une animation de fermeture (`visible` déjà false). */
  keepMounted?: boolean;
  children: ReactNode;
  onRequestClose?: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  /** z-index iOS (défaut 9000). */
  zIndex?: number;
};

/**
 * Overlay type sheet / plein écran.
 * Sur iOS (Fabric), évite `Modal` et `FullWindowOverlay` (crash RNSModalScreen + status bar).
 * Le parent direct doit avoir `flex: 1` (écran racine ou wizard).
 */
export function PlatformSheetOverlay({
  visible,
  keepMounted = false,
  children,
  onRequestClose,
  animationType = 'none',
  zIndex = 9000,
}: Props) {
  const mounted = visible || keepMounted;
  if (!mounted) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return (
      <View
        style={[styles.iosOverlay, { zIndex, elevation: zIndex }]}
        pointerEvents={visible || keepMounted ? 'box-none' : 'none'}
        accessibilityViewIsModal={visible}>
        {children}
      </View>
    );
  }

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent>
      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  iosOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
