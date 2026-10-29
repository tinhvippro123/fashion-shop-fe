"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";
import { useAuthStore } from "@/features/users/stores/auth.store";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);

  useEffect(() => {
    if (!code) return;
    apiFetch<OrderResponseDto>(`/orders/${encodeURIComponent(code)}`)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [code]);

  const today = new Date();
  const minDelivery = new Date(today);
  minDelivery.setDate(today.getDate() + 3);
  const maxDelivery = new Date(today);
  maxDelivery.setDate(today.getDate() + 5);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const paymentDisplay =
    order?.paymentMethod === "BANK_TRANSFER"
      ? "Chuyển khoản ngân hàng"
      : "Thanh toán khi nhận hàng (COD)";

  return (
    <div className="pb-[80px]">
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-4">
        {/* 3-Step Progress Bar */}
        <div className="max-w-[800px] mx-auto px-[20px] md:px-[40px]">
          <div className="flex justify-between relative mb-[40px] md:mb-[50px] mt-[20px] md:mt-[30px]">
            <div className="absolute top-[5px] md:top-[7px] left-[50px] right-[50px] h-[2px] bg-[#222] z-[1]"></div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#333] bg-white px-1">
                Giỏ hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#333] bg-white px-1">
                Đặt hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] font-medium text-[#222] bg-white px-1">
                Hoàn thành đơn
              </div>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-[700px] mx-auto mt-[40px] md:mt-[60px]">
          <div className="text-center mb-[40px]">
            <div className="w-[80px] h-[80px] mx-auto bg-[#f7f8f9] rounded-[20px] rounded-br-[4px] rounded-tl-[4px] flex items-center justify-center mb-[25px]">
              <svg
                className="w-[40px] h-[40px] text-[#222]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-normal text-[#222] mb-[15px] uppercase tracking-[1px]">
              ĐẶT HÀNG THÀNH CÔNG
            </h1>
            <p className="text-[15px] text-[#6c6d70] leading-[1.6]">
              Cảm ơn bạn đã mua sắm tại <strong>LUXE FASHION</strong>.
              <br className="hidden md:block" />
              Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
            </p>
          </div>

          {/* Order Details Box */}
          <div className="bg-[#f7f8f9] rounded-[4px] p-[30px] md:p-[40px] mb-[40px]">
            <h2 className="text-[18px] font-normal text-[#222] mb-[25px] pb-[15px] border-b border-[#e1e1e1]">
              Thông tin đơn hàng
            </h2>

            <div className="flex flex-col md:flex-row mb-[20px]">
              <div className="w-full md:w-[200px] text-[15px] text-[#6c6d70] mb-[5px] md:mb-0">
                Mã đơn hàng:
              </div>
              <div className="flex-1 font-bold text-[#222] text-[15px]">
                {order?.orderCode || code || "Đang cập nhật"}
              </div>
            </div>

            <div className="flex flex-col md:flex-row mb-[20px]">
              <div className="w-full md:w-[200px] text-[15px] text-[#6c6d70] mb-[5px] md:mb-0">
                Ngày đặt hàng:
              </div>
              <div className="flex-1 font-normal text-[#222] text-[15px]">
                {order?.date || formatDate(today)}
              </div>
            </div>

            {order?.total && (
              <div className="flex flex-col md:flex-row mb-[20px]">
                <div className="w-full md:w-[200px] text-[15px] text-[#6c6d70] mb-[5px] md:mb-0">
                  Tổng thanh toán:
                </div>
                <div className="flex-1 font-bold text-[#222] text-[15px]">
                  {order.total}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row mb-[20px]">
              <div className="w-full md:w-[200px] text-[15px] text-[#6c6d70] mb-[5px] md:mb-0">
                Phương thức thanh toán:
              </div>
              <div className="flex-1 font-normal text-[#222] text-[15px]">
                {paymentDisplay}
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[200px] text-[15px] text-[#6c6d70] mb-[5px] md:mb-0">
                Dự kiến giao hàng:
              </div>
              <div className="flex-1 font-bold text-[#b5121b] text-[15px]">
                {formatDate(minDelivery)} - {formatDate(maxDelivery)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-[15px] sm:gap-[20px]">
            <Link
              href="/"
              className="inline-flex justify-center items-center py-[15px] px-[40px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-white text-[#222] border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-[#f9f9f9] transition-colors"
            >
              TIẾP TỤC MUA SẮM
            </Link>
            <Link
              href={
                isAuthenticated
                  ? code
                    ? `/account/orders/${encodeURIComponent(code)}`
                    : "/account/orders"
                  : "/order/tracking"
              }
              className="inline-flex justify-center items-center py-[15px] px-[40px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-[#222] text-white border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors"
            >
              XEM ĐƠN HÀNG
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-[80px] text-center text-[#666]">Đang tải...</div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

