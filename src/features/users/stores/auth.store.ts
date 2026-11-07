import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/shared/lib/api";
import { useCartStore } from "@/features/cart-and-order/stores/cart.store";

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  role?: string;
  isAdmin: boolean;
  avatar?: string;
  status?: string;
}

interface AuthResponsePayload {
  token: string;
  user: User;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  password: string;
  otpCode: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  wishlistIds: number[];
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
  syncWishlist: () => Promise<void>;
  setWishlistProductState: (productId: number, favorited: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      wishlistIds: [],

      login: async (email: string, password: string) => {
        const res = await apiFetch<AuthResponsePayload>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const normalizedUser: User = {
          ...res.user,
          name: res.user.name || res.user.fullName || email.split("@")[0],
          isAdmin: Boolean(res.user.isAdmin || res.user.role === "ADMIN"),
        };
        set({
          isAuthenticated: true,
          token: res.token,
          user: normalizedUser,
        });
        useCartStore.getState().syncWithServer().catch(() => {});
        return normalizedUser;
      },

      loginWithGoogle: async (credential: string) => {
        const res = await apiFetch<AuthResponsePayload>("/auth/google", {
          method: "POST",
          body: JSON.stringify({ credential }),
        });
        const normalizedUser: User = {
          ...res.user,
          name: res.user.name || res.user.fullName || res.user.email.split("@")[0],
          isAdmin: Boolean(res.user.isAdmin || res.user.role === "ADMIN"),
        };
        set({
          isAuthenticated: true,
          token: res.token,
          user: normalizedUser,
        });
        useCartStore.getState().syncWithServer().catch(() => {});
        return normalizedUser;
      },

      register: async (payload: RegisterPayload) => {
        const res = await apiFetch<AuthResponsePayload>("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const normalizedUser: User = {
          ...res.user,
          name: res.user.name || res.user.fullName || payload.fullName,
          isAdmin: Boolean(res.user.isAdmin || res.user.role === "ADMIN"),
        };
        set({
          isAuthenticated: true,
          token: res.token,
          user: normalizedUser,
        });
        useCartStore.getState().syncWithServer().catch(() => {});
        return normalizedUser;
      },

      refreshProfile: async () => {
        if (!get().isAuthenticated && !get().token) return null;
        try {
          const profile = await apiFetch<User>("/account/profile");
          const normalizedUser: User = {
            ...profile,
            name: profile.name || profile.fullName || profile.email,
            isAdmin: Boolean(profile.isAdmin || profile.role === "ADMIN"),
          };
          set({ isAuthenticated: true, user: normalizedUser });
          return normalizedUser;
        } catch {
          set({ isAuthenticated: false, token: null, user: null });
          return null;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      syncWishlist: async () => {
        if (!get().isAuthenticated && !get().token) {
          set({ wishlistIds: [] });
          return;
        }
        try {
          const list = await apiFetch<Array<{ id: number }>>(
            "/account/wishlists"
          );
          if (Array.isArray(list)) {
            set({
              wishlistIds: list
                .map((item) => Number(item.id))
                .filter((id) => !Number.isNaN(id)),
            });
          }
        } catch {
          // ignore
        }
      },

      setWishlistProductState: (productId: number, favorited: boolean) => {
        const numId = Number(productId);
        const current = get().wishlistIds || [];
        if (favorited) {
          if (!current.includes(numId)) {
            set({ wishlistIds: [...current, numId] });
          }
        } else {
          set({ wishlistIds: current.filter((id) => id !== numId) });
        }
      },

      logout: () => {
        apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          wishlistIds: [],
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        wishlistIds: state.wishlistIds,
      }),
    }
  )
);

