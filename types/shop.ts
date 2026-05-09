/**
 * Types boutique alignés sur le backend Symfony et le front web.
 * Le format des champs reflète les payloads JSON renvoyés par
 * `ShopProductPublicController` et `ShopOrderPublicController`.
 */

export type ShopProductType = 'product' | 'pack';

export type ShopOrderLineProductType = ShopProductType | 'service';

export interface ShopProductEstablishmentRef {
  id: number;
  nom: string;
  sigle: string | null;
  slug: string;
}

export interface ShopProductListItem {
  id: number;
  slug: string;
  title: string;
  shortDescription: string | null;
  type: ShopProductType;
  packPricingMode?: 'manual' | 'discount_from_sum' | null;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  category: string | null;
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  isPromo: boolean;
  isFreeShipping?: boolean;
  isOutOfStock?: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  stockUrgentPieces?: number | null;
  establishments?: ShopProductEstablishmentRef[];
  boutiqueBacTargets?: string[] | null;
}

export interface ShopPackLineDetail {
  quantity: number;
  childProduct: {
    id: number;
    slug: string;
    title: string;
    shortDescription: string | null;
    price: string;
    currency: string;
    type: ShopProductType;
    isOutOfStock?: boolean;
    ratingAverage: number | null;
    ratingCount: number;
    images?: string[];
  };
}

export interface ShopProductDetail extends ShopProductListItem {
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  packLines: ShopPackLineDetail[];
  containingPacks?: ShopProductListItem[];
}

export interface ShopPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ShopOrderLine {
  id?: number;
  productId: number | null;
  productTitle: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  productType: ShopOrderLineProductType;
  removedAt?: string | null;
  removalReason?: string | null;
  isUpsell?: boolean;
}

export interface ShopOrderPayload {
  publicId: string;
  orderNumber: string;
  status: string;
  deliveryFulfillmentStatus?: string;
  deliveryMode: string;
  deliveryVilleCheckCode?: number | null;
  deliveryDelayRaw?: string | null;
  deliveryDelayLabel?: string | null;
  email: string;
  fullName: string;
  phone: string;
  addressLine: string | null;
  city: string | null;
  notes: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  subtotal: string;
  shippingFee: string;
  referenceShippingFee?: string | null;
  total: string;
  currency: string;
  createdAt: string | null;
  trafficSource?: string | null;
  lines: ShopOrderLine[];
}

/** Ligne stockée localement (AsyncStorage) — minimum requis pour reconstituer l'UI panier. */
export interface ShopCartLine {
  productId: number;
  slug: string;
  title: string;
  price: string;
  currency: string;
  quantity: number;
  type: ShopProductType;
  packPricingMode?: 'manual' | 'discount_from_sum' | null;
  images?: string[];
  isFreeShipping?: boolean;
}

export type ShopShippingFeeMode = 'catalog' | 'fixed';

export type ShopPublicSettings = {
  shippingFeeMode: ShopShippingFeeMode;
  fixedShippingFee: string | null;
};

export type ShopDeliveryMode = 'cod_delivery' | 'pickup_office';

export interface CreateShopOrderInput {
  lines: { productId: number; quantity: number }[];
  email: string;
  fullName: string;
  phone: string;
  deliveryMode: ShopDeliveryMode;
  addressLine?: string;
  city?: string;
  deliveryVilleCheckCode?: number;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  trafficSource?: string;
}

export interface CreateShopOrderResult {
  publicId: string;
  orderNumber: string;
  accessToken: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  currency: string;
  nextStepUrl: string;
  order: ShopOrderPayload;
}
