"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";

interface FeaturedBanner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  targetUrl?: string | null;
}

const DEFAULT_FEATURED: FeaturedBanner[] = [
  {
    id: 1,
    title: "ĐẦM",
    subtitle: "Đầm dáng xòe & đầm công sở thanh lịch",
    targetUrl: "/danh-muc/dam-nu",
    imageUrl: "/uploads/products/002eab5bd95091694139ae9e8f046007.webp",
  },
  {
    id: 2,
    title: "ÁO NỮ",
    subtitle: "Áo sơ mi lụa & áo kiểu tinh tế",
    targetUrl: "/danh-muc/ao-nu",
    imageUrl: "/uploads/products/f4a49449c18a61d9d49c0f976bc56606.webp",
  },
  {
    id: 3,
    title: "ÁO NAM",
    subtitle: "Áo polo & sơ mi chuẩn phom lịch lãm",
    targetUrl: "/danh-muc/ao-nam",
    imageUrl: "/uploads/products/9278e16772c52fe0c41b035b775a2f9c.jpg",
  },
  {
    id: 4,
    title: "SẢN PHẨM SALE",
    subtitle: "Ưu đãi hấp dẫn lên đến 50%",
    targetUrl: "/danh-muc/sale",
    imageUrl: "/uploads/products/0284007651a63e1aa34493daa2754ba1.webp",
  },
];

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<FeaturedBanner[]>(DEFAULT_FEATURED);

  useEffect(() => {
    let active = true;
    apiFetch<FeaturedBanner[]>("/banners?position=FEATURED")
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // keep fallback default categories
      });
    return () => {
      active = false;
    };
  }, []);

  // Giới hạn tối đa 4 danh mục nổi bật trên trang chủ
  const displayCategories = categories.slice(0, 4);

  if (displayCategories.length === 0) {
    return null;
  }

  // Tự động căn chỉnh layout và tỉ lệ ảnh lấp đầy toàn bộ hàng ngang:
  // - 4 thẻ: 4 cột đều nhau (25% mỗi thẻ)
  // - 3 thẻ: 3 cột đều nhau (33.3% mỗi thẻ)
  // - 2 thẻ: 2 cột đều nhau (50% mỗi thẻ dàn đều 2 bên, không bị trống phải)
  // - 1 thẻ: Căn giữa trung tâm
  let containerClass = "grid gap-[20px] xl:gap-[24px] w-full";
  let aspectClass = "aspect-[3/4]";

  if (displayCategories.length === 4) {
    containerClass += " grid-cols-2 lg:grid-cols-4";
    aspectClass = "aspect-[3/4]";
  } else if (displayCategories.length === 3) {
    containerClass += " grid-cols-1 md:grid-cols-3";
    aspectClass = "aspect-[3/4]";
  } else if (displayCategories.length === 2) {
    containerClass += " grid-cols-1 sm:grid-cols-2";
    aspectClass = "aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/11]";
  } else {
    containerClass += " grid-cols-1 max-w-[800px] mx-auto";
    aspectClass = "aspect-[16/9]";
  }

  return (
    <section className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto my-[40px] xl:my-[60px]">
      <div className="text-center mb-[25px]">
        <h3 className="text-[28px] md:text-[32px] font-bold uppercase tracking-[3px] text-[#000]">
          DANH MỤC NỔI BẬT
        </h3>
      </div>

      <div className={containerClass}>
        {displayCategories.map((cat) => {
          const isSale =
            cat.targetUrl?.includes("sale") ||
            cat.title?.toLowerCase().includes("ưu đãi") ||
            cat.title?.toLowerCase().includes("sale");

          return (
            <Link
              key={cat.id}
              href={cat.targetUrl || "/"}
              className={`group relative block ${aspectClass} overflow-hidden rounded-[8px] bg-[#f8f8f8] shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl}
                alt={cat.title}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity group-hover:from-black/85" />

              {/* Sale Badge if relevant */}
              {isSale && (
                <span className="absolute top-[16px] left-[16px] px-[12px] py-[5px] bg-[#b5121b] text-white text-[11px] font-bold tracking-wider uppercase rounded-full shadow-sm">
                  SALE UP TO 50%
                </span>
              )}

              {/* Content Bottom */}
              <div className="absolute bottom-[20px] left-[20px] right-[20px] text-white z-10">
                <h4 className="text-[19px] md:text-[21px] font-bold tracking-[1.5px] uppercase mb-[4px] drop-shadow-sm">
                  {cat.title}
                </h4>
                {cat.subtitle && (
                  <p className="text-[12px] text-gray-200 mb-[12px] font-light line-clamp-1">
                    {cat.subtitle}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] font-medium text-white pb-[2px] border-b border-white group-hover:border-[#b5121b] group-hover:text-red-300 transition-colors">
                  Khám phá ngay <i className="fas fa-arrow-right text-[9px]"></i>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
