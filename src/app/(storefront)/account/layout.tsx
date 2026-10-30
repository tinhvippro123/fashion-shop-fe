"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AccountSidebar from "@/features/users/components/account/AccountSidebar";
import { useAuthStore } from "@/features/users/stores/auth.store";

const emptySubscribe = () => () => {};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const getBreadcrumbTitle = () => {
    if (pathname.includes("/account/profile")) return "Tài khoản của tôi";
    if (pathname.includes("/account/addresses")) return "Danh sách địa chỉ";
    if (pathname.includes("/account/orders")) return "Quản lý đơn hàng";
    if (pathname.includes("/account/wishlist")) return "Sản phẩm yêu thích";
    return "Tài khoản";
  };

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container-luxe w-full px-[15px] min-[1200px]:px-[85px] mx-auto mb-[50px]">
      {/* Breadcrumb */}
      <div className="text-[14px] font-bold uppercase border-b border-[#e1e1e1] pt-[20px] pb-[21px] mb-[40px]">
        <Link
          href="/"
          className="text-[#333] hover:text-[#000] transition-colors"
        >
          Trang chủ
        </Link>
        <span className="mx-[8px]">-</span>
        <span>{getBreadcrumbTitle()}</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="mb-[24px] shrink-0 lg:mr-[24px] xl:mr-[40px]">
          <AccountSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

