import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { ETAWJIHI_LOGO_LIGHT_ASPECT, ETAWJIHI_LOGO_LIGHT_URL } from '@/constants/brandAssets';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

/** Hauteur visuelle du logo (largeur = ratio × hauteur). */
const LOGO_HEIGHT = 68;

type Props = {
  unreadCount: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
};

export function HomeTopBar({ unreadCount, onPressNotifications, onPressProfile }: Props) {
  const { locale, setLocale, t, isRTL } = useLocale();
  const notificationsA11y =
    unreadCount > 0
      ? `${t('notifications')}, ${unreadCount} ${t('unreadSuffix')}`
      : t('notifications');

  return (
    <View style={[styles.row, isRTL && styles.rowRtl]}>
      <View style={[styles.logoBlock, isRTL && styles.logoBlockRtl]} accessibilityLabel="E-Tawjihi">
        <Image
          source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
          style={[styles.logoImage, isRTL && styles.logoImageRtl]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.rowSpacer} />
      <View
        style={[styles.langSwitch, isRTL && styles.langSwitchRtl]}
        accessibilityRole="tablist"
        accessibilityLabel={t('languageSwitcher')}>
        <Pressable
          onPress={() => setLocale('fr')}
          style={({ pressed }) => [
            styles.langPill,
            locale === 'fr' && styles.langPillActive,
            pressed && styles.langPillPressed,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: locale === 'fr' }}>
          <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setLocale('ar')}
          style={({ pressed }) => [
            styles.langPill,
            locale === 'ar' && styles.langPillActive,
            pressed && styles.langPillPressed,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: locale === 'ar' }}>
          <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
        </Pressable>
      </View>
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
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
    marginEnd: spacing.md,
  },
  langSwitchRtl: {
    flexDirection: 'row-reverse',
  },
  langPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  langPillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  langPillPressed: {
    opacity: 0.88,
  },
  langPillTxt: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  langPillTxtActive: {
    color: homeShell.text,
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
    width: LOGO_HEIGHT * ETAWJIHI_LOGO_LIGHT_ASPECT,
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
