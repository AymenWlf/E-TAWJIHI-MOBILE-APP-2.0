import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { radius, spacing as space } from '@/theme/tokens';
import { heroShellHeaderUi, useHeroShellHeaderWide } from '@/utils/heroShellHeaderUi';

type Props = {
  /** Couleur de l’icône (heroes bleus → blanc ou homeShell.text). */
  color?: string;
  /** Marge après le bouton (direction logique). */
  trailingSpacing?: number;
};

const MIN_TOUCH = 44;

export function SidebarMenuIconButton({
  color = '#FFFFFF',
  trailingSpacing = space.sm,
}: Props) {
  const { open } = useAppSidebar();
  const { t } = useLocale();
  const { width: screenW } = useWindowDimensions();
  const isWideHeader = useHeroShellHeaderWide(screenW);

  return (
    <View style={[styles.wrap, { marginEnd: trailingSpacing }]}>
      <Pressable
        onPress={open}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          isWideHeader ? heroShellHeaderUi.iconBtn : styles.hit,
          pressed && (isWideHeader ? heroShellHeaderUi.iconBtnPressed : styles.hitPressed),
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('sidebarOpen')}
      >
        <FontAwesome name="bars" size={isWideHeader ? 20 : 21} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
  },
  hit: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'transparent',
  },
  hitPressed: {
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.12)',
  },
});
