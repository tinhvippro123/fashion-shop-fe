"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface HeroBanner {
  id: number;
  imageUrl: string;
  targetUrl?: string | null;
  title?: string;
}

const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 1,
    imageUrl: "/client/img/banner-1.jpg",
    targetUrl: "/danh-muc/nu",
    title: "Bộ sưu tập Thời trang Nữ",
  },
  {
    id: 2,
    imageUrl: "/client/img/banner-2.jpg",
    targetUrl: "/danh-muc/nam",
    title: "Bộ sưu tập Thời trang Nam",
  },
];

export default function HomeSlider() {
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);

  useEffect(() => {
    let active = true;
    apiFetch<HeroBanner[]>("/banners?position=HERO")
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      })
      .catch(() => {
        // keep default fallback banners
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mb-[3rem]">
      <div className="relative group rounded-tl-[80px] rounded-br-[80px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          modules={[Autoplay, Pagination, Navigation]}
          className="w-full h-auto aspect-[2.5/1] max-[768px]:aspect-auto max-[768px]:h-[35vh]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link
                href={banner.targetUrl || "/"}
                className="block w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${banner.id}`}
                  className="block w-full h-full object-cover object-center"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-button-prev-custom absolute top-1/2 left-[20px] -translate-y-1/2 z-10 text-white/70 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-white">
          <i className="fas fa-chevron-left text-[30px] font-light"></i>
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 right-[20px] -translate-y-1/2 z-10 text-white/70 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-white">
          <i className="fas fa-chevron-right text-[30px] font-light"></i>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          opacity: 0.5;
          margin: 0 5px !important;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
