import { brand } from '@/theme/tokens';

export type OrderStatusUi = { label: string; color: string; bg: string };

/** Statuts commande boutique (alignés backend ShopOrder). */
export function shopOrderStatusUi(status: string, locale: string): OrderStatusUi {
  const ar = locale === 'ar';
  switch (status) {
    case 'pending_review':
      return { label: ar ? 'En cours de traitement' : 'En cours de traitement', color: '#92400E', bg: '#FEF3C7' };
    case 'pending_payment':
    case 'interested':
    case 'hesitant':
      return {
        label: ar ? 'في انتظار الدفع' : 'En attente de paiement',
        color: '#6D28D9',
        bg: '#EDE9FE',
      };
    case 'confirmed':
      return { label: ar ? 'Confirmée' : 'Confirmée', color: brand.primary, bg: '#DBEAFE' };
    case 'ready_pickup':
      return { label: ar ? 'Prête au retrait' : 'Prête au retrait', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'out_for_delivery':
      return { label: ar ? 'En livraison' : 'En livraison', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'completed':
      return { label: ar ? 'Terminée' : 'Terminée', color: '#166534', bg: '#DCFCE7' };
    case 'cancelled':
      return { label: ar ? 'Annulée' : 'Annulée', color: brand.error, bg: '#FEE2E2' };
    case 'whatsapp_sent':
      return { label: ar ? 'WhatsApp envoyé' : 'WhatsApp envoyé', color: brand.primary, bg: '#EFF6FF' };
    default:
      return { label: status, color: brand.textMuted, bg: '#F1F5F9' };
  }
}

export function shopDeliveryFulfillmentUi(status: string | null | undefined, locale: string): OrderStatusUi {
  const ar = locale === 'ar';
  switch (status) {
    case 'new':
      return { label: ar ? 'Nouvelle' : 'Nouvelle', color: '#92400E', bg: '#FEF3C7' };
    case 'preparing':
      return { label: ar ? 'En préparation' : 'En préparation', color: brand.primary, bg: '#DBEAFE' };
    case 'shipped':
      return { label: ar ? 'Expédiée' : 'Expédiée', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'delivered':
      return { label: ar ? 'Livrée' : 'Livrée', color: '#166534', bg: '#DCFCE7' };
    case 'picked_up':
      return { label: ar ? 'Retirée' : 'Retirée', color: '#166534', bg: '#DCFCE7' };
    case 'cancelled':
      return { label: ar ? 'Annulée' : 'Annulée', color: brand.error, bg: '#FEE2E2' };
    default:
      return { label: status || '—', color: brand.textMuted, bg: '#F1F5F9' };
  }
}

/** Commande clôturée : terminée ou annulée. */
export function isShopOrderClosed(status: string): boolean {
  return status === 'completed' || status === 'cancelled';
}

/** @deprecated Préférer `isShopOrderClosed` (même logique). */
export function isShopOrderCompleted(status: string): boolean {
  return isShopOrderClosed(status);
}

export function countOpenShopOrders(orders: { status: string }[]): number {
  return orders.filter((o) => !isShopOrderClosed(o.status)).length;
}

export function orderHasActiveServiceLines(
  lines: { productType: string; removedAt?: string | null }[],
): boolean {
  return lines.some((l) => !l.removedAt && l.productType === 'service');
}

export function orderHasActivePhysicalLines(
  lines: { productType: string; removedAt?: string | null }[],
): boolean {
  return lines.some((l) => !l.removedAt && l.productType !== 'service');
}

/** Statuts permettant d’ajouter un code promo après création (aligné backend). */
export const SHOP_ORDER_STATUSES_ALLOWING_PROMO_APPLY = [
  'pending_review',
  'pending_payment',
  'injoignable_1',
  'injoignable_2',
  'raccroche',
  'whatsapp_sent',
] as const;

export function isOrderStatusAllowingPromoApply(status: string): boolean {
  return (SHOP_ORDER_STATUSES_ALLOWING_PROMO_APPLY as readonly string[]).includes(status);
}

export function canApplyPromoToOrder(order: {
  status: string;
  promoCodeLabel?: string | null;
}): boolean {
  if ((order.promoCodeLabel ?? '').trim() !== '') {
    return false;
  }

  return isOrderStatusAllowingPromoApply(order.status);
}
