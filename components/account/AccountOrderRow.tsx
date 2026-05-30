import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { OrderServicePaymentSnippet } from '@/components/shop/OrderServicePaymentSnippet';
import { Text } from '@/components/ui/Text';
import { getApiBaseUrl } from '@/constants/api';
import type { HomeCopyKey } from '@/constants/i18n';
import type { UserOrderSummary } from '@/services/userOrders';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius } from '@/theme/tokens';
import { formatOrderCreatedAtShort } from '@/utils/dateParis';
import { formatShopPrice } from '@/utils/shopFormatPrice';
import { isShopOrderClosed, shopOrderStatusUi } from '@/utils/shopOrderStatusUi';

export function AccountOrderRow({
  order,
  rtl,
  locale,
  first,
  t,
  onPress,
}: {
  order: UserOrderSummary;
  rtl: boolean;
  locale: string;
  first: boolean;
  t: (k: HomeCopyKey) => string;
  onPress: () => void;
}) {
  const cfg = shopOrderStatusUi(order.status, locale);
  const dateStr = formatOrderCreatedAtShort(order.createdAt, locale);
  const showPaymentSnippet =
    order.hasServiceLines === true &&
    !isShopOrderClosed(order.status) &&
    order.servicePaymentCard != null;
  const receiptUrl =
    order.servicePaymentModality === 'bank_transfer' && order.bankTransferReceiptUrl
      ? `${getApiBaseUrl().replace(/\/$/, '')}${order.bankTransferReceiptUrl}`
      : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderRow,
        first && styles.orderRowFirst,
        rtl && styles.orderRowRtl,
        pressed && { opacity: 0.88 },
      ]}>
      <View style={styles.orderIconWrap}>
        <FontAwesome
          name={
            order.hasServiceLines && order.hasPhysicalLines
              ? 'shopping-bag'
              : order.hasServiceLines
                ? 'graduation-cap'
                : 'shopping-bag'
          }
          size={13}
          color={homeShell.cardMuted}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={[styles.orderTopLine, rtl && styles.orderTopLineRtl]}>
          <Text style={styles.orderNumber} numberOfLines={1}>
            {`N° ${order.orderNumber}`}
          </Text>
          <Text style={styles.orderDate}>{dateStr}</Text>
        </View>
        {order.firstItemTitle ? (
          <View style={styles.fieldLabelRow}>
            <Text style={[styles.orderItemTitle, rtl && styles.txtRtl]} numberOfLines={1}>
              {order.firstItemTitle}
              {order.itemsCount > 1 ? `  +${order.itemsCount - 1}` : ''}
            </Text>
          </View>
        ) : null}
        {showPaymentSnippet ? (
          <OrderServicePaymentSnippet card={order.servicePaymentCard!} rtl={rtl} t={t} compact />
        ) : null}
        {receiptUrl ? (
          <Pressable
            onPress={() => void Linking.openURL(receiptUrl)}
            style={({ pressed }) => [styles.orderReceiptLink, pressed && { opacity: 0.85 }]}>
            <FontAwesome name="paperclip" size={11} color={brand.primary} />
            <Text style={styles.orderReceiptLinkTxt}>{t('accountOrderReceiptLink')}</Text>
          </Pressable>
        ) : null}
        <View style={[styles.orderBottomLine, rtl && styles.orderBottomLineRtl]}>
          <Text style={styles.orderTotal}>{formatShopPrice(order.total, order.currency)}</Text>
          <View style={[styles.orderStatusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.orderStatusTxt, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={[styles.orderDetailLink, rtl && styles.txtRtl]}>{t('accountOrderViewDetail')}</Text>
      </View>
      <FontAwesome name={rtl ? 'chevron-left' : 'chevron-right'} size={12} color={homeShell.cardMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  fieldLabelRow: {
    flexDirection: 'row',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    gap: 8,
  },
  orderRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  orderRowRtl: {
    flexDirection: 'row-reverse',
  },
  orderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  orderTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  orderTopLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderNumber: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    writingDirection: 'ltr',
  },
  orderDate: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    writingDirection: 'ltr',
  },
  orderItemTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  orderReceiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  orderReceiptLinkTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    textDecorationLine: 'underline',
  },
  orderBottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  orderBottomLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderTotal: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    writingDirection: 'ltr',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  orderStatusTxt: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  orderDetailLink: {
    fontSize: 12,
    fontWeight: '700',
    color: brand.primary,
    marginTop: 2,
  },
});
