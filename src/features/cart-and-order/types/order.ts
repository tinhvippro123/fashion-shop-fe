export interface OrderItemDto {
  id: string;
  variantId?: number | null;
  productId?: number | null;
  productSlug?: string | null;
  name: string;
  image: string;
  variantInfo: string;
  colorName: string;
  sizeName: string;
  sku: string;
  price: number;
  costPrice?: number;
  quantity: number;
  totalPrice: number;
  isReviewed?: boolean;
}

export interface AppliedPromotionDto {
  id: string;
  name: string;
  code: string;
  discountAmount: number;
}

export interface CustomerInfoDto {
  name: string;
  type: string;
  email: string;
  phone: string;
}

export interface ShippingInfoDto {
  address: string;
  method: string;
  code: string;
}

export interface OrderResponseDto {
  id: string;
  numericId: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  payment: string;
  paymentBg: string;
  paymentUrl?: string | null;
  total: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  voucherCode?: string | null;
  note?: string | null;
  cancelReason?: string | null;
  items: OrderItemDto[];
  appliedPromotions: AppliedPromotionDto[];
  customer: CustomerInfoDto;
  shipping: ShippingInfoDto;
}

export interface VoucherDto {
  id: string;
  numericId: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderValueRaw: number;
  maxDiscountAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  rawStatus: string;
  discountAmount: string;
  minOrderValue: string;
  quantity: string;
  status: string;
  duration: string;
}

export interface ValidateVoucherResponse {
  code: string;
  name: string;
  discountAmount: number;
  subtotal: number;
  finalSubtotal: number;
}

export interface AddressDto {
  id: number;
  recipientName: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  fullAddress?: string;
  isDefault: boolean;
}

