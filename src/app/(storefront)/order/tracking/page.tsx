"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuẩn bị hàng",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Giao thành công",
  CANCELLED: "Đã hủy đơn hàng",
};

const STEP_ORDER = ["PENDING", "PROCESSING", "SHIPPING", "COMPLETED"];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [orderId, setOrderId] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResponseDto | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        orderCode: orderId.trim(),
      });
      if (phone.trim()) qs.set("phone", phone.trim());
      const res = await apiFetch<OrderResponseDto>(
        `/orders/track?${qs.toString()}`
      );
      setOrder(res);
    } catch (err) {
      setOrder(null);
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const activeStepIdx = order
    ? order.status === "CANCELLED"
      ? 0
      : Math.max(0, STEP_ORDER.indexOf(order.status))
    : 0;

  return (
    <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-[40px] mb-[60px] font-['Montserrat',sans-serif]">
      {/* Form Section */}
      <div className="flex justify-center mb-[40px]">
        <div className="w-full max-w-[500px]">
          <h2 className="font-semibold text-[24px] text-center mb-[40px] text-[#222] uppercase">
            Tra cứu đơn hàng
          </h2>
          <form onSubmit={handleSearch}>
            <div className="flex items-center mb-[20px]">
              <label className="w-[130px] text-[14px] text-[#6c6d70]">
                Mã đơn <span className="text-[#ff0000]">*</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 h-[48px] border border-[#e1e1e1] px-[15px] rounded-[4px] outline-none focus:border-[#222] text-[14px] text-[#222] transition-colors"
                placeholder="Ví dụ: ORD-261029-1001"
                required
              />
            </div>
            <div className="flex items-center mb-[30px]">
              <label className="w-[130px] text-[14px] text-[#6c6d70]">
                Số điện thoại <span className="text-[#ff0000]">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-[48px] border border-[#e1e1e1] px-[15px] rounded-[4px] outline-none focus:border-[#222] text-[14px] text-[#222] transition-colors"
                placeholder="Nhập SĐT nhận hàng"
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#222] text-white px-[40px] py-[12px] text-[14px] font-medium uppercase hover:bg-white hover:text-[#222] border border-[#222] transition-colors disabled:opacity-60"
                style={{ borderRadius: "20px 0 20px 0", letterSpacing: "0.5px" }}
              >
                {loading ? "Đang tra cứu..." : "Tra cứu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Result Section */}
      {order && (
        <div className="pt-[40px] animate-fade-in">
          <div className="flex justify-between items-center mb-[20px] gap-[10px]">
            <h3 className="text-[15px] md:text-[20px] font-semibold text-[#222] uppercase mb-0 whitespace-nowrap">
              Theo dõi đơn hàng #{order.orderCode}
            </h3>
            <span className="text-[#222] font-medium text-[12px] md:text-[14px] flex items-center whitespace-nowrap">
              <i className="fas fa-sync-alt mr-[4px] md:mr-[8px]"></i>{" "}
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px]">
            {/* Left Column */}
            <div className="flex-1 overflow-hidden">
              {/* Horizontal Progress Bar */}
              <div
                className="mb-[50px] border border-[#e1e1e1] px-[15px] lg:px-[40px] py-[30px]"
                style={{ borderRadius: "20px 0 20px 0" }}
              >
                <div className="w-full relative">
                  <div className="absolute top-[6px] left-[7px] right-[7px] h-[2px] bg-[#e1e1e1] z-[1]"></div>

                  <div className="flex justify-between relative z-[2] h-[55px]">
                    {order.status === "CANCELLED" ? (
                      <>
                        <div className="relative w-[14px]">
                          <div className="w-[14px] h-[14px] rounded-full bg-[#222] mx-auto"></div>
                          <div className="text-[12px] text-[#6c6d70] text-left leading-tight absolute top-[25px] left-[-5px] w-max">
                            Đơn hàng đã đặt
                          </div>
                        </div>
                        <div className="relative w-[14px]">
                          <div className="w-[14px] h-[14px] rounded-full bg-[#dc3545] mx-auto"></div>
                          <div className="text-[12px] text-[#dc3545] font-semibold text-right leading-tight absolute top-[25px] right-[-5px] w-max">
                            Đã hủy
                          </div>
                        </div>
                      </>
                    ) : (
                      [
                        { key: "PENDING", label: "Đã đặt đơn" },
                        { key: "PROCESSING", label: "Đang xử lý" },
                        { key: "SHIPPING", label: "Đang giao" },
                        { key: "COMPLETED", label: "Hoàn thành" },
                      ].map((step, idx) => {
                        const reached = idx <= activeStepIdx;
                        return (
                          <div key={step.key} className="relative w-[14px]">
                            <div
                              className={`w-[14px] h-[14px] rounded-full mx-auto ${
                                reached
                                  ? "bg-[#222]"
                                  : "bg-white border-[2px] border-[#e1e1e1]"
                              }`}
                            ></div>
                            <div
                              className={`text-[12px] leading-tight absolute top-[25px] w-max ${
                                idx === 0
                                  ? "left-[-5px]"
                                  : idx === 3
                                  ? "right-[-5px]"
                                  : "left-1/2 -translate-x-1/2"
                              } ${
                                reached
                                  ? "text-[#222] font-medium"
                                  : "text-[#999]"
                              }`}
                            >
                              {step.label}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Vertical Timeline */}
              <h4 className="font-semibold text-[18px] text-[#222] mb-[30px]">
                Chi tiết trạng thái đơn hàng
              </h4>

              <div className="pl-[8px] mb-[40px] space-y-[20px] border-l-[2px] border-[#222]">
                <div className="relative pl-[25px]">
                  <div className="absolute top-[4px] left-[-8px] w-[14px] h-[14px] rounded-full bg-[#222]"></div>
                  <div className="flex flex-wrap items-center gap-[20px]">
                    <span className="text-[14px] font-medium text-[#222] w-[180px]">
                      Đơn hàng đã đặt
                    </span>
                    <span className="text-[14px] text-[#6c6d70]">
                      {order.createdAt}
                    </span>
                  </div>
                </div>

                {order.status !== "PENDING" && (
                  <div className="relative pl-[25px]">
                    <div className="absolute top-[4px] left-[-8px] w-[14px] h-[14px] rounded-full bg-[#222]"></div>
                    <div className="flex flex-wrap items-center gap-[20px]">
                      <span className="text-[14px] font-medium text-[#222] w-[180px]">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-[14px] text-[#6c6d70]">
                        {order.status === "CANCELLED"
                          ? order.cancelReason || "Đơn hàng đã bị hủy"
                          : "Đã cập nhật trạng thái đơn hàng"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Items */}
              <div className="border-t border-[#e1e1e1] pt-[30px] space-y-[24px]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-[16px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="w-[120px] h-[165px] md:w-[150px] md:h-[200px] object-cover shrink-0 bg-[#f8f9fa]"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h5 className="text-[16px] md:text-[18px] text-[#222] mb-[12px] font-medium">
                          {item.name}
                        </h5>
                        <div className="text-[14px] text-[#6c6d70] space-y-[6px]">
                          <p>Màu sắc: {item.colorName}</p>
                          <p>Size: {item.sizeName}</p>
                          <p>Số lượng: {item.quantity}</p>
                          <p>Đơn giá: {formatPrice(item.price)}</p>
                          <p>SKU: ({item.sku})</p>
                        </div>
                      </div>
                      {item.productId && (
                        <Link
                          href={`/product/${item.productId}`}
                          className="border border-[#222] text-[#222] bg-white px-[24px] py-[8px] text-[13px] uppercase hover:bg-[#222] hover:text-white transition-colors w-fit mt-2"
                          style={{ borderRadius: "20px 0 20px 0" }}
                        >
                          MUA LẠI
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Sidebar Summary) */}
            <div className="w-full lg:w-[400px]">
              <div className="bg-[#f8f9fa] p-[30px] rounded-[4px]">
                <div className="border-b border-[#e1e1e1] pb-[20px] mb-[20px]">
                  <h4 className="text-[18px] text-[#222] mb-[20px]">
                    Tóm tắt đơn hàng
                  </h4>
                  <div className="space-y-[12px] text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-[#6c6d70]">Ngày tạo đơn</span>
                      <span className="text-[#222]">{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c6d70]">Tạm tính</span>
                      <span className="text-[#222]">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c6d70]">Phí vận chuyển</span>
                      <span className="text-[#222]">
                        {formatPrice(order.shippingFee)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-[#28a745]">
                        <span>Giảm giá ({order.voucherCode})</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-[8px]">
                      <span className="text-[#6c6d70]">Tổng tiền</span>
                      <span className="text-[16px] font-bold text-[#222]">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-[#e1e1e1] pb-[20px] mb-[20px]">
                  <h5 className="font-semibold text-[15px] text-[#222] mb-[10px]">
                    Hình thức thanh toán
                  </h5>
                  <p className="text-[14px] text-[#6c6d70]">{order.payment}</p>
                </div>

                <div className="border-b border-[#e1e1e1] pb-[20px] mb-[20px]">
                  <h5 className="font-semibold text-[15px] text-[#222] mb-[10px]">
                    Đơn vị vận chuyển
                  </h5>
                  <p className="text-[14px] text-[#6c6d70]">
                    {order.shipping?.method || "Chuyển phát nhanh"}
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-[15px] text-[#222] mb-[10px]">
                    Địa chỉ nhận hàng
                  </h5>
                  <div className="text-[14px] text-[#6c6d70] space-y-[8px]">
                    <p className="text-[#222] font-medium">
                      {order.customerName}
                    </p>
                    <p>{order.shipping?.address}</p>
                    <p>Điện thoại: {order.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-[80px] text-center text-[#666]">Đang tải...</div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}

