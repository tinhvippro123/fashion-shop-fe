"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
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
  const [fetchedQuery, setFetchedQuery] = useState<string | null>(null);

  const sortOptions = [
    { value: "default", label: "Mặc định" },
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá: thấp đến cao" },
    { value: "price_desc", label: "Giá: cao đến thấp" },
  ];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (categorySlug) {
      if (categorySlug === "hang-nu-moi-ve") {
        params.set("categorySlug", "nu");
        params.set("isNew", "true");
      } else if (categorySlug === "hang-nam-moi-ve") {
        params.set("categorySlug", "nam");
        params.set("isNew", "true");
      } else if (categorySlug === "sale-nu") {
        params.set("categorySlug", "nu");
        params.set("onSale", "true");
      } else if (categorySlug === "sale-nam") {
        params.set("categorySlug", "nam");
        params.set("onSale", "true");
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

    return params.toString();
  }, [categorySlug, keyword, filters, sortCode]);

  const loading = fetchedQuery !== queryString;

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>(`/catalog/products?${queryString}`)
      .then((res) => {
        if (active) setProducts(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setFetchedQuery(queryString);
      });
    return () => {
      active = false;
    };
  }, [queryString]);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = products.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > 1 && typeof window !== "undefined") {
      const el = document.getElementById("product-grid-top");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  }, [currentPage]);

  return (
    <div id="product-grid-top" className="scroll-mt-[100px]">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[20px] gap-y-[30px] w-full animate-pulse py-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      ) : paginatedProducts.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
            <PackageOpen className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-[#222] mb-1.5 uppercase tracking-wide">
            Chưa có sản phẩm trong danh mục này
          </h3>
          <p className="text-sm text-[#6c6d70] max-w-md mb-6 leading-relaxed">
            Các sản phẩm mới đang được cập nhật và sẽ sớm ra mắt. Bạn vui lòng quay lại sau hoặc khám phá các bộ sưu tập khác của LUXE nhé!
          </p>
          <Link
            href="/danh-muc/tat-ca"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0a0a0b] text-white text-xs font-semibold tracking-wider uppercase rounded hover:bg-black/80 transition-colors shadow-sm"
          >
            Khám phá tất cả sản phẩm
          </Link>
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

