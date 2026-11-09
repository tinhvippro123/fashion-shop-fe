export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItemAdmin {
  id: string;
  variantId?: number;
  productId?: number;
  name: string;
  image: string;
  variantInfo: string;
  colorName?: string;
  sizeName?: string;
  sku?: string;
  price: number;
  costPrice?: number;
  quantity: number;
  totalPrice?: number;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  code: string;
  discountAmount: number;
}

export interface Order {
  id: string;
  numericId?: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  payment: string;
  paymentBg: string;
  total: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  voucherCode?: string;
  note?: string;
  cancelReason?: string;
  cancelBy?: string;
  items: OrderItemAdmin[];
  appliedPromotions?: AppliedPromotion[];
  customer?: {
    id?: string | number;
    name: string;
    type: string;
    email: string;
    phone: string;
  };
  shipping?: {
    address: string;
    method: string;
    code: string;
  };
}

