"use client";

import React, { use, useState } from "react";
import Link from "next/link";

const PAGES = [
  {
    slug: "ve-chung-toi",
    title: "Về chúng tôi",
    content:
      '<h2>Về LUXE Fashion</h2><p>LUXE Fashion là thương hiệu thời trang Việt Nam với mong muốn đem lại vẻ đẹp hiện đại và sự tự tin cho khách hàng, thông qua các dòng sản phẩm thời trang thể hiện cá tính và xu hướng.</p><p>Một trong những "tôn chỉ" về thiết kế của LUXE Fashion chính là sự đa dạng, với mong muốn mang đến cho người mặc những sản phẩm phù hợp nhất với ngoại hình và quan trọng hơn cả là cá tính của chính mình.</p>',
  },
  {
    slug: "chinh-sach-doi-tra",
    title: "Chính sách đổi trả",
    content:
      "<h2>Chính sách đổi trả</h2><p>Hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng.</p>",
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    content:
      "<h2>Chính sách bảo mật</h2><p>LUXE Fashion cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng theo quy định của pháp luật.</p>",
  },
  {
    slug: "dieu-khoan-dich-vu",
    title: "Điều khoản dịch vụ",
    content:
      "<h2>Điều khoản dịch vụ</h2><p>Bằng việc truy cập và mua sắm tại website LUXE Fashion, quý khách đồng ý với các điều khoản dịch vụ của chúng tôi.</p>",
  },
  {
    slug: "he-thong-cua-hang",
    title: "Hệ thống cửa hàng",
    content:
      "<h2>Hệ thống cửa hàng LUXE</h2><p>Hiện tại LUXE Fashion có hơn 50 cửa hàng trên toàn quốc. Để tìm cửa hàng gần nhất, vui lòng liên hệ hotline 1900 1234.</p>",
  },
];

export default function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  const currentPage = PAGES.find((p) => p.slug === slug) || PAGES[0];

  return (
    <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-[30px] mb-[50px] font-['Montserrat',sans-serif]">
      {/* Breadcrumb */}
      <div className="mb-[30px] text-[14px] font-medium flex items-center gap-[8px]">
        <Link
          href="/"
          className="text-[#666] hover:text-[#222] transition-colors"
        >
          Trang chủ
        </Link>
        <span className="text-[#999]">-</span>
        <span className="text-[#333]">{currentPage.title}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-[30px]">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-full md:w-3/12 lg:w-3/12">
          <div className="border border-[#f0f0f0] rounded-[20px] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.05)]">
            <ul className="flex flex-col m-0 p-0 list-none">
              {PAGES.map((p) => {
                const isActive = p.slug === slug;
                return (
                  <li
                    key={p.slug}
                    className="border-b border-[#f0f0f0] last:border-b-0"
                  >
                    <Link
                      href={`/pages/${p.slug}`}
                      className={`block px-[25px] py-[18px] text-[15px] transition-colors duration-300 ${
                        isActive
                          ? "text-[#333] font-semibold bg-[#f8f9fa]"
                          : "text-[#555] hover:text-[#000] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-9/12 lg:w-9/12">
          {/* Dropdown for Mobile */}
          <div className="md:hidden mb-[25px] relative">
            <button
              onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
              className="w-full px-[20px] py-[12px] border border-[#e1e1e1] rounded-full bg-white text-[14px] font-medium text-[#333] uppercase flex justify-between items-center outline-none"
            >
              <span>{currentPage.title}</span>
              <i
                className={`fas fa-chevron-${
                  isOpenMobileMenu ? "up" : "down"
                } text-[#999] text-[12px]`}
              ></i>
            </button>

            {isOpenMobileMenu && (
              <div
                className="absolute top-[calc(100%+5px)] left-0 w-full border border-[#e1e1e1] bg-white z-[10] py-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.05)]"
                style={{ borderRadius: "20px 0 20px 0" }}
              >
                {PAGES.map((p) => {
                  const isActive = p.slug === slug;
                  return (
                    <Link
                      key={p.slug}
                      href={`/pages/${p.slug}`}
                      onClick={() => setIsOpenMobileMenu(false)}
                      className={`block px-[20px] py-[10px] text-[14px] ${
                        isActive
                          ? "font-semibold text-[#111]"
                          : "text-[#555] hover:bg-[#f8f9fa] hover:text-[#111]"
                      }`}
                    >
                      {p.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Page Content */}
          <div className="text-[15px] text-[#333] leading-[1.8]">
            <div
              dangerouslySetInnerHTML={{ __html: currentPage.content }}
              className="
                 [&>h1]:font-bold [&>h1]:text-[22px] md:[&>h1]:text-[26px] [&>h1]:mt-[20px] [&>h1]:mb-[15px]
                 [&>h2]:font-bold [&>h2]:text-[18px] md:[&>h2]:text-[22px] [&>h2]:mt-[20px] [&>h2]:mb-[15px]
                 [&>h3]:font-bold [&>h3]:text-[16px] md:[&>h3]:text-[18px] [&>h3]:mt-[20px] [&>h3]:mb-[15px]
                 [&>p]:mb-[15px] [&>p]:text-[14px] md:[&>p]:text-[15px]
               "
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

