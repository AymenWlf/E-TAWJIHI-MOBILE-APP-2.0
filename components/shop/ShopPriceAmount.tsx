import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  formatShopPriceAmount,
  shopDisplayCurrency,
  type ShopPriceIntlOptions,
} from '@/utils/shopFormatPrice';

type Props = {
  amount: string | number;
  currency?: string;
  intl?: ShopPriceIntlOptions;
  amountStyle?: TextStyle | TextStyle[];
  currencyStyle?: TextStyle | TextStyle[];
  style?: ViewStyle | ViewStyle[];
  latinDigits?: boolean;
};

/** Prix « montant + Dhs » toujours en ordre LTR (devise à droite), y compris en RTL. */
export function ShopPriceAmount({
  amount,
  currency = 'MAD',
  intl,
  amountStyle,
  currencyStyle,
  style,
  latinDigits = true,
}: Props) {
  const amountStr = formatShopPriceAmount(amount, currency, intl);
  const curLabel = shopDisplayCurrency(currency);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={amountStyle} latinDigits={latinDigits}>
        {amountStr}
      </Text>
      <Text style={currencyStyle ?? amountStyle}>{curLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    direction: 'ltr',
    gap: 4,
  },
});
