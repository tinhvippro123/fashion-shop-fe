import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartState, CartItem } from "@/features/cart-and-order/types/cart";
import { apiFetch } from "@/shared/lib/api";

interface ServerCartItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  colorId: number;
  colorName: string;
  sizeName: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  quantity: number;
  stock: number;
  lineTotal: number;
}

interface ServerCartResponse {
  items: ServerCartItem[];
  totalItems: number;
  totalPrice: number;
}

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

function mapServerCartToItems(serverCart: ServerCartResponse): CartItem[] {
  if (!serverCart || !Array.isArray(serverCart.items)) return [];
  return serverCart.items.map((item) => ({
    id: `${item.productId}-${item.colorId}-${item.variantId}`,
    quantity: item.quantity,
    product: {
      id: item.productId,
      name: item.productName,
      slug: item.productSlug,
      basePrice: item.originalPrice,
      discountPercent: item.discountPercent,
      description: "",
      brand: "LUXE",
      skuPrefix: "",
      material: "",
      careInstructions: "",
      isNew: false,
      isBestSeller: false,
      isActive: true,
      productColors: [],
    } as unknown as CartItem["product"],
    color: {
      id: item.colorId,
      name: item.colorName,
      isActive: true,
      color: { id: item.colorId, name: item.colorName, hexCode: "#000" },
      images: item.imageUrl
        ? [
            {
              id: 0,
              imageUrl: item.imageUrl,
              isThumbnail: true,
              displayOrder: 0,
            },
          ]
        : [],
      variants: [],
    } as unknown as CartItem["color"],
    variant: {
      id: item.variantId,
      sku: item.sku,
      price: item.originalPrice,
      stock: item.stock,
      size: { id: 0, name: item.sizeName, sortOrder: 0 },
    } as unknown as CartItem["variant"],
  }));
}

function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("auth-storage");
    return Boolean(raw && JSON.parse(raw)?.state?.token);
  } catch {
    return false;
  }
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

        if (hasAuthToken()) {
          apiFetch("/cart/items", {
            method: "POST",
            body: JSON.stringify({ variantId: variant.id, quantity }),
          }).catch(() => {});
        }
      },

      removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== id);
        const { totalItems, totalPrice } = recalculateTotals(newItems);
        set({ items: newItems, totalItems, totalPrice });

        if (hasAuthToken()) {
          apiFetch("/cart/sync", {
            method: "POST",
            body: JSON.stringify({
              items: newItems.map((i) => ({
                variantId: i.variant.id,
                quantity: i.quantity,
              })),
            }),
          }).catch(() => {});
        }
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

        if (hasAuthToken()) {
          apiFetch("/cart/sync", {
            method: "POST",
            body: JSON.stringify({
              items: newItems.map((i) => ({
                variantId: i.variant.id,
                quantity: i.quantity,
              })),
            }),
          }).catch(() => {});
        }
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
        if (hasAuthToken()) {
          apiFetch("/cart", { method: "DELETE" }).catch(() => {});
        }
      },

      syncWithServer: async () => {
        if (!hasAuthToken()) return;
        try {
          const currentItems = get().items;
          const serverCart = await apiFetch<ServerCartResponse>("/cart/sync", {
            method: "POST",
            body: JSON.stringify({
              items: currentItems.map((i) => ({
                variantId: i.variant.id,
                quantity: i.quantity,
              })),
            }),
          });
          if (serverCart) {
            const mapped = mapServerCartToItems(serverCart);
            const { totalItems, totalPrice } = recalculateTotals(mapped);
            set({ items: mapped, totalItems, totalPrice });
          }
        } catch {
          // ignore
        }
      },

      fetchServerCart: async () => {
        if (!hasAuthToken()) return;
        try {
          const serverCart = await apiFetch<ServerCartResponse>("/cart");
          if (serverCart) {
            const mapped = mapServerCartToItems(serverCart);
            const { totalItems, totalPrice } = recalculateTotals(mapped);
            set({ items: mapped, totalItems, totalPrice });
          }
        } catch {
          // ignore
        }
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
