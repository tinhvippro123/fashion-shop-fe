"use client";

import React, { useState } from "react";
import { formatPrice } from "@/shared/utils/format";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";

interface VnPayInAppModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  paymentUrl?: string | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function VnPayInAppModal({
  isOpen,
  orderCode,
  totalAmount,
  onSuccess,
  onClose,
}: VnPayInAppModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFillTestData = () => {
    setCardNumber("9704 1985 2619 1432 198");
    setCardHolder("NGUYEN VAN A");
    setIssueDate("07/15");
    setOtp("123456");
  };

  if (!isOpen) return null;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    if (!cardNumber.trim() || !cardHolder.trim() || !issueDate.trim() || !otp.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin thẻ");
      return;
    }

    setProcessing(true);
    try {
      // Realistic brief authentication delay (800ms)
      await new Promise((r) => setTimeout(r, 800));

      await apiFetch("/payment/direct-pay", {
        method: "POST",
        body: JSON.stringify({
          orderCode,
          bankCode: "NCB",
        }),
      });

      toast.success("Thanh toán đơn hàng qua VNPay thành công!");
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message || "Thanh toán thất bại");
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in"
      onClick={() => {
        if (!processing) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[440px] bg-white rounded-[14px] shadow-2xl overflow-hidden border border-[#e5e7eb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#005baa] px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center font-black text-[#005baa] text-[13px] tracking-tight">
              VN
            </div>
            <div>
              <div className="font-bold text-[14px] tracking-wide uppercase leading-tight">
                CỔNG THANH TOÁN VNPAY
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                Xác thực thanh toán trực tiếp
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm cursor-pointer"
            title="Đóng (quay lại)"
          >
            ✕
          </button>
        </div>

        {/* Order summary bar */}
        <div className="bg-[#f8f9fa] border-b border-[#eee] px-5 py-2.5 flex items-center justify-between text-[13px]">
          <div>
            <span className="text-[#6c757d]">Đơn hàng:</span>{" "}
            <strong className="text-[#222] font-mono">{orderCode}</strong>
          </div>
          <div>
            <span className="text-[#6c757d]">Số tiền:</span>{" "}
            <strong className="text-[#e10600] font-bold text-[15px]">
              {formatPrice(totalAmount)}
            </strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmPayment} className="p-5 space-y-3">
          {/* Bank Indicator */}
          <div className="flex items-center justify-between p-2 border border-[#d1d5db] rounded-[6px] bg-[#f9fafb]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#005baa] text-white flex items-center justify-center font-bold text-[10px]">
                NCB
              </div>
              <span className="font-semibold text-[12.5px] text-[#222]">
                Thẻ ATM Quốc dân (NCB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillTestData}
              className="text-[11px] bg-sky-50 text-[#005baa] hover:bg-sky-100 border border-sky-200 font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer"
              title="Nhấp để tự động điền mẫu thẻ test NCB"
            >
              ⚡ Điền mẫu thẻ test
            </button>
          </div>

          {/* Card number */}
          <div>
            <label className="block text-[11px] font-semibold text-[#555] uppercase mb-0.5">
              Số thẻ ATM
            </label>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Nhập số thẻ ATM"
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-[6px] text-[13px] font-mono text-[#222] placeholder:font-sans placeholder:text-[#9ca3af] focus:outline-none focus:border-[#005baa]"
              required
            />
          </div>

          {/* Cardholder name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#555] uppercase mb-0.5">
              Tên chủ thẻ
            </label>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder="Họ và tên chủ thẻ (không dấu)"
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-[6px] text-[13px] uppercase text-[#222] placeholder:normal-case placeholder:font-sans placeholder:text-[#9ca3af] focus:outline-none focus:border-[#005baa]"
              required
            />
          </div>

          {/* Expiry & OTP row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase mb-0.5">
                Ngày phát hành
              </label>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-[6px] text-[13px] text-center font-mono text-[#222] placeholder:font-sans placeholder:text-[#9ca3af] focus:outline-none focus:border-[#005baa]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase mb-0.5">
                Mã OTP
              </label>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Nhập mã xác thực OTP"
                maxLength={6}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-[6px] text-[13px] text-center font-mono font-bold text-[#222] placeholder:font-sans placeholder:font-normal placeholder:text-[#9ca3af] focus:outline-none focus:border-[#005baa]"
                required
              />
            </div>
          </div>

          {/* Payment hint */}
          <div className="bg-sky-50 border border-sky-200 rounded-[6px] px-3 py-2 text-[11px] text-sky-800 space-y-1">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="font-bold text-sky-900">ℹ</span>
              <span>Cổng thanh toán bảo mật • Sandbox thử nghiệm</span>
            </div>
            <div className="text-[10.5px] text-sky-700 leading-normal">
              Nhập thông tin thẻ thanh toán hoặc bấm nút <strong>&quot;Điền mẫu thẻ test&quot;</strong> ở trên để nạp nhanh thông tin thẻ NCB mẫu.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 bg-[#005baa] hover:bg-[#004a8c] text-white font-bold text-[13px] uppercase rounded-[6px] shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>XÁC NHẬN THANH TOÁN ({formatPrice(totalAmount)})</span>
            )}
          </button>

          {/* Footer cancel button */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="text-[12px] text-[#6c757d] hover:text-[#222] font-medium underline transition-colors cursor-pointer"
            >
              Quay lại thay đổi thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
