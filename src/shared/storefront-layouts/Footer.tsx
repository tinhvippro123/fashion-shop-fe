"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-white pt-[60px] pb-[10px] border-t border-[#e1e1e1] text-[14px] text-[#333] leading-[1.2] mt-[40px]">
      <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto">
        <div className="flex flex-wrap min-[1200px]:flex-nowrap justify-between items-start pb-[30px]">
          {/* Col 1 */}
          <div className="w-full max-[768px]:w-full max-[1199px]:w-1/2 min-[1200px]:w-[298px] shrink-0 max-[1199px]:pr-[15px] mb-[30px] min-[1200px]:mb-0">
            <div className="mb-3 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/client/img/logo.png"
                alt="Logo"
                className="h-[40px] w-auto mr-3 inline-block"
              />
            </div>
            <div className="flex gap-[29px] mb-[30px] items-center max-[768px]:flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <i className="fab fa-facebook-f text-[24px] text-[#4267b2]"></i>
              </a>
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <i className="fab fa-google text-[24px] text-[#ea4335]"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80 flex items-center justify-center"
              >
                <i
                  className="fab fa-instagram text-[24px]"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    display: "inline-block",
                  }}
                ></i>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0068ff] font-bold no-underline transition-opacity hover:opacity-80"
              >
                Zalo
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <i className="fab fa-youtube text-[24px] text-[#ff0000]"></i>
              </a>
            </div>
            <div className="bg-[#222] text-white inline-block px-[22px] py-[15px] rounded-tl-[15px] rounded-br-[15px] font-semibold text-[15px]">
              HOTLINE: 0123 456 789
            </div>
          </div>

          {/* Col 2 */}
          <div className="w-full max-[768px]:w-full max-[1199px]:w-1/2 min-[1200px]:w-[180px] shrink-0 max-[1199px]:pr-[15px] mb-[30px] max-[768px]:mb-0 min-[1200px]:mb-0">
            <h5
              className="text-[20px] max-[768px]:text-[16px] font-semibold text-[#000] mb-[20px] flex justify-between items-center cursor-pointer lg:cursor-default"
              onClick={() => toggleSection("intro")}
            >
              <div className="flex justify-between w-full items-center">
                <span>GIỚI THIỆU</span>
                <span className="min-[769px]:hidden">
                  <i
                    className={`fas fa-angle-right text-[20px] text-[#333] font-light transition-transform duration-300 ${
                      expandedSections["intro"] ? "rotate-90" : ""
                    }`}
                  ></i>
                </span>
              </div>
            </h5>
            <div
              className={`overflow-hidden transition-all duration-300 min-[769px]:!max-h-none min-[769px]:!opacity-100 min-[769px]:overflow-visible ${
                expandedSections["intro"]
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <ul className="list-none p-0 m-0">
                <li className="mb-[16px]">
                  <Link
                    href="/pages/ve-chung-toi"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Về LUXE fashion
                  </Link>
                </li>
                <li className="mb-[16px]">
                  <Link
                    href="/pages/he-thong-cua-hang"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Hệ thống cửa hàng
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3 */}
          <div className="w-full max-[768px]:w-full max-[1199px]:w-1/2 min-[1200px]:w-[250px] shrink-0 max-[1199px]:pr-[15px] mb-[30px] max-[768px]:mb-0 min-[1200px]:mb-0">
            <h5
              className="text-[20px] max-[768px]:text-[16px] font-semibold text-[#000] mb-[20px] flex justify-between items-center cursor-pointer lg:cursor-default"
              onClick={() => toggleSection("service")}
            >
              <div className="flex justify-between w-full items-center">
                <span>DỊCH VỤ KHÁCH HÀNG</span>
                <span className="min-[769px]:hidden">
                  <i
                    className={`fas fa-angle-right text-[20px] text-[#333] font-light transition-transform duration-300 ${
                      expandedSections["service"] ? "rotate-90" : ""
                    }`}
                  ></i>
                </span>
              </div>
            </h5>
            <div
              className={`overflow-hidden transition-all duration-300 min-[769px]:!max-h-none min-[769px]:!opacity-100 min-[769px]:overflow-visible ${
                expandedSections["service"]
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <ul className="list-none p-0 m-0">
                <li className="mb-[16px]">
                  <Link
                    href="/pages/dieu-khoan-dich-vu"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Chính sách điều khoản
                  </Link>
                </li>
                <li className="mb-[16px]">
                  <Link
                    href="/pages/chinh-sach-doi-tra"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Chính sách đổi trả
                  </Link>
                </li>
                <li className="mb-[16px]">
                  <Link
                    href="/order/tracking"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Tra cứu đơn hàng
                  </Link>
                </li>
                <li className="mb-[16px]">
                  <Link
                    href="/pages/chinh-sach-bao-mat"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4 */}
          <div className="w-full max-[768px]:w-full max-[1199px]:w-1/2 min-[1200px]:w-[240px] shrink-0 max-[1199px]:pr-[15px] mb-[30px] max-[768px]:mb-0 min-[1200px]:mb-0">
            <h5
              className="text-[20px] max-[768px]:text-[16px] font-semibold text-[#000] mb-[20px] flex justify-between items-center cursor-pointer lg:cursor-default"
              onClick={() => toggleSection("contact")}
            >
              <div className="flex justify-between w-full items-center">
                <span>THÔNG TIN LIÊN HỆ</span>
                <span className="min-[769px]:hidden">
                  <i
                    className={`fas fa-angle-right text-[20px] text-[#333] font-light transition-transform duration-300 ${
                      expandedSections["contact"] ? "rotate-90" : ""
                    }`}
                  ></i>
                </span>
              </div>
            </h5>
            <div
              className={`overflow-hidden transition-all duration-300 min-[769px]:!max-h-none min-[769px]:!opacity-100 min-[769px]:overflow-visible ${
                expandedSections["contact"]
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <ul className="list-none p-0 m-0">
                <li className="mb-[16px]">
                  <a
                    href="tel:0123456789"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000]"
                  >
                    Hotline: 0123 456 789
                  </a>
                </li>
                <li className="mb-[16px]">
                  <a
                    href="mailto:cskh@luxe.vn"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000]"
                  >
                    Email: cskh@luxe.vn
                  </a>
                </li>
                <li className="mb-[16px]">
                  <Link
                    href="/pages/he-thong-cua-hang"
                    className="text-[#555] font-normal block py-[2px] transition-all duration-200 hover:text-[#000] hover:pl-[5px]"
                  >
                    68 Nguyễn Huệ, Q.1, TP.HCM
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-[30px] mt-[30px] border-t border-[#d1d2d4] pb-[20px] px-[15px]">
        <p className="text-[13px] mb-[5px] italic text-[#6c757d]">
          Đồ án môn học Phát triển phần mềm hướng đối tượng – Website Quản lý Bán
          quần áo LUXE Fashion.
        </p>
        <span className="text-[16px] text-[#888]">
          ©LUXE fashion All rights reserved
        </span>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around py-[10px] z-[1060] border-t border-[#eee]">
        <Link
          href="/search"
          className="flex flex-col items-center justify-center text-center text-[#555] text-[12px] w-1/3 hover:text-[#000] transition-colors"
        >
          <i className="fas fa-search text-[20px] mb-[5px]"></i>
          <span>Tìm kiếm</span>
        </Link>
        <Link
          href="/order/tracking"
          className="flex flex-col items-center justify-center text-center text-[#555] text-[12px] w-1/3 border-l border-r border-[#eee] hover:text-[#000] transition-colors"
        >
          <i className="fas fa-truck text-[20px] mb-[5px]"></i>
          <span>Tra cứu đơn</span>
        </Link>
        <Link
          href="/account/profile"
          className="flex flex-col items-center justify-center text-center text-[#555] text-[12px] w-1/3 hover:text-[#000] transition-colors"
        >
          <i className="far fa-user text-[20px] mb-[5px]"></i>
          <span>Tài khoản</span>
        </Link>
      </div>
    </footer>
  );
}
