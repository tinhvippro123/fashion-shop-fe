"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/users/stores/auth.store";

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsDesktop(true);
        setIsMenuOpen(true);
      } else {
        setIsDesktop(false);
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    if (!isDesktop) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const menuItems = [
    {
      name: "Thông tin tài khoản",
      path: "/account/profile",
      icon: "far fa-user",
    },
    {
      name: "Quản lý đơn hàng",
      path: "/account/orders",
      icon: "fas fa-sync",
    },
    {
      name: "Sổ địa chỉ",
      path: "/account/addresses",
      icon: "fas fa-map-marker-alt",
    },
    {
      name: "Sản phẩm yêu thích",
      path: "/account/wishlist",
      icon: "far fa-heart",
    },
  ];

  return (
    <div className="border border-[#e7e8e9] rounded-tl-[32px] rounded-br-[32px] bg-white text-[#6c6d70] text-left mb-[30px] w-full p-[15px_20px] lg:w-[235px] lg:p-[32px_33px] shrink-0">
      <div
        className="flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={toggleMenu}
      >
        <div className="flex items-center">
          <div className="w-[42px] h-[42px] bg-[#e8e8e8] rounded-full flex items-center justify-center mr-[15px] shrink-0">
            <i className="fas fa-user text-[#b0b0b0] text-[20px]"></i>
          </div>
          <div>
            <div className="font-semibold text-[16px] text-[#555]">
              {user?.name || user?.fullName || "Khách hàng"}
            </div>
          </div>
        </div>
        {!isDesktop && (
          <i
            className="fas fa-angle-down text-[#666] text-[18px] transition-transform duration-300"
            style={{ transform: isMenuOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          ></i>
        )}
      </div>

      <div
        className={`transition-all duration-300 ${
          isMenuOpen
            ? "max-h-[1000px] opacity-100 mt-[25px] pt-[25px] border-t border-[#e7e8e9] overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <ul className="list-none mb-0 text-[14px]">
          {menuItems.map((item, index) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <li
                key={index}
                className="mb-[32px]"
              >
                <Link
                  href={item.path}
                  className={`flex items-center transition-colors duration-300 whitespace-nowrap ${
                    isActive
                      ? "text-[#111] font-semibold"
                      : "text-[#666] font-medium hover:text-[#111]"
                  }`}
                >
                  <i
                    className={`${item.icon} w-[13px] h-[14px] inline-flex justify-center items-center mr-[15px] text-[14px] ${
                      isActive ? "text-[#111]" : "text-[#a0a0a0]"
                    }`}
                  ></i>
                  {item.name}
                </Link>
              </li>
            );
          })}
          <li className="mb-0">
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex items-center transition-colors duration-300 whitespace-nowrap text-[#666] font-medium hover:text-[#dc3545] bg-transparent border-none p-0 cursor-pointer"
            >
              <i className="fas fa-sign-out-alt w-[13px] h-[14px] inline-flex justify-center items-center mr-[15px] text-[14px] text-[#a0a0a0]"></i>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

