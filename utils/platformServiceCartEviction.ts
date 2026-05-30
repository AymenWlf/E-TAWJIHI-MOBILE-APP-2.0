import { Alert } from 'react-native';

import type { AppLocale, HomeCopyKey } from '@/constants/i18n';
import type { PlatformServiceCatalogEntitlement } from '@/services/platformServices';
import type { ShopCartLine } from '@/types/shop';
import { isPlatformServiceCartLine } from '@/utils/platformServiceCart';
import { loadCart, upsertCartLine } from '@/utils/shopCartStorage';

/** Peut être ajouté au panier (directement ou en remplaçant des services en conflit). */
export function platformServiceCanAddToCart(
  ent: PlatformServiceCatalogEntitlement | undefined,
): boolean {
  if (!ent) return true;
  if (ent.purchasable) return true;
  return (ent.replacesCartSlugs?.length ?? 0) > 0;
}

function platformServiceSlugFromLine(line: ShopCartLine): string {
  return (line.platformServiceSlug ?? line.slug ?? '').trim();
}

function filterOutPlatformServiceSlugs(lines: ShopCartLine[], slugsToRemove: string[]): ShopCartLine[] {
  const removeSet = new Set(slugsToRemove.map((s) => s.trim()).filter(Boolean));
  if (removeSet.size === 0) return lines;
  return lines.filter((l) => {
    if (!isPlatformServiceCartLine(l)) return true;
    return !removeSet.has(platformServiceSlugFromLine(l));
  });
}

function formatQuotedServiceList(names: string[], locale: AppLocale): string {
  const quoted = names.map((n) => `« ${n} »`);
  if (quoted.length <= 1) return quoted[0] ?? '';
  const conj = locale === 'ar' ? ' و ' : ' et ';
  if (quoted.length === 2) return `${quoted[0]}${conj}${quoted[1]}`;
  return `${quoted.slice(0, -1).join(', ')}${conj}${quoted[quoted.length - 1]}`;
}

/** Demande confirmation avant de retirer des services du panier (upgrade / non cumulable). */
export function confirmPlatformServiceCartEviction(params: {
  replacesCartSlugs: string[];
  newServiceName: string;
  resolveServiceName: (slug: string) => string;
  locale: AppLocale;
  t: (key: HomeCopyKey) => string;
}): Promise<boolean> {
  const slugs = params.replacesCartSlugs.map((s) => s.trim()).filter(Boolean);
  if (slugs.length === 0) return Promise.resolve(true);

  const removedNames = slugs.map((slug) => {
    const name = params.resolveServiceName(slug).trim();
    return name || slug;
  });
  const removed = formatQuotedServiceList(removedNames, params.locale);
  const newService = `« ${params.newServiceName.trim()} »`;
  const messageKey: HomeCopyKey =
    removedNames.length > 1 ? 'shopCartReplaceServiceMessageMany' : 'shopCartReplaceServiceMessage';
  const message = params
    .t(messageKey)
    .replace('{newService}', newService)
    .replace('{removed}', removed);

  return new Promise((resolve) => {
    Alert.alert(params.t('shopCartReplaceServiceTitle'), message, [
      { text: params.t('shopCartReplaceServiceCancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: params.t('shopCartReplaceServiceAccept'), onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

/**
 * Alerte si besoin, puis retire les services en conflit et ajoute la ligne en une seule écriture panier.
 * @returns false si l’utilisateur annule.
 */
export async function addPlatformServiceToCartWithEviction(params: {
  entitlement: PlatformServiceCatalogEntitlement | undefined;
  replaceLines: (next: ShopCartLine[]) => Promise<void>;
  lineToAdd: ShopCartLine;
  newServiceName: string;
  resolveServiceName: (slug: string) => string;
  locale: AppLocale;
  t: (key: HomeCopyKey) => string;
}): Promise<boolean> {
  const slugs = params.entitlement?.replacesCartSlugs ?? [];
  if (slugs.length > 0) {
    const accepted = await confirmPlatformServiceCartEviction({
      replacesCartSlugs: slugs,
      newServiceName: params.newServiceName,
      resolveServiceName: params.resolveServiceName,
      locale: params.locale,
      t: params.t,
    });
    if (!accepted) return false;
  }

  const currentLines = await loadCart();
  const withoutConflicts = filterOutPlatformServiceSlugs(currentLines, slugs);
  const next = upsertCartLine(withoutConflicts, { ...params.lineToAdd, quantity: 1 });
  await params.replaceLines(next);
  return true;
}
