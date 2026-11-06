"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";

interface GoogleSignInButtonProps {
  mode?: "login" | "register";
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "806310825796-6h2bnvob8nk9mm8okdnemi99e3ihn4t7.apps.googleusercontent.com";

export function GoogleSignInButton({
  mode = "login",
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra nếu script google gsi đã có trong DOM
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.warn("[Google Auth] Không thể tải Google GSI Script");
      };
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", () => setScriptLoaded(true));
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) {
            toast.error("Không nhận được token xác thực từ Google");
            return;
          }

          setLoading(true);
          try {
            const user = await loginWithGoogle(response.credential);
            toast.success(`Đăng nhập Google thành công! Xin chào, ${user.name}`);
            router.push("/");
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Đăng nhập Google thất bại";
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
      });

      // Render official Google button
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: mode === "register" ? "signup_with" : "continue_with",
        logo_alignment: "left",
        width: 390,
        locale: "vi",
      });
    } catch (e) {
      console.error("[Google Auth Error]", e);
    }
  }, [scriptLoaded, mode, loginWithGoogle, router]);

  return (
    <div className={`w-full max-w-[390px] mx-auto ${className}`}>
      {loading ? (
        <div className="w-full h-[44px] flex items-center justify-center border border-[#dadce0] rounded-[4px] text-sm text-[#3c4043] bg-[#f8f9fa] font-['Montserrat',sans-serif]">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#333]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Đang xác thực tài khoản Google...
        </div>
      ) : (
        <div
          ref={buttonRef}
          className="flex justify-center min-h-[44px] w-full"
        ></div>
      )}
    </div>
  );
}
