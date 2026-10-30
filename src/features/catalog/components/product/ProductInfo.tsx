"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductDetail, ProductColor } from "@/features/catalog/types/product";
import SizeGuideModal from "./SizeGuideModal";
import { useCartStore } from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice } from "@/shared/utils/format";

interface ProductInfoProps {
  product: ProductDetail;
  selectedColor: ProductColor;
  onColorChange: (colorId: number) => void;
  reviewCount: number;
}

export default function ProductInfo({
  product,
  selectedColor,
  onColorChange,
  reviewCount,
}: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { items, addItem, showSuccessModal } = useCartStore();
  const { isAuthenticated, wishlistIds, setWishlistProductState, syncWishlist } =
    useAuthStore();
  const router = useRouter();
  const liked =
    isAuthenticated && (wishlistIds || []).includes(Number(product.id));

  useEffect(() => {
    if (isAuthenticated && (!wishlistIds || wishlistIds.length === 0)) {
      syncWishlist();
    }
  }, [isAuthenticated, wishlistIds, syncWishlist]);

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
      toast.success(
        res.favorited
          ? "Đã thêm vào danh sách yêu thích"
          : "Đã xóa khỏi danh sách yêu thích"
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const selectedVariant = selectedColor?.variants?.find(
    (v) => v.id === selectedVariantId
  );

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.max(1, prev + delta);
      if (selectedVariant && next > selectedVariant.stock) {
        return Math.max(1, selectedVariant.stock);
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    const variant = selectedColor.variants.find(
      (v) => v.id === selectedVariantId
    );
    if (variant) {
      const inCart =
        items.find((i) => i.variant.id === variant.id)?.quantity || 0;
      if (inCart + quantity > variant.stock) {
        toast.warning(
          inCart >= variant.stock
            ? `Bạn đã có ${inCart} sản phẩm này trong giỏ (đạt tối đa tồn kho)`
            : `Kho chỉ còn ${variant.stock} sản phẩm (trong giỏ đã có ${inCart})`
        );
        return;
      }
      addItem(product, selectedColor, variant, quantity);
      showSuccessModal();
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariantId) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    const variant = selectedColor.variants.find(
      (v) => v.id === selectedVariantId
    );
    if (variant) {
      const inCart =
        items.find((i) => i.variant.id === variant.id)?.quantity || 0;
      if (inCart + quantity > variant.stock) {
        if (inCart >= variant.stock) {
          router.push("/cart");
          return;
        }
        addItem(product, selectedColor, variant, variant.stock - inCart);
        router.push("/cart");
        return;
      }
      addItem(product, selectedColor, variant, quantity);
      router.push("/cart");
    }
  };

  const baseUnitPrice = Number(selectedVariant?.price || product.basePrice || 0);
  const hasDiscount =
    product.discountPercent !== undefined && product.discountPercent > 0;
  const effectivePrice = hasDiscount
    ? Math.round((baseUnitPrice * (100 - product.discountPercent!)) / 100)
    : baseUnitPrice;

  return (
    <div className="w-full">
      <h2 className="font-bold uppercase mb-[16px] text-[28px] text-[#222]">
        {product.name}
      </h2>

      <div className="flex items-center mb-[24px] text-[#6c757d] text-[14px]">
        <div className="mr-[24px]">
          <span>SKU: {selectedVariant?.sku || product.sku || `SP-${product.id}`}</span>
        </div>
        <div className="flex items-center">
          <div className="text-[#ffc107] mr-[8px]">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
          </div>
          <span>({reviewCount} đánh giá)</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-[15px] mb-[24px]">
        <div
          className={`font-bold text-[24px] ${
            hasDiscount ? "text-[#e10600]" : "text-[#222]"
          }`}
        >
          {formatPrice(effectivePrice)}
        </div>
        {hasDiscount && (
          <>
            <div className="text-[16px] text-[#999] line-through">
              {formatPrice(baseUnitPrice)}
            </div>
            <span className="bg-[#da251d] text-white text-[12px] font-bold px-[8px] py-[2px] rounded">
              -{product.discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Colors */}
      <div className="mb-[24px] mt-[16px]">
        <div className="mb-[8px] text-[18px]">
          <span className="font-bold text-[#222]">Màu sắc:</span>{" "}
          <span className="text-[#333]">{selectedColor?.color?.name}</span>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          {product.productColors.map((pc) => {
            if (pc.isActive === false) return null;
            const isSelected = pc.id === selectedColor.id;
            return (
              <button
                key={pc.id}
                onClick={() => {
                  onColorChange(pc.id);
                  setSelectedVariantId(null);
                  setQuantity(1);
                  setSizeError(false);
                }}
                className={`relative w-[22px] h-[22px] rounded-full border transition-transform duration-200 hover:scale-110 cursor-pointer ${
                  pc.color.hexCode?.toUpperCase() === "#FFFFFF"
                    ? "border-[#ccc]"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: pc.color.hexCode }}
                title={pc.color.name}
              >
                {isSelected && (
                  <i className="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white mix-blend-difference"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-[24px]">
        <div className="mb-[16px]">
          <div className="flex flex-wrap gap-[8px]">
            {(selectedColor?.variants || []).map((variant) => {
              const isOutOfStock = variant.stock <= 0;
              const isSelected = selectedVariantId === variant.id;

              return (
                <button
                  key={variant.id}
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setQuantity((q) => Math.min(q, Math.max(1, variant.stock)));
                    setSizeError(false);
                  }}
                  title={isOutOfStock ? "Hết hàng" : `Còn ${variant.stock} SP`}
                  className={`min-w-[40px] h-[40px] leading-[38px] text-center border text-[14px] transition-colors ${
                    isOutOfStock
                      ? "bg-[#f8f9fa] text-[#ccc] border-[#eee] line-through cursor-not-allowed"
                      : isSelected
                      ? "border-[#000] text-[#000] font-bold"
                      : "border-[#ddd] text-[#999] hover:border-[#000] hover:text-[#000] cursor-pointer"
                  }`}
                >
                  {variant.size.name}
                </button>
              );
            })}
          </div>

          {selectedVariant && (
            <div className="text-[#6c757d] mt-[8px] text-[13px]">
              Tồn kho hiện tại: <strong className="text-[#222]">{selectedVariant.stock}</strong> sản phẩm
            </div>
          )}

          {sizeError && (
            <div className="text-[#dc3545] mt-[8px] text-[13px]">
              <i className="fas fa-exclamation-circle mr-[4px]"></i>
              Vui lòng chọn kích cỡ (Size)
            </div>
          )}

          {(!selectedColor?.variants || selectedColor.variants.length === 0) && (
            <div className="text-[#dc3545] mt-[8px] text-[13px]">
              Tạm hết hàng màu này.
            </div>
          )}
        </div>

        <span
          className="text-[#222] font-bold text-[13px] underline cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => setIsSizeGuideOpen(true)}
        >
          <i className="fas fa-ruler mr-[4px]"></i> Kiểm tra size của bạn
        </span>
      </div>

      {/* Quantity */}
      <div className="mb-[24px] flex items-center">
        <label className="font-normal mr-[24px] mb-0 text-[15px] text-[#222]">
          Số lượng
        </label>
        <div className="inline-flex items-center border border-[#e1e1e1] rounded-tl-[20px] rounded-br-[20px] overflow-hidden h-[45px]">
          <button
            onClick={() => handleQtyChange(-1)}
            className="w-[40px] h-full bg-white text-[#333] hover:bg-[#f5f5f5] flex justify-center items-center text-[18px] transition-colors cursor-pointer"
          >
            -
          </button>
          <input
            type="text"
            value={quantity}
            readOnly
            className="w-[50px] h-full border-x border-[#e1e1e1] bg-white text-center text-[#333] font-semibold outline-none"
          />
          <button
            onClick={() => handleQtyChange(1)}
            className="w-[40px] h-full bg-white text-[#333] hover:bg-[#f5f5f5] flex justify-center items-center text-[18px] transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-[10px] mb-[24px]">
        <button
          onClick={handleAddToCart}
          className="w-[160px] h-[50px] bg-[#222] text-white font-bold text-[13px] rounded-tl-[16px] rounded-br-[16px] transition-all hover:bg-black uppercase border border-transparent whitespace-nowrap cursor-pointer"
        >
          THÊM VÀO GIỎ
        </button>
        <button
          onClick={handleBuyNow}
          className="w-[140px] h-[50px] bg-white text-[#222] font-bold text-[13px] rounded-tl-[16px] rounded-br-[16px] transition-all hover:bg-[#f9f9f9] uppercase border border-[#222] whitespace-nowrap cursor-pointer"
        >
          MUA HÀNG
        </button>
        <button
          onClick={handleToggleLike}
          className={`w-[50px] h-[50px] flex-shrink-0 bg-white border border-[#222] rounded-tl-[16px] rounded-br-[16px] flex items-center justify-center transition-all cursor-pointer ${
            liked
              ? "text-[#dc3545] border-[#dc3545] hover:bg-[#ffe6e6]"
              : "text-[#222] hover:bg-[#f9f9f9]"
          }`}
        >
          <i
            className={
              liked ? "fas fa-heart text-[18px]" : "far fa-heart text-[18px]"
            }
          ></i>
        </button>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}

