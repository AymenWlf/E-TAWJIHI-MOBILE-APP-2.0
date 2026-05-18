import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Alert, Clipboard, Linking, Pressable, StyleSheet, View } from 'react-native';

import { ReferralReferredDiscountBanner } from '@/components/account/ReferralReferredDiscountBanner';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { recordReferralProgramCodeCopy } from '@/services/referralProgramAnalytics';
import { fillReferralPercentPlaceholder } from '@/utils/referralDiscountDisplay';

type Props = {
  referralCode: string;
  referralLink?: string | null;
  referredDiscountPercent?: number;
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  /** Carte Mon compte (fond bleu) ou carte blanche fidélité */
  variant: 'teaser' | 'card';
  showLink?: boolean;
};

export function ReferralShareCodeBlock({
  referralCode,
  referralLink,
  referredDiscountPercent,
  rtl,
  t,
  variant,
  showLink = false,
}: Props) {
  const { getValidAccessToken } = useAuth();
  const isTeaser = variant === 'teaser';
  const discountPct = Math.min(100, Math.max(1, referredDiscountPercent ?? 10));

  const flashCopy = (value: string, trackCodeCopy = false) => {
    void Clipboard.setString(value);
    Alert.alert(t('referralCopied'));
    if (trackCodeCopy && value === referralCode) {
      void (async () => {
        const token = await getValidAccessToken();
        if (token) await recordReferralProgramCodeCopy(token);
      })();
    }
  };

  const shareWhatsApp = () => {
    const link = referralLink ?? '';
    const message = fillReferralPercentPlaceholder(
      t('referralShareMessage').replace('{{code}}', referralCode).replace('{{link}}', link),
      discountPct,
      rtl,
    );
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const web = `https://wa.me/?text=${encodeURIComponent(message)}`;
    void Linking.canOpenURL(url).then((ok) => {
      void Linking.openURL(ok ? url : web);
    });
  };

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <ReferralReferredDiscountBanner percent={discountPct} rtl={rtl} variant={variant} t={t} />
      <Text style={[isTeaser ? styles.labelTeaser : styles.labelCard, rtl && styles.txtRtl]}>
        {t('referralYourCode')}
      </Text>
      <View style={[isTeaser ? styles.codeRowTeaser : styles.codeRowCard, rtl && styles.rowRtl]}>
        <Text
          style={[isTeaser ? styles.codeValueTeaser : styles.codeValueCard, rtl && styles.codeValueRtl]}
          selectable
          numberOfLines={1}>
          {referralCode}
        </Text>
        <Pressable
          onPress={() => flashCopy(referralCode, true)}
          style={[isTeaser ? styles.iconBtnTeaser : styles.iconBtnCard]}
          accessibilityRole="button"
          accessibilityLabel={t('referralCopyCode')}>
          <FontAwesome name="copy" size={16} color={isTeaser ? brand.primary : brand.primary} />
        </Pressable>
      </View>

      {showLink && referralLink ? (
        <>
          <Text style={[isTeaser ? styles.labelTeaser : styles.labelCard, styles.linkLabel, rtl && styles.txtRtl]}>
            {t('referralYourLink')}
          </Text>
          <Text style={[styles.linkValue, rtl && styles.codeValueRtl]} selectable numberOfLines={2}>
            {referralLink}
          </Text>
        </>
      ) : null}

      <View style={[styles.actionsRow, rtl && styles.rowRtl]}>
        <Pressable
          onPress={() => flashCopy(referralCode, true)}
          style={[styles.actionBtn, isTeaser ? styles.actionBtnTeaser : styles.actionBtnCard]}
          accessibilityRole="button"
          accessibilityLabel={t('referralCopyCode')}>
          <FontAwesome name="copy" size={14} color={isTeaser ? brand.white : brand.primary} />
          <Text style={[isTeaser ? styles.actionTxtTeaser : styles.actionTxtCard, rtl && styles.txtRtl]}>
            {t('referralCopyCode')}
          </Text>
        </Pressable>
        {showLink && referralLink ? (
          <Pressable
            onPress={() => flashCopy(referralLink)}
            style={[styles.actionBtn, isTeaser ? styles.actionBtnTeaser : styles.actionBtnCard]}
            accessibilityRole="button"
            accessibilityLabel={t('referralCopyLink')}>
            <FontAwesome name="link" size={14} color={isTeaser ? brand.white : brand.primary} />
            <Text style={[isTeaser ? styles.actionTxtTeaser : styles.actionTxtCard, rtl && styles.txtRtl]}>
              {t('referralCopyLink')}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={shareWhatsApp}
          style={[styles.actionBtn, styles.whatsappBtn]}
          accessibilityRole="button"
          accessibilityLabel={t('referralShareWhatsApp')}>
          <FontAwesome name="whatsapp" size={16} color={brand.white} />
          <Text style={styles.whatsappTxt}>{t('referralShareWhatsApp')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  wrapRtl: { direction: 'rtl', alignItems: 'stretch' },
  rowRtl: { flexDirection: 'row-reverse' },
  labelTeaser: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labelCard: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  linkLabel: { marginTop: spacing.xs },
  codeRowTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  codeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
  },
  codeValueTeaser: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: 0.6,
    textAlign: 'left',
  },
  codeValueCard: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.cardText,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  linkValue: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 18,
    textAlign: 'left',
  },
  iconBtnTeaser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
  },
  iconBtnCard: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${brand.primary}14`,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 120,
  },
  actionBtnTeaser: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  actionBtnCard: {
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  actionTxtTeaser: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.white,
  },
  actionTxtCard: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.primary,
  },
  whatsappBtn: {
    flexBasis: '100%',
    backgroundColor: '#25D366',
    borderWidth: 0,
  },
  whatsappTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.white,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  codeValueRtl: { textAlign: 'left', writingDirection: 'ltr' },
});
