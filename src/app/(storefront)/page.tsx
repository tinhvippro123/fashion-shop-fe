"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HomeSlider from "@/features/catalog/components/home/HomeSlider";
import ProductSlider from "@/features/catalog/components/home/ProductSlider";
import ProductCard, { Product } from "@/shared/storefront-ui/ProductCard";
import { apiFetch } from "@/shared/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"women" | "men">("women");
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    apiFetch<Product[]>("/catalog/products?onSale=true")
      .then((res) => setSaleProducts((res || []).slice(0, 4)))
      .catch(() => {});

    apiFetch<Product[]>("/catalog/products?categorySlug=nu")
      .then((res) => setWomenProducts(res || []))
      .catch(() => {});

    apiFetch<Product[]>("/catalog/products?categorySlug=nam")
      .then((res) => setMenProducts(res || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <HomeSlider />

      {/* SALE SECTION */}
      {saleProducts.length > 0 && (
        <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mt-[40px]">
          <div className="bg-white rounded-lg p-[20px] md:p-[30px] border border-[#e10600]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#f7941d]/10 rounded-bl-full -z-0"></div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-[20px] relative z-10">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <h3 className="text-[28px] font-bold text-[#e10600] italic flex items-center gap-2 uppercase tracking-wide">
                  <i className="fas fa-bolt"></i>
                  Hot Sale
                </h3>
                <div className="flex gap-2">
                  <div className="bg-[#e10600] text-white font-bold text-[18px] w-[40px] h-[40px] flex items-center justify-center rounded">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <span className="text-[#e10600] font-bold text-[24px]">
                    :
                  </span>
                  <div className="bg-[#e10600] text-white font-bold text-[18px] w-[40px] h-[40px] flex items-center justify-center rounded">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <span className="text-[#e10600] font-bold text-[24px]">
                    :
                  </span>
                  <div className="bg-[#e10600] text-white font-bold text-[18px] w-[40px] h-[40px] flex items-center justify-center rounded">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                </div>
              </div>
              <Link
                href="/danh-muc/sale"
                className="text-[#333] hover:text-[#e10600] font-medium transition-colors flex items-center gap-1"
              >
                Xem tất cả <i className="fas fa-chevron-right text-[12px]"></i>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px] md:gap-[30px] relative z-10">
              {saleProducts.map((product) => (
                <ProductCard key={`sale-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW ARRIVAL SECTION */}
      <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mt-[30px] mb-[60px]">
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

