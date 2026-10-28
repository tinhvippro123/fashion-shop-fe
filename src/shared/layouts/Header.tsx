"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, Store } from "lucide-react";
import { Input } from "@/shared/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/shared/ui/sheet";
import { Sidebar } from "@/shared/layouts/Sidebar";
import Link from "next/link";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { useAuthStore } from "@/features/users/stores/auth.store";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      searchTerm.trim()
        ? `/admin/orders?q=${encodeURIComponent(searchTerm.trim())}`
        : "/admin/orders"
    );
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      <div className="flex items-center lg:hidden">
        <Sheet>
          <SheetTrigger className="flex h-10 w-10 -ml-2.5 items-center justify-center rounded-md hover:bg-muted outline-none">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <form onSubmit={handleSearch} className="hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
              className="w-full appearance-none bg-muted/50 pl-8 shadow-none md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border rounded-md px-3 py-1.5"
        >
          <Store className="h-3.5 w-3.5" />
          Trang bán hàng
        </Link>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/logo.png" alt={user?.name || "Admin"} />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {user?.name || "Admin LUXE"}
              </DropdownMenuLabel>
              <div className="px-2 pb-2 text-xs text-muted-foreground">
                {user?.email || "admin@luxe.vn"}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account/profile")}>
              Hồ sơ tài khoản
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/")}>
              Về cửa hàng
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
            >
              <span className="w-full text-red-600 cursor-pointer">
                Đăng xuất
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
