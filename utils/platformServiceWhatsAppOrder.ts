import { ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS } from '@/constants/etawjihiWhatsApp';
import {
  platformServiceActivePromotionalPrice,
  platformServiceCurrency,
} from '@/utils/platformServicePrice';
import { formatShopPrice } from '@/utils/shopFormatPrice';

export type PlatformServiceWhatsAppOrderInput = {
  name: string;
  slug?: string | null;
  price?: string | null;
  promotionalPrice?: string | null;
  promotionDeadlineAt?: string | null;
  currency?: string | null;
};

/** Message prérempli WhatsApp pour commander un service plateforme. */
export function buildPlatformServiceWhatsAppOrderMessage(
  service: PlatformServiceWhatsAppOrderInput,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const name = (service.name || (locale === 'ar' ? 'هذه الخدمة' : 'ce service')).trim();
  const list = service.price ?? '';
  const sale = service.promotionalPrice ?? null;
  const hasPromo = Boolean(
    platformServiceActivePromotionalPrice(list, sale, service.promotionDeadlineAt),
  );
  const unit = hasPromo && sale ? sale : list;
  const cur = platformServiceCurrency(service.currency);
  const priceLabel = unit
    ? formatShopPrice(unit, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : '';

  if (locale === 'ar') {
    const lines = [`السلام عليكم، أرغب في طلب خدمة « ${name} ».`];
    if (priceLabel) {
      lines.push(`السعر المعروض : ${priceLabel}.`);
    }
    lines.push('شكرًا لتأكيد طرق الدفع.');
    return lines.join('\n');
  }

  const lines = [`Salam, je souhaite commander le service « ${name} ».`];
  if (priceLabel) {
    lines.push(`Prix indiqué : ${priceLabel}.`);
  }
  lines.push('Merci de me confirmer les modalités.');
  return lines.join('\n');
}

export function platformServiceWhatsAppOrderPhoneDigits(): string {
  return ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS;
}
