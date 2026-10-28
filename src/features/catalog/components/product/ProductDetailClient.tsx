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
    <div className="flex flex-col md:flex-row -mx-[15px]">
      <div className="w-full md:w-[50%] min-[1200px]:w-[610px] px-[15px] mb-[30px] md:mb-0 lg:flex-shrink-0">
        <ProductGallery selectedColor={selectedColor} />
      </div>

      <div className="w-full md:w-[50%] min-[1200px]:flex-1 px-[15px] md:pl-[30px] lg:pl-[40px] min-[1200px]:pl-[120px]">
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

