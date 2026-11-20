"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice, resolveImageUrl } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";
import ProductReviewModal, {
  ReviewProductInfo,
} from "@/features/reviews/components/ProductReviewModal";
import { OrderTrackingTimeline } from "@/features/cart-and-order/components/OrderTrackingTimeline";

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
  const [selectedProductToReview, setSelectedProductToReview] =
    useState<ReviewProductInfo | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(
    new Set()
  );

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
    const config: Record<string, { label: string; dot: string; text: string }> = {
      PENDING: {
        label: "Chờ xử lý",
        dot: "bg-amber-600",
        text: "text-[#222]",
      },
      PROCESSING: {
        label: "Đang chuẩn bị hàng",
        dot: "bg-[#222]",
        text: "text-[#222]",
      },
      SHIPPING: {
        label: "Đang giao hàng",
        dot: "bg-[#555]",
        text: "text-[#222]",
      },
      COMPLETED: {
        label: "Giao thành công",
        dot: "bg-emerald-600",
        text: "text-[#222]",
      },
      CANCELLED: {
        label: "Đã hủy đơn hàng",
        dot: "bg-[#b5121b]",
        text: "text-[#b5121b]",
      },
    };
    const item = config[status] || {
      label: status,
      dot: "bg-[#999]",
      text: "text-[#222]",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.4px] ${item.text}`}
      >
        <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${item.dot}`} />
        <span>{item.label}</span>
      </span>
    );
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

        <OrderTrackingTimeline
          status={order.status}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
          cancelReason={order.cancelReason}
          showVerticalDetails={true}
        />

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

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  {(item.productSlug || item.productId) && (
                    <Link
                      href={`/product/${item.productSlug || item.productId}`}
                      className="inline-block border border-[#222] text-[#222] text-[12px] md:text-[13px] px-[16px] md:px-[20px] py-[4px] rounded-full hover:bg-[#222] hover:text-white transition-colors uppercase font-medium"
                    >
                      Mua lại
                    </Link>
                  )}
                  {order.status === "COMPLETED" && item.productId && (
                    Boolean(item.isReviewed || item.reviewed || (item.productId && reviewedProductIds.has(item.productId))) ? (
                      <Link
                        href={`/product/${item.productSlug || item.productId}#reviews`}
                        className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-[14px] py-[4px] rounded-full transition-colors"
                        title="Xem nhận xét của bạn tại trang sản phẩm"
                      >
                        <i className="fas fa-check text-[11px]"></i> Đã đánh giá
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductToReview({
                            productId: Number(item.productId),
                            name: item.name,
                            image: item.image,
                            colorName: item.colorName,
                            sizeName: item.sizeName,
                            variantInfo: item.variantInfo,
                          });
                          setIsReviewModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 border border-[#222] bg-[#222] hover:bg-[#000] text-white text-[12px] md:text-[13px] px-[16px] md:px-[20px] py-[4px] rounded-full transition-colors uppercase font-medium cursor-pointer shadow-2xs"
                      >
                        <i className="fas fa-star text-amber-400 text-[11px]"></i>
                        <span>Đánh giá</span>
                      </button>
                    )
                  )}
                </div>
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

      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProductToReview(null);
        }}
        product={selectedProductToReview}
        onReviewSuccess={(productId) => {
          setReviewedProductIds((prev) => new Set([...prev, productId]));
        }}
      />
    </div>
  );
}
