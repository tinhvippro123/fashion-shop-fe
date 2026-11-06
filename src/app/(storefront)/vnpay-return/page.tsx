"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice } from "@/shared/utils/format";
import { useAuthStore } from "@/features/users/stores/auth.store";

interface VnPayCallbackResult {
  success: boolean;
  orderCode: string;
  orderId?: number;
  amount: number;
  bankCode?: string;
  transactionNo?: string;
  responseCode?: string;
  message?: string;
  payDate?: string;
}

function VnPayReturnContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const qs = searchParams.toString();
  const [loading, setLoading] = useState(Boolean(qs));
  const [result, setResult] = useState<VnPayCallbackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    qs ? null : "Không tìm thấy thông tin giao dịch từ VNPay."
  );

  useEffect(() => {
    if (!qs) return;

    let active = true;
    apiFetch<VnPayCallbackResult>(`/payment/vnpay/callback?${qs}`)
      .then((res) => {
        if (active) setResult(res);
      })
      .catch((err) => {
        if (active) {
          setErrorMsg((err as Error).message || "Không thể xác minh giao dịch.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [qs]);

  const formatPayDate = (raw?: string) => {
    if (!raw || raw.length < 14) return new Date().toLocaleString("vi-VN");
    // format: yyyyMMddHHmmss
    const y = raw.substring(0, 4);
    const m = raw.substring(4, 6);
    const d = raw.substring(6, 8);
    const h = raw.substring(8, 10);
    const min = raw.substring(10, 12);
    const s = raw.substring(12, 14);
    return `${h}:${min}:${s} - ${d}/${m}/${y}`;
  };

  const orderCode =
    result?.orderCode || searchParams.get("vnp_TxnRef") || "Đang cập nhật";

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
              <div
                className={`w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full mb-[5px] md:mb-[10px] relative z-10 ${
                  result?.success ? "bg-[#222]" : "bg-[#dc3545]"
                }`}
              ></div>
              <div
                className={`text-[12px] md:text-[14px] font-medium bg-white px-1 ${
                  result?.success ? "text-[#222]" : "text-[#dc3545]"
                }`}
              >
                {result?.success ? "Hoàn thành đơn" : "Kết quả thanh toán"}
              </div>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="max-w-[700px] mx-auto mt-[40px] md:mt-[60px]">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-[#222] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-[18px] font-medium text-[#222] uppercase tracking-[1px]">
                Đang đối soát giao dịch với VNPay...
              </h2>
              <p className="text-[14px] text-[#6c6d70] mt-2">
                Vui lòng không tắt hoặc tải lại trang trong giây lát.
              </p>
            </div>
          ) : result?.success ? (
            <>
              <div className="text-center mb-[40px]">
                <div className="w-[80px] h-[80px] mx-auto bg-[#e6f4ea] text-[#137333] rounded-[20px] rounded-br-[4px] rounded-tl-[4px] flex items-center justify-center mb-[25px]">
                  <svg
                    className="w-[44px] h-[44px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h1 className="text-[28px] md:text-[32px] font-normal text-[#222] mb-[15px] uppercase tracking-[1px]">
                  THANH TOÁN THÀNH CÔNG!
                </h1>
                <p className="text-[15px] text-[#6c6d70] leading-[1.6]">
                  Giao dịch của bạn đã được xác nhận thành công qua{" "}
                  <strong>Cổng thanh toán điện tử VNPay</strong>.
                  <br />
                  Đơn hàng đã được thanh toán và chuyển sang bộ phận kho để chuẩn bị sản phẩm.
                </p>
              </div>

              {/* Transaction details card */}
              <div className="bg-[#f7f8f9] rounded-[4px] p-[30px] md:p-[40px] mb-[40px]">
                <h2 className="text-[18px] font-normal text-[#222] mb-[25px] pb-[15px] border-b border-[#e1e1e1] flex items-center justify-between">
                  <span>Chi tiết giao dịch</span>
                  <span className="text-[12px] bg-[#137333] text-white px-2.5 py-1 rounded font-semibold tracking-wide uppercase">
                    ĐÃ THANH TOÁN (PAID)
                  </span>
                </h2>

                <div className="flex flex-col md:flex-row mb-[18px]">
                  <div className="w-full md:w-[220px] text-[15px] text-[#6c6d70] mb-[4px] md:mb-0">
                    Mã đơn hàng:
                  </div>
                  <div className="flex-1 font-bold text-[#222] text-[15px]">
                    {orderCode}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row mb-[18px]">
                  <div className="w-full md:w-[220px] text-[15px] text-[#6c6d70] mb-[4px] md:mb-0">
                    Mã giao dịch VNPay:
                  </div>
                  <div className="flex-1 font-mono text-[#222] text-[15px]">
                    {result.transactionNo || searchParams.get("vnp_TransactionNo") || "-"}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row mb-[18px]">
                  <div className="w-full md:w-[220px] text-[15px] text-[#6c6d70] mb-[4px] md:mb-0">
                    Ngân hàng thanh toán:
                  </div>
                  <div className="flex-1 font-bold text-[#222] text-[15px]">
                    {result.bankCode || searchParams.get("vnp_BankCode") || "NCB (Test)"}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row mb-[18px]">
                  <div className="w-full md:w-[220px] text-[15px] text-[#6c6d70] mb-[4px] md:mb-0">
                    Số tiền thanh toán:
                  </div>
                  <div className="flex-1 font-bold text-[#b5121b] text-[16px]">
                    {formatPrice(result.amount)}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-[220px] text-[15px] text-[#6c6d70] mb-[4px] md:mb-0">
                    Thời gian thanh toán:
                  </div>
                  <div className="flex-1 text-[#222] text-[15px]">
                    {formatPayDate(result.payDate || searchParams.get("vnp_PayDate") || undefined)}
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
                      ? `/account/orders`
                      : `/order/tracking?code=${encodeURIComponent(orderCode)}`
                  }
                  className="inline-flex justify-center items-center py-[15px] px-[40px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-[#222] text-white border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors"
                >
                  XEM ĐƠN HÀNG
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Failed / Cancelled state */}
              <div className="text-center mb-[40px]">
                <div className="w-[80px] h-[80px] mx-auto bg-[#fde8e8] text-[#c81e1e] rounded-[20px] rounded-br-[4px] rounded-tl-[4px] flex items-center justify-center mb-[25px]">
                  <svg
                    className="w-[44px] h-[44px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <h1 className="text-[26px] md:text-[30px] font-normal text-[#222] mb-[15px] uppercase tracking-[1px]">
                  THANH TOÁN CHƯA HOÀN TẤT
                </h1>
                <p className="text-[15px] text-[#6c6d70] leading-[1.6]">
                  {searchParams.get("vnp_ResponseCode") === "24"
                    ? "Giao dịch đã bị hủy bởi khách hàng trên cổng thanh toán VNPay."
                    : result?.message ||
                      errorMsg ||
                      "Giao dịch thanh toán qua VNPay không thành công hoặc xảy ra sự cố."}
                </p>
              </div>

              <div className="bg-[#f7f8f9] rounded-[4px] p-[25px] md:p-[35px] mb-[40px] text-center text-[14px] text-[#6c6d70]">
                <div>Mã đơn hàng: <strong>{orderCode}</strong></div>
                {searchParams.get("vnp_ResponseCode") && (
                  <div className="mt-1">
                    Mã lỗi VNPay: <code>{searchParams.get("vnp_ResponseCode")}</code>
                  </div>
                )}
                <div className="mt-3 text-[13px] text-[#888]">
                  Đơn hàng của bạn vẫn được lưu lại nhưng ở trạng thái <em>Chưa thanh toán</em>. Bạn có thể tiến hành thanh toán lại bất kỳ lúc nào.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-[15px] sm:gap-[20px]">
                <Link
                  href="/checkout"
                  className="inline-flex justify-center items-center py-[15px] px-[40px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-[#222] text-white border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors"
                >
                  THANH TOÁN LẠI
                </Link>
                <Link
                  href="/"
                  className="inline-flex justify-center items-center py-[15px] px-[40px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-white text-[#222] border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-[#f9f9f9] transition-colors"
                >
                  VỀ TRANG CHỦ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VnPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-[#6c6d70]">
          Đang tải kết quả thanh toán...
        </div>
      }
    >
      <VnPayReturnContent />
    </Suspense>
  );
}
