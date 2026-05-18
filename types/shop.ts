/**
 * Types boutique alignés sur le backend Symfony et le front web.
 * Le format des champs reflète les payloads JSON renvoyés par
 * `ShopProductPublicController` et `ShopOrderPublicController`.
 */

export type ShopProductType = 'product' | 'pack' | 'service';

export type ShopOrderLineProductType = ShopProductType;

export interface ShopProductEstablishmentRef {
  id: number;
  nom: string;
  sigle: string | null;
  slug: string;
  /** Public | Privé | Militaire | Semi-public — renvoyé par l’API fiche produit. */
  type?: string | null;
  /** Fichier ou URL logo établissement (API boutique). */
  logo?: string | null;
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
  isBestseller?: boolean;
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
  /** Présent pour les lignes service plateforme (récap commande). */
  platformServiceSlug?: string | null;
  platformServiceBrandIcon?: string | null;
  platformServiceBrandColor?: string | null;
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
  promoDiscountAmount?: string;
  promoCodeLabel?: string | null;
  shippingFee: string;
  referenceShippingFee?: string | null;
  total: string;
  currency: string;
  createdAt: string | null;
  trafficSource?: string | null;
  lines: ShopOrderLine[];
  /** Présent si la commande contient au moins un service et une modalité de paiement. */
  servicePaymentFollowUp?: ShopOrderServicePaymentFollowUp | null;
  /** Chemin relatif côté serveur (debug / admin). */
  bankTransferReceiptPath?: string | null;
  /** URL publique du justificatif (`/uploads/...`). */
  bankTransferReceiptUrl?: string | null;
  bankTransferReceiptUploadedAt?: string | null;
  studentCity?: string | null;
  studyLevel?: string | null;
  bacType?: string | null;
  filiere?: string | null;
  specialiteMission1?: string | null;
  specialiteMission2?: string | null;
  specialiteMission3?: string | null;
  servicePaymentModality?: string | null;
  servicePaymentCashplusCode?: string | null;
}

export type ShopOrderServicePaymentFollowUp = {
  modality: 'bank_transfer' | 'cashplus' | 'office' | 'pay_on_delivery';
  modalityLabel: string;
  bankInstructions?: string;
  /** Texte d’instructions en arabe (API) ; secours FR si absent. */
  bankInstructionsAr?: string | null;
  cashplusCode?: string | null;
  cashplusInstructions?: string;
  cashplusInstructionsAr?: string | null;
  officeAddress?: string;
  officeMapsUrl?: string | null;
  officeInstructions?: string;
  officeInstructionsAr?: string | null;
  officePhoneDisplay?: string;
  officeTelHref?: string;
  officeHoursFr?: string;
  officeHoursAr?: string;
  /** Modalité « paiement à la livraison » (panier mixte services + produits physiques). */
  payOnDeliveryMessage?: string;
  payOnDeliveryMessageAr?: string | null;
  /** Détails affichage virement (API). */
  bankWire?: {
    bankName: string;
    rib: string;
    accountHolder: string;
  };
  whatsappPhoneDisplay?: string;
  /** Indicatif+pays sans + pour wa.me (ex. 212655690632). */
  whatsappWaMe?: string;
};

export type ShopCartLineKind = 'shop_product' | 'platform_service';

/** Ligne stockée localement (AsyncStorage) — minimum requis pour reconstituer l'UI panier. */
export interface ShopCartLine {
  productId: number;
  slug: string;
  title: string;
  price: string;
  currency: string;
  quantity: number;
  type: ShopProductType;
  /** Lignes issues de `/api/platform-services` (commande avec `platformServiceSlug`). */
  lineKind?: ShopCartLineKind;
  platformServiceSlug?: string | null;
  /** Identité visuelle du service (panier / récap). */
  platformServiceBrandIcon?: string | null;
  platformServiceBrandColor?: string | null;
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

export type ShopOrderCreateLineInput =
  | { productId: number; quantity: number }
  | { platformServiceSlug: string; quantity: number };

export interface CreateShopOrderInput {
  lines: ShopOrderCreateLineInput[];
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
  analyticsVisitorId?: string;
  analyticsViewport?: 'mobile' | 'desktop';
  /** Profil / service (requis si le panier contient un service). */
  studyLevel?: string;
  bacType?: string;
  filiere?: string;
  specialiteMission1?: string;
  specialiteMission2?: string;
  specialiteMission3?: string;
  studentCity?: string;
  servicePaymentModality?: 'bank_transfer' | 'cashplus' | 'office' | 'pay_on_delivery';
  /** Code promo validé au checkout (un seul par commande). */
  promoCode?: string;
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
