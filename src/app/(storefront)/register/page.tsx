"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { GoogleSignInButton } from "@/features/auth";
import { apiFetch } from "@/shared/lib/api";
import {
  BIRTH_DATE_ERROR,
  PASSWORD_ERROR,
  VN_NAME_ERROR,
  VN_PHONE_ERROR,
  getMaxBirthDateString,
  getMinBirthDateString,
  isValidBirthDate,
  isValidEmail,
  isValidOtp,
  isValidPassword,
  isValidVnName,
  isValidVnPhone,
  sanitizeOtp,
  sanitizeVnPhone,
} from "@/shared/utils/validation";
import {
  loadVnProvinces,
  loadVnDistricts,
  loadVnWards,
  VnProvince,
  VnDistrict,
  VnWard,
} from "@/shared/utils/vn-locations";

interface SendOtpResponse {
  email: string;
  expiresInSeconds: number;
  sentViaSmtp: boolean;
  otpCode?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("FEMALE");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [street, setStreet] = useState("");
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
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      toast.warning("Vui lòng nhập địa chỉ Email hợp lệ trước khi lấy mã OTP!");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await apiFetch<SendOtpResponse>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail }),
      });
      setOtpCountdown(60);
      toast.success(`Đã gửi mã OTP 6 số tới ${res.email}. Vui lòng kiểm tra hộp thư!`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
    if (val) {
      const province = provinces.find((p) => p.name === val);
      const d = await loadVnDistricts(province?.code, val);
      setDistricts(d);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedWard("");
    if (val) {
      const district = districts.find((d) => d.name === val);
      const w = await loadVnWards(district?.code, val);
      setWards(w);
    } else {
      setWards([]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${lastName} ${firstName}`.trim();
    if (!lastName.trim() || !firstName.trim() || !isValidVnName(fullName)) {
      toast.error(VN_NAME_ERROR);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Địa chỉ email không đúng định dạng (tối đa 100 ký tự)!");
      return;
    }
    if (!isValidVnPhone(phone)) {
      toast.error(VN_PHONE_ERROR);
      return;
    }
    if (!dateOfBirth || !isValidBirthDate(dateOfBirth)) {
      toast.error(BIRTH_DATE_ERROR);
      return;
    }
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã!");
      return;
    }
    const cleanStreet = street.trim();
    if (cleanStreet.length < 3 || cleanStreet.length > 150) {
      toast.error("Địa chỉ cụ thể (số nhà, tên đường) phải từ 3 đến 150 ký tự!");
      return;
    }
    if (!isValidPassword(password)) {
      toast.error(PASSWORD_ERROR);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }
    if (!isValidOtp(otpCode)) {
      toast.error("Vui lòng nhập đủ mã xác thực OTP gồm 6 chữ số!");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email: email.trim(),
        phone: phone.trim(),
        gender,
        dateOfBirth: dateOfBirth || undefined,
        password,
        otpCode: otpCode.trim(),
        province: selectedProvince || undefined,
        district: selectedDistrict || undefined,
        ward: selectedWard || undefined,
        streetAddress: street.trim() || undefined,
      });

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
                    maxLength={20}
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
                    maxLength={20}
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
                    maxLength={100}
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
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(sanitizeVnPhone(e.target.value))}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    placeholder="VD: 0987654321 (10 số)"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-[20px] mb-[20px]">
                <div className="w-full sm:w-1/2">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Ngày sinh:<span className="text-[#ff0000]">*</span>
                  </label>
                  <input
                    type="date"
                    min={getMinBirthDateString()}
                    max={getMaxBirthDateString()}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                    Giới tính:<span className="text-[#ff0000]">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] bg-white cursor-pointer"
                  >
                    <option value="FEMALE">Nữ</option>
                    <option value="MALE">Nam</option>
                    <option value="OTHER">Khác</option>
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
                    onChange={handleProvinceChange}
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
                    onChange={handleDistrictChange}
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
                  minLength={3}
                  maxLength={150}
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
                  minLength={6}
                  maxLength={32}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                  placeholder="Từ 6 đến 32 ký tự, không khoảng trắng..."
                  required
                />
              </div>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Nhập lại mật khẩu:<span className="text-[#ff0000]">*</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  maxLength={32}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3]"
                  placeholder="Nhập lại mật khẩu..."
                  required
                />
              </div>

              <div className="mb-[20px]">
                <label className="block text-[14px] text-[#6c6d70] mb-[8px] font-['Montserrat',sans-serif]">
                  Mã xác thực OTP Email:<span className="text-[#ff0000]">*</span>
                </label>
                <div className="flex gap-[12px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(sanitizeOtp(e.target.value))}
                    className="flex-1 h-[50px] px-[15px] border border-[#e1e1e1] rounded-[8px] text-[14px] text-[#222] outline-none focus:border-[#222] placeholder-[#a3a3a3] tracking-[2px] font-semibold"
                    placeholder="Nhập mã OTP 6 số..."
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCountdown > 0}
                    className="px-[18px] h-[50px] bg-[#f8f9fa] border border-[#221f20] rounded-[8px] text-[13px] font-semibold text-[#221f20] hover:bg-[#221f20] hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {sendingOtp
                      ? "Đang gửi..."
                      : otpCountdown > 0
                        ? `Gửi lại (${otpCountdown}s)`
                        : "Lấy mã OTP"}
                  </button>
                </div>
              </div>

              <div className="mb-[25px] flex items-center">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#222] text-white py-[15px] font-semibold text-[15px] uppercase border border-[#222] rounded-tl-[24px] rounded-br-[24px] hover:bg-white hover:text-[#222] transition-colors text-center font-['Montserrat',sans-serif] disabled:opacity-60 cursor-pointer"
              >
                {loading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
              </button>

              <div className="w-full my-[22px] flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-[#e1e1e1]"></div>
                <span className="text-[11px] uppercase text-[#888] font-semibold tracking-[1px]">HOẶC</span>
                <div className="flex-1 h-[1px] bg-[#e1e1e1]"></div>
              </div>

              <GoogleSignInButton mode="register" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

