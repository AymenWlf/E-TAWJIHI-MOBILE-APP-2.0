import { ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS } from '@/constants/etawjihiWhatsApp';
import { openWhatsAppChat } from '@/utils/openWhatsApp';
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
  intent?: 'order' | 'upgrade';
  /** Prix déjà formaté (upgrade compris). Sinon le prix catalogue est calculé. */
  priceLabel?: string | null;
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
  const cur = platformServiceCurrency(service.currency ?? '');
  const priceLabel =
    service.priceLabel?.trim() ||
    (unit ? formatShopPrice(unit, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '');
  const upgrade = service.intent === 'upgrade';

  if (locale === 'ar') {
    const lines = [
      upgrade
        ? `السلام عليكم، أرغب في ترقية باقتي إلى خدمة « ${name} ».`
        : `السلام عليكم، أرغب في طلب خدمة « ${name} ».`,
    ];
    if (priceLabel) {
      lines.push(`السعر المعروض : ${priceLabel}.`);
    }
    lines.push('شكرًا لتأكيد طرق الدفع.');
    return lines.join('\n');
  }

  const lines = [
    upgrade
      ? `Salam, je souhaite faire un upgrade vers le service « ${name} ».`
      : `Salam, je souhaite commander le service « ${name} ».`,
  ];
  if (priceLabel) {
    lines.push(`Prix indiqué : ${priceLabel}.`);
  }
  lines.push('Merci de me confirmer les modalités.');
  return lines.join('\n');
}

export function platformServiceWhatsAppOrderPhoneDigits(): string {
  return ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS;
}

export function openPlatformServiceWhatsAppOrder(
  service: PlatformServiceWhatsAppOrderInput,
  locale: 'fr' | 'ar' = 'fr',
): void {
  void openWhatsAppChat({
    message: buildPlatformServiceWhatsAppOrderMessage(service, locale),
    phoneWaDigits: platformServiceWhatsAppOrderPhoneDigits(),
  });
}

export function openPlatformServicesWhatsAppOrder(
  services: PlatformServiceWhatsAppOrderInput[],
  locale: 'fr' | 'ar' = 'fr',
): void {
  const list = services.filter((s) => (s.name || '').trim());
  if (list.length === 0) return;
  if (list.length === 1) {
    openPlatformServiceWhatsAppOrder(list[0], locale);
    return;
  }
  const message = list.map((s) => buildPlatformServiceWhatsAppOrderMessage(s, locale)).join('\n\n');
  void openWhatsAppChat({
    message,
    phoneWaDigits: platformServiceWhatsAppOrderPhoneDigits(),
  });
}
