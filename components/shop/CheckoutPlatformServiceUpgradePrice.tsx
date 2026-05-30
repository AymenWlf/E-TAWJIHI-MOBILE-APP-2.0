import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { PlatformServiceCatalogEntitlement } from '@/services/platformServices';
import { brand } from '@/theme/tokens';
import { formatShopPrice, shopPriceFormatOptsForCatalogOrCartLine } from '@/utils/shopFormatPrice';
import type { ShopCartLine } from '@/types/shop';
import { platformServiceUpgradeCheckoutBreakdown } from '@/utils/platformServiceEntitlementUi';

type Props = {
  line: ShopCartLine;
  listPrice: string | null | undefined;
  promoPrice: string | null | undefined;
  entitlement?: PlatformServiceCatalogEntitlement;
  sourceServiceName?: string | null;
  isRTL?: boolean;
  catalogLabel: string;
  creditLabelTemplate: string;
};

function fillTpl(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

/** Lignes prix upgrade sous le titre d’une ligne service au checkout. */
export function CheckoutPlatformServiceUpgradePrice({
  line,
  listPrice,
  promoPrice,
  entitlement,
  sourceServiceName,
  isRTL = false,
  catalogLabel,
  creditLabelTemplate,
}: Props) {
  const breakdown = platformServiceUpgradeCheckoutBreakdown(listPrice, promoPrice, entitlement);
  if (!breakdown) return null;

  const opts = shopPriceFormatOptsForCatalogOrCartLine(line);
  const cur = line.currency;
  const serviceLabel = sourceServiceName?.trim() || '—';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.row, isRTL && styles.txtRtl]}>
        <Text style={styles.lbl}>{catalogLabel} </Text>
        <Text style={styles.compare}>
          {formatShopPrice(breakdown.catalogUnitPrice, cur, opts)}
        </Text>
      </Text>
      <Text style={[styles.credit, isRTL && styles.txtRtl]}>
        {fillTpl(creditLabelTemplate, {
          service: serviceLabel,
          amount: formatShopPrice(breakdown.upgradeCredit, cur, opts),
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    gap: 2,
  },
  row: {
    fontSize: 10,
    lineHeight: 14,
  },
  lbl: {
    color: brand.textMuted,
    fontWeight: '600',
  },
  compare: {
    color: brand.textMuted,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  credit: {
    fontSize: 10,
    lineHeight: 14,
    color: brand.emerald,
    fontWeight: '700',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
