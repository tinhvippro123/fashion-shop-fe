import {
  ProductDetail,
  ProductColor,
  ProductVariant,
} from "@/features/catalog/types/product";

export interface CartItem {
  id: string;
  quantity: number;
  product: ProductDetail;
  color: ProductColor;
  variant: ProductVariant;
}

export interface CartState {
  items: CartItem[];
  isMiniCartOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (
    product: ProductDetail,
    color: ProductColor,
    variant: ProductVariant,
    quantity: number
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleMiniCart: (isOpen?: boolean) => void;
  showSuccessModal: () => void;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
  fetchServerCart: () => Promise<void>;
  isSuccessModalOpen?: boolean;
}

