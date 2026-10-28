"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuẩn bị hàng",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Đã giao thành công",
  CANCELLED: "Đã hủy đơn hàng",
};

const STEP_ORDER = ["PENDING", "PROCESSING", "SHIPPING", "COMPLETED"];

export default function AccountOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<OrderResponseDto>(`/orders/${encodeURIComponent(decodedId)}`)
      .then(setOrder)
      .catch((err) => toast.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [decodedId]);

  if (loading) {
    return (
      <div className="py-[48px] text-center text-[#6c6d70]">
        Đang tải trạng thái đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-[48px] text-center text-[#6c6d70]">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const activeStepIdx =
    order.status === "CANCELLED"
      ? 0
      : Math.max(0, STEP_ORDER.indexOf(order.status));

  return (
    <>
      <div className="flex justify-between items-center mb-[20px] gap-[10px]">
        <h3 className="flex items-center text-[15px] md:text-[20px] font-semibold text-[#222] uppercase mb-0 whitespace-nowrap">
          <Link
            href={`/account/orders/${encodeURIComponent(order.orderCode)}`}
            className="text-[#222] mr-[8px] md:mr-[12px] hover:text-[#555] text-[14px] md:text-[18px]"
          >
            <i className="fas fa-chevron-left"></i>
          </Link>
          Theo dõi đơn hàng {order.orderCode}
        </h3>
        <span className="text-[#6c6d70] text-[12px] md:text-[14px] flex items-center whitespace-nowrap">
          <i className="fas fa-sync-alt mr-[4px] md:mr-[8px]"></i>{" "}
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-[30px] xl:gap-[60px]">
        {/* Left Column */}
        <div className="w-full lg:w-7/12 xl:w-8/12 overflow-hidden">
          <div
            className="mb-[50px] border border-[#e1e1e1] px-[15px] lg:px-[40px] py-[30px]"
            style={{ borderRadius: "20px 0 20px 0" }}
          >
            <div className="w-full relative">
              <div className="absolute top-[6px] left-[7px] right-[7px] h-[2px] bg-[#e1e1e1] z-[1]"></div>

              <div className="flex justify-between relative z-[2] h-[50px]">
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
                      <div className="text-[12px] text-[#dc3545] font-medium text-right leading-tight absolute top-[25px] right-[-5px] w-max">
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

          <h4 className="font-semibold text-[18px] text-[#222] mb-[30px]">
            Chi tiết trạng thái đơn hàng
          </h4>

          <div className="pl-[8px] mb-[50px] space-y-[20px] border-l-[2px] border-[#222]">
            <div className="relative pl-[25px]">
              <div className="absolute top-[4px] left-[-8px] w-[14px] h-[14px] rounded-full bg-[#222]"></div>
              <div className="flex flex-wrap gap-[20px]">
                <span className="text-[14px] text-[#222] w-[150px] font-medium">
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
                <div className="flex flex-wrap gap-[20px]">
                  <span className="text-[14px] text-[#222] w-[150px] font-medium">
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-[14px] text-[#6c6d70]">
                    {order.cancelReason || "Đã cập nhật trạng thái"}
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
                  className="w-[120px] h-[160px] md:w-[160px] md:h-[213px] object-cover shrink-0 bg-[#f8f9fa]"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[18px] text-[#222] mb-[12px] font-medium">
                      {item.name}
                    </h5>
                    <div className="text-[15px] text-[#6c6d70] space-y-[8px]">
                      <p>Màu sắc: {item.colorName}</p>
                      <p>Size: {item.sizeName}</p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>SKU: ({item.sku})</p>
                    </div>
                  </div>
                  {item.productId && (
                    <Link
                      href={`/product/${item.productId}`}
                      className="border border-[#222] text-[#222] bg-white px-[30px] py-[10px] text-[14px] uppercase hover:bg-[#222] hover:text-white transition-colors w-fit mt-2"
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
        <div className="w-full lg:w-5/12 xl:w-4/12 shrink-0">
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
                Địa chỉ
              </h5>
              <div className="text-[14px] text-[#6c6d70] space-y-[8px]">
                <p className="text-[#222]">{order.customerName}</p>
                <p>{order.shipping?.address}</p>
                <p>Điện thoại: {order.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

