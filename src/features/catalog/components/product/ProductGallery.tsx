"use client";

import { useState, useEffect, useRef } from "react";
import { ProductColor } from "@/features/catalog/types/product";
import { resolveImageUrl } from "@/shared/utils/format";

interface ProductGalleryProps {
  selectedColor: ProductColor;
}

export default function ProductGallery({ selectedColor }: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const images = selectedColor?.images || [];
  const colorKey = selectedColor?.id;
  const [selection, setSelection] = useState<{
    colorKey?: string | number;
    index: number;
  }>({ colorKey, index: 0 });

  const activeIndex = selection.colorKey === colorKey ? selection.index : 0;
  const setActiveIndex = (
    updater: number | ((prevIndex: number) => number)
  ) => {
    setSelection((prev) => {
      const baseIndex = prev.colorKey === colorKey ? prev.index : 0;
      const nextIndex =
        typeof updater === "function" ? updater(baseIndex) : updater;
      return { colorKey, index: nextIndex };
    });
  };

  useEffect(() => {
    const activeThumb = document.getElementById(`thumb-item-${activeIndex}`);
    if (activeThumb && scrollerRef.current) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeIndex]);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[2/3] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Chưa có hình ảnh</span>
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const scrollThumbs = (direction: "up" | "down") => {
    if (scrollerRef.current) {
      const scrollAmount = 150;
      scrollerRef.current.scrollBy({
        top: direction === "down" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const safeImg = images[activeIndex] || images[0];

  return (
    <div className="product-gallery_slide flex flex-col xl:flex-row items-start justify-between w-full max-w-[675px] px-0 xl:px-[15px] gap-[15px] xl:gap-[20px]">
      <div className="relative w-full xl:flex-1 min-w-0 xl:max-w-[530px] aspect-[2/3] lg:max-h-[795px] shrink-0 group overflow-hidden mb-[15px] xl:mb-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(safeImg.imageUrl)}
          alt={`Product image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-[5px] lg:left-[20px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10 lg:bg-white/80 lg:rounded-full hover:lg:bg-white cursor-pointer"
            >
              <i className="fas fa-angle-left text-[40px] text-[#999] lg:text-[#333] lg:text-[24px]"></i>
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-[5px] lg:right-[20px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10 lg:bg-white/80 lg:rounded-full hover:lg:bg-white cursor-pointer"
            >
              <i className="fas fa-angle-right text-[40px] text-[#999] lg:text-[#333] lg:text-[24px]"></i>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="w-full xl:w-[95px] shrink-0 flex xl:flex-col items-center justify-start overflow-visible relative mt-0">
          {images.length > 4 ? (
            <button
              type="button"
              onClick={() => scrollThumbs("up")}
              className="hidden xl:flex w-full h-[30px] items-center justify-center text-[#999] hover:text-[#000] mb-[15px] transition-colors cursor-pointer"
              title="Ảnh trước"
              aria-label="Ảnh trước"
            >
              <i className="fas fa-angle-up text-[20px]"></i>
            </button>
          ) : (
            <div className="hidden xl:block h-[45px] w-full shrink-0" />
          )}

          <div
            ref={scrollerRef}
            id="thumbnail-scroller"
            className="flex xl:flex-col items-center overflow-x-auto xl:overflow-y-auto no-scrollbar scroll-smooth gap-[10px] xl:gap-[15px] w-full"
            style={{
              maxHeight: "585px",
            }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                id={`thumb-item-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 relative w-[60px] sm:w-[75px] xl:w-[95px] aspect-[2/3] xl:h-[135px] transition-all border-b-2 xl:border-b-0 xl:border-l-2 cursor-pointer opacity-100 ${
                  activeIndex === idx
                    ? "border-[#000]"
                    : "border-transparent hover:border-[#bbb]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(img.imageUrl)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {images.length > 4 && (
            <button
              type="button"
              onClick={() => scrollThumbs("down")}
              className="hidden xl:flex w-full h-[30px] items-center justify-center text-[#999] hover:text-[#000] mt-[15px] transition-colors cursor-pointer"
              title="Ảnh tiếp theo"
              aria-label="Ảnh tiếp theo"
            >
              <i className="fas fa-angle-down text-[20px]"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
