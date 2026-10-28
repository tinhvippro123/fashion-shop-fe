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

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Tất cả mức giá" },
  { label: "Dưới 500.000đ", min: 0, max: 500000 },
  { label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
  { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000đ", min: 2000000 },
];

export default function FilterSidebar({ onApply }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    size: true,
    color: true,
    price: true,
  });

  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<{ name: string; code: string }[]>([
    { name: "Đen", code: "#000000" },
    { name: "Trắng", code: "#FFFFFF" },
    { name: "Be", code: "#e6dcc8" },
    { name: "Xanh dương", code: "#254a7e" },
    { name: "Đỏ", code: "#b8232a" },
    { name: "Xám", code: "#696969" },
  ]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedPriceIdx, setSelectedPriceIdx] = useState<number>(0);

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
    const preset = PRICE_PRESETS[selectedPriceIdx] || {};
    onApply({
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      minPrice: preset.min,
      maxPrice: preset.max,
    });
  };

  const handleReset = () => {
    setSelectedSize("");
    setSelectedColor("");
    setSelectedPriceIdx(0);
    onApply({});
  };

  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      {/* Size Filter */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[20px] border-b border-[#e1e1e1] font-semibold text-[14px] uppercase cursor-pointer"
          onClick={() => toggleSection("size")}
        >
          <span>Size</span>
          <i
            className={`fas fa-${
              expandedSections["size"] ? "minus" : "plus"
            } text-[#333] transition-transform`}
          ></i>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["size"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-[10px] pt-[10px] pb-[10px]">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                className={`flex justify-center items-center min-w-[50px] h-[35px] border text-[13px] font-semibold cursor-pointer rounded-[4px] transition-all duration-200 ${
                  selectedSize === s
                    ? "border-[#000] bg-[#000] text-white"
                    : "border-[#ddd] text-[#666] bg-white hover:border-[#000] hover:text-[#000]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Filter */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[20px] border-b border-[#e1e1e1] font-semibold text-[14px] uppercase cursor-pointer"
          onClick={() => toggleSection("color")}
        >
          <span>Màu sắc</span>
          <i
            className={`fas fa-${
              expandedSections["color"] ? "minus" : "plus"
            } text-[#333] transition-transform`}
          ></i>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["color"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-[10px] pt-[10px] pb-[10px]">
            {colors.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() =>
                    setSelectedColor(active ? "" : c.name)
                  }
                  className={`block w-[30px] h-[30px] rounded-full border cursor-pointer relative transition-all duration-200 hover:scale-110 ${
                    active ? "border-[#000] scale-110" : "border-[#ddd]"
                  }`}
                  style={{ backgroundColor: c.code }}
                  title={c.name}
                >
                  {active && (
                    <i
                      className={`fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] ${
                        c.code.toUpperCase() === "#FFFFFF" ||
                        c.code.toLowerCase() === "#e6dcc8"
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

      {/* Price Filter */}
      <div className="filter-group">
        <div
          className="flex justify-between items-center py-[20px] border-b border-[#e1e1e1] font-semibold text-[14px] uppercase cursor-pointer"
          onClick={() => toggleSection("price")}
        >
          <span>Mức giá</span>
          <i
            className={`fas fa-${
              expandedSections["price"] ? "minus" : "plus"
            } text-[#333] transition-transform`}
          ></i>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections["price"]
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-[12px] space-y-2">
            {PRICE_PRESETS.map((preset, idx) => (
              <label
                key={preset.label}
                className="flex items-center gap-2 text-[14px] text-[#333] cursor-pointer"
              >
                <input
                  type="radio"
                  name="pricePreset"
                  checked={selectedPriceIdx === idx}
                  onChange={() => setSelectedPriceIdx(idx)}
                  className="accent-[#222]"
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-[48px] flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex justify-center items-center w-[48%] h-[40px] bg-white text-[#333] border border-[#333] text-[13px] font-semibold uppercase rounded-tl-[12px] rounded-br-[12px] transition-all duration-300 hover:bg-[#f9f9f9] hover:text-[#000] cursor-pointer"
        >
          BỎ LỌC
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex justify-center items-center w-[48%] h-[40px] bg-[#222] text-white border border-[#222] text-[13px] font-bold uppercase rounded-tl-[12px] rounded-br-[12px] transition-all duration-300 hover:bg-[#000] cursor-pointer"
        >
          LỌC
        </button>
      </div>
    </form>
  );
}

