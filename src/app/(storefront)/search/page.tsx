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
      <div className="text-[14px] font-bold uppercase border-b border-[#e1e1e1] pt-[20px] pb-[21px] mb-[40px]">
        <Link
          href="/"
          className="text-[#333] hover:text-[#000] transition-colors"
        >
          Trang chủ
        </Link>
        <span className="mx-[8px]">-</span>
        <span>Tìm kiếm</span>
      </div>

      <div className="flex flex-wrap relative">
        <div className="hidden lg:block w-full lg:w-[25%] px-[15px] mb-[30px] lg:mb-0">
          <FilterSidebar onApply={setFilters} />
        </div>

        <div className="w-full lg:w-[75%]">
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

