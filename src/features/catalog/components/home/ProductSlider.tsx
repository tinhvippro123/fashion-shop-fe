"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard, { Product } from "@/shared/storefront-ui/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

interface ProductSliderProps {
  products: Product[];
  sliderId?: string;
  loading?: boolean;
}

export function ProductSliderSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[15px] sm:gap-[20px] lg:gap-[30px] w-full animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-[30px]">
          <div className="aspect-[2/3] bg-gradient-to-r from-[#f0f0f2] via-[#e4e4e7] to-[#f0f0f2] rounded-[4px] mb-[15px]" />
          <div className="flex gap-[6px] mb-[10px]">
            <div className="w-[18px] h-[18px] rounded-full bg-[#e4e4e7]" />
            <div className="w-[18px] h-[18px] rounded-full bg-[#e4e4e7]" />
          </div>
          <div className="h-[14px] bg-[#e4e4e7] rounded w-3/4 mb-[8px]" />
          <div className="h-[16px] bg-[#e4e4e7] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function ProductSlider({
  products,
  sliderId = "home-slider",
  loading = false,
}: ProductSliderProps) {
  if (loading) {
    return <ProductSliderSkeleton />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 italic">
          Sản phẩm đang được cập nhật...
        </p>
      </div>
    );
  }

  const prevClass = `swiper-btn-prev-${sliderId}`;
  const nextClass = `swiper-btn-next-${sliderId}`;

  return (
    <div className="relative group/slider product-slider-container">
      <Swiper
        spaceBetween={30}
        navigation={{
          nextEl: `.${nextClass}`,
          prevEl: `.${prevClass}`,
        }}
        modules={[Navigation]}
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
        }}
        className="w-full"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className={`${prevClass} absolute top-[40%] -left-[10px] -translate-y-1/2 z-10 w-[40px] h-[40px] bg-white text-[#333] flex items-center justify-center rounded-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#000] hover:text-white [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:pointer-events-none`}
      >
        <i className="fas fa-chevron-left text-[18px]"></i>
      </div>
      <div
        className={`${nextClass} absolute top-[40%] -right-[10px] -translate-y-1/2 z-10 w-[40px] h-[40px] bg-white text-[#333] flex items-center justify-center rounded-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#000] hover:text-white [&.swiper-button-disabled]:opacity-40 [&.swiper-button-disabled]:pointer-events-none`}
      >
        <i className="fas fa-chevron-right text-[18px]"></i>
      </div>
    </div>
  );
}
