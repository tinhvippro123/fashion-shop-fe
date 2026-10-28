"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterSidebar, {
  CatalogFilters,
} from "@/features/catalog/components/category/FilterSidebar";
import ProductGrid from "@/features/catalog/components/category/ProductGrid";

const SLUG_LABELS: Record<string, string> = {
  nu: "THỜI TRANG NỮ",
  nam: "THỜI TRANG NAM",
  "hang-nu-moi-ve": "HÀNG NỮ MỚI VỀ",
  "hang-nam-moi-ve": "HÀNG NAM MỚI VỀ",
  sale: "SẢN PHẨM GIẢM GIÁ",
  "tat-ca": "TẤT CẢ SẢN PHẨM",
  "dam-nu": "ĐẦM & VÁY NỮ",
  "ao-nu": "ÁO SƠ MI & ÁO KIỂU NỮ",
  "quan-vay-nu": "CHÂN VÁY & QUẦN ÂU NỮ",
  "ao-nam": "ÁO NAM",
  "quan-nam": "QUẦN NAM",
  "vest-nam": "ÁO KHOÁC & VEST NAM",
};

function CategoryPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>({});

  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const title =
    SLUG_LABELS[slug] || `DANH MỤC ${slug.replace(/-/g, " ").toUpperCase()}`;

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
        <span>{title}</span>
      </div>

      <div className="flex flex-wrap relative">
        <div className="hidden lg:block w-full lg:w-[25%] px-[15px] mb-[30px] lg:mb-0">
          <FilterSidebar onApply={setFilters} />
        </div>

        <div className="w-full lg:w-[75%]">
          <ProductGrid
            title={title}
            currentPage={currentPage}
            categorySlug={slug}
            filters={filters}
            baseUrl={`/danh-muc/${slug}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#6c6d70]">Đang tải...</div>
      }
    >
      <CategoryPageContent slug={slug} />
    </Suspense>
  );
}
