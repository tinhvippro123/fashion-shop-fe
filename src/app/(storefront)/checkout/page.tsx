"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  useCartStore,
  getEffectiveUnitPrice,
} from "@/features/cart-and-order/stores/cart.store";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import {
  loadVnProvinces,
  loadVnDistricts,
  loadVnWards,
  VnProvince,
  VnDistrict,
  VnWard,
} from "@/shared/utils/vn-locations";
import {
  AddressDto,
  OrderResponseDto,
  ValidateVoucherResponse,
  VoucherDto,
} from "@/features/cart-and-order/types/order";
import VnPayInAppModal from "@/features/cart-and-order/components/checkout/VnPayInAppModal";

const emptySubscribe = () => () => { };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [submitting, setSubmitting] = useState(false);
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [vnPayModalData, setVnPayModalData] = useState<{
    orderCode: string;
    totalAmount: number;
    paymentUrl?: string | null;
  } | null>(null);

  // Vouchers
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherDto[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Saved Addresses (when authenticated)
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(
    null
  );
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showSelectAddressModal, setShowSelectAddressModal] = useState(false);

  // Guest Shipping Fields
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");

  // Add Address Modal Fields
  const [modalDistricts, setModalDistricts] = useState<VnDistrict[]>([]);
  const [modalWards, setModalWards] = useState<VnWard[]>([]);
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalProvince, setModalProvince] = useState("");
  const [modalDistrict, setModalDistrict] = useState("");
  const [modalWard, setModalWard] = useState("");
  const [modalStreet, setModalStreet] = useState("");
  const [modalDefault, setModalDefault] = useState(false);

  // Payment Method (COD, VNPAY)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "COD" | "VNPAY"
  >("COD");

  const fetchUserAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const list = await apiFetch<AddressDto[]>("/account/addresses");
      setAddresses(list);
      if (list.length > 0) {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddress((prev) => prev || def);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadVnProvinces().then(setProvinces);
    apiFetch<VoucherDto[]>("/catalog/vouchers/active")
      .then(setAvailableVouchers)
      .catch(() => setAvailableVouchers([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    apiFetch<AddressDto[]>("/account/addresses")
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddress((prev) => prev || def);
        }
      })
      .catch(() => {
        // ignore
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      if (!receiverName && (user.fullName || user.name)) {
        setReceiverName(user.fullName || user.name || "");
      }
      if (!receiverPhone && user.phone) {
        setReceiverPhone(user.phone);
      }
    }
  }, [user, receiverName, receiverPhone]);

  useEffect(() => {
    if (showAddAddressModal && user) {
      if (!modalName && (user.fullName || user.name)) {
        setModalName(user.fullName || user.name || "");
      }
      if (!modalPhone && user.phone) {
        setModalPhone(user.phone);
      }
    }
  }, [showAddAddressModal, user, modalName, modalPhone]);

  const submitFinalOrder = useCallback(async () => {
    if (submitting) return;
    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      router.push("/cart");
      return;
    }

    let finalName = "";
    let finalPhone = "";
    let finalAddress = "";

    if (isAuthenticated && selectedAddress) {
      finalName = selectedAddress.recipientName;
      finalPhone = selectedAddress.phone;
      finalAddress =
        selectedAddress.fullAddress ||
        [
          selectedAddress.streetAddress,
          selectedAddress.ward,
          selectedAddress.district,
          selectedAddress.province,
        ]
          .filter(Boolean)
          .join(", ");
    } else {
      finalName = receiverName.trim() || user?.name || "";
      finalPhone = receiverPhone.trim() || user?.phone || "";
      finalAddress = [
        street.trim(),
        selectedWard,
        selectedDistrict,
        selectedProvince,
      ]
        .filter(Boolean)
        .join(", ");
    }

    if (!finalName || !finalPhone || !finalAddress) {
      toast.error("Vui lòng chọn hoặc nhập đầy đủ địa chỉ giao hàng");
      if (isAuthenticated && addresses.length === 0) {
        setShowAddAddressModal(true);
      }
      return;
    }

    const VN_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
    if (!VN_PHONE_REGEX.test(finalPhone.trim())) {
      toast.error("Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09)");
      return;
    }

    // Tự động kiểm tra và áp dụng mã giảm giá nếu khách đã điền vào ô nhưng chưa bấm "ÁP DỤNG"
    let activeVoucherCode = appliedVoucher?.code;
    const pendingVoucher = voucherCode.trim().toUpperCase();
    if (pendingVoucher && (!appliedVoucher || appliedVoucher.code !== pendingVoucher)) {
      try {
        const res = await apiFetch<ValidateVoucherResponse>(
          "/catalog/vouchers/validate",
          {
            method: "POST",
            body: JSON.stringify({
              code: pendingVoucher,
              subtotal: totalAmount,
            }),
          }
        );
        activeVoucherCode = res.code;
        setVoucherCode(res.code);
        setAppliedVoucher({
          code: res.code,
          discount: Number(res.discountAmount),
        });
        toast.success(`Đã tự động áp dụng mã ${res.code} (-${formatPrice(Number(res.discountAmount))})!`);
      } catch {
        toast.error(`Mã giảm giá "${pendingVoucher}" không hợp lệ hoặc chưa đạt điều kiện đơn hàng. Vui lòng kiểm tra lại!`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const created = await apiFetch<OrderResponseDto>("/orders", {
        method: "POST",
        body: JSON.stringify({
          recipientName: finalName,
          recipientPhone: finalPhone,
          recipientEmail: user?.email || undefined,
          shippingAddress: finalAddress,
          paymentMethod: selectedPaymentMethod,
          voucherCode: activeVoucherCode || undefined,
          note: note.trim() || undefined,
          items: items.map((item) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
          })),
        }),
      });
      clearCart();
      if (isAuthenticated && user && !user.phone && finalPhone) {
        setUser({ ...user, phone: finalPhone });
      }
      if (selectedPaymentMethod === "VNPAY") {
        setVnPayModalData({
          orderCode: created.orderCode || "",
          totalAmount: created.totalAmount || totalPrice,
          paymentUrl: created.paymentUrl,
        });
        setShowVnPayModal(true);
        setSubmitting(false);
        return;
      }
      toast.success("Đặt hàng thành công!");
      router.push(
        `/order-success?code=${encodeURIComponent(created.orderCode || "")}`
      );
    } catch (err) {
      toast.error((err as Error).message);
      setSubmitting(false);
    }
  }, [
    submitting,
    items,
    totalPrice,
    isAuthenticated,
    selectedAddress,
    receiverName,
    receiverPhone,
    user,
    street,
    selectedWard,
    selectedDistrict,
    selectedProvince,
    selectedPaymentMethod,
    appliedVoucher,
    note,
    clearCart,
    router,
  ]);

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = e.target.options[e.target.selectedIndex]?.dataset?.code;
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
    if (val) {
      const d = await loadVnDistricts(code, val);
      setDistricts(d);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = e.target.options[e.target.selectedIndex]?.dataset?.code;
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedWard("");
    if (val) {
      const w = await loadVnWards(code, val);
      setWards(w);
    } else {
      setWards([]);
    }
  };

  const handleModalProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    const found = provinces.find((p) => p.name === val);
    setModalProvince(val);
    setModalDistrict("");
    setModalWard("");
    setModalWards([]);
    if (val) {
      const d = await loadVnDistricts(found?.code, val);
      setModalDistricts(d);
    } else {
      setModalDistricts([]);
    }
  };

  const handleModalDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    const found = modalDistricts.find((d) => d.name === val);
    setModalDistrict(val);
    setModalWard("");
    if (val) {
      const w = await loadVnWards(found?.code, val);
      setModalWards(w);
    } else {
      setModalWards([]);
    }
  };

  const handleSaveNewAddress = async () => {
    if (
      !modalName.trim() ||
      !modalPhone.trim() ||
      !modalProvince ||
      !modalDistrict ||
      !modalWard ||
      !modalStreet.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }
    const VN_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
    if (!VN_PHONE_REGEX.test(modalPhone.trim())) {
      toast.error("Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09)");
      return;
    }
    try {
      const created = await apiFetch<AddressDto>("/account/addresses", {
        method: "POST",
        body: JSON.stringify({
          recipientName: modalName.trim(),
          phone: modalPhone.trim(),
          province: modalProvince,
          district: modalDistrict,
          ward: modalWard,
          streetAddress: modalStreet.trim(),
          isDefault: modalDefault || addresses.length === 0,
        }),
      });
      await fetchUserAddresses();
      setSelectedAddress(created);
      if (user && !user.phone && modalPhone.trim()) {
        setUser({ ...user, phone: modalPhone.trim() });
      }
      setShowAddAddressModal(false);
      setModalName("");
      setModalPhone("");
      setModalProvince("");
      setModalDistrict("");
      setModalWard("");
      setModalDistricts([]);
      setModalWards([]);
      setModalStreet("");
      setModalDefault(false);
      toast.success("Thêm địa chỉ thành công");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!isMounted) return null;

  const totalAmount = totalPrice;
  const shippingFee = items.length > 0 ? 30000 : 0;

  let finalTotal = totalAmount + shippingFee;
  if (appliedVoucher) {
    finalTotal -= appliedVoucher.discount;
  }
  finalTotal = Math.max(0, finalTotal);

  const applyVoucherCode = async (codeToValidate: string) => {
    const trimmed = codeToValidate.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      const res = await apiFetch<ValidateVoucherResponse>(
        "/catalog/vouchers/validate",
        {
          method: "POST",
          body: JSON.stringify({
            code: trimmed,
            subtotal: totalAmount,
          }),
        }
      );
      setVoucherCode(res.code);
      setAppliedVoucher({
        code: res.code,
        discount: Number(res.discountAmount),
      });
      setShowVoucherModal(false);
      toast.success(`Áp dụng mã ${res.code} thành công!`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Estimated delivery date (+3 days)
  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 3);
  const expectedDeliveryStr = expectedDelivery.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="pb-[80px]">
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-4">
        {/* 3-Step Progress Bar matching Cart & Order Success */}
        <div className="max-w-[800px] mx-auto px-[20px] md:px-[40px]">
          <div className="flex justify-between relative mb-[40px] md:mb-[50px] mt-[20px] md:mt-[30px]">
            <div className="absolute top-[5px] md:top-[7px] left-[50px] right-[50px] h-[2px] bg-[#e0e0e0] z-[1]"></div>
            <div className="absolute top-[5px] md:top-[7px] left-[50px] w-[calc((100%-100px)/2)] h-[2px] bg-[#222] z-[1]"></div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#333] bg-white px-1">
                Giỏ hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] font-medium text-[#222] bg-white px-1">
                Đặt hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-white border-[2px] border-[#e0e0e0] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#999] bg-white px-1">
                Hoàn thành đơn
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (items.length === 0) {
              toast.error("Giỏ hàng của bạn đang trống");
              return;
            }
            if (isAuthenticated && !selectedAddress) {
              toast.error("Vui lòng thêm địa chỉ giao hàng trước khi đặt đơn");
              setShowAddAddressModal(true);
              return;
            }
            submitFinalOrder();
          }}
        >
          <div className="flex flex-col lg:flex-row -mx-[15px]">
            {/* Left Column: Checkout Form */}
            <div className="w-full flex-1 px-[15px]">
              <div className="flex flex-col lg:flex-row -mx-[15px]">
                {/* Shipping Address */}
                <div className="w-full lg:w-[58.333333%] px-[15px] mb-4">
                  <h5 className="font-bold text-[20px] mb-4">
                    Địa chỉ giao hàng
                  </h5>

                  {isAuthenticated ? (
                    <>
                      {selectedAddress ? (
                        <div className="border border-[#eaeaea] rounded-tl-[30px] rounded-br-[30px] p-[25px] mb-[20px] relative shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-bold text-[16px] text-[#333]">
                              {selectedAddress.recipientName}
                            </div>
                            <div className="flex items-center gap-[15px]">
                              {addresses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowSelectAddressModal(true);
                                  }}
                                  className="text-[#888] text-[13px] underline hover:text-[#222]"
                                >
                                  Chọn địa chỉ khác
                                </button>
                              )}
                              {selectedAddress.isDefault && (
                                <span className="bg-[#222] text-white text-[10px] font-bold px-[12px] py-[4px] rounded-tl-[10px] rounded-br-[10px] uppercase tracking-[1px]">
                                  MẶC ĐỊNH
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[14px] text-[#666] mb-2">
                            Điện thoại: {selectedAddress.phone}
                          </div>
                          <div className="text-[14px] text-[#666]">
                            Địa chỉ:{" "}
                            {selectedAddress.fullAddress ||
                              [
                                selectedAddress.streetAddress,
                                selectedAddress.ward,
                                selectedAddress.district,
                                selectedAddress.province,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#ccc] rounded-tl-[20px] rounded-br-[20px] p-[20px] mb-[20px] text-[14px] text-[#666]">
                          Bạn chưa có địa chỉ giao hàng nào trong sổ địa chỉ.
                          Vui lòng nhấn &ldquo;+ THÊM ĐỊA CHỈ&rdquo; bên dưới.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(true)}
                        className="bg-[#222] text-white text-[13px] font-bold px-[20px] py-[12px] rounded-tl-[15px] rounded-br-[15px] hover:bg-black transition-colors uppercase tracking-[1px]"
                      >
                        + THÊM ĐỊA CHỈ
                      </button>

                      <div className="mt-4">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] py-[10px] h-[80px] text-[14px] outline-none focus:border-[#222] transition-colors resize-none"
                          placeholder="Ghi chú đơn hàng (Tùy chọn)"
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-[15px] mb-[30px]">
                        <Link
                          href="/login"
                          className="flex-1 py-[15px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-[#222] text-white rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors"
                        >
                          ĐĂNG NHẬP
                        </Link>
                        <Link
                          href="/register"
                          className="flex-1 py-[15px] text-center font-bold text-[14px] tracking-[1px] uppercase bg-white text-[#222] border border-[#222] rounded-tl-[20px] rounded-br-[20px] hover:bg-[#f9f9f9] transition-colors"
                        >
                          ĐĂNG KÝ
                        </Link>
                      </div>
                      <p className="text-[13px] text-[#6c757d] mb-4">
                        Đăng nhập/Đăng ký tài khoản để lưu lịch sử đơn hàng và
                        nhận thêm nhiều ưu đãi.
                      </p>

                      <div className="mb-3 mt-3 font-bold">
                        <i className="fas fa-check-circle mr-1"></i> Địa chỉ
                        nhận hàng
                      </div>

                      <div className="flex flex-col md:flex-row gap-[15px] mb-3">
                        <input
                          type="text"
                          name="receiverName"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className="w-full md:w-1/2 border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] py-[10px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                          placeholder="Họ tên"
                          required
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                          className="w-full md:w-1/2 border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] py-[10px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                          placeholder="Số điện thoại (10 số, VD: 0901234567)"
                          maxLength={11}
                          required
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-[15px] mb-3">
                        <select
                          name="province"
                          value={selectedProvince}
                          onChange={handleProvinceChange}
                          className="w-full md:w-1/2 border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white"
                          required
                        >
                          <option value="">Tỉnh/Thành phố</option>
                          {provinces.map((p) => (
                            <option
                              key={p.code}
                              value={p.name}
                              data-code={p.code}
                            >
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="district"
                          value={selectedDistrict}
                          onChange={handleDistrictChange}
                          className="w-full md:w-1/2 border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white"
                          required
                        >
                          <option value="">Quận/Huyện</option>
                          {districts.map((d) => (
                            <option
                              key={d.code}
                              value={d.name}
                              data-code={d.code}
                            >
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <select
                          name="ward"
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className="w-full border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white"
                          required
                        >
                          <option value="">Phường xã</option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.name}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <input
                          type="text"
                          name="street"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] py-[10px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                          placeholder="Địa chỉ (Ví dụ: 123 đường Lê Lợi)"
                          required
                        />
                      </div>

                      <div className="mt-3">
                        <textarea
                          name="note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full border border-[#ddd] rounded-tl-[4px] rounded-br-[4px] px-[15px] py-[10px] h-[80px] text-[14px] outline-none focus:border-[#222] transition-colors resize-none"
                          placeholder="Ghi chú thêm (Tùy chọn)"
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="w-full lg:w-[41.666667%] px-[15px] mb-4">
                  <h5 className="font-bold text-[20px] mb-[20px]">
                    Phương thức giao hàng
                  </h5>

                  <div className="bg-white border border-[#eaeaea] rounded-tl-[30px] rounded-br-[30px] p-[30px]">
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer mb-0">
                        <div className="relative w-[18px] h-[18px] mr-[12px] flex-shrink-0 mt-[2px]">
                          <input
                            type="radio"
                            name="shippingMethod"
                            defaultChecked
                            className="peer appearance-none w-full h-full border border-[#ccc] rounded-full checked:bg-[#222] checked:border-[#222] cursor-pointer transition-colors m-0"
                          />
                          <svg
                            className="absolute top-[4px] left-[4px] w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#333] text-[15px] font-medium block">
                            Giao hàng tiêu chuẩn LUXE Express
                          </span>
                          <span className="text-[#888] text-[13px] block mt-1">
                            Thời gian giao hàng dự kiến: {expectedDeliveryStr}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <h5 className="font-bold text-[20px] mb-3">
                  Phương thức thanh toán
                </h5>

                <div className="bg-white border border-[#eaeaea] rounded-tl-[30px] rounded-br-[30px] p-[30px]">
                  <div className="mb-[24px] flex items-start">
                    <div className="relative w-[18px] h-[18px] mr-[12px] flex-shrink-0 mt-[2px]">
                      <input
                        type="radio"
                        id="pay-cod"
                        name="paymentMethod"
                        value="COD"
                        checked={selectedPaymentMethod === "COD"}
                        onChange={() => setSelectedPaymentMethod("COD")}
                        className="peer appearance-none w-full h-full border border-[#ccc] rounded-full checked:bg-[#222] checked:border-[5px] cursor-pointer transition-all m-0"
                      />
                    </div>
                    <label
                      htmlFor="pay-cod"
                      className="cursor-pointer text-[#333] text-[15px] flex flex-col items-start w-full"
                    >
                      <span className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className="text-[13px] text-[#888] mt-1">
                        Quý khách kiểm tra và thanh toán tiền mặt trực tiếp cho
                        nhân viên giao hàng.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-start">
                    <div className="relative w-[18px] h-[18px] mr-[12px] flex-shrink-0 mt-[2px]">
                      <input
                        type="radio"
                        id="pay-vnpay"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={selectedPaymentMethod === "VNPAY"}
                        onChange={() => setSelectedPaymentMethod("VNPAY")}
                        className="peer appearance-none w-full h-full border border-[#ccc] rounded-full checked:bg-[#222] checked:border-[5px] cursor-pointer transition-all m-0"
                      />
                    </div>
                    <label
                      htmlFor="pay-vnpay"
                      className="cursor-pointer text-[#333] text-[15px] flex flex-col items-start w-full"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Cổng thanh toán điện tử VNPay
                        </span>
                      </div>
                      <span className="text-[13px] text-[#888] mt-1">
                        Thanh toán trực tuyến bảo mật: Quét mã VNPAY-QR, Thẻ ATM nội địa (NCB), Thẻ quốc tế Visa/MasterCard.
                      </span>

                      {selectedPaymentMethod === "VNPAY" && (
                        <div className="mt-3 w-full bg-[#f0f7ff] border border-[#b9d9eb] rounded-[6px] p-[14px] text-[13px] text-[#004085]">
                          <div className="font-semibold mb-1 flex items-center gap-1.5">
                            <i className="fas fa-shield-alt text-[#005baa]"></i>
                            Cổng thanh toán điện tử VNPay
                          </div>
                          <div>
                            Sau khi bấm &quot;HOÀN THÀNH ĐẶT HÀNG&quot;, hệ thống sẽ chuyển sang cổng bảo mật VNPay để bạn quét mã VNPAY-QR bằng App ngân hàng hoặc thanh toán qua thẻ ATM / Visa / MasterCard.
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Show items in cart */}
              <div className="mt-[30px] mb-[20px]">
                <details className="group">
                  <summary className="inline-flex items-center justify-center cursor-pointer list-none font-semibold text-[14px] tracking-[1px] bg-[#222] text-white px-[30px] py-[15px] rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors uppercase">
                    HIỂN THỊ SẢN PHẨM
                  </summary>

                  <div className="mt-[30px]">
                    <h4 className="font-bold text-[24px] mb-[20px]">
                      Giỏ hàng của bạn
                    </h4>

                    <div className="hidden xl:flex items-center pb-[20px] border-b border-[#eee] font-semibold text-[12px] text-[#6c6d70] uppercase">
                      <div className="flex-1">TÊN SẢN PHẨM</div>
                      <div className="w-[120px] text-center">CHIẾT KHẤU</div>
                      <div className="w-[150px] text-center">SỐ LƯỢNG</div>
                      <div className="w-[120px] text-left pl-[20px]">
                        TỔNG TIỀN
                      </div>
                    </div>

                    <div>
                      {items.map((item, index) => {
                        const hasDiscount =
                          item.product.discountPercent &&
                          item.product.discountPercent > 0;
                        const unitPrice = getEffectiveUnitPrice(item);
                        const baseItemPrice = Number(
                          item.variant?.price || item.product.basePrice || 0
                        );
                        const discountAmount = hasDiscount
                          ? baseItemPrice - unitPrice
                          : 0;
                        const lineTotal = unitPrice * item.quantity;

                        return (
                          <div
                            key={index}
                            className="flex relative items-stretch border-b border-[#eee] py-[20px] last:border-b-0"
                          >
                            <div className="w-[90px] h-[129px] xl:w-[150px] xl:h-[215px] mr-[15px] xl:mr-[30px] flex-shrink-0 bg-[#f8f9fa]">
                              {item.color.images &&
                                item.color.images.length > 0 ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={resolveImageUrl(
                                    item.color.images[0].imageUrl
                                  )}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-[150px] xl:min-w-[200px] pt-[5px] xl:pt-[10px] pr-[10px] xl:pr-0">
                              <div>
                                <h6 className="font-normal text-[#373737] text-[14px] xl:text-[16px] leading-[22px] xl:leading-[24px] mb-[5px]">
                                  {item.product.name}
                                </h6>
                                <div className="text-[13px] xl:text-[14px] text-[#6c6d70] mb-[10px]">
                                  Màu sắc: <span>{item.color.color.name}</span>{" "}
                                  &nbsp;&nbsp; Size:{" "}
                                  <span>{item.variant.size.name}</span>
                                </div>
                              </div>

                              <div className="xl:hidden mt-[15px] flex justify-between items-end">
                                <div>
                                  {hasDiscount ? (
                                    <div className="flex flex-col">
                                      <span className="text-[14px] text-[#666]">
                                        -{formatPrice(discountAmount)}
                                      </span>
                                      <span className="text-[13px] font-bold text-[#dc3545] mt-[2px]">
                                        ( -{item.product.discountPercent || 0}% )
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="flex items-center justify-center w-[80px] h-[36px] border border-[#e5e5e5] rounded-tl-[15px] rounded-br-[15px] bg-white">
                                  <span className="text-[14px] text-[#333] font-normal">
                                    {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="w-[120px] text-center hidden xl:block pt-[10px]">
                              {hasDiscount ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-[14px] text-[#666]">
                                    -{formatPrice(discountAmount)}
                                  </span>
                                  <span className="text-[13px] font-bold text-[#dc3545] mt-[2px]">
                                    ( -{item.product.discountPercent || 0}% )
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#999]">-</span>
                              )}
                            </div>

                            <div className="hidden xl:flex w-[150px] justify-center pt-[10px]">
                              <div className="flex items-center justify-center w-[120px] h-[40px] border border-[#e5e5e5] rounded-tl-[15px] rounded-br-[15px] bg-white">
                                <span className="text-[15px] text-[#222] font-normal">
                                  {item.quantity}
                                </span>
                              </div>
                            </div>

                            <div className="hidden xl:block w-[120px] text-left pl-[20px] pt-[10px]">
                              <span className="font-bold text-[#222] text-[16px]">
                                {formatPrice(lineTotal)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[420px] lg:min-w-[420px] px-[15px] lg:px-0 lg:ml-[3rem] mt-[40px] lg:mt-0 flex-shrink-0">
              <div className="bg-[#f7f8f9] p-[22px] rounded-[4px] lg:sticky lg:top-[100px] w-full">
                <div className="text-[20px] md:text-[22px] font-normal text-[#222] mb-[20px]">
                  Tóm tắt đơn hàng
                </div>

                <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                  <span>Tổng tiền hàng</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#6c6d70] leading-[24px]">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>

                {/* Voucher Input */}
                <div className="mt-[20px] mb-[15px]">
                  <div className="flex justify-between items-center mb-[8px]">
                    <div className="font-bold text-[14px] text-[#222]">
                      Mã giảm giá / Voucher
                    </div>
                    <div className="flex items-center">
                      <div className="w-[1px] h-[14px] bg-[#e1e1e1] mx-[10px]"></div>
                      <button
                        type="button"
                        onClick={() => setShowVoucherModal(true)}
                        className="text-[#6c6d70] text-[13px] hover:text-[#222] transition-colors bg-transparent border-none cursor-pointer p-0 font-normal"
                      >
                        Mã của tôi ({availableVouchers.length})
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-[10px]">
                    <input
                      type="text"
                      autoComplete="off"
                      value={voucherCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setVoucherCode(val);
                        if (appliedVoucher && val !== appliedVoucher.code) {
                          setAppliedVoucher(null);
                        }
                      }}
                      placeholder="Nhập mã giảm giá..."
                      className="flex-1 h-[45px] px-[15px] border border-[#e1e1e1] rounded-[4px] text-[14px] outline-none focus:border-[#222] bg-white font-mono uppercase"
                    />
                    <button
                      onClick={() => applyVoucherCode(voucherCode)}
                      type="button"
                      className={`px-[20px] h-[45px] font-bold text-[14px] rounded-tl-[20px] rounded-br-[20px] transition-colors whitespace-nowrap uppercase cursor-pointer ${
                        appliedVoucher && appliedVoucher.code === voucherCode.trim().toUpperCase()
                          ? "bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700"
                          : "bg-white text-[#222] border border-[#222] hover:bg-[#f9f9f9]"
                      }`}
                    >
                      {appliedVoucher && appliedVoucher.code === voucherCode.trim().toUpperCase() ? (
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-check"></i> ĐÃ ÁP DỤNG
                        </span>
                      ) : (
                        "ÁP DỤNG"
                      )}
                    </button>
                  </div>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between items-center mb-[15px] text-[15px] text-[#28a745] leading-[24px] font-medium">
                    <span>
                      Mã giảm giá ({appliedVoucher.code}){" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCode("");
                        }}
                        className="text-[#dc3545] text-[12px] underline ml-1"
                      >
                        Bỏ chọn
                      </button>
                    </span>
                    <span>-{formatPrice(appliedVoucher.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-[15px] border-t border-[#e1e1e1] text-[16px] text-[#6c6d70] leading-[24px]">
                  <span>Tiền thanh toán</span>
                  <span className="font-bold text-[#000]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="block w-full bg-[#222] text-white text-center py-[15px] font-bold text-[16px] uppercase tracking-[1px] rounded-tl-[20px] rounded-br-[20px] hover:bg-black transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "ĐANG XỬ LÝ..." : "HOÀN THÀNH ĐẶT HÀNG"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-[15px]"
          onClick={() => setShowVoucherModal(false)}
        >
          <div
            className="bg-white w-full max-w-[600px] rounded-[4px] overflow-hidden flex flex-col shadow-2xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-[20px] border-b border-[#e1e1e1]">
              <h3 className="font-bold text-[16px] text-[#222] m-0">
                Danh sách mã Voucher khả dụng
              </h3>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="text-[#666] hover:text-[#222] bg-transparent border-none cursor-pointer text-[20px]"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-[20px] overflow-y-auto space-y-[12px]">
              {availableVouchers.length === 0 ? (
                <div className="text-[#6c6d70] text-[14px] py-[10px]">
                  Hiện chưa có mã giảm giá nào đang hoạt động.
                </div>
              ) : (
                availableVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="border border-[#e1e1e1] rounded-[6px] p-[16px] flex justify-between items-center gap-[15px] hover:border-[#222] transition-colors"
                  >
                    <div>
                      <div className="font-bold text-[15px] text-[#222]">
                        {v.code}{" "}
                        <span className="font-normal text-[#dc3545]">
                          (-{v.discountAmount})
                        </span>
                      </div>
                      <div className="text-[13px] text-[#666] mt-1">
                        {v.name} • Đơn tối thiểu: {v.minOrderValue}
                      </div>
                      <div className="text-[12px] text-[#999] mt-1">
                        Hiệu lực: {v.duration}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyVoucherCode(v.code)}
                      className="bg-[#222] text-white text-[12px] font-bold px-[16px] py-[10px] rounded-tl-[12px] rounded-br-[12px] uppercase shrink-0 hover:bg-black"
                    >
                      Dùng ngay
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-[15px]"
          onClick={() => setShowAddAddressModal(false)}
        >
          <div
            className="bg-white w-full max-w-[700px] rounded-[8px] overflow-hidden flex flex-col shadow-2xl relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              className="absolute top-[20px] right-[20px] text-[#666] hover:text-[#222] bg-transparent border-none cursor-pointer text-[20px] z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="p-[30px] md:p-[40px]">
              <h3 className="font-bold text-[24px] text-[#222] text-center uppercase tracking-[1px] mb-[40px]">
                Thêm địa chỉ
              </h3>

              <div className="flex flex-col md:flex-row gap-[20px] mb-[20px]">
                <input
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="Họ tên người nhận"
                  className="w-full md:w-1/2 border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                />
                <input
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  placeholder="Số điện thoại (10 số, VD: 0901234567)"
                  maxLength={11}
                  className="w-full md:w-1/2 border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-[20px] mb-[20px]">
                <div className="w-full md:w-1/2 relative">
                  <select
                    value={modalProvince}
                    onChange={handleModalProvinceChange}
                    className="w-full border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white text-[#222]"
                  >
                    <option value="">Chọn Tỉnh/Tp</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-1/2 relative">
                  <select
                    value={modalDistrict}
                    onChange={handleModalDistrictChange}
                    className="w-full border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white text-[#222]"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {modalDistricts.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-[20px] relative">
                <select
                  value={modalWard}
                  onChange={(e) => setModalWard(e.target.value)}
                  className="w-full border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors bg-white text-[#222]"
                >
                  <option value="">Chọn Phường/xã</option>
                  {modalWards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-[25px]">
                <input
                  type="text"
                  value={modalStreet}
                  onChange={(e) => setModalStreet(e.target.value)}
                  placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
                  className="w-full border border-[#e1e1e1] rounded-[4px] px-[15px] h-[45px] text-[14px] outline-none focus:border-[#222] transition-colors"
                />
              </div>

              <div className="mb-[30px]">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalDefault}
                    onChange={(e) => setModalDefault(e.target.checked)}
                    className="mr-[10px] accent-[#222]"
                  />
                  <span className="text-[#333] text-[14px]">
                    Đặt làm mặc định
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveNewAddress}
                className="w-full bg-[#222] text-white text-[14px] font-bold py-[15px] rounded-[4px] uppercase tracking-[1px] hover:bg-black transition-colors"
              >
                THÊM ĐỊA CHỈ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Address Modal */}
      {showSelectAddressModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-[15px]"
          onClick={() => setShowSelectAddressModal(false)}
        >
          <div
            className="bg-white w-full max-w-[700px] rounded-[8px] overflow-hidden flex flex-col shadow-2xl relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-[30px]">
              <div className="flex justify-between items-center mb-[30px]">
                <h3 className="font-medium text-[18px] text-[#333]">
                  Chọn địa chỉ
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSelectAddressModal(false)}
                  className="text-[#999] hover:text-[#222] bg-transparent border-none cursor-pointer text-[20px]"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="flex flex-col gap-[20px]">
                {addresses.map((addr) => {
                  const active = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowSelectAddressModal(false);
                      }}
                      className={`border ${active ? "border-[#4CAF50]" : "border-[#e1e1e1]"
                        } rounded-tl-[30px] rounded-br-[30px] p-[25px] relative cursor-pointer hover:border-[#4CAF50] hover:bg-[#fcfcfc] transition-colors`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-[16px] text-[#333]">
                          {addr.recipientName}
                        </div>
                        {addr.isDefault && (
                          <span className="bg-[#222] text-white text-[10px] font-bold px-[12px] py-[4px] rounded-tl-[10px] rounded-br-[10px] uppercase tracking-[1px]">
                            MẶC ĐỊNH
                          </span>
                        )}
                      </div>
                      <div className="text-[14px] text-[#666] mb-2">
                        Điện thoại: {addr.phone}
                      </div>
                      <div className="text-[14px] text-[#666]">
                        Địa chỉ:{" "}
                        {addr.fullAddress ||
                          [
                            addr.streetAddress,
                            addr.ward,
                            addr.district,
                            addr.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVnPayModal && vnPayModalData && (
        <VnPayInAppModal
          isOpen={showVnPayModal}
          orderCode={vnPayModalData.orderCode}
          totalAmount={vnPayModalData.totalAmount}
          paymentUrl={vnPayModalData.paymentUrl}
          onSuccess={() => {
            setShowVnPayModal(false);
            router.push(
              `/order-success?code=${encodeURIComponent(vnPayModalData.orderCode)}`
            );
          }}
          onClose={() => {
            setShowVnPayModal(false);
            toast.warning(
              `Đơn hàng #${vnPayModalData.orderCode} đã được tạo ở trạng thái "Chờ thanh toán VNPay".`
            );
            router.push(
              `/order-success?code=${encodeURIComponent(vnPayModalData.orderCode)}&payment=unpaid`
            );
          }}
        />
      )}
    </div>
  );
}
