"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { apiFetch } from "@/shared/lib/api";

interface CategoryNode {
  id: string;
  numericId: number;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    apiFetch<CategoryNode[]>("/catalog/categories")
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {
        // Fallback silently if backend not started yet
      });
  }, []);

  const womenRoot = categories.find((c) => c.slug === "nu");
  const menRoot = categories.find((c) => c.slug === "nam");

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
        <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto flex items-center justify-between relative after:content-[''] after:absolute after:bottom-[-17px] min-[1200px]:after:left-[85px] min-[1200px]:after:right-[85px] after:left-[15px] after:right-[15px] after:h-[1px] after:bg-[#e1e1e1]">
          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center h-full">
            {/* NỮ Menu */}
            <div className="group flex items-center h-full">
              <Link
                href="/danh-muc/nu"
                className="h-full flex items-center text-[12px] font-semibold text-[#333] group-hover:text-[#000] mr-[14px] uppercase tracking-[0.5px] transition-colors relative cursor-pointer"
              >
                NỮ
              </Link>

              <div className="absolute left-[85px] right-[85px] top-full w-auto bg-white border border-[#f1f1f1] shadow-[0_10px_20px_rgba(0,0,0,0.05)] py-[30px] px-[40px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000] hidden xl:flex before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent before:z-[1001]">
                <div className="w-[250px] shrink-0 pr-[50px] border-r border-[#eee]">
                  <Link
                    href="/danh-muc/hang-nu-moi-ve"
                    className="block font-bold mb-3 text-[#ff0000] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    NEW ARRIVAL
                  </Link>
                  <Link
                    href="/danh-muc/nu"
                    className="block font-bold mb-3 text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/sale"
                    className="block font-bold text-[#ff0000] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    HOT ITEMS - SALE UP TO 50%
                  </Link>
                </div>
                <div className="flex-1 flex flex-wrap gap-[30px] pl-[50px] content-start">
                  {(womenRoot?.children && womenRoot.children.length > 0
                    ? womenRoot.children
                    : [
                        { id: "1", numericId: 1, name: "Đầm & Váy", slug: "dam-nu" },
                        { id: "2", numericId: 2, name: "Áo Sơ Mi & Áo Kiểu", slug: "ao-nu" },
                        { id: "3", numericId: 3, name: "Chân Váy & Quần Âu", slug: "quan-vay-nu" },
                      ]
                  ).map((sub) => (
                    <div
                      key={sub.slug}
                      className="w-[200px] min-w-[180px] mb-[20px]"
                    >
                      <Link
                        href={`/danh-muc/${sub.slug}`}
                        className="block font-bold text-[#333] text-[14px] uppercase mb-[10px] hover:text-[#000] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NAM Menu */}
            <div className="group flex items-center h-full">
              <Link
                href="/danh-muc/nam"
                className="h-full flex items-center text-[12px] font-semibold text-[#333] group-hover:text-[#000] mr-[14px] uppercase tracking-[0.5px] transition-colors relative cursor-pointer"
              >
                NAM
              </Link>

              <div className="absolute left-[85px] right-[85px] top-full w-auto bg-white border border-[#f1f1f1] shadow-[0_10px_20px_rgba(0,0,0,0.05)] py-[30px] px-[40px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000] hidden xl:flex before:content-[''] before:absolute before:-top-[20px] before:left-0 before:w-full before:h-[20px] before:bg-transparent before:z-[1001]">
                <div className="w-[250px] shrink-0 pr-[50px] border-r border-[#eee]">
                  <Link
                    href="/danh-muc/hang-nam-moi-ve"
                    className="block font-bold mb-3 text-[#ff0000] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    NEW ARRIVAL
                  </Link>
                  <Link
                    href="/danh-muc/nam"
                    className="block font-bold mb-3 text-[#333] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/sale"
                    className="block font-bold text-[#ff0000] text-[14px] hover:text-[#000] uppercase transition-colors"
                  >
                    HOT ITEMS - SALE UP TO 50%
                  </Link>
                </div>
                <div className="flex-1 flex flex-wrap gap-[30px] pl-[50px] content-start">
                  {(menRoot?.children && menRoot.children.length > 0
                    ? menRoot.children
                    : [
                        { id: "4", numericId: 4, name: "Áo Nam", slug: "ao-nam" },
                        { id: "5", numericId: 5, name: "Quần Nam", slug: "quan-nam" },
                        { id: "6", numericId: 6, name: "Áo Khoác & Vest Nam", slug: "vest-nam" },
                      ]
                  ).map((sub) => (
                    <div
                      key={sub.slug}
                      className="w-[200px] min-w-[180px] mb-[20px]"
                    >
                      <Link
                        href={`/danh-muc/${sub.slug}`}
                        className="block font-bold text-[#333] text-[14px] uppercase mb-[10px] hover:text-[#000] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/danh-muc/sale"
              className="text-[12px] font-semibold text-[#ff0000] hover:text-[#ff0000] py-[10px] mr-[14px] uppercase tracking-[0.5px] transition-colors"
            >
              BIG SALE THÁNG 12
            </Link>
            <Link
              href="/danh-muc/tat-ca"
              className="text-[12px] font-semibold text-[#333] hover:text-[#000] py-[10px] mr-[14px] uppercase tracking-[0.5px] transition-colors"
            >
              BỘ SƯU TẬP
            </Link>
            <Link
              href="/order/tracking"
              className="text-[12px] font-semibold text-[#333] hover:text-[#000] py-[10px] mr-[14px] uppercase tracking-[0.5px] transition-colors"
            >
              TRA CỨU ĐƠN
            </Link>
            <Link
              href="/pages/ve-chung-toi"
              className="text-[12px] font-semibold text-[#333] hover:text-[#000] py-[10px] mr-[14px] uppercase tracking-[0.5px] transition-colors"
            >
              VỀ CHÚNG TÔI
            </Link>
          </nav>

          {/* Left: Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="block xl:hidden bg-transparent border-none text-[#000] text-[20px] cursor-pointer"
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            style={{ top: "50%", transform: "translate(-50%, -50%)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/client/img/logo.png"
              alt="Luxe Fashion"
              className="h-[40px] w-auto block mx-auto"
            />
          </Link>

          {/* Right: Search and User Actions */}
          <div className="flex items-center gap-[20px] ml-auto">
            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center relative w-[250px] border border-[#e1e1e1] rounded px-[12px] py-[6px]"
            >
              <button
                type="submit"
                className="bg-transparent border-none text-[#333] p-0 mr-[12px]"
              >
                <i className="fas fa-search"></i>
              </button>
              <input
                type="text"
                name="keyword"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="TÌM KIẾM SẢN PHẨM"
                className="w-full border-none outline-none bg-transparent font-light text-[13px] text-[#333]"
                autoComplete="off"
              />
            </form>

            <Link
              href="/contact"
              className="hidden xl:block text-[#333] text-[18px] relative transition-colors"
              title="Liên hệ"
            >
              <i className="fas fa-headset"></i>
            </Link>

            {isAuthenticated ? (
              <div className="hidden xl:block relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="bg-transparent border-none p-0 text-[#333] text-[18px] cursor-pointer transition-colors"
                >
                  <i className="far fa-user"></i>
                </button>

                <div
                  className={`absolute top-full right-0 w-[250px] bg-white border border-[#e1e1e1] rounded shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[1050] mt-[10px] transition-all duration-200 ${
                    isUserMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
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
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] transition-colors border-b border-[#f5f5f5]"
                      >
                        <i className="fas fa-sync-alt w-[20px] text-center mr-3"></i>{" "}
                        Quản lý đơn hàng
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
                className="hidden xl:block text-[#333] text-[18px] relative transition-colors"
              >
                <i className="far fa-user"></i>
              </Link>
            )}

            <div
              className="text-[#000] text-[18px] relative cursor-pointer"
              onClick={() => toggleMiniCart()}
            >
              <i className="fas fa-shopping-bag text-[24px]"></i>
              {totalItems > 0 && (
                <span className="absolute -top-[5px] -right-[10px] bg-[#ff0000] text-white text-[11px] font-bold px-[6px] py-[2px] rounded-full leading-none flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1040] transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[85%] max-w-[400px] bg-white z-[1050] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-3 pb-4">
                  <Link
                    href="/danh-muc/nu"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#ff0000] uppercase text-[13px]"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/hang-nu-moi-ve"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#6c757d] uppercase text-[13px]"
                  >
                    NEW ARRIVAL
                  </Link>
                  {womenRoot?.children?.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/danh-muc/${sub.slug}`}
                      onClick={toggleMobileMenu}
                      className="block mb-3 text-[#6c757d] uppercase text-[13px]"
                    >
                      {sub.name}
                    </Link>
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
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-3 pb-4">
                  <Link
                    href="/danh-muc/nam"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#ff0000] uppercase text-[13px]"
                  >
                    ALL ITEMS
                  </Link>
                  <Link
                    href="/danh-muc/hang-nam-moi-ve"
                    onClick={toggleMobileMenu}
                    className="block mb-4 text-[#6c757d] uppercase text-[13px]"
                  >
                    NEW ARRIVAL
                  </Link>
                  {menRoot?.children?.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/danh-muc/${sub.slug}`}
                      onClick={toggleMobileMenu}
                      className="block mb-3 text-[#6c757d] uppercase text-[13px]"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li>
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="/danh-muc/sale"
                  onClick={toggleMobileMenu}
                  className="text-[#ff0000] font-bold block w-full text-[14px] no-underline uppercase"
                >
                  BIG SALE – ƯU ĐÃI ĐẶC BIỆT
                </Link>
              </div>
            </li>
            <li>
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="/danh-muc/tat-ca"
                  onClick={toggleMobileMenu}
                  className="text-[#333] font-bold block w-full text-[14px] no-underline uppercase"
                >
                  BỘ SƯU TẬP
                </Link>
              </div>
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
            <li className="pb-4">
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
          </ul>
        </div>
      </div>
    </>
  );
}

