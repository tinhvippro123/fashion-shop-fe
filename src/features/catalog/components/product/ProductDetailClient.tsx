"use client";

import { useState, useEffect } from "react";
import {
  ProductDetail,
  ProductReviewItem,
} from "@/features/catalog/types/product";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductTabs from "./ProductTabs";
import { apiFetch } from "@/shared/lib/api";

interface ProductDetailClientProps {
  product: ProductDetail;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const defaultColorId =
    product.productColors.find((c) => c.isActive && c.images && c.images.length > 0)?.id ||
    product.productColors.find((c) => c.images && c.images.length > 0)?.id ||
    product.productColors.find((c) => c.isActive)?.id ||
    product.productColors[0]?.id;
  const [selectedColorId, setSelectedColorId] =
    useState<number>(defaultColorId);
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);

  useEffect(() => {
    apiFetch<ProductReviewItem[]>(`/catalog/products/${product.id}/reviews`)
      .then((res) => setReviews(Array.isArray(res) ? res : []))
      .catch(() => setReviews([]));
  }, [product.id]);

  const selectedColor =
    product.productColors.find((c) => c.id === selectedColorId) ||
    product.productColors[0];

  return (
    <div className="product-detail-layout flex flex-col md:flex-row items-start gap-[24px] md:gap-[30px] lg:gap-[45px] xl:gap-[105px] w-full">
      <div className="w-full md:w-[48%] lg:w-[52%] xl:w-[55%] max-w-[675px] shrink-0 mb-[30px] md:mb-0">
        <ProductGallery selectedColor={selectedColor} />
      </div>

      <div className="w-full flex-1 min-w-0">
        <ProductInfo
          product={product}
          selectedColor={selectedColor}
          onColorChange={setSelectedColorId}
          reviewCount={reviews.length || product.reviewCount || 0}
        />
        <ProductTabs
          product={product}
          reviews={reviews}
          onReviewAdded={(r) => setReviews((prev) => [r, ...prev])}
        />
      </div>
    </div>
  );
}

