"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard, { Product } from "@/shared/storefront-ui/ProductCard";
import { apiFetch } from "@/shared/lib/api";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Product[]>("/account/wishlists")
      .then(setWishlist)
      .catch(() => setWishlist([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h5 className="font-bold mb-[24px] uppercase text-[20px] text-[#222]">
        Sản phẩm yêu thích
      </h5>

      {loading ? (
        <div className="py-[48px] text-center text-[#6c6d70]">
          Đang tải danh sách yêu thích...
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-[48px]">
          <i className="far fa-heart text-[#6c6d70] mb-[16px] text-[50px]"></i>
          <h5 className="text-[#6c6d70] mb-[16px] text-[20px] font-medium">
            Bạn chưa có sản phẩm yêu thích nào
          </h5>
          <Link
            href="/danh-muc"
            className="inline-block bg-[#222] text-white mt-[16px] px-[24px] py-[8px] font-medium transition-colors hover:bg-[#333]"
            style={{ borderRadius: 0 }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap mx-[-15px]">
          {wishlist.map((product) => (
            <div key={product.id} className="w-1/2 lg:w-1/4 px-[15px]">
              <ProductCard
                product={product}
                isLiked={true}
                onUnliked={(pid) =>
                  setWishlist((prev) => prev.filter((p) => p.id !== pid))
                }
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

