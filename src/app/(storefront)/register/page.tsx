"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { apiFetch } from "@/shared/lib/api";
import {
  loadVnProvinces,
  loadVnDistricts,
  loadVnWards,
  VnProvince,
  VnDistrict,
  VnWard,
} from "@/shared/utils/vn-locations";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [street, setStreet] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    loadVnProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.name === selectedProvince);
      loadVnDistricts(province?.code, selectedProvince).then((d) => {
        setDistricts(d);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      });
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
    }
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find((d) => d.name === selectedDistrict);
      loadVnWards(district?.code, selectedDistrict).then((w) => {
        setWards(w);
        setSelectedWard("");
      });
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict, districts]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    const fullName = `${lastName} ${firstName}`.trim();
    setLoading(true);
    try {
      await register({
        fullName,
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (selectedProvince && street.trim()) {
        await apiFetch("/account/addresses", {
          method: "POST",
          body: JSON.stringify({
            recipientName: fullName,
            phone: phone.trim(),
            province: selectedProvince,
            district: selectedDistrict,
            ward: selectedWard,
            streetAddress: street.trim(),
            isDefault: true,
          }),
        }).catch(() => null);
      }

      toast.success("Đăng ký tài khoản thành công!");
      router.push("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-luxe w-full px-[15px] min-[1200px]:px-[85px] mx-auto mt-[40px] mb-[30px]">
      <div className="max-w-[1170px] mx-auto w-full">
        <h2 className="text-[24px] font-semibold text-[#221f20] text-center mb-[40px] font-['Montserrat',sans-serif] uppercase">
          Đăng ký
        </h2>

        <form onSubmit={handleRegister}>
          <div className="flex flex-col lg:flex-row -mx-[15px]">
            {/* Left Col: Customer Info */}
            <div className="w-full lg:w-1/2 px-[15px] mb-[40px] lg:mb-0 lg:pr-[28px] lg:border-r lg:border-[#e1e1e1]">
              <h5 className="font-semibold text-[20px] text-[#221f20] mb-[25px] font-['Montserrat',sans-serif]">
                Thông tin khách hàng
              </h5>

              <div className="flex flex-col sm:flex-row gap-[20px] mb-[20px]">
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Họ:<span className="text-[#ff0000]">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    placeholder="Họ..."
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Tên:<span className="text-[#ff0000]">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    placeholder="Tên..."
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-[20px] mb-[20px]">
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Email:<span className="text-[#ff0000]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    placeholder="Email..."
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Điện thoại:<span className="text-[#ff0000]">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    placeholder="Điện thoại..."
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-[20px] mb-[20px]">
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Ngày sinh:
                  </label>
                  <input
                    type="date"
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white"
                  />
                </div>
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Giới tính:
                  </label>
                  <select className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white appearance-none cursor-pointer">
                    <option value="nu">Nữ</option>
                    <option value="nam">Nam</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-[20px] mb-[20px]">
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Tỉnh/TP:<span className="text-[#ff0000]">*</span>
                  </label>
                  <select
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white cursor-pointer"
                    required
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                  >
                    <option value="">Chọn Tỉnh/Tp</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Quận/Huyện:<span className="text-[#ff0000]">*</span>
                  </label>
                  <select
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white cursor-pointer"
                    required
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-[20px] relative">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Phường/Xã:<span className="text-[#ff0000]">*</span>
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white cursor-pointer"
                  required
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Địa chỉ:<span className="text-[#ff0000]">*</span>
                </label>
                <textarea
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full h-[100px] p-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3] resize-none"
                  placeholder="Số nhà, tên đường..."
                  required
                ></textarea>
              </div>
            </div>

            {/* Right Col: Password Info */}
            <div className="w-full lg:w-1/2 px-[15px] lg:pl-[28px] pt-[20px] lg:pt-0">
              <h5 className="font-semibold text-[20px] text-[#221f20] mb-[25px] font-['Montserrat',sans-serif]">
                Thông tin mật khẩu
              </h5>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Mật khẩu:<span className="text-[#ff0000]">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)..."
                  required
                />
              </div>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Nhập lại mật khẩu:<span className="text-[#ff0000]">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                  placeholder="Nhập lại mật khẩu..."
                  required
                />
              </div>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Mời nhập các ký tự trong hình vào ô sau:
                </label>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222]"
                  placeholder="Nhập ixk80..."
                />
              </div>

              <div className="mb-[25px]">
                <div className="inline-block px-[20px] py-[10px] bg-white border border-[#e1e1e1] text-[24px] tracking-[5px] font-serif italic text-[#221f20]">
                  i x k 8 0
                </div>
              </div>

              <div className="mb-[15px] flex items-center">
                <input
                  type="checkbox"
                  id="termAgree"
                  defaultChecked
                  className="w-[16px] h-[16px] mr-[10px] cursor-pointer border-[#e1e1e1] rounded-[4px]"
                  required
                />
                <label
                  htmlFor="termAgree"
                  className="text-[14px] text-[#6c6d70] cursor-pointer font-['Montserrat',sans-serif]"
                >
                  Đồng ý với các{" "}
                  <Link
                    href="/pages/dieu-khoan-dich-vu"
                    className="text-[#ff0000]"
                  >
                    điều khoản
                  </Link>{" "}
                  của LUXE
                </label>
              </div>

              <div className="mb-[30px] flex items-center">
                <input
                  type="checkbox"
                  id="newsAgree"
                  className="w-[16px] h-[16px] mr-[10px] cursor-pointer border-[#e1e1e1] rounded-[4px]"
                />
                <label
                  htmlFor="newsAgree"
                  className="text-[14px] text-[#6c6d70] cursor-pointer font-['Montserrat',sans-serif]"
                >
                  Đăng ký nhận bản tin
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#222] text-white py-[15px] font-semibold text-[15px] uppercase border border-[#222] rounded-tl-[24px] rounded-br-[24px] hover:bg-white hover:text-[#222] transition-colors text-center font-['Montserrat',sans-serif] disabled:opacity-60"
              >
                {loading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

