"use client";

import { Suspense, use, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterSidebar, {
  CatalogFilters,
} from "@/features/catalog/components/category/FilterSidebar";
import ProductGrid from "@/features/catalog/components/category/ProductGrid";
import { apiFetch } from "@/shared/lib/api";

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  children?: ApiCategory[];
}

const SLUG_LABELS: Record<string, string> = {
  nu: "THỜI TRANG NỮ",
  nam: "THỜI TRANG NAM",
  "hang-nu-moi-ve": "HÀNG NỮ MỚI VỀ",
  "hang-nam-moi-ve": "HÀNG NAM MỚI VỀ",
  sale: "SẢN PHẨM SALE",
  "sale-nu": "HÀNG NỮ GIẢM GIÁ",
  "sale-nam": "HÀNG NAM GIẢM GIÁ",
  "tat-ca": "TẤT CẢ SẢN PHẨM",

  // Nữ - Cấp 2
  "ao-nu": "ÁO NỮ",
  "dam-nu": "ĐẦM",
  dam: "ĐẦM",
  "quan-nu": "QUẦN NỮ",
  "chan-vay-nu": "CHÂN VÁY",

  // Nữ - Cấp 3
  "ao-so-mi-nu": "ÁO SƠ MI",
  "ao-khoac-nu": "ÁO KHOÁC",
  "dam-xoe-nu": "ĐẦM CHỮ A",
  "dam-cong-so-nu": "ĐẦM CÔNG SỞ",
  "quan-au-nu": "QUẦN ÂU",
  "chan-vay-a-nu": "CHÂN VÁY CHỮ A",
  "chan-vay-xoe-nu": "CHÂN VÁY XÒE",

  // Nam - Cấp 2
  "ao-nam": "ÁO NAM",
  "quan-nam": "QUẦN NAM",

  // Nam - Cấp 3
  "ao-polo-nam": "ÁO POLO",
  "ao-so-mi-nam": "ÁO SƠ MI",
  "ao-khoac-nam": "ÁO KHOÁC",
  "quan-dai-nam": "QUẦN DÀI",
  "quan-short-nam": "QUẦN SHORT",
};

function CategoryPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiCategory[]>("/catalog/categories")
      .then((cats) => {
        if (!Array.isArray(cats)) return;
        function findCat(list: ApiCategory[]): ApiCategory | undefined {
          for (const item of list) {
            if (item.slug === slug) return item;
            if (item.children) {
              const f = findCat(item.children);
              if (f) return f;
            }
          }
          return undefined;
        }
        const found = findCat(cats);
        if (found) {
          setDynamicTitle(found.name.toUpperCase());
        }
      })
      .catch(() => {});
  }, [slug]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const title =
    dynamicTitle ||
    SLUG_LABELS[slug] ||
    `DANH MỤC ${slug.replace(/-/g, " ").toUpperCase()}`;

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
        <span className="text-[#333] uppercase">{title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-[36px] relative">
        <div className="hidden lg:block w-[240px] shrink-0">
          <FilterSidebar onApply={setFilters} />
        </div>

        <div className="flex-1 min-w-0">
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
