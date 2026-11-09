"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/shared/lib/api";

export interface CatalogFilters {
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface FilterSidebarProps {
  onApply: (filters: CatalogFilters) => void;
}

interface ColorOption {
  id: number;
  name: string;
  hexCode: string;
}

interface SizeOption {
  id: number;
  name: string;
}

const MIN_LIMIT = 0;
const MAX_LIMIT = 10000000;
const PRICE_STEP = 100000;

export default function FilterSidebar({ onApply }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    size: false,
    color: false,
    price: false,
  });

  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL", "XXL"]);
  const [colors, setColors] = useState<{ name: string; code: string }[]>([
    { name: "Đen", code: "#111111" },
    { name: "Trắng", code: "#FFFFFF" },
    { name: "Xanh dương", code: "#2563EB" },
    { name: "Vàng", code: "#F5C542" },
    { name: "Hồng", code: "#F2A6B3" },
    { name: "Đỏ", code: "#A61C1C" },
    { name: "Xám", code: "#696969" },
    { name: "Be", code: "#E8DCC8" },
    { name: "Nâu", code: "#6F4E37" },
    { name: "Xanh rêu", code: "#4A5D4E" },
    { name: "Cam", code: "#E85D04" },
    { name: "Tím", code: "#7B2CBF" },
  ]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(MIN_LIMIT);
  const [maxPrice, setMaxPrice] = useState<number>(MAX_LIMIT);

  useEffect(() => {
    apiFetch<SizeOption[]>("/catalog/sizes")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setSizes(res.map((s) => s.name));
        }
      })
      .catch(() => {});

    apiFetch<ColorOption[]>("/catalog/colors")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setColors(res.map((c) => ({ name: c.name, code: c.hexCode })));
        }
      })
      .catch(() => {});
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    onApply({
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      minPrice: minPrice > MIN_LIMIT ? minPrice : undefined,
      maxPrice: maxPrice < MAX_LIMIT ? maxPrice : undefined,
    });
  };

  const handleReset = () => {
    setSelectedSize("");
    setSelectedColor("");
    setMinPrice(MIN_LIMIT);
    setMaxPrice(MAX_LIMIT);
    onApply({});
  };

  const formatVND = (v: number) => {
    return new Intl.NumberFormat("vi-VN").format(v) + "đ";
  };

  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      {/* Size Filter */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[16px] border-b border-[#e1e1e1] font-medium text-[14px] uppercase cursor-pointer select-none"
          onClick={() => toggleSection("size")}
        >
          <span className="tracking-wide">Size</span>
          <span className="text-[18px] font-light leading-none text-[#333]">
            {expandedSections["size"] ? "−" : "+"}
          </span>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["size"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-[8px] pt-[12px] pb-[12px]">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                className={`flex justify-center items-center min-w-[42px] h-[34px] border text-[13px] font-medium cursor-pointer rounded-[3px] transition-all duration-200 ${
                  selectedSize === s
                    ? "border-[#000] bg-[#000] text-white"
                    : "border-[#e1e1e1] text-[#333] bg-white hover:border-[#000] hover:text-[#000]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Filter (18x18 as requested) */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[16px] border-b border-[#e1e1e1] font-medium text-[14px] uppercase cursor-pointer select-none"
          onClick={() => toggleSection("color")}
        >
          <span className="tracking-wide">Màu sắc</span>
          <span className="text-[18px] font-light leading-none text-[#333]">
            {expandedSections["color"] ? "−" : "+"}
          </span>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["color"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-[10px] pt-[14px] pb-[14px]">
            {colors.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(active ? "" : c.name)}
                  className={`block w-[18px] h-[18px] rounded-full border cursor-pointer relative transition-all duration-200 ${
                    active
                      ? "border-[#000] ring-2 ring-[#000] ring-offset-1 scale-110"
                      : "border-[#ddd] hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.code }}
                  title={c.name}
                >
                  {active && (
                    <i
                      className={`fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] ${
                        c.code.toUpperCase() === "#FFFFFF" ||
                        c.code.toLowerCase() === "#e8dcc8"
                          ? "text-black"
                          : "text-white"
                      }`}
                    ></i>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Filter (Dual Range Slider matching LUXE style) */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[16px] border-b border-[#e1e1e1] font-medium text-[14px] uppercase cursor-pointer select-none"
          onClick={() => toggleSection("price")}
        >
          <span className="tracking-wide">Mức giá</span>
          <span className="text-[18px] font-light leading-none text-[#333]">
            {expandedSections["price"] ? "−" : "+"}
          </span>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["price"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-[20px] pb-[16px] px-[2px]">
            {/* Range Slider Track */}
            <div className="relative w-full h-[24px] flex items-center">
              {/* Gray Base Track */}
              <div className="absolute w-full h-[4px] bg-[#e1e1e1] rounded-full"></div>

              {/* Black Active Segment */}
              <div
                className="absolute h-[4px] bg-[#222] rounded-full"
                style={{
                  left: `${(minPrice / MAX_LIMIT) * 100}%`,
                  right: `${100 - (maxPrice / MAX_LIMIT) * 100}%`,
                }}
              ></div>

              {/* Min Handle Input */}
              <input
                type="range"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                step={PRICE_STEP}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - PRICE_STEP);
                  setMinPrice(val);
                }}
                className="absolute w-full h-[4px] appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#222] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
              />

              {/* Max Handle Input */}
              <input
                type="range"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + PRICE_STEP);
                  setMaxPrice(val);
                }}
                className="absolute w-full h-[4px] appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#222] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
              />
            </div>

            {/* Price Labels Below (0đ - 10.000.000đ) */}
            <div className="flex justify-between items-center text-[13px] text-[#333] font-normal mt-[10px]">
              <span>{formatVND(minPrice)}</span>
              <span>{formatVND(maxPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: BỎ LỌC & LỌC with leaf-shape */}
      <div className="mt-[36px] flex justify-between gap-[10px]">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex justify-center items-center w-[48%] h-[40px] bg-white text-[#333] border border-[#333] text-[13px] font-semibold uppercase rounded-tl-[10px] rounded-br-[10px] transition-all duration-300 hover:bg-[#f9f9f9] hover:text-[#000] cursor-pointer"
        >
          BỎ LỌC
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex justify-center items-center w-[48%] h-[40px] bg-[#222] text-white border border-[#222] text-[13px] font-bold uppercase rounded-tl-[10px] rounded-br-[10px] transition-all duration-300 hover:bg-[#000] cursor-pointer"
        >
          LỌC
        </button>
      </div>
    </form>
  );
}
