"use client";

import {
  useCartStore,
  getEffectiveUnitPrice,
} from "@/features/cart-and-order/stores/cart.store";
import Link from "next/link";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";

export default function CartDetail() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mb-[3rem]">
        <div className="text-center py-[3rem]">
          <h4 className="mt-[1.5rem] text-[24px] font-bold">
            Giỏ hàng của bạn đang trống
          </h4>
          <Link
            href="/"
            className="inline-flex items-center mt-[1rem] border border-[#222] text-[#222] bg-white px-[30px] py-[10px] font-normal text-[14px] hover:bg-[#222] hover:text-white transition-colors rounded-tl-[20px] rounded-br-[20px]"
          >
            &larr; Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mb-[3rem]">
      <div className="flex flex-col lg:flex-row -mx-[15px]">
        <div className="w-full flex-1 px-[15px]">
          <h4 className="font-bold mb-[1.5rem] text-[20px] xl:text-[24px] whitespace-nowrap">
            Giỏ hàng của bạn{" "}
            <span className="text-[#dc3545] ml-2">{totalItems} Sản phẩm</span>
          </h4>

          <div className="hidden xl:flex items-center pb-[24px] mb-[20px] border-b border-[#eee] font-semibold text-[12px] text-[#6c6d70] uppercase">
            <div className="flex-1">TÊN SẢN PHẨM</div>
            <div className="w-[120px] text-center">CHIẾT KHẤU</div>
            <div className="w-[150px] text-center">SỐ LƯỢNG</div>
            <div className="w-[120px] text-left pl-[20px]">TỔNG TIỀN</div>
            <div className="w-[40px]"></div>
          </div>

          {items.map((item) => {
            const hasDiscount =
              item.product.discountPercent && item.product.discountPercent > 0;
            const salePrice = getEffectiveUnitPrice(item);
            const discountAmount = item.product.basePrice - salePrice;
            const lineTotal = salePrice * item.quantity;

            return (
              <div
                key={item.id}
                className="flex relative items-stretch xl:items-start py-[20px] border-b border-[#eee]"
              >
                <div className="w-[90px] aspect-[3/4] xl:w-[150px] xl:h-[215px] mr-[15px] xl:mr-[30px] flex-shrink-0 relative bg-[#f8f9fa]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(item.color.images?.[0]?.imageUrl)}
                    alt={item.product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between xl:block min-w-[150px] xl:min-w-[200px] pt-[5px] xl:pt-[10px] relative">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="xl:hidden absolute top-[5px] right-0 text-[#333] hover:text-[#dc3545] transition-colors border-none bg-transparent cursor-pointer text-[18px]"
                  >
                    <i className="far fa-trash-alt"></i>
                  </button>

                  <div className="pr-[30px] xl:pr-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="block font-normal text-[#373737] text-[14px] xl:text-[16px] leading-[22px] xl:leading-[24px] hover:text-[#000] mb-[5px]"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-[13px] xl:text-[14px] text-[#6c6d70] mb-[10px] xl:mb-0">
                      Màu sắc: <span>{item.color.color.name}</span> &nbsp;&nbsp;
                      Size: <span>{item.variant.size.name}</span>
                    </div>
                  </div>

                  <div className="xl:hidden mt-[15px] flex justify-end">
                    <div className="flex items-center w-[110px] h-[36px] border border-[#e5e5e5] rounded-tl-[15px] rounded-br-[15px] overflow-hidden bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-[35px] h-full text-[#333] hover:bg-[#f9f9f9] flex justify-center items-center font-normal text-[16px] outline-none border-r border-[#e5e5e5]"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="flex-1 w-full h-full text-center text-[#333] font-normal text-[14px] bg-white outline-none border-none"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-[35px] h-full text-[#333] hover:bg-[#f9f9f9] flex justify-center items-center font-normal text-[16px] outline-none border-l border-[#e5e5e5]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-[120px] text-center hidden xl:block pt-[10px]">
                  {hasDiscount ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[14px] text-[#666]">
                        -{formatPrice(discountAmount)}
                      </span>
                      <span className="text-[13px] font-bold text-[#dc3545] mt-[2px]">
                        ( -{item.product.discountPercent}% )
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#999]">-</span>
                  )}
                </div>

                <div className="hidden xl:flex w-[150px] justify-center pt-[10px]">
                  <div className="flex items-center w-[120px] h-[40px] border border-[#e5e5e5] rounded-tl-[15px] rounded-br-[15px] overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-[40px] h-full text-[#333] hover:bg-[#f9f9f9] flex justify-center items-center font-normal text-[16px] outline-none border-r border-[#e5e5e5]"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      readOnly
                      className="flex-1 w-full h-full text-center text-[#333] font-normal text-[14px] bg-white outline-none border-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-[40px] h-full text-[#333] hover:bg-[#f9f9f9] flex justify-center items-center font-normal text-[16px] outline-none border-l border-[#e5e5e5]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="hidden xl:block w-[120px] text-left pl-[20px] pt-[10px]">
                  <span className="font-bold text-[#222] text-[16px]">
                    {formatPrice(lineTotal)}
                  </span>
                </div>

                <div className="hidden xl:flex w-[40px] justify-end pt-[10px]">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#999] hover:text-[#dc3545] transition-colors border-none bg-transparent cursor-pointer text-[18px]"
                  >
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            );
          })}

          <div className="mt-[30px]">
            <Link
              href="/"
              className="inline-flex justify-center items-center text-[#222] font-normal text-[14px] hover:bg-[#222] hover:text-white transition-colors border border-[#222] px-[30px] py-[10px] rounded-tl-[20px] rounded-br-[20px]"
            >
              &larr; Tiếp tục mua hàng
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-[420px] lg:min-w-[420px] px-[15px] lg:px-0 lg:ml-[3rem] mt-[30px] lg:mt-0 flex-shrink-0">
          <div className="bg-[#f7f8f9] p-[22px] rounded-[4px] lg:sticky lg:top-[100px] w-full">
            <div className="hidden lg:block">
              <div className="text-[20px] md:text-[22px] font-normal text-[#222] mb-[20px]">
                Tổng tiền giỏ hàng
              </div>
              <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                <span>Tổng sản phẩm</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                <span>Tổng tiền hàng</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                <span>Thành tiền</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-[15px] border-t-0 lg:border-t border-[#e1e1e1] text-[16px] text-[#6c6d70] leading-[24px]">
              <span>Tạm tính</span>
              <span className="font-bold text-[#000]">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="text-[#b5121b] text-[14px] mt-[15px] mb-[20px] flex items-start">
              <svg
                className="w-[18px] h-[18px] mt-[2px] mr-[8px] text-[#b5121b] flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                ></path>
              </svg>
              <span className="font-normal leading-[1.6]">
                Sản phẩm SALE trên 50% không hỗ trợ ĐỔI TRẢ. Không thanh toán cho
                Shipper khi chưa nhận được hàng !
              </span>
            </div>

            <hr className="mb-[20px] border-[#e1e1e1]" />

            <Link
              href="/checkout"
              className="block w-full bg-[#222] text-white text-center py-[15px] rounded-tl-[20px] rounded-br-[20px] font-bold text-[16px] uppercase tracking-[1px] hover:bg-black transition-colors"
            >
              ĐẶT HÀNG
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

