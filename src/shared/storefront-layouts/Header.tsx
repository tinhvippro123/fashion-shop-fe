"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCartStore } from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { IvyUserIcon, IvyBagIcon, IvySearchIcon } from "@/shared/icons/IvyIcons";
import { apiFetch } from "@/shared/lib/api";

interface SubCategoryGroup {
  title: string;
  slug: string;
  items: { name: string; href: string }[];
}

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
  children?: ApiCategory[];
}

function mapToNavGroups(cat?: ApiCategory): SubCategoryGroup[] {
  if (!cat || !cat.children || cat.children.length === 0) return [];
  return cat.children
    .filter((group) => (group.productCount ?? 0) > 0)
    .map((group) => {
      const activeChildren = (group.children || []).filter(
        (sub) => (sub.productCount ?? 0) > 0
      );

      const items =
        activeChildren.length > 0
          ? activeChildren.map((sub) => ({
              name: sub.name,
              href: `/danh-muc/${sub.slug}`,
            }))
          : [
              {
                name: group.name,
                href: `/danh-muc/${group.slug}`,
              },
            ];

      return {
        title: group.name.toUpperCase(),
        slug: group.slug,
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

const WOMEN_NAV_GROUPS: SubCategoryGroup[] = [
  {
    title: "ÁO NỮ",
    slug: "ao-nu",
    items: [
      { name: "Áo sơ mi", href: "/danh-muc/ao-so-mi-nu" },
      { name: "Áo khoác", href: "/danh-muc/ao-khoac-nu" },
    ],
  },
  {
    title: "ĐẦM",
    slug: "dam-nu",
    items: [
      { name: "Đầm chữ A", href: "/danh-muc/dam-xoe-nu" },
      { name: "Đầm công sở", href: "/danh-muc/dam-cong-so-nu" },
    ],
  },
  {
    title: "QUẦN NỮ",
    slug: "quan-nu",
    items: [
      { name: "Quần âu", href: "/danh-muc/quan-au-nu" },
    ],
  },
  {
    title: "CHÂN VÁY",
    slug: "chan-vay-nu",
    items: [
      { name: "Chân váy chữ A", href: "/danh-muc/chan-vay-a-nu" },
      { name: "Chân váy xòe", href: "/danh-muc/chan-vay-xoe-nu" },
    ],
  },
];

const MEN_NAV_GROUPS: SubCategoryGroup[] = [
  {
    title: "ÁO NAM",
    slug: "ao-nam",
    items: [
      { name: "Áo polo", href: "/danh-muc/ao-polo-nam" },
      { name: "Áo sơ mi", href: "/danh-muc/ao-so-mi-nam" },
      { name: "Áo khoác", href: "/danh-muc/ao-khoac-nam" },
    ],
  },
  {
    title: "QUẦN NAM",
    slug: "quan-nam",
    items: [
      { name: "Quần dài", href: "/danh-muc/quan-dai-nam" },
      { name: "Quần short", href: "/danh-muc/quan-short-nam" },
    ],
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [womenNavGroups, setWomenNavGroups] =
    useState<SubCategoryGroup[]>(WOMEN_NAV_GROUPS);
  const [menNavGroups, setMenNavGroups] =
    useState<SubCategoryGroup[]>(MEN_NAV_GROUPS);
  const { isAuthenticated, user, logout, syncWishlist } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [unreadOrderCount, setUnreadOrderCount] = useState<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadOrderCount(0);
      return;
    }
    try {
      const res = await apiFetch<{ unreadCount: number }>("/notifications/unread-count");
      setUnreadOrderCount(res?.unreadCount || 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000);
    const handleFocus = () => fetchUnreadCount();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    apiFetch<ApiCategory[]>("/catalog/categories")
      .then((cats) => {
        if (Array.isArray(cats)) {
          const nu = cats.find((c) => c.slug === "nu");
          const nam = cats.find((c) => c.slug === "nam");
          if (nu && nu.children && nu.children.length > 0) {
            setWomenNavGroups(mapToNavGroups(nu));
          }
          if (nam && nam.children && nam.children.length > 0) {
            setMenNavGroups(mapToNavGroups(nam));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncWishlist();
    }
  }, [isAuthenticated, syncWishlist]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(
        `/search?keyword=${encodeURIComponent(searchKeyword.trim())}`
      );
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const { totalItems, toggleMiniCart } = useCartStore();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const toggleSubMenu = (menu: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <>
      <header
        className="sticky top-0 z-[1020] bg-white py-[17px] w-full"
        style={{ position: "sticky", WebkitPosition: "sticky" } as React.CSSProperties}
      >
        <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center relative after:content-[''] after:absolute after:bottom-[-17px] min-[1200px]:after:left-[85px] min-[1200px]:after:right-[85px] after:left-[15px] after:right-[15px] after:h-[1px] after:bg-[#e1e1e1]">
          {/* Left: Desktop Nav or Mobile Hamburger */}
          <div className="flex items-center justify-start">
            <button
              onClick={toggleMobileMenu}
              className="block xl:hidden bg-transparent border-none text-[#000] text-[20px] cursor-pointer"
              aria-label="Mở menu"
            >
              <i className="fas fa-bars"></i>
            </button>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden xl:flex items-center h-full">
              {/* NỮ Menu */}
              <div className="group flex items-center h-full">
                <Link
                  href="/danh-muc/nu"
                  className="h-full flex items-center text-[12px] font-semibold text-[#333] group-hover:text-[#000] mr-[16px] uppercase tracking-[0.5px] transition-colors relative cursor-pointer"
                >
                  NỮ
                </Link>

                <div className="absolute left-[85px] right-[85px] top-full w-auto bg-white border border-[#f1f1f1] shadow-[0_12px_24px_rgba(0,0,0,0.06)] py-[35px] px-[50px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000] hidden xl:flex before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent before:z-[1001]">
                  <div className="w-[240px] shrink-0 pr-[40px] border-r border-[#eee]">
                    <Link
                      href="/danh-muc/nu"
                      className="block font-bold mb-[14px] text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                    >
                      ALL ITEMS
                    </Link>
                    <Link
                      href="/danh-muc/hang-nu-moi-ve"
                      className="block font-bold mb-[14px] text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                    >
                      NEW ARRIVAL
                    </Link>
                    <Link
                      href="/danh-muc/sale-nu"
                      className="block font-bold text-[#e10600] text-[13px] hover:text-[#000] uppercase transition-colors"
                    >
                      SẢN PHẨM SALE
                    </Link>
                  </div>
                  <div className="flex-1 flex gap-[60px] pl-[60px] content-start">
                    {womenNavGroups.map((group) => (
                      <div key={group.title} className="w-[160px] min-w-[140px]">
                        <Link
                          href={`/danh-muc/${group.slug}`}
                          className="block font-bold text-[#333] text-[14px] uppercase mb-[14px] hover:text-[#000] tracking-[0.5px] transition-colors"
                        >
                          {group.title}
                        </Link>
                        <ul className="list-none p-0 m-0 space-y-[10px]">
                          {group.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className="text-[13px] text-[#6c757d] hover:text-[#000] hover:font-medium transition-colors block leading-relaxed"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NAM Menu */}
              <div className="group flex items-center h-full">
                <Link
                  href="/danh-muc/nam"
                  className="h-full flex items-center text-[12px] font-semibold text-[#333] group-hover:text-[#000] mr-[16px] uppercase tracking-[0.5px] transition-colors relative cursor-pointer"
                >
                  NAM
                </Link>

                <div className="absolute left-[85px] right-[85px] top-full w-auto bg-white border border-[#f1f1f1] shadow-[0_12px_24px_rgba(0,0,0,0.06)] py-[35px] px-[50px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000] hidden xl:flex before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent before:z-[1001]">
                  <div className="w-[240px] shrink-0 pr-[40px] border-r border-[#eee]">
                    <Link
                      href="/danh-muc/nam"
                      className="block font-bold mb-[14px] text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                    >
                      ALL ITEMS
                    </Link>
                    <Link
                      href="/danh-muc/hang-nam-moi-ve"
                      className="block font-bold mb-[14px] text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                    >
                      NEW ARRIVAL
                    </Link>
                    <Link
                      href="/danh-muc/sale-nam"
                      className="block font-bold text-[#e10600] text-[13px] hover:text-[#000] uppercase transition-colors"
                    >
                      SẢN PHẨM SALE
                    </Link>
                  </div>
                  <div className="flex-1 flex gap-[70px] pl-[60px] content-start">
                    {menNavGroups.map((group) => (
                      <div key={group.title} className="w-[160px] min-w-[140px]">
                        <Link
                          href={`/danh-muc/${group.slug}`}
                          className="block font-bold text-[#333] text-[14px] uppercase mb-[14px] hover:text-[#000] tracking-[0.5px] transition-colors"
                        >
                          {group.title}
                        </Link>
                        <ul className="list-none p-0 m-0 space-y-[10px]">
                          {group.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className="text-[13px] text-[#6c757d] hover:text-[#000] hover:font-medium transition-colors block leading-relaxed"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SALE Item */}
              <Link
                href="/danh-muc/sale"
                className="text-[12px] font-bold text-[#e10600] hover:text-[#b5121b] py-[10px] mr-[16px] uppercase tracking-[0.5px] transition-colors whitespace-nowrap flex items-center"
              >
                SALE
              </Link>

              <Link
                href="/order/tracking"
                className="text-[12px] font-semibold text-[#333] hover:text-[#000] py-[10px] mr-[16px] uppercase tracking-[0.5px] transition-colors whitespace-nowrap"
              >
                TRA CỨU ĐƠN
              </Link>
              <Link
                href="/pages/ve-chung-toi"
                className="text-[12px] font-semibold text-[#333] hover:text-[#000] py-[10px] uppercase tracking-[0.5px] transition-colors whitespace-nowrap"
              >
                VỀ CHÚNG TÔI
              </Link>
            </nav>
          </div>

          {/* Center: Logo (Guaranteed 50% Center via grid-cols-[1fr_auto_1fr]) */}
          <div className="flex items-center justify-center px-2">
            <Link
              href="/"
              className="inline-block text-center cursor-pointer transition-opacity hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/client/img/logo.png"
                alt="Luxe Fashion"
                className="h-[38px] w-auto block mx-auto object-contain"
              />
            </Link>
          </div>

          {/* Right: Search and User Actions */}
          <div className="flex items-center justify-end gap-[18px]">
            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center relative w-[250px] border border-[#e1e1e1] rounded px-[12px] py-[6px]"
            >
              <button
                type="submit"
                className="bg-transparent border-none text-[#221F20] hover:text-[#000] p-0 mr-[10px] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tìm kiếm"
              >
                <IvySearchIcon className="w-[16px] h-[16px]" />
              </button>
              <input
                type="text"
                name="keyword"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="TÌM KIẾM SẢN PHẨM"
                className="w-full border-none outline-none bg-transparent font-normal text-[12px] text-[#333] placeholder-[#888] tracking-wider"
                autoComplete="off"
              />
            </form>

            {isAuthenticated ? (
              <div className="hidden xl:block relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="bg-transparent border-none p-1 text-[#221F20] hover:text-[#000] cursor-pointer transition-colors flex items-center justify-center relative"
                  title={unreadOrderCount > 0 ? `Tài khoản (${unreadOrderCount} thông báo mới)` : "Tài khoản"}
                  aria-label="Tài khoản"
                >
                  <IvyUserIcon className="w-[20px] h-[20px]" />
                  {unreadOrderCount > 0 && (
                    <span
                      className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-[#e10600] rounded-full ring-2 ring-white animate-pulse pointer-events-none"
                      title={`Bạn có ${unreadOrderCount} thông báo đơn hàng mới`}
                    />
                  )}
                </button>

                <div
                  className={`absolute top-full right-0 w-[250px] bg-white border border-[#e1e1e1] rounded shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[1050] mt-[10px] transition-all duration-200 ${isUserMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                >
                  <div className="p-3 border-b border-[#eee] bg-[#f8f9fa] rounded-t font-semibold text-[14px]">
                    Xin chào, <b className="font-bold">{user?.name}</b>
                  </div>
                  <ul className="list-none p-0 m-0">
                    {user?.isAdmin && (
                      <li>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                        >
                          <i className="fas fa-cogs w-[20px] text-center mr-3"></i>{" "}
                          Trang quản trị
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                      >
                        <i className="far fa-user w-[20px] text-center mr-3"></i>{" "}
                        Thông tin tài khoản
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/orders"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          if (unreadOrderCount > 0) {
                            setUnreadOrderCount(0);
                            try {
                              await apiFetch("/notifications/mark-read", { method: "PUT" });
                            } catch {
                              // ignore
                            }
                          }
                        }}
                        className="flex items-center justify-between px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                      >
                        <div className="flex items-center">
                          <i className="fas fa-sync-alt w-[20px] text-center mr-3"></i>{" "}
                          <span>Quản lý đơn hàng</span>
                        </div>
                        {unreadOrderCount > 0 && (
                          <span className="bg-[#e10600] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs leading-none">
                            {unreadOrderCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                      >
                        <i className="fas fa-map-marker-alt w-[20px] text-center mr-3"></i>{" "}
                        Sổ địa chỉ
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                      >
                        <i className="far fa-heart w-[20px] text-center mr-3"></i>{" "}
                        Sản phẩm yêu thích
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <i className="fas fa-sign-out-alt w-[20px] text-center mr-3"></i>{" "}
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden xl:flex items-center justify-center p-1 text-[#221F20] hover:text-[#000] relative transition-colors"
                title="Đăng nhập"
                aria-label="Đăng nhập"
              >
                <IvyUserIcon className="w-[20px] h-[20px]" />
              </Link>
            )}

            <div
              className="text-[#221F20] hover:text-[#000] relative cursor-pointer flex items-center justify-center p-1 transition-transform active:scale-95"
              onClick={() => toggleMiniCart()}
              title="Giỏ hàng"
            >
              {/* LUXE exact SVG shopping bag icon */}
              <IvyBagIcon className="w-[22px] h-[22px]" />

              {/* Black circular badge with white count matching LUXE style */}
              <span className="absolute -top-[4px] -right-[6px] bg-[#221F20] text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-[2px] rounded-full leading-none flex items-center justify-center shadow-sm select-none pointer-events-none">
                {totalItems}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1040] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[85%] max-w-[400px] bg-white z-[1050] transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex-grow overflow-y-auto px-[20px] pt-[15px] pb-[80px]">
          <div className="mb-3">
            <span
              className="text-[28px] cursor-pointer text-[#333] font-light leading-none inline-block"
              onClick={toggleMobileMenu}
            >
              &times;
            </span>
          </div>

          <ul className="list-none p-0 m-0">
            <li className="mb-0">
              <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => toggleSubMenu("women")}
              >
                <span className="text-[#333] font-bold block w-full text-[14px] uppercase">
                  Nữ
                </span>
                <span className="text-[#6c757d] text-[22px] font-light leading-none">
                  {expandedMenus["women"] ? "–" : "+"}
                </span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedMenus["women"]
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <div className="pl-3 pb-4">
                  <Link
                    href="/danh-muc/nu"
                    onClick={toggleMobileMenu}
                    className="block mb-3 text-[#ff0000] font-bold uppercase text-[13px]"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/hang-nu-moi-ve"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#333] font-semibold uppercase text-[13px]"
                  >
                    NEW ARRIVAL
                  </Link>
                  {womenNavGroups.map((group) => (
                    <div key={group.title} className="mb-4">
                      <Link
                        href={`/danh-muc/${group.slug}`}
                        onClick={toggleMobileMenu}
                        className="block font-bold text-[#333] uppercase text-[13px] mb-2 hover:text-black"
                      >
                        {group.title}
                      </Link>
                      <div className="pl-3 space-y-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={toggleMobileMenu}
                            className="block text-[#6c757d] text-[13px] hover:text-[#000] transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </li>

            <li className="mb-0">
              <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => toggleSubMenu("men")}
              >
                <span className="text-[#333] font-bold block w-full text-[14px] uppercase">
                  Nam
                </span>
                <span className="text-[#6c757d] text-[22px] font-light leading-none">
                  {expandedMenus["men"] ? "–" : "+"}
                </span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedMenus["men"]
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <div className="pl-3 pb-4">
                  <Link
                    href="/danh-muc/nam"
                    onClick={toggleMobileMenu}
                    className="block mb-3 text-[#ff0000] font-bold uppercase text-[13px]"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/hang-nam-moi-ve"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#333] font-semibold uppercase text-[13px]"
                  >
                    NEW ARRIVAL
                  </Link>
                  {menNavGroups.map((group) => (
                    <div key={group.title} className="mb-4">
                      <Link
                        href={`/danh-muc/${group.slug}`}
                        onClick={toggleMobileMenu}
                        className="block font-bold text-[#333] uppercase text-[13px] mb-2 hover:text-black"
                      >
                        {group.title}
                      </Link>
                      <div className="pl-3 space-y-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={toggleMobileMenu}
                            className="block text-[#6c757d] text-[13px] hover:text-[#000] transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </li>

            <li className="border-b border-[#f0f0f0] pb-3 mb-3">
              <Link
                href="/danh-muc/sale"
                onClick={toggleMobileMenu}
                className="text-[#e10600] font-bold w-full text-[14px] no-underline uppercase flex items-center justify-between"
              >
                <span>SẢN PHẨM SALE</span>
                <span className="text-[11px] bg-[#e10600] text-white px-2 py-0.5 rounded-full font-semibold">HOT</span>
              </Link>
            </li>

            <li>
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="/order/tracking"
                  onClick={toggleMobileMenu}
                  className="text-[#333] font-bold block w-full text-[14px] no-underline uppercase"
                >
                  TRA CỨU ĐƠN HÀNG
                </Link>
              </div>
            </li>
            <li>
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="/pages/ve-chung-toi"
                  onClick={toggleMobileMenu}
                  className="text-[#333] font-bold block w-full text-[14px] no-underline uppercase"
                >
                  VỀ CHÚNG TÔI
                </Link>
              </div>
            </li>
            <li className="pb-4 pt-2 border-t border-[#eee]">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/account/profile"
                    onClick={toggleMobileMenu}
                    className="text-[#333] font-bold flex w-full text-[14px] no-underline uppercase items-center gap-2"
                  >
                    <IvyUserIcon className="w-[18px] h-[18px]" />
                    <span>{user?.name || "TÀI KHOẢN CỦA TÔI"}</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={async () => {
                      toggleMobileMenu();
                      if (unreadOrderCount > 0) {
                        setUnreadOrderCount(0);
                        try {
                          await apiFetch("/notifications/mark-read", { method: "PUT" });
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className="text-[#555] font-semibold flex w-full text-[13px] no-underline items-center justify-between pl-6"
                  >
                    <span>Quản lý đơn hàng</span>
                    {unreadOrderCount > 0 && (
                      <span className="bg-[#e10600] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {unreadOrderCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={toggleMobileMenu}
                  className="text-[#333] font-bold flex w-full text-[14px] no-underline uppercase items-center gap-2"
                >
                  <IvyUserIcon className="w-[18px] h-[18px]" />
                  <span>ĐĂNG NHẬP / ĐĂNG KÝ</span>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

