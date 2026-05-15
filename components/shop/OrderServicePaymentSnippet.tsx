import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Alert, Clipboard, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';

import type { UserOrderServicePaymentCard } from '@/services/userOrders';

type Props = {
  card: UserOrderServicePaymentCard;
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  compact?: boolean;
};

export function OrderServicePaymentSnippet({ card, rtl, t, compact }: Props) {
  const onCopy = (value: string) => {
    const v = value.trim();
    if (!v) return;
    void Clipboard.setString(v);
    Alert.alert('', t('shopThankCopied'));
  };

  if (card.modality === 'cashplus' && card.cashplusCode) {
    return (
      <Pressable
        onPress={() => onCopy(card.cashplusCode!)}
        style={({ pressed }) => [styles.box, styles.boxCashplus, pressed && styles.pressed]}
      >
        <View style={[styles.row, rtl && styles.rowRtl]}>
          <FontAwesome name="mobile" size={14} color="#5B21B6" />
          <Text style={[styles.lbl, rtl && styles.txtRtl]}>{t('shopThankCashplusCodeLbl')}</Text>
        </View>
        <Text style={[styles.code, compact && styles.codeCompact, rtl && styles.txtRtl]} selectable>
          {card.cashplusCode}
        </Text>
        <Text style={[styles.copyHint, rtl && styles.txtRtl]}>{t('shopThankCopy')}</Text>
      </Pressable>
    );
  }

  if (card.modality === 'bank_transfer' && card.bankRib) {
    return (
      <Pressable
        onPress={() => onCopy(card.bankRib!)}
        style={({ pressed }) => [styles.box, styles.boxBank, pressed && styles.pressed]}
      >
        <View style={[styles.row, rtl && styles.rowRtl]}>
          <FontAwesome name="credit-card" size={14} color={brand.primary} />
          <Text style={[styles.lbl, rtl && styles.txtRtl]}>RIB</Text>
        </View>
        <Text
          style={[styles.rib, compact && styles.ribCompact, rtl && styles.txtRtl]}
          selectable
          numberOfLines={2}>
          {card.bankRib}
        </Text>
        <Text style={[styles.copyHint, rtl && styles.txtRtl]}>{t('shopThankCopy')}</Text>
      </Pressable>
    );
  }

  if (card.modality === 'office' && card.officeMapsUrl) {
    return (
      <View style={[styles.box, styles.boxOffice]}>
        {card.officeAddress ? (
          <Text style={[styles.addr, rtl && styles.txtRtl]} numberOfLines={2}>
            {card.officeAddress}
          </Text>
        ) : null}
        <Pressable
          onPress={() => void Linking.openURL(card.officeMapsUrl!)}
          style={({ pressed }) => [styles.mapsBtn, rtl && styles.rowRtl, pressed && styles.pressed]}
        >
          <FontAwesome name="map-marker" size={14} color={brand.white} />
          <Text style={[styles.mapsBtnTxt, rtl && styles.txtRtl]}>{t('shopThankOfficeMapsBtn')}</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { writingDirection: 'rtl', textAlign: 'right' },
  box: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 4,
    gap: 4,
  },
  boxCashplus: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  boxBank: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  boxOffice: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.88 },
  lbl: { fontSize: fontSize.xs, fontWeight: '700', color: homeShell.cardMuted },
  code: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeCompact: { fontSize: 15 },
  rib: {
    fontSize: 13,
    fontWeight: '700',
    color: homeShell.cardText,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  ribCompact: { fontSize: 12 },
  copyHint: { fontSize: 10, fontWeight: '600', color: brand.primary },
  addr: { fontSize: fontSize.xs, color: homeShell.cardText, lineHeight: 18 },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: homeShell.blue,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  mapsBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
});
