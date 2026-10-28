import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/shared/lib/api";

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  role?: string;
  isAdmin: boolean;
  avatar?: string;
  status?: string;
}

interface AuthResponsePayload {
  token: string;
  user: User;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,

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
        return normalizedUser;
      },

      refreshProfile: async () => {
        if (!get().token) return null;
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

      logout: () => {
        set({ isAuthenticated: false, token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

