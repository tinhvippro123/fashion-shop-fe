"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";

const STEP_ORDER = ["PENDING", "PROCESSING", "SHIPPING", "COMPLETED"];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiFetch<OrderResponseDto>(`/orders/${encodeURIComponent(decodedId)}`)
      .then(setOrder)
      .catch((err) => toast.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [decodedId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    setCancelling(true);
    try {
      const updated = await apiFetch<OrderResponseDto>(
        `/orders/${encodeURIComponent(order.orderCode)}/cancel`,
        {
          method: "PUT",
          body: JSON.stringify({ reason: "Khách hàng yêu cầu hủy đơn" }),
        }
      );
      setOrder(updated);
      toast.success("Đã hủy đơn hàng và hoàn lại tồn kho sản phẩm!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-[#ffc107]">
            <i className="fas fa-clock mr-[4px]"></i> CHỜ XỬ LÝ
          </span>
        );
      case "PROCESSING":
        return (
          <span className="text-[#007bff]">
            <i className="fas fa-box mr-[4px]"></i> ĐANG CHUẨN BỊ HÀNG
          </span>
        );
      case "SHIPPING":
        return (
          <span className="text-[#17a2b8]">
            <i className="fas fa-truck mr-[4px]"></i> ĐANG GIAO HÀNG
          </span>
        );
      case "COMPLETED":
        return (
          <span className="text-[#28a745]">
            <i className="fas fa-check-circle mr-[4px]"></i> GIAO THÀNH CÔNG
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[#dc3545]">
            <i className="fas fa-sync mr-[4px] text-[12px]"></i> ĐÃ HỦY ĐƠN HÀNG
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-[48px] text-center text-[#6c6d70]">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-[48px] text-center text-[#6c6d70]">
        Không tìm thấy đơn hàng.{" "}
        <Link href="/account/orders" className="underline text-[#222]">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const activeStepIdx =
    order.status === "CANCELLED"
      ? 0
      : Math.max(0, STEP_ORDER.indexOf(order.status));

  return (
    <div className="flex flex-col lg:flex-row mx-[-15px]">
      {/* Main Content */}
      <div className="w-full lg:w-8/12 px-[15px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-[24px] border-b border-[#e1e1e1] pb-[16px]">
          <h5 className="font-bold mb-[8px] md:mb-0 uppercase text-[18px] text-[#222]">
            <Link
              href="/account/orders"
              className="text-[#222] mr-[8px] hover:text-[#555]"
            >
              <i className="fas fa-chevron-left"></i>
            </Link>
            CHI TIẾT ĐƠN HÀNG{" "}
            <span className="text-[#dc3545]">{order.orderCode}</span>
          </h5>
          <div className="text-[14px] font-bold">
            {getStatusDisplay(order.status)}
          </div>
        </div>

        {/* Integrated 4-Step Order Progress Bar */}
        <div
          className="mb-[28px] border border-[#e1e1e1] px-[15px] lg:px-[36px] py-[28px]"
          style={{ borderRadius: "20px 0 20px 0" }}
        >
          <div className="w-full relative">
            <div className="absolute top-[6px] left-[7px] right-[7px] h-[2px] bg-[#e1e1e1] z-[1]"></div>

            <div className="flex justify-between relative z-[2] h-[48px]">
              {order.status === "CANCELLED" ? (
                <>
                  <div className="relative w-[14px]">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#222] mx-auto"></div>
                    <div className="text-[12px] text-[#6c6d70] text-left leading-tight absolute top-[24px] left-[-5px] w-max">
                      Đơn hàng đã đặt
                    </div>
                  </div>
                  <div className="relative w-[14px]">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#dc3545] mx-auto"></div>
                    <div className="text-[12px] text-[#dc3545] font-semibold text-right leading-tight absolute top-[24px] right-[-5px] w-max">
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
                        className={`text-[12px] leading-tight absolute top-[24px] w-max ${
                          idx === 0
                            ? "left-[-5px]"
                            : idx === 3
                            ? "right-[-5px]"
                            : "left-1/2 -translate-x-1/2"
                        } ${
                          reached ? "text-[#222] font-medium" : "text-[#999]"
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
          {order.status === "CANCELLED" && order.cancelReason && (
            <div className="mt-2 pt-3 border-t border-[#f0f0f0] text-[13px] text-[#dc3545]">
              Lý do hủy: {order.cancelReason}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-[24px] border-b border-[#e1e1e1] pb-[24px]">
          {order.items.map((item, index) => (
            <div key={index} className="flex flex-row mb-[24px] last:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(item.image)}
                alt={item.name}
                className="w-[100px] h-[150px] md:w-[120px] md:h-[180px] object-cover rounded-[4px] mr-[16px] md:mr-[24px] shrink-0 bg-[#f8f9fa]"
              />
              <div className="flex-1 min-w-0 flex flex-col py-[2px] md:py-[4px]">
                <div>
                  <div className="flex justify-between mb-[4px] md:mb-[8px]">
                    <div className="font-bold text-[14px] md:text-[16px] text-[#222] pr-[8px] md:pr-[16px]">
                      {item.name}
                    </div>
                    <div className="font-bold text-[14px] md:text-[16px] text-[#222] shrink-0">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="text-[#6c6d70] text-[13px] md:text-[14px] mt-[4px] md:mt-[8px]">
                    Màu sắc:{" "}
                    <span className="text-[#222]">{item.colorName}</span>
                  </div>
                  <div className="text-[#6c6d70] text-[13px] md:text-[14px] mt-[4px]">
                    Size: <span className="text-[#222]">{item.sizeName}</span>
                  </div>
                  <div className="text-[#6c6d70] text-[13px] md:text-[14px] mt-[4px]">
                    Số lượng:{" "}
                    <span className="text-[#222]">{item.quantity}</span>
                  </div>
                </div>

                {(item.productSlug || item.productId) && (
                  <div className="mt-auto">
                    <Link
                      href={`/product/${item.productSlug || item.productId}`}
                      className="inline-block border border-[#222] text-[#222] text-[12px] md:text-[14px] px-[16px] md:px-[24px] py-[4px] rounded-full hover:bg-[#222] hover:text-white transition-colors uppercase font-medium"
                    >
                      Mua lại
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {order.status === "PENDING" && (
          <div className="flex flex-wrap gap-[12px] items-start mt-[16px] pt-[8px]">
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="bg-white text-[#dc3545] font-bold py-[8px] px-[24px] rounded-tl-[12px] rounded-br-[12px] text-[14px] border border-[#dc3545] hover:bg-[#dc3545] hover:text-white transition-colors uppercase disabled:opacity-60 cursor-pointer"
            >
              {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Right */}
      <div className="w-full lg:w-4/12 px-[15px] mt-[32px] lg:mt-0 lg:pl-[40px]">
        <div className="mb-[24px]">
          <h6 className="font-bold mb-[24px] text-[16px] text-[#222]">
            Tóm tắt đơn hàng
          </h6>
          <div className="flex justify-between text-[14px] mb-[16px] text-[#6c6d70]">
            <span>Ngày tạo đơn</span>
            <span className="ml-auto">{order.createdAt}</span>
          </div>
          <div className="flex justify-between text-[14px] mb-[16px] text-[#6c6d70]">
            <span>Tạm tính</span>
            <span className="ml-auto">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] mb-[16px] text-[#6c6d70]">
            <span>Phí vận chuyển</span>
            <span className="ml-auto">{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[14px] mb-[16px] text-[#28a745]">
              <span>Giảm giá ({order.voucherCode})</span>
              <span className="ml-auto">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-[4px] pb-[24px] mb-[24px] border-b border-[#e1e1e1]">
            <span className="text-[#222] text-[14px]">Tổng tiền</span>
            <span className="font-bold text-[#222] text-[15px] ml-auto">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <h6 className="font-bold mb-[16px] text-[15px] text-[#222]">
            Hình thức thanh toán
          </h6>
          <p className="text-[14px] text-[#6c6d70] pb-[24px] mb-[24px] border-b border-[#e1e1e1]">
            {order.payment}
          </p>

          <h6 className="font-bold mb-[16px] text-[15px] text-[#222]">
            Đơn vị vận chuyển
          </h6>
          <p className="text-[14px] text-[#6c6d70] pb-[24px] mb-[24px] border-b border-[#e1e1e1]">
            {order.shipping?.method || "Chuyển phát nhanh"}
          </p>

          <h6 className="font-bold mb-[16px] text-[15px] text-[#222]">
            Địa chỉ nhận hàng
          </h6>
          <div className="text-[14px] text-[#6c6d70]">
            <p className="mb-[12px] text-[#222] font-medium">
              {order.customerName}
            </p>
            <p className="mb-[12px]">{order.shipping?.address}</p>
            <p className="mb-0">
              Điện thoại:{" "}
              <span className="text-[#222]">{order.customerPhone}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
