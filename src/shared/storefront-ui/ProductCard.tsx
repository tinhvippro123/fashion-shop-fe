"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import { LuxeBagIcon, LuxeHeartIcon } from "@/shared/icons/LuxeIcons";
import {
  ProductDetail,
  ProductColor as FullProductColor,
  ProductVariant,
} from "@/features/catalog/types/product";

interface ProductImage {
  imageUrl: string;
}

interface ProductColor {
  id: number;
  isActive: boolean;
  color: { name: string; hexCode: string };
  images: ProductImage[];
  variants?: ProductVariant[];
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  basePrice: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercent?: number;
  productColors: ProductColor[];
}

interface ProductCardProps {
  product: Product;
  isLiked?: boolean;
  onUnliked?: (productId: number) => void;
}

export default function ProductCard({
  product,
  isLiked = false,
  onUnliked,
}: ProductCardProps) {
  const [activeColorId, setActiveColorId] = useState<number | null>(
    product.productColors && product.productColors.length > 0
      ? product.productColors[0].id
      : null
  );
  const [isQuickSizeOpen, setIsQuickSizeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const quickSizeRef = useRef<HTMLDivElement>(null);

  const activeColor =
    product.productColors?.find((c) => c.id === activeColorId) ||
    product.productColors?.[0];

  const mainImage =
    activeColor && activeColor.images && activeColor.images.length > 0
      ? resolveImageUrl(activeColor.images[0].imageUrl)
      : "/uploads/03321697-61dc-4f30-8da7-d25085a78741.webp";

  const hoverImage =
    activeColor && activeColor.images && activeColor.images.length > 1
      ? resolveImageUrl(activeColor.images[1].imageUrl)
      : null;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [mainImage]);

  useEffect(() => {
    if (!isQuickSizeOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        quickSizeRef.current &&
        !quickSizeRef.current.contains(event.target as Node)
      ) {
        setIsQuickSizeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isQuickSizeOpen]);

  const { items, addItem, showSuccessModal } = useCartStore();
  const { isAuthenticated, wishlistIds, setWishlistProductState } =
    useAuthStore();
  const liked =
    isLiked ||
    (isAuthenticated && (wishlistIds || []).includes(Number(product.id)));

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast("Bạn cần đăng nhập để thực hiện chức năng này !", {
        style: {
          backgroundColor: "#359cb1",
          color: "#fff",
          borderRadius: "2px",
          padding: "16px",
        },
      });
      return;
    }
    try {
      const res = await apiFetch<{ favorited: boolean }>(
        `/account/wishlists/${product.id}`,
        { method: "POST" }
      );
      setWishlistProductState(Number(product.id), res.favorited);
      if (!res.favorited && onUnliked) {
        onUnliked(product.id);
      }
      toast.success(
        res.favorited
          ? "Đã thêm sản phẩm vào mục yêu thích"
          : "Đã xóa khỏi danh sách yêu thích"
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const availableVariants = activeColor?.variants || [];

  return (
    <div className="mb-[30px] relative transition-all duration-300">
      {product.isNew && (
        <div className="absolute top-[0px] -left-[5px] z-[10] bg-[#f7941d] text-white text-[11px] font-bold px-[12px] py-[4px] rounded-tr-[15px] shadow-[2px_2px_5px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:top-full before:left-0 before:w-0 before:h-0 before:border-t-[5px] before:border-t-[#961c1c] before:border-l-[5px] before:border-l-transparent uppercase tracking-wider">
          NEW
        </div>
      )}

      {product.isBestSeller && !product.isNew && (
        <div className="absolute top-[10px] -left-[5px] z-[10] bg-[#b8232a] text-white text-[11px] font-medium px-[12px] py-[4px] rounded-r-[15px] shadow-[2px_2px_5px_rgba(0,0,0,0.2)] before:content-[''] before:absolute before:top-full before:left-0 before:w-0 before:h-0 before:border-t-[5px] before:border-t-[#7a151b] before:border-l-[5px] before:border-l-transparent">
          BEST SELLER
        </div>
      )}

      {product.discountPercent && product.discountPercent > 0 ? (
        <div
          className="absolute top-[10px] right-[10px] z-[10] bg-[#da251d] text-white text-[13px] font-bold w-[40px] h-[40px] flex items-center justify-center shadow-md"
          style={{ borderRadius: "50% 50% 0 50%" }}
        >
          -{product.discountPercent}%
        </div>
      ) : null}

      {/* Image container: Scoped hover so only hovering the image swaps it */}
      <div className="group relative overflow-hidden aspect-[2/3] bg-[#f8f9fa] rounded-[4px]">
        {/* Shimmer skeleton while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f0f2] via-[#e4e4e7] to-[#f0f0f2] animate-pulse z-[1]" />
        )}

        <Link href={`/product/${product.slug || product.id}`} className="block w-full h-full">
          {/* Main product image with smooth fade-in */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasError ? "/uploads/03321697-61dc-4f30-8da7-d25085a78741.webp" : mainImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />

          {/* Hover alternate image (only rendered if distinct from main image) */}
          {hoverImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={hoverImage}
              alt={`${product.name} hover`}
              loading="lazy"
              decoding="async"
              className="absolute top-0 left-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[2] pointer-events-none"
            />
          )}
        </Link>
      </div>

      <div className="pt-[15px] text-left">
        <div className="flex justify-between items-center mb-[10px]">
          <div className="flex gap-[5px]">
            {product.productColors?.map((pc) => (
              <div
                key={pc.id}
                className={`w-[18px] h-[18px] rounded-full cursor-pointer relative border transition-colors hover:border-gray-400 ${
                  pc.color.hexCode?.toUpperCase() === "#FFFFFF"
                    ? "border-[#ccc]"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: pc.color.hexCode }}
                title={pc.color.name}
                onClick={() => setActiveColorId(pc.id)}
              >
                {activeColorId === pc.id && (
                  <i className="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[8px] mix-blend-difference"></i>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleToggleLike}
            className={`transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center ${
              liked
                ? "text-[#dc3545] hover:text-[#c82333]"
                : "text-[#6c757d] hover:text-[#dc3545]"
            }`}
            aria-label="Yêu thích"
            title={liked ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <LuxeHeartIcon className="w-[18px] h-[18px]" filled={liked} />
          </button>
        </div>

        <div className="mb-[5px]">
          <Link
            href={`/product/${product.slug || product.id}`}
            className="text-[#333] text-[14px] font-normal no-underline uppercase block hover:text-[#000] whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex justify-between items-center mb-[8px]">
          <div className="flex items-center gap-[10px]">
            {product.discountPercent && product.discountPercent > 0 ? (
              <>
                <span className="text-[16px] font-bold text-[#e10600]">
                  {formatPrice(
                    Math.round(
                      (product.basePrice *
                        (100 - (product.discountPercent || 0))) /
                        100
                    )
                  )}
                </span>
                <span className="text-[14px] text-[#999] line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="text-[16px] font-bold text-[#000]">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          <div className="relative" ref={quickSizeRef}>
            <button
              onClick={() => setIsQuickSizeOpen(!isQuickSizeOpen)}
              className={`w-[32px] h-[32px] flex items-center justify-center cursor-pointer transition-colors duration-200 rounded-tl-[8px] rounded-br-[8px] rounded-tr-0 rounded-bl-0 ${
                isQuickSizeOpen
                  ? "bg-white text-[#221F20] border border-[#221F20]"
                  : "bg-[#221F20] text-white border border-transparent hover:bg-white hover:text-[#221F20] hover:border-[#221F20]"
              }`}
              aria-label="Thêm vào giỏ"
              title="Thêm vào giỏ"
            >
              <LuxeBagIcon className="w-[17px] h-[17px]" />
            </button>

            {isQuickSizeOpen && availableVariants.length > 0 && (
              <div className="absolute bottom-[38px] right-0 bg-white w-[64px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#E7E8E9] z-[100] animate-fadeInUp">
                <ul className="list-none p-0 m-0">
                  {availableVariants.map((variant) => {
                    const out = variant.stock <= 0;
                    return (
                      <li
                        key={variant.id}
                        onClick={() => {
                          if (out || !activeColor) return;
                          const inCart =
                            items.find((i) => i.variant.id === variant.id)
                              ?.quantity || 0;
                          if (inCart + 1 > variant.stock) {
                            toast.warning(
                              `Sản phẩm chỉ còn ${variant.stock} sản phẩm trong kho`
                            );
                            return;
                          }
                          addItem(
                            product as unknown as ProductDetail,
                            activeColor as unknown as FullProductColor,
                            variant,
                            1
                          );
                          setIsQuickSizeOpen(false);
                          showSuccessModal();
                        }}
                        className={`py-[8px] text-center text-[13px] font-semibold border-b border-[#f5f5f5] last:border-none transition-colors ${
                          out
                            ? "text-[#ccc] line-through cursor-not-allowed"
                            : "text-[#221F20] cursor-pointer hover:bg-[#221F20] hover:text-white"
                        }`}
                      >
                        {variant.size.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

