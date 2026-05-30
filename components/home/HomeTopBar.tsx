import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import {
  ETAWJIHI_HEADER_LOGO_HEIGHT,
  ETAWJIHI_LOGO_LIGHT_ASPECT,
  ETAWJIHI_LOGO_LIGHT_URL,
} from '@/constants/brandAssets';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { spacing } from '@/theme/tokens';

/** Hauteur visuelle du logo (largeur = ratio × hauteur). */
const LOGO_HEIGHT = 68;

type Props = {
  unreadCount: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  /** Ouvre le menu latéral (navigation principale). */
  onPressMenu?: () => void;
};

export function HomeTopBar({
  unreadCount,
  onPressNotifications,
  onPressProfile,
  onPressMenu,
}: Props) {
  const { t, isRTL } = useLocale();
  const notificationsA11y =
    unreadCount > 0
      ? `${t('notifications')}, ${unreadCount} ${t('unreadSuffix')}`
      : t('notifications');

  return (
    <View style={[styles.row, isRTL && styles.rowRtl]}>
      {onPressMenu ? (
        <Pressable
          onPress={onPressMenu}
          hitSlop={10}
          style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel={t('sidebarOpen')}
        >
          <FontAwesome name="bars" size={22} color={homeShell.text} />
        </Pressable>
      ) : null}
      <View style={[styles.logoBlock, isRTL && styles.logoBlockRtl]} accessibilityLabel="E-Tawjihi">
        <Image
          source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
          style={[styles.logoImage, isRTL && styles.logoImageRtl]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.rowSpacer} />
      <HeroLangSwitch style={styles.langSwitchSlot} />
      <View style={styles.actions}>
        <Pressable
          onPress={onPressNotifications}
          hitSlop={8}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={notificationsA11y}>
          <FontAwesome name="bell-o" size={22} color={homeShell.text} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={onPressProfile}
          hitSlop={8}
          style={[styles.iconBtn, styles.iconBtnSp]}
          accessibilityLabel={t('profile')}>
          <FontAwesome name="user-circle-o" size={26} color={homeShell.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    marginEnd: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  /** Prend l'espace restant entre logo et actions. */
  rowSpacer: {
    flex: 1,
    minWidth: spacing.sm,
  },
  langSwitchSlot: {
    marginEnd: spacing.md,
  },
  logoBlock: {
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  logoBlockRtl: {
    alignItems: 'flex-end',
  },
  /** CDN `logo-blanc-nobg.png` = 1000×500 ; largeur = ratio × hauteur pour éviter le centrage interne de `contain`. */
  logoImage: {
    width: ETAWJIHI_HEADER_LOGO_HEIGHT * ETAWJIHI_LOGO_LIGHT_ASPECT,
    maxWidth: '100%',
    aspectRatio: ETAWJIHI_LOGO_LIGHT_ASPECT,
    alignSelf: 'flex-start',
  },
  logoImageRtl: {
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  iconBtnSp: {
    marginStart: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -2,
    end: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: homeShell.notifBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: homeShell.notifBadgeBorder,
  },
  badgeTxt: {
    color: homeShell.notifBadgeText,
    fontSize: 10,
    fontWeight: '800',
  },
});