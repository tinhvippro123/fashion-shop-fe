"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { useAuthStore, User } from "@/features/users/stores/auth.store";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [gender, setGender] = useState(user?.gender || "FEMALE");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    apiFetch<User>("/account/profile")
      .then((profile) => {
        const displayName = profile.fullName || profile.name || "";
        setFullName(displayName);
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
        setGender(profile.gender || "FEMALE");
        setDateOfBirth(profile.dateOfBirth || "");
        setUser({
          ...profile,
          name: displayName,
          isAdmin: Boolean(profile.isAdmin || profile.role === "ADMIN"),
        });
      })
      .catch(() => null);
  }, [setUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch<User>("/account/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          gender,
          dateOfBirth: dateOfBirth || null,
        }),
      });
      setUser({
        ...updated,
        name: updated.fullName || updated.name || fullName.trim(),
        isAdmin: Boolean(updated.isAdmin || updated.role === "ADMIN"),
      });
      setSuccessMessage("Cập nhật thông tin tài khoản thành công!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải từ 6 ký tự trở lên");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới nhập lại không khớp");
      return;
    }
    try {
      await apiFetch("/account/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setIsModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Đổi mật khẩu thành công!");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <h5 className="font-bold mb-[15px] uppercase text-[18px] text-[#222]">
        Tài khoản của tôi
      </h5>

      <div className="bg-[#d1ecf1] text-[#0c5460] text-[14px] p-[12px_20px] mb-[24px]">
        Quản lý thông tin hồ sơ cá nhân để bảo mật tài khoản và nhận thông tin
        đơn hàng chính xác từ LUXE Fashion.
      </div>

      {successMessage && (
        <div className="bg-[#d4edda] text-[#155724] p-[12px_20px] mb-[24px] rounded flex items-center justify-between">
          <div>
            <i className="fas fa-check-circle mr-[8px]"></i> {successMessage}
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-[#155724] font-bold"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleUpdateProfile}>
        <div className="flex flex-col lg:flex-row mx-[-15px]">
          {/* Left Form Column */}
          <div className="w-full lg:w-7/12 px-[15px] order-2 lg:order-1">
            <div className="flex flex-col md:flex-row md:items-center mb-[24px]">
              <label className="text-[#6c6d70] text-[14px] w-full md:w-[150px] shrink-0 mb-[8px] md:mb-0">
                Họ và tên
              </label>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-[#e1e1e1] rounded-[4px] p-[10px_15px] text-[14px] text-[#222] outline-none focus:border-[#222] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center mb-[24px]">
              <label className="text-[#6c6d70] text-[14px] w-full md:w-[150px] shrink-0 mb-[8px] md:mb-0">
                Số điện thoại
              </label>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#e1e1e1] rounded-[4px] p-[10px_15px] text-[14px] text-[#222] outline-none focus:border-[#222] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center mb-[24px]">
              <label className="text-[#6c6d70] text-[14px] w-full md:w-[150px] shrink-0 mb-[8px] md:mb-0">
                Email đăng nhập
              </label>
              <div className="flex-1 w-full">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-[#f8f9fa] border-0 rounded-[4px] p-[10px_15px] text-[14px] text-[#495057] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center mb-[24px]">
              <label className="text-[#6c6d70] text-[14px] w-full md:w-[150px] shrink-0 mb-[8px] md:mb-0">
                Giới tính
              </label>
              <div className="flex-1 w-full flex items-center gap-[24px] py-[8px]">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={gender === "MALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-[6px] w-[16px] h-[16px] accent-[#222]"
                  />
                  <span className="text-[14px] text-[#222]">Nam</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={gender === "FEMALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-[6px] w-[16px] h-[16px] accent-[#222]"
                  />
                  <span className="text-[14px] text-[#222]">Nữ</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="OTHER"
                    checked={gender === "OTHER"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-[6px] w-[16px] h-[16px] accent-[#222]"
                  />
                  <span className="text-[14px] text-[#222]">Khác</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center mb-[24px]">
              <label className="text-[#6c6d70] text-[14px] w-full md:w-[150px] shrink-0 mb-[8px] md:mb-0">
                Ngày sinh
              </label>
              <div className="flex-1 w-full">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full border border-[#e1e1e1] rounded-[4px] p-[10px_15px] text-[14px] text-[#222] outline-none focus:border-[#222] transition-colors"
                />
              </div>
            </div>

            <div className="flex mt-[16px]">
              <div className="hidden md:block w-[150px] shrink-0"></div>
              <div className="flex w-full">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#222] text-white px-[24px] py-[8px] mr-[16px] font-bold text-[14px] border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#222] transition-colors disabled:opacity-60"
                >
                  {saving ? "ĐANG LƯU..." : "CẬP NHẬT"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-[#333] px-[24px] py-[8px] font-bold text-[14px] border border-[#333] rounded-tl-[20px] rounded-br-[20px] hover:bg-[#333] hover:text-white transition-colors"
                >
                  ĐỔI MẬT KHẨU
                </button>
              </div>
            </div>
          </div>

          {/* Right Info Table Column */}
          <div className="w-full lg:w-5/12 px-[15px] order-1 lg:order-2 mb-[24px] lg:mb-0 lg:pl-[24px]">
            <table className="w-full border border-[#dee2e6] text-center text-[14px]">
              <tbody>
                <tr className="border-b border-[#dee2e6]">
                  <td className="bg-[#f8f9fa] text-[#6c6d70] py-[16px] px-[24px] w-1/2 align-middle border-r border-[#dee2e6]">
                    Vai trò tài khoản
                  </td>
                  <td className="font-bold py-[16px] px-[24px] align-middle text-[#222]">
                    {user?.isAdmin ? "Quản trị viên (ADMIN)" : "Khách hàng thành viên"}
                  </td>
                </tr>
                <tr className="border-b border-[#dee2e6]">
                  <td className="bg-[#f8f9fa] text-[#6c6d70] py-[16px] px-[24px] align-middle border-r border-[#dee2e6]">
                    Trạng thái
                  </td>
                  <td className="font-bold py-[16px] px-[24px] align-middle text-[#28a745]">
                    Đang hoạt động
                  </td>
                </tr>
                <tr>
                  <td className="bg-[#f8f9fa] text-[#6c6d70] py-[16px] px-[24px] align-middle border-r border-[#dee2e6]">
                    Ưu đãi Voucher
                  </td>
                  <td className="font-bold py-[16px] px-[24px] align-middle text-[#222]">
                    Áp dụng trực tiếp
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px]">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-[500px] shadow-lg rounded-none z-10 flex flex-col">
            <div className="p-[16px] border-b-0 relative">
              <h5 className="font-bold text-center text-[20px] uppercase tracking-[1px] m-0 text-[#222]">
                Đổi mật khẩu
              </h5>
              <button
                className="absolute top-[16px] right-[16px] text-[#aaa] hover:text-[#222] text-[24px] leading-none"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="p-[24px] pt-[16px] sm:px-[48px] sm:pb-[48px]">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-[16px]">
                  <label className="text-[12px] text-[#6c6d70] font-bold block mb-[8px]">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full h-[40px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors"
                  />
                </div>
                <div className="mb-[16px]">
                  <label className="text-[12px] text-[#6c6d70] font-bold block mb-[8px]">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full h-[40px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors"
                  />
                </div>
                <div className="mb-[24px]">
                  <label className="text-[12px] text-[#6c6d70] font-bold block mb-[8px]">
                    Nhập lại Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-[40px] px-[15px] border border-[#e7e8e9] rounded-[4px] text-[14px] outline-none focus:border-[#222] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#222] text-white font-bold py-[12px] rounded-tl-[20px] rounded-br-[20px] hover:bg-white hover:text-[#222] border border-[#222] transition-colors uppercase text-[15px]"
                >
                  Cập nhật
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

