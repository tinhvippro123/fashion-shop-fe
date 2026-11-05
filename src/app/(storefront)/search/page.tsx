"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterSidebar, {
  CatalogFilters,
} from "@/features/catalog/components/category/FilterSidebar";
import ProductGrid from "@/features/catalog/components/category/ProductGrid";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>({});

  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const keyword = searchParams.get("keyword") || "";
  const title = keyword
    ? `KẾT QUẢ TÌM KIẾM CHO: "${keyword.toUpperCase()}"`
    : "KẾT QUẢ TÌM KIẾM";

  const baseUrl = keyword
    ? `/search?keyword=${encodeURIComponent(keyword)}`
    : "/search";

  return (
    <div className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto mb-[80px]">
      <div className="text-[13px] font-normal text-[#6c757d] border-b border-[#f0f0f0] pt-[16px] pb-[16px] mb-[20px] flex items-center">
        <Link
          href="/"
          className="text-[#6c757d] hover:text-[#000] transition-colors"
        >
          Trang chủ
        </Link>
        <span className="mx-[8px] text-[#999]">-</span>
        <span className="text-[#333] uppercase">Tìm kiếm</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-[36px] relative">
        <div className="hidden lg:block w-[240px] shrink-0">
          <FilterSidebar onApply={setFilters} />
        </div>

        <div className="flex-1 min-w-0">
          <ProductGrid
            title={title}
            currentPage={currentPage}
            keyword={keyword}
            filters={filters}
            baseUrl={baseUrl}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#6c6d70]">Đang tải...</div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

