"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";

interface SendOtpResponse {
  email: string;
  expiresInSeconds: number;
  sentViaSmtp: boolean;
  otpCode?: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [fallbackOtpHint, setFallbackOtpHint] = useState("");

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Vui lòng nhập địa chỉ email của bạn");
      return;
    }

    setSendingOtp(true);
    setFallbackOtpHint("");
    try {
      const res = await apiFetch<SendOtpResponse>(
        "/auth/forgot-password/send-otp",
        {
          method: "POST",
          body: JSON.stringify({ email: cleanEmail }),
        }
      );

      toast.success(
        res.sentViaSmtp
          ? "Đã gửi mã xác thực OTP tới hộp thư email của bạn!"
          : "Hệ thống đã tạo mã OTP khôi phục mật khẩu!"
      );

      if (res.otpCode) {
        setFallbackOtpHint(res.otpCode);
      }

      setStep(2);
      setOtpCountdown(60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể gửi mã xác thực";
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error("Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải từ 6 ký tự trở lên");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setResetting(true);
    try {
      await apiFetch<void>("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đổi mật khẩu không thành công";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="container-luxe w-full px-[15px] min-[1200px]:px-[85px] mx-auto mt-[30px] mb-[60px]">
      {/* Breadcrumb */}
      <div className="text-[13px] font-normal text-[#6c757d] border-b border-[#f0f0f0] pt-[16px] pb-[16px] mb-[30px] flex items-center">
        <Link href="/" className="text-[#6c757d] hover:text-[#000] transition-colors">
          Trang chủ
        </Link>
        <span className="mx-[8px] text-[#999]">-</span>
        <span className="text-[#333] uppercase">QUÊN MẬT KHẨU</span>
      </div>

      <div className="max-w-[480px] mx-auto bg-white border border-[#eaeaea] rounded-[8px] p-[30px] sm:p-[40px] shadow-sm">
        <div className="text-center mb-[25px]">
          <h2 className="text-[22px] font-semibold text-[#221f20] mb-[8px] font-['Montserrat',sans-serif]">
            Khôi phục mật khẩu
          </h2>
          <p className="text-[13px] text-[#6c6d70] leading-[20px] font-['Montserrat',sans-serif]">
            {step === 1
              ? "Nhập email của bạn để nhận mã xác thực OTP đặt lại mật khẩu"
              : `Nhập mã OTP 6 số đã được gửi tới email ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#333] mb-[6px] font-['Montserrat',sans-serif]">
                Địa chỉ Email đã đăng ký *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: khachhang@gmail.com"
                className="w-full h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3] font-['Montserrat',sans-serif]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full bg-[#222] text-white py-[14px] font-semibold text-[14px] uppercase border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#222] transition-colors text-center disabled:opacity-60 cursor-pointer"
            >
              {sendingOtp ? "ĐANG GỬI MÃ OTP..." : "GỬI MÃ XÁC THỰC"}
            </button>

            <div className="text-center pt-[10px]">
              <Link
                href="/login"
                className="text-[13px] text-[#6c6d70] hover:text-[#000] hover:underline transition-colors font-['Montserrat',sans-serif]"
              >
                ← Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-[16px]">
            {fallbackOtpHint && (
              <div className="p-[12px] bg-[#f0f9ff] border border-[#bae6fd] rounded-[6px] text-[13px] text-[#0369a1] text-center font-mono">
                Mã OTP thử nghiệm: <strong>{fallbackOtpHint}</strong>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="text-[13px] font-medium text-[#333] font-['Montserrat',sans-serif]">
                  Mã OTP (6 chữ số) *
                </label>
                <button
                  type="button"
                  disabled={otpCountdown > 0 || sendingOtp}
                  onClick={() => handleSendOtp()}
                  className="text-[12px] text-[#b5121b] hover:underline disabled:text-[#999] disabled:no-underline cursor-pointer"
                >
                  {otpCountdown > 0
                    ? `Gửi lại sau (${otpCountdown}s)`
                    : "Gửi lại mã OTP"}
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Nhập 6 số OTP trong email"
                className="w-full h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[16px] text-center tracking-[4px] font-mono outline-none focus:border-[#222] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#333] mb-[6px] font-['Montserrat',sans-serif]">
                Mật khẩu mới *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3]"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#333] mb-[6px] font-['Montserrat',sans-serif]">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={resetting}
              className="w-full bg-[#222] text-white py-[14px] font-semibold text-[14px] uppercase border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#222] transition-colors text-center disabled:opacity-60 cursor-pointer mt-[10px]"
            >
              {resetting ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN & ĐẶT LẠI MẬT KHẨU"}
            </button>

            <div className="flex items-center justify-between pt-[10px] text-[13px] text-[#6c6d70]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-[#000] hover:underline cursor-pointer"
              >
                ← Đổi email khác
              </button>
              <Link
                href="/login"
                className="hover:text-[#000] hover:underline transition-colors"
              >
                Về Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
