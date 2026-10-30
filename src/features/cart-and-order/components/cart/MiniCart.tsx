"use client";

import {
  useCartStore,
  getEffectiveUnitPrice,
} from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import Link from "next/link";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";

export default function MiniCart() {
  const {
    isMiniCartOpen,
    toggleMiniCart,
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 ${
          isMiniCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => toggleMiniCart(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-[320px] md:w-[390px] max-w-[100vw] bg-white z-[9999] flex flex-col shadow-xl transition-transform duration-300 ease-in-out transform ${
          isMiniCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-[20px] py-[25px]">
          <h5 className="m-0 text-[18px] font-bold text-[#111] flex items-center">
            Giỏ hàng
            <span className="ml-[8px] bg-[#222] text-white rounded-full text-[14px] font-normal px-[7px] py-[4px] leading-none">
              {totalItems}
            </span>
          </h5>
          <button
            onClick={() => toggleMiniCart(false)}
            className="text-[28px] font-light outline-none border-none bg-transparent text-[#333] leading-none hover:text-[#ff0000] transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[20px] pb-[20px]">
          {items.length === 0 ? (
            <div className="py-[20px] text-center text-[#666]">
              Giỏ hàng đang trống
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex mb-[20px] pb-[20px] border-b border-[#f5f5f5] last:border-0 last:mb-0 last:pb-0"
              >
                <div className="w-[80px] aspect-[3/4] relative flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(item.color.images?.[0]?.imageUrl)}
                    alt={item.product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="ml-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="mb-[6px] text-[#333] font-normal text-[14px] line-clamp-2 pr-[10px]">
                        {item.product.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#999] hover:text-[#ff0000] text-[14px] mt-[2px] transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
                    </div>

                    <small className="text-[#6c757d] text-[13px] block mb-[10px]">
                      Màu sắc: <span>{item.color.color.name}</span> &nbsp;&nbsp;
                      Size: <span>{item.variant.size.name}</span>
                    </small>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center w-[85px] h-[30px] border border-[#e5e5e5] rounded-tl-[10px] rounded-br-[10px] overflow-hidden bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-[28px] h-full bg-white text-[#6c6d70] hover:bg-[#f5f5f5] flex justify-center items-center text-[16px] outline-none border-r border-[#e5e5e5]"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="flex-1 w-full h-full text-center text-[#333] font-normal text-[14px] bg-white outline-none"
                      />
                      <button
                        disabled={
                          item.quantity >= Math.max(1, item.variant?.stock ?? 99)
                        }
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-[28px] h-full bg-white text-[#6c6d70] hover:bg-[#f5f5f5] flex justify-center items-center text-[16px] outline-none border-l border-[#e5e5e5] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-[#b5121b] text-[14px]">
                      {formatPrice(getEffectiveUnitPrice(item) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-[20px] border-t border-[#eee] bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
          <div className="text-right mb-[15px]">
            <span className="text-[#777] font-medium text-[15px]">
              Tổng cộng:
            </span>
            <span className="font-bold ml-[8px] text-[#111] text-[18px]">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col gap-[10px] mt-[15px]">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/cart"
                    onClick={() => toggleMiniCart(false)}
                    className="w-full text-center bg-white text-[#222] border border-[#222] py-[12px] font-bold text-[14px] rounded-tl-[4px] rounded-br-[4px] hover:bg-[#f9f9f9] transition-colors uppercase"
                  >
                    Xem giỏ hàng
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => toggleMiniCart(false)}
                    className="w-full text-center bg-[#222] text-white py-[12px] font-bold text-[14px] rounded-tl-[4px] rounded-br-[4px] hover:bg-black transition-colors uppercase"
                  >
                    Thanh toán
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/cart"
                    onClick={() => toggleMiniCart(false)}
                    className="w-full text-center bg-[#222] text-white py-[12px] font-bold text-[14px] rounded-tl-[4px] rounded-br-[4px] hover:bg-black transition-colors uppercase"
                  >
                    Xem giỏ hàng
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => toggleMiniCart(false)}
                    className="w-full text-center bg-white text-[#222] border border-[#222] py-[12px] font-bold text-[14px] rounded-tl-[4px] rounded-br-[4px] hover:bg-[#f9f9f9] transition-colors uppercase"
                  >
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

