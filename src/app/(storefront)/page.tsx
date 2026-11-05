"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HomeSlider from "@/features/catalog/components/home/HomeSlider";
import ProductSlider from "@/features/catalog/components/home/ProductSlider";
import FeaturedCategories from "@/features/catalog/components/home/FeaturedCategories";
import ServiceHighlights from "@/features/catalog/components/home/ServiceHighlights";
import type { Product } from "@/shared/storefront-ui/ProductCard";
import { apiFetch } from "@/shared/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    // 1. New Arrival - Nữ (Giới hạn 10 sản phẩm mới nhất)
    apiFetch<Product[]>("/catalog/products?categorySlug=nu")
      .then((res) => {
        const list = res || [];
        setWomenProducts(list.slice(0, 10));
      })
      .catch(() => {});

    // 2. New Arrival - Nam (Giới hạn 10 sản phẩm mới nhất)
    apiFetch<Product[]>("/catalog/products?categorySlug=nam")
      .then((res) => {
        const list = res || [];
        setMenProducts(list.slice(0, 10));
      })
      .catch(() => {});

    // 3. Best Seller & Hot Deals (Lấy 10 sản phẩm đang có ưu đãi giảm giá tốt nhất)
    apiFetch<Product[]>("/catalog/products?onSale=true")
      .then((res) => {
        const list = res || [];
        setSaleProducts(list.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* 1. HERO BANNER SLIDER */}
      <HomeSlider />

      {/* 2. NEW ARRIVAL SECTION (Tối đa 10 sản phẩm) */}
      <section className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mt-[40px] mb-[60px]">
        <div className="text-center mb-[25px]">
          <h3 className="text-[28px] md:text-[32px] font-bold uppercase tracking-[3px] text-[#000] mb-[8px]">
            NEW ARRIVAL
          </h3>
          <p className="text-[14px] text-[#6c757d] uppercase tracking-[1px] mb-[15px]">
            Bộ sưu tập mới nhất tuần này
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("women")}
              className={`inline-block text-[17px] md:text-[18px] uppercase transition-colors mx-[10px] px-[15px] pb-[5px] border-b-2 cursor-pointer ${
                activeTab === "women"
                  ? "text-[#000] font-semibold border-[#000]"
                  : "text-[#6c757d] border-transparent hover:text-[#000]"
              }`}
            >
              WOMEN
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`inline-block text-[17px] md:text-[18px] uppercase transition-colors mx-[10px] px-[15px] pb-[5px] border-b-2 cursor-pointer ${
                activeTab === "men"
                  ? "text-[#000] font-semibold border-[#000]"
                  : "text-[#6c757d] border-transparent hover:text-[#000]"
              }`}
            >
              MEN
            </button>
          </div>
        </div>

        <div>
          {activeTab === "women" && (
            <div className="animate-fade-in">
              <ProductSlider products={womenProducts} sliderId="new-women" />
              <div className="text-center mt-[24px]">
                <Link
                  href="/danh-muc/nu"
                  className="inline-block px-[40px] py-[12px] bg-white border border-[#333] text-[#333] font-normal text-[14px] uppercase tracking-[1px] no-underline rounded-tl-[20px] rounded-br-[20px] transition-all duration-300 hover:bg-[#000] hover:border-[#000] hover:text-white"
                >
                  Xem tất cả ({womenProducts.length > 0 ? "Nữ" : "0"})
                </Link>
              </div>
            </div>
          )}

          {activeTab === "men" && (
            <div className="animate-fade-in">
              <ProductSlider products={menProducts} sliderId="new-men" />
              <div className="text-center mt-[24px]">
                <Link
                  href="/danh-muc/nam"
                  className="inline-block px-[40px] py-[12px] bg-white border border-[#333] text-[#333] font-normal text-[14px] uppercase tracking-[1px] no-underline rounded-tl-[20px] rounded-br-[20px] transition-all duration-300 hover:bg-[#000] hover:border-[#000] hover:text-white"
                >
                  Xem tất cả ({menProducts.length > 0 ? "Nam" : "0"})
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES SECTION */}
      <FeaturedCategories />

      {/* 4. BEST SELLER & HOT DEALS SECTION */}
      {saleProducts.length > 0 && (
        <section className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto my-[60px]">
          <div className="text-center mb-[25px]">
            <div className="inline-block px-[14px] py-[4px] bg-[#fff0f1] text-[#b5121b] text-[12px] font-bold uppercase tracking-[1.5px] rounded-full mb-[8px]">
              ĐỪNG BỎ LỠ
            </div>
            <h3 className="text-[28px] md:text-[32px] font-bold uppercase tracking-[3px] text-[#000] mb-[8px]">
              BEST SELLER & HOT DEALS
            </h3>
            <p className="text-[14px] text-[#6c757d] uppercase tracking-[1px]">
              Những mẫu trang phục được yêu thích nhất với mức giá hấp dẫn
            </p>
          </div>

          <ProductSlider products={saleProducts} sliderId="best-seller" />

          <div className="text-center mt-[24px]">
            <Link
              href="/danh-muc/sale"
              className="inline-block px-[40px] py-[12px] bg-[#b5121b] border border-[#b5121b] text-white font-medium text-[14px] uppercase tracking-[1px] no-underline rounded-tl-[20px] rounded-br-[20px] transition-all duration-300 hover:bg-[#8e0c13] hover:border-[#8e0c13]"
            >
              Xem tất cả sản phẩm ưu đãi
            </Link>
          </div>
        </section>
      )}

      {/* 5. SERVICE HIGHLIGHTS */}
      <ServiceHighlights />
    </>
  );
}
