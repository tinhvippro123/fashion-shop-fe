import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState, CartItem } from "@/features/cart-and-order/types/cart";

export function getEffectiveUnitPrice(item: CartItem): number {
  const base = Number(item.variant?.price || item.product?.basePrice || 0);
  const discount = Number(item.product?.discountPercent || 0);
  if (discount > 0) {
    return Math.round((base * (100 - discount)) / 100);
  }
  return Math.round(base);
}

function recalculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + getEffectiveUnitPrice(item) * item.quantity,
    0
  );
  return { totalItems, totalPrice };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,
      isSuccessModalOpen: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, color, variant, quantity) => {
        const { items } = get();
        const itemId = `${product.id}-${color.id}-${variant.id}`;
        const existingItemIndex = items.findIndex((item) => item.id === itemId);

        const newItems = [...items];
        const maxStock = Math.max(1, variant?.stock ?? 99);
        if (existingItemIndex >= 0) {
          const existingItem = newItems[existingItemIndex];
          newItems[existingItemIndex] = {
            ...existingItem,
            variant,
            quantity: Math.min(maxStock, existingItem.quantity + quantity),
          };
        } else {
          newItems.push({
            id: itemId,
            quantity: Math.min(maxStock, Math.max(1, quantity)),
            product,
            color,
            variant,
          });
        }

        const { totalItems, totalPrice } = recalculateTotals(newItems);
        set({ items: newItems, totalItems, totalPrice });
      },

      removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== id);
        const { totalItems, totalPrice } = recalculateTotals(newItems);
        set({ items: newItems, totalItems, totalPrice });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        const { items } = get();
        const newItems = items.map((item) => {
          if (item.id !== id) return item;
          const maxStock = Math.max(1, item.variant?.stock ?? 99);
          return { ...item, quantity: Math.min(maxStock, quantity) };
        });
        const { totalItems, totalPrice } = recalculateTotals(newItems);
        set({ items: newItems, totalItems, totalPrice });
      },

      toggleMiniCart: (isOpen) => {
        set((state) => ({
          isMiniCartOpen:
            isOpen !== undefined ? isOpen : !state.isMiniCartOpen,
        }));
      },

      showSuccessModal: () => {
        set({ isSuccessModalOpen: true });
        setTimeout(() => {
          set({ isSuccessModalOpen: false });
        }, 2000);
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },
    }),
    {
      name: "luxe-cart-storage",
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);

