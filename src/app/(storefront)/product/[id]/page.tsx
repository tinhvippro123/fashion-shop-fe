"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ProductDetail } from "@/features/catalog/types/product";
import ProductDetailClient from "@/features/catalog/components/product/ProductDetailClient";
import { apiFetch } from "@/shared/lib/api";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const loading = loadedId !== id;

  useEffect(() => {
    let active = true;
    apiFetch<ProductDetail>(`/catalog/products/${id}`)
      .then((res) => {
        if (active) setProduct(res);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoadedId(id);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto py-20 text-center text-[#6c6d70]">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto py-20 text-center">
        <h3 className="text-[20px] font-bold mb-4">Không tìm thấy sản phẩm</h3>
        <Link
          href="/"
          className="inline-block bg-[#222] text-white px-6 py-2.5 text-[14px] uppercase rounded-tl-[16px] rounded-br-[16px]"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto">
        <div className="text-[13px] font-normal text-[#6c757d] border-b border-[#f0f0f0] pt-[16px] pb-[16px] mb-[30px] flex flex-wrap items-center">
          <Link
            href="/"
            className="text-[#6c757d] hover:text-[#000] transition-colors"
          >
            Trang chủ
          </Link>
          {product.category?.parent && (
            <>
              <span className="mx-[8px] text-[#999]">-</span>
              <Link
                href={`/danh-muc/${product.category.parent.slug}`}
                className="text-[#6c757d] hover:text-[#000] transition-colors uppercase"
              >
                {product.category.parent.name}
              </Link>
            </>
          )}
          {product.category && (
            <>
              <span className="mx-[8px] text-[#999]">-</span>
              <Link
                href={`/danh-muc/${product.category.slug}`}
                className="text-[#6c757d] hover:text-[#000] transition-colors uppercase"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-[8px] text-[#999]">-</span>
          <span className="text-[#333] uppercase truncate max-w-[200px] sm:max-w-[400px] inline-block align-bottom">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mb-[60px]">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}

