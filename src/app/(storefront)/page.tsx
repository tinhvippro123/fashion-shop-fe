"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HomeSlider from "@/features/catalog/components/home/HomeSlider";
import ProductSlider from "@/features/catalog/components/home/ProductSlider";
import type { Product } from "@/shared/storefront-ui/ProductCard";
import { apiFetch } from "@/shared/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiFetch<Product[]>("/catalog/products?categorySlug=nu")
      .then((res) => setWomenProducts(res || []))
      .catch(() => {});

    apiFetch<Product[]>("/catalog/products?categorySlug=nam")
      .then((res) => setMenProducts(res || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <HomeSlider />

      {/* NEW ARRIVAL SECTION */}
      <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mt-[40px] mb-[60px]">
        <div className="text-center mb-[25px]">
          <h3 className="text-[32px] font-bold uppercase tracking-[3px] text-[#000] mb-[15px]">
            NEW ARRIVAL
          </h3>
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("women")}
              className={`inline-block text-[18px] font-normal uppercase transition-colors mx-[10px] px-[15px] pb-[5px] border-b-2 cursor-pointer ${
                activeTab === "women"
                  ? "text-[#000] font-medium border-[#000]"
                  : "text-[#6c757d] border-transparent hover:text-[#000]"
              }`}
            >
              WOMEN
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`inline-block text-[18px] font-normal uppercase transition-colors mx-[10px] px-[15px] pb-[5px] border-b-2 cursor-pointer ${
                activeTab === "men"
                  ? "text-[#000] font-medium border-[#000]"
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
              <ProductSlider products={womenProducts} />
              <div className="text-center mt-[8px]">
                <Link
                  href="/danh-muc/nu"
                  className="inline-block px-[40px] py-[12px] bg-white border border-[#333] text-[#333] font-normal text-[14px] no-underline rounded-tl-[20px] rounded-br-[20px] transition-all duration-300 hover:bg-[#000] hover:border-[#000] hover:text-white"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
          )}

          {activeTab === "men" && (
            <div className="animate-fade-in">
              <ProductSlider products={menProducts} />
              <div className="text-center mt-[8px]">
                <Link
                  href="/danh-muc/nam"
                  className="inline-block px-[40px] py-[12px] bg-white border border-[#333] text-[#333] font-normal text-[14px] no-underline rounded-tl-[20px] rounded-br-[20px] transition-all duration-300 hover:bg-[#000] hover:border-[#000] hover:text-white"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
