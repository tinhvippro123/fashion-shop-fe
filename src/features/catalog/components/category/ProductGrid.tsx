"use client";

import { useState, useEffect } from "react";
import ProductCard, { Product } from "@/shared/storefront-ui/ProductCard";
import Pagination from "@/shared/storefront-ui/Pagination";
import { apiFetch } from "@/shared/lib/api";
import { CatalogFilters } from "./FilterSidebar";

interface ProductGridProps {
  title: string;
  currentPage: number;
  categorySlug?: string;
  keyword?: string;
  filters?: CatalogFilters;
  baseUrl: string;
}

const ITEMS_PER_PAGE = 8;

export default function ProductGrid({
  title,
  currentPage,
  categorySlug,
  keyword,
  filters,
  baseUrl,
}: ProductGridProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Sắp xếp theo");
  const [sortCode, setSortCode] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const sortOptions = [
    { value: "default", label: "Mặc định" },
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá: thấp đến cao" },
    { value: "price_desc", label: "Giá: cao đến thấp" },
  ];

  useEffect(() => {
    const params = new URLSearchParams();

    if (categorySlug) {
      if (categorySlug === "hang-nu-moi-ve") {
        params.set("categorySlug", "nu");
        params.set("isNew", "true");
      } else if (categorySlug === "hang-nam-moi-ve") {
        params.set("categorySlug", "nam");
        params.set("isNew", "true");
      } else if (categorySlug === "sale") {
        params.set("onSale", "true");
      } else if (categorySlug !== "tat-ca") {
        params.set("categorySlug", categorySlug);
      }
    }

    if (keyword) params.set("keyword", keyword);
    if (filters?.size) params.set("size", filters.size);
    if (filters?.color) params.set("color", filters.color);
    if (filters?.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (sortCode && sortCode !== "default") params.set("sort", sortCode);

    setLoading(true);
    apiFetch<Product[]>(`/catalog/products?${params.toString()}`)
      .then((res) => setProducts(Array.isArray(res) ? res : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categorySlug, keyword, filters, sortCode]);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = products.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-[24px]">
        <h2 className="font-bold m-0 mb-[16px] lg:mb-0 uppercase text-[24px]">
          {title}
        </h2>

        <div className="flex items-center lg:justify-end flex-grow lg:ml-[24px] gap-[15px]">
          <div className="relative w-full lg:max-w-[250px]">
            <button
              type="button"
              className="flex justify-between items-center w-full border border-[#e5e5e5] rounded-[25px] h-[45px] px-[20px] text-[#333] text-[15px] bg-white outline-none cursor-pointer"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <span>{selectedSort}</span>
              <i className="fas fa-chevron-down text-[14px] text-[#666]"></i>
            </button>

            <div
              className={`absolute top-full left-0 w-full bg-white border border-[#e5e5e5] rounded-[10px] mt-[5px] z-50 shadow-sm overflow-hidden transition-all duration-200 ${
                isSortOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-[10px]"
              }`}
            >
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-[20px] py-[10px] text-[14px] text-[#333] hover:bg-[#f8f9fa] hover:text-[#000] cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedSort(option.label);
                    setSortCode(option.value);
                    setIsSortOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#6c6d70]">
          Đang tải danh sách sản phẩm...
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="py-16 text-center text-[#6c6d70]">
          Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="flex flex-wrap -mx-[15px]">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="w-1/2 md:w-1/3 lg:w-1/4 px-[15px] mb-[24px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        baseUrl={baseUrl}
      />
    </div>
  );
}

