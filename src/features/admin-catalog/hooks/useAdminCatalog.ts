"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import {
  AdminCategory,
  AdminProduct,
  RawProductResponseDto,
} from "../types/catalog.admin";

function mapRawToAdminProduct(p: RawProductResponseDto): AdminProduct {
  const rawVariants = p.adminVariants || [];
  const lowStockList = rawVariants
    .filter((v) => (v.stock ?? 0) <= 5)
    .map((v) => {
      const optStr = Object.values(v.options || {}).join(" / ");
      const stockNum = v.stock ?? 0;
      const statusText = stockNum === 0 ? "Hết (0)" : `còn ${stockNum}`;
      return {
        sku: v.sku,
        stock: stockNum,
        label: optStr ? `${optStr} (${statusText})` : `${v.sku} (${statusText})`,
      };
    });

  const outOfStockCount = rawVariants.filter((v) => (v.stock ?? 0) === 0).length;

  return {
    id: String(p.id),
    numericId: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || `SP-${p.id}`,
    brand: p.brand || "LUXE",
    category: p.category?.name || "Chưa phân loại",
    categorySlug: p.category?.slug || "",
    price:
      p.formattedPrice ||
      `${Number(p.effectivePrice || p.basePrice || 0).toLocaleString("vi-VN")}đ`,
    basePrice: Number(p.basePrice || 0),
    discountPercent: p.discountPercent ?? 0,
    isNew: Boolean(p.isNew),
    isBestSeller: Boolean(p.isBestSeller),
    stock: p.totalStock ?? 0,
    sold: p.sold ?? 0,
    rating: p.rating ?? 5,
    reviewCount: p.reviewCount ?? 0,
    isActive: Boolean(p.isActive),
    image: p.images?.[0],
    description: p.description,
    lowStockVariantCount: lowStockList.length,
    outOfStockVariantCount: outOfStockCount,
    lowStockVariants: lowStockList,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await apiFetch<RawProductResponseDto[]>("/admin/products");
      setProducts((raw || []).map(mapRawToAdminProduct));
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<RawProductResponseDto[]>("/admin/products")
      .then((raw) => {
        if (active) setProducts((raw || []).map(mapRawToAdminProduct));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setProductActiveState = useCallback(
    async (product: AdminProduct, nextActive: boolean) => {
      const updated = await apiFetch<RawProductResponseDto>(
        `/admin/products/${product.numericId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: product.name,
            description: product.description || "",
            price: product.basePrice,
            discountPercent: product.discountPercent ?? 0,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            sku: product.sku,
            stock: product.stock,
            category: product.categorySlug || product.category,
            brand: product.brand || "LUXE",
            status: nextActive ? "published" : "draft",
          }),
        }
      );
      const mapped = mapRawToAdminProduct(updated);
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? mapped : item))
      );
      return mapped;
    },
    []
  );

  return {
    products,
    setProducts,
    isLoading,
    reload,
    setProductActiveState,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<AdminCategory[]>("/admin/categories");
      setCategories(data || []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<AdminCategory[]>("/admin/categories")
      .then((data) => {
        if (active) setCategories(data || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    categories,
    setCategories,
    isLoading,
    reload,
  };
}

