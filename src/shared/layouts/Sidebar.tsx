"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  MessageSquare,
  Gift,
  Star,
  BarChart3,
  PackageOpen,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

const navGroups = [
  {
    title: "Quản lý chung",
    items: [
      { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Báo cáo", href: "/admin/reports", icon: BarChart3 },
      { name: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
      { name: "Sản phẩm", href: "/admin/products", icon: Package },
      { name: "Nhập kho", href: "/admin/stock-imports", icon: PackageOpen },
      { name: "Khách hàng", href: "/admin/customers", icon: Users },
      { name: "Đánh giá", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Khuyến mãi & Thuộc tính",
    items: [
      { name: "Mã giảm giá", href: "/admin/vouchers", icon: Gift },
      { name: "Danh mục", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    title: "Chăm sóc khách hàng",
    items: [{ name: "Liên hệ", href: "/admin/contacts", icon: MessageSquare }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
        >
          <Image
            src="/logo.png"
            alt="LUXE"
            width={100}
            height={30}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-4 px-3">
          {navGroups.map((group, index) => (
            <div key={index}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
              <div className="grid gap-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "" : "text-muted-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <span>Xem cửa hàng LUXE</span>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
