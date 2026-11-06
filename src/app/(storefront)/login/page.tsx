"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { GoogleSignInButton } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Vui lòng nhập đầy đủ Email và Mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      toast.success(`Xin chào, ${loggedUser.name}!`);
      router.push("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-luxe w-full px-[15px] min-[1200px]:px-[85px] mx-auto mt-[40px] mb-[30px]">
      <div className="w-full">
        <div className="relative flex flex-col lg:flex-row lg:justify-center lg:gap-[60px] min-[1200px]:gap-[240px]">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#e1e1e1] -translate-x-1/2"></div>

          {/* Left Column: Login */}
          <div className="w-full lg:flex-1 lg:max-w-[480px] mx-auto min-[1200px]:mx-0 mb-[30px] lg:mb-0 pb-[30px] lg:pb-0 border-b lg:border-b-0 border-[#e1e1e1] bg-white">
            <div className="w-full">
              <h4 className="text-[20px] font-semibold text-[#221f20] mb-[15px] leading-[30px] text-center font-['Montserrat',sans-serif]">
                Bạn đã có tài khoản LUXE
              </h4>
              <p className="text-[14px] text-[#6c6d70] mb-[30px] leading-[24px] text-center font-['Montserrat',sans-serif]">
                Nếu bạn đã có tài khoản, hãy đăng nhập để theo dõi đơn hàng
                <br className="hidden lg:block" />
                và nhận được những ưu đãi tốt hơn!
              </p>

              <form onSubmit={handleLogin}>
                <div className="mb-[20px] flex justify-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full max-w-[390px] h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3] font-['Montserrat',sans-serif]"
                    placeholder="Email (VD: khachhang@gmail.com)"
                    required
                  />
                </div>
                <div className="mb-[14px] flex justify-center">
                  <div className="relative w-full max-w-[390px]">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[48px] pl-[15px] pr-[42px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3] font-['Montserrat',sans-serif]"
                      placeholder="Mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#888] hover:text-[#222] bg-transparent border-none cursor-pointer p-1"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="w-full max-w-[390px] mx-auto flex justify-end mb-[20px]">
                  <Link
                    href="/forgot-password"
                    className="text-[13px] text-[#6c6d70] hover:text-[#000] hover:underline transition-colors font-['Montserrat',sans-serif]"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <div className="flex justify-center mt-[10px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="block w-full max-w-[390px] bg-[#222] text-white py-[15px] font-semibold text-[15px] uppercase border border-[#222] rounded-tl-[24px] rounded-br-[24px] hover:bg-white hover:text-[#222] transition-colors text-center disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                  </button>
                </div>

                <div className="w-full max-w-[390px] mx-auto my-[22px] flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-[#e1e1e1]"></div>
                  <span className="text-[11px] uppercase text-[#888] font-semibold tracking-[1px]">HOẶC</span>
                  <div className="flex-1 h-[1px] bg-[#e1e1e1]"></div>
                </div>

                <GoogleSignInButton mode="login" />
              </form>
            </div>
          </div>

          {/* Right Column: Register Prompt */}
          <div className="w-full lg:flex-1 lg:max-w-[480px] mx-auto min-[1200px]:mx-0 pt-[20px] lg:pt-0 bg-white text-center">
            <div className="w-full">
              <h4 className="text-[20px] font-semibold text-[#221f20] mb-[15px] leading-[30px] text-center font-['Montserrat',sans-serif]">
                Khách hàng mới của LUXE fashion
              </h4>
              <p className="text-[14px] text-[#6c6d70] mb-[30px] leading-[24px] text-center font-['Montserrat',sans-serif]">
                Nếu bạn chưa có tài khoản trên luxefashion.com, hãy sử dụng
                <br className="hidden lg:block" />
                tùy chọn này để truy cập biểu mẫu đăng ký.
                <br className="hidden lg:block" />
                Bằng cách cung cấp cho LUXE fashion thông tin chi tiết của bạn,
                <br className="hidden lg:block" />
                quá trình mua hàng trên luxefashion.com sẽ là một trải nghiệm
                <br className="hidden lg:block" />
                thú vị và nhanh chóng hơn!
              </p>

              <div className="flex justify-center">
                <Link
                  href="/register"
                  className="block w-full max-w-[390px] bg-[#222] text-white border border-[#222] text-center py-[15px] font-semibold text-[15px] uppercase rounded-tl-[24px] rounded-br-[24px] hover:bg-white hover:text-[#222] transition-colors"
                >
                  ĐĂNG KÝ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

