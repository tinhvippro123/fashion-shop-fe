"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { AddressDto } from "@/features/cart-and-order/types/order";
import {
  loadVnProvinces,
  loadVnDistricts,
  loadVnWards,
  VnProvince,
  VnDistrict,
  VnWard,
} from "@/shared/utils/vn-locations";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressDto | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiFetch<AddressDto[]>("/account/addresses");
      setAddresses(list);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<AddressDto[]>("/account/addresses")
      .then((list) => {
        if (active) setAddresses(list);
      })
      .catch(() => {
        if (active) setAddresses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await apiFetch(`/account/addresses/${id}`, { method: "DELETE" });
      toast.success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSetDefault = async (addr: AddressDto) => {
    try {
      await apiFetch(`/account/addresses/${addr.id}`, {
        method: "PUT",
        body: JSON.stringify({
          recipientName: addr.recipientName,
          phone: addr.phone,
          province: addr.province,
          district: addr.district,
          ward: addr.ward,
          streetAddress: addr.streetAddress,
          fullAddress: addr.fullAddress,
          isDefault: true,
        }),
      });
      toast.success("Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-[24px] pb-[4px]">
        <h5 className="font-bold uppercase mb-0 text-[18px] text-[#222]">
          SỔ ĐỊA CHỈ
        </h5>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#222] text-white font-medium py-[8px] px-[16px] flex items-center hover:bg-[#333] transition-colors"
          style={{ borderRadius: "15px 0 15px 0" }}
        >
          <i className="fas fa-plus-circle mr-[8px]"></i> THÊM ĐỊA CHỈ
        </button>
      </div>

      {loading ? (
        <div className="py-[48px] text-center text-[#6c6d70]">
          Đang tải sổ địa chỉ...
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-[48px] text-center text-[#6c6d70] border border-dashed border-[#e1e1e1] rounded-[12px]">
          Bạn chưa lưu địa chỉ giao hàng nào. Hãy nhấn &ldquo;THÊM ĐỊA
          CHỈ&rdquo; để tạo mới.
        </div>
      ) : (
        <div className="flex flex-wrap mx-[-15px]">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="w-full lg:w-1/2 px-[15px] mb-[24px]"
            >
              <div
                className="border border-[#e1e1e1] p-[24px] h-full relative bg-white flex flex-col"
                style={{ borderRadius: "40px 0 40px 0" }}
              >
                <div className="mb-[24px]">
                  <div className="flex justify-between items-center">
                    <h6 className="mb-0 text-[16px] font-medium text-[#111]">
                      {addr.recipientName}
                    </h6>

                    <div className="flex items-center shrink-0">
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-[#6c6d70] mr-[16px] text-[15px] hover:text-[#222]"
                      >
                        Xóa
                      </button>

                      <button
                        onClick={() => {
                          setEditingAddr(addr);
                          setIsEditModalOpen(true);
                        }}
                        className="text-[#222] mr-[16px] text-[15px] hover:underline"
                      >
                        Sửa
                      </button>

                      {addr.isDefault ? (
                        <span
                          className="bg-[#222] text-white text-[14px] px-[16px] py-[8px] cursor-default pointer-events-none"
                          style={{ borderRadius: "20px 0 20px 0" }}
                        >
                          Mặc định
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="border border-[#222] text-[#222] text-[14px] px-[16px] py-[8px] hover:bg-[#f8f9fa]"
                          style={{ borderRadius: "20px 0 20px 0" }}
                        >
                          Đặt mặc định
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[#555]">
                  <p className="mb-[8px] text-[15px]">
                    Điện thoại: &nbsp;<span>{addr.phone}</span>
                  </p>
                  <p className="mb-0 text-[15px]">
                    Địa chỉ: &nbsp;
                    <span>
                      {addr.fullAddress ||
                        [
                          addr.streetAddress,
                          addr.ward,
                          addr.district,
                          addr.province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddressModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm địa chỉ"
          onSubmit={async (payload) => {
            await apiFetch("/account/addresses", {
              method: "POST",
              body: JSON.stringify({
                ...payload,
                isDefault: addresses.length === 0 || payload.isDefault,
              }),
            });
            toast.success("Thêm địa chỉ thành công");
            setIsAddModalOpen(false);
            fetchAddresses();
          }}
        />
      )}

      {isEditModalOpen && editingAddr && (
        <AddressModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAddr(null);
          }}
          title="Sửa địa chỉ"
          initialData={editingAddr}
          onSubmit={async (payload) => {
            await apiFetch(`/account/addresses/${editingAddr.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            toast.success("Cập nhật địa chỉ thành công");
            setIsEditModalOpen(false);
            setEditingAddr(null);
            fetchAddresses();
          }}
        />
      )}
    </>
  );
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData?: AddressDto;
  onSubmit: (data: {
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    isDefault: boolean;
  }) => Promise<void>;
}

function AddressModal({
  isOpen,
  onClose,
  title,
  initialData,
  onSubmit,
}: AddressModalProps) {
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [saving, setSaving] = useState(false);

  const [recipientName, setRecipientName] = useState(
    initialData?.recipientName || ""
  );
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [district, setDistrict] = useState(initialData?.district || "");
  const [ward, setWard] = useState(initialData?.ward || "");
  const [streetAddress, setStreetAddress] = useState(
    initialData?.streetAddress || ""
  );
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);

  useEffect(() => {
    loadVnProvinces().then(async (pList) => {
      setProvinces(pList);
      if (initialData?.province) {
        const foundP = pList.find((p) => p.name === initialData.province);
        const dList = await loadVnDistricts(foundP?.code, initialData.province);
        setDistricts(dList);
        if (initialData.district) {
          const foundD = dList.find((d) => d.name === initialData.district);
          const wList = await loadVnWards(foundD?.code, initialData.district);
          setWards(wList);
        }
      }
    });
  }, [initialData]);

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const pName = e.target.value;
    const found = provinces.find((p) => p.name === pName);
    setProvince(pName);
    setDistrict("");
    setWard("");
    setWards([]);
    if (pName) {
      setDistricts(await loadVnDistricts(found?.code, pName));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const dName = e.target.value;
    const found = districts.find((d) => d.name === dName);
    setDistrict(dName);
    setWard("");
    if (dName) {
      setWards(await loadVnWards(found?.code, dName));
    } else {
      setWards([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const VN_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
    if (!VN_PHONE_REGEX.test(phone.trim())) {
      toast.error("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        province,
        district,
        ward,
        streetAddress: streetAddress.trim(),
        isDefault,
      });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto pt-[60px] pb-[60px]">
      <div className="bg-white w-full max-w-[800px] relative mx-[15px] my-auto">
        <div className="relative text-center border-b-0 pt-[24px]">
          <h4 className="font-bold uppercase text-[24px] text-[#222] m-0">
            {title}
          </h4>
          <button
            type="button"
            className="absolute right-[24px] top-[24px] text-[28px] leading-none text-[#000] opacity-50 hover:opacity-100"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="p-[32px] md:p-[48px]">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap mx-[-15px] mb-[16px]">
              <div className="w-full md:w-1/2 px-[15px] mb-[16px] md:mb-0">
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors placeholder-[#6c6d70]"
                  placeholder="Họ tên người nhận"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/2 px-[15px]">
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={11}
                  className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors placeholder-[#6c6d70]"
                  placeholder="Số điện thoại (10 chữ số)"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                />
              </div>
            </div>

            <div className="flex flex-wrap mx-[-15px] mb-[16px]">
              <div className="w-full md:w-1/2 px-[15px] mb-[16px] md:mb-0">
                <select
                  className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors bg-white"
                  required
                  value={province}
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
              <div className="w-full md:w-1/2 px-[15px]">
                <select
                  className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors bg-white"
                  required
                  value={district}
                  onChange={handleDistrictChange}
                >
                  <option value="">Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-[16px]">
              <select
                className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors bg-white"
                required
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                <option value="">Phường xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-[24px]">
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                className="w-full border-b border-[#e1e1e1] pb-[10px] pt-[10px] text-[#222] focus:border-[#222] outline-none transition-colors placeholder-[#6c6d70]"
                placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>

            <div className="flex items-center mb-[32px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-[8px] accent-[#222]"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span className="text-[#222]">Đặt làm mặc định</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#222] text-white py-[16px] font-bold hover:bg-[#333] transition-colors uppercase disabled:opacity-60"
              style={{ borderRadius: "15px 0" }}
            >
              {saving
                ? "ĐANG LƯU..."
                : initialData
                ? "SỬA ĐỊA CHỈ"
                : "THÊM ĐỊA CHỈ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

