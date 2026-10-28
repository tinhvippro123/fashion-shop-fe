"use client";

import { useState, useEffect } from "react";
import { ProductColor } from "@/features/catalog/types/product";
import { resolveImageUrl } from "@/shared/utils/format";

interface ProductGalleryProps {
  selectedColor: ProductColor;
}

export default function ProductGallery({ selectedColor }: ProductGalleryProps) {
  const images = selectedColor?.images || [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedColor?.id]);

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
    const scroller = document.getElementById("thumbnail-scroller");
    if (scroller) {
      const scrollAmount = 145;
      scroller.scrollBy({
        top: direction === "down" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const safeImg = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-auto min-[1200px]:h-[750px]">
      <div className="relative w-full lg:w-[calc(100%-90px)] min-[1200px]:w-[500px] lg:flex-shrink-0 aspect-[2/3] min-[1200px]:aspect-auto h-auto min-[1200px]:h-full group mb-[15px] lg:mb-0 px-0 lg:px-[15px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(safeImg.imageUrl)}
          alt={`Product image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-[5px] lg:left-[30px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10 lg:bg-white/80 lg:rounded-full hover:lg:bg-white"
            >
              <i className="fas fa-angle-left text-[40px] text-[#999] lg:text-[#333] lg:text-[24px]"></i>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-[5px] lg:right-[30px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10 lg:bg-white/80 lg:rounded-full hover:lg:bg-white"
            >
              <i className="fas fa-angle-right text-[40px] text-[#999] lg:text-[#333] lg:text-[24px]"></i>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="w-full lg:w-[90px] lg:h-full flex lg:flex-col items-center justify-center lg:py-[30px] px-0 overflow-visible relative mt-[15px] lg:mt-0">
          {images.length > 4 && (
            <button
              onClick={() => scrollThumbs("up")}
              className="hidden lg:flex w-full h-[30px] items-center justify-center text-[#999] hover:text-[#000] mb-[20px] transition-colors"
            >
              <i className="fas fa-angle-up text-[24px]"></i>
            </button>
          )}

          <div
            id="thumbnail-scroller"
            className="flex lg:flex-col items-center overflow-x-auto lg:overflow-y-hidden no-scrollbar gap-[5px] lg:gap-[15px] w-full"
            style={{
              maxHeight: images.length > 4 ? "585px" : "none",
            }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 relative w-[calc((100%-15px)/4)] lg:w-[90px] aspect-[2/3] lg:aspect-auto lg:h-[135px] transition-all border-b-2 lg:border-b-0 lg:border-l-2 ${
                  activeIndex === idx
                    ? "border-[#000] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-100"
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
              onClick={() => scrollThumbs("down")}
              className="hidden lg:flex w-full h-[30px] items-center justify-center text-[#999] hover:text-[#000] mt-[20px] transition-colors"
            >
              <i className="fas fa-angle-down text-[24px]"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

