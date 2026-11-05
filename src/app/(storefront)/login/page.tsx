"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
                <div className="mb-[20px] flex justify-center">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full max-w-[390px] h-[48px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors placeholder-[#a3a3a3] font-['Montserrat',sans-serif]"
                    placeholder="Mật khẩu"
                    required
                  />
                </div>

                <div className="flex justify-center mt-[30px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="block w-full max-w-[390px] bg-[#222] text-white py-[15px] font-semibold text-[15px] uppercase border border-[#222] rounded-tl-[24px] rounded-br-[24px] hover:bg-white hover:text-[#222] transition-colors text-center disabled:opacity-60"
                  >
                    {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                  </button>
                </div>
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

