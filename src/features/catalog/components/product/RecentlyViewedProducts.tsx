"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import ProductSlider from "@/features/catalog/components/home/ProductSlider";
import { Product } from "@/shared/storefront-ui/ProductCard";

const STORAGE_KEY = "luxe_recently_viewed_ids";
const MAX_VIEWED_ITEMS = 10;

interface RecentlyViewedProductsProps {
  currentProductId: number;
}

function readStoredIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => Number(item))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

function saveViewedId(productId: number): number[] {
  const existing = readStoredIds();
  const next = [productId, ...existing.filter((id) => id !== productId)].slice(
    0,
    MAX_VIEWED_ITEMS + 1
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or private browsing errors
  }
  return next.filter((id) => id !== productId).slice(0, MAX_VIEWED_ITEMS);
}

export default function RecentlyViewedProducts({
  currentProductId,
}: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!currentProductId) return;
    let active = true;

    const otherIds = saveViewedId(currentProductId);
    if (otherIds.length === 0) {
      return () => {
        active = false;
      };
    }

    apiFetch<Product[]>("/catalog/products")
      .then((allProducts) => {
        if (!active || !Array.isArray(allProducts)) return;
        const byId = new Map<number, Product>();
        for (const p of allProducts) {
          byId.set(p.id, p);
        }
        const ordered = otherIds
          .map((id) => byId.get(id))
          .filter((p): p is Product => Boolean(p));
        setProducts(ordered);
      })
      .catch(() => {
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, [currentProductId]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto pt-[36px] pb-[64px] border-t border-[#f0f0f0]">
      <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#221F20] text-center tracking-[0.4px] mb-[26px] sm:mb-[32px]">
        Sản phẩm đã xem
      </h2>
      <ProductSlider products={products} sliderId="recently-viewed-slider" />
    </section>
  );
}
