import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { applyUserOrderPromo } from '@/services/userOrders';
import { rejectMultipleShopPromoCodesInInput } from '@/services/shopPromo';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import type { ShopOrderPayload } from '@/types/shop';
import { canApplyPromoToOrder, isOrderStatusAllowingPromoApply } from '@/utils/shopOrderStatusUi';

type Props = {
  publicId: string;
  order: ShopOrderPayload;
  onOrderUpdated: (order: ShopOrderPayload) => void;
  isRTL: boolean;
};

export function OrderPromoApplyBlock({ publicId, order, onOrderUpdated, isRTL }: Props) {
  const { t } = useLocale();
  const { getValidAccessToken } = useAuth();
  const [draftCode, setDraftCode] = useState('');
  const [applying, setApplying] = useState(false);

  const hasPromo = (order.promoCodeLabel ?? '').trim() !== '';
  if (hasPromo) {
    return null;
  }

  const statusAllowsPromo = isOrderStatusAllowingPromoApply(order.status);
  const canApply = canApplyPromoToOrder(order);
  const locked = !statusAllowsPromo;

  const onApply = useCallback(async () => {
    if (!canApply) return;
    const code = draftCode.trim();
    if (!code) {
      Alert.alert(t('commonErrorTitle'), t('shopCheckoutPromoErrEnter'));
      return;
    }
    const multiErr = rejectMultipleShopPromoCodesInInput(code);
    if (multiErr) {
      Alert.alert(t('commonErrorTitle'), multiErr);
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;
    setApplying(true);
    try {
      const next = await applyUserOrderPromo(token, publicId, code);
      onOrderUpdated(next);
      setDraftCode('');
      Alert.alert('', t('accountOrderPromoApplied'));
    } catch (e) {
      Alert.alert(t('commonErrorTitle'), e instanceof Error ? e.message : t('shopCheckoutPromoErrValidate'));
    } finally {
      setApplying(false);
    }
  }, [canApply, draftCode, getValidAccessToken, onOrderUpdated, publicId, t]);

  return (
    <View style={styles.promoBlock}>
      <Text style={[styles.promoTitle, isRTL && styles.txtRtl]}>{t('accountOrderPromoAddTitle')}</Text>
      <View style={[styles.promoRow, isRTL && styles.rowRtl]}>
        <TextInput
          value={locked ? '' : draftCode}
          onChangeText={(v) => setDraftCode(v.toUpperCase())}
          placeholder={locked ? '—' : t('accountOrderPromoPlaceholder')}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!locked && !applying}
          style={[styles.promoInput, locked && styles.promoInputLocked, isRTL && styles.txtRtl]}
        />
        <Pressable
          onPress={() => void onApply()}
          disabled={locked || applying || !draftCode.trim()}
          style={({ pressed }) => [
            styles.promoBtn,
            (locked || applying || !draftCode.trim()) && styles.promoBtnDisabled,
            pressed && !locked && { opacity: 0.9 },
          ]}
        >
          {applying ? (
            <ActivityIndicator color={brand.white} size="small" />
          ) : (
            <Text style={styles.promoBtnTxt}>{t('accountOrderPromoApply')}</Text>
          )}
        </Pressable>
      </View>
      <Text style={[styles.promoHint, locked && styles.promoHintLocked, isRTL && styles.txtRtl]}>
        {locked ? t('accountOrderPromoLockedHint') : t('accountOrderPromoHint')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { writingDirection: 'rtl', textAlign: 'right' },
  promoBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: spacing.xs,
  },
  promoTitle: { fontSize: fontSize.sm, fontWeight: '700', color: homeShell.text },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  promoInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    backgroundColor: '#F8FAFC',
  },
  promoInputLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    color: '#94A3B8',
  },
  promoBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnDisabled: { opacity: 0.5 },
  promoBtnTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  promoHint: { fontSize: 11, color: homeShell.cardMuted, lineHeight: 16 },
  promoHintLocked: { color: '#B45309', fontWeight: '600' },
});
