"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard, { Product } from "@/shared/storefront-ui/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

interface ProductSliderProps {
  products: Product[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 italic">
          Sản phẩm mới đang được cập nhật...
        </p>
      </div>
    );
  }

  return (
    <div className="relative group/slider product-slider-container">
      <Swiper
        spaceBetween={30}
        navigation={{
          nextEl: ".product-swiper-button-next",
          prevEl: ".product-swiper-button-prev",
        }}
        modules={[Navigation]}
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          600: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          800: {
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

      <div className="product-swiper-button-prev absolute top-[40%] -left-[10px] -translate-y-1/2 z-10 w-[40px] h-[40px] bg-white text-[#333] flex items-center justify-center rounded-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#000] hover:text-white [&.swiper-button-disabled]:opacity-50 [&.swiper-button-disabled]:pointer-events-none">
        <i className="fas fa-chevron-left text-[18px]"></i>
      </div>
      <div className="product-swiper-button-next absolute top-[40%] -right-[10px] -translate-y-1/2 z-10 w-[40px] h-[40px] bg-white text-[#333] flex items-center justify-center rounded-full cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#000] hover:text-white [&.swiper-button-disabled]:opacity-50 [&.swiper-button-disabled]:pointer-events-none">
        <i className="fas fa-chevron-right text-[18px]"></i>
      </div>
    </div>
  );
}

