"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";
import ProductReviewModal from "@/features/reviews/components/ProductReviewModal";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả", icon: "fas fa-layer-group", color: "text-[#6c757d]" },
  { value: "PENDING", label: "Chờ xử lý", icon: "fas fa-clock", color: "text-[#f59e0b]" },
  { value: "PROCESSING", label: "Đang chuẩn bị", icon: "fas fa-box", color: "text-[#3b82f6]" },
  { value: "SHIPPING", label: "Đang giao", icon: "fas fa-truck", color: "text-[#06b6d4]" },
  { value: "COMPLETED", label: "Đã giao", icon: "fas fa-check-circle", color: "text-[#10b981]" },
  { value: "CANCELLED", label: "Đã hủy", icon: "fas fa-ban", color: "text-[#ef4444]" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reviews modal state
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());
  const [selectedProductToReview, setSelectedProductToReview] = useState<{
    productId: number;
    name: string;
    image?: string;
    colorName?: string;
    sizeName?: string;
    variantInfo?: string;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenReview = (item: {
    productId?: number | null;
    name: string;
    image?: string;
    colorName?: string;
    sizeName?: string;
    variantInfo?: string;
  }) => {
    if (!item?.productId) return;
    setSelectedProductToReview({
      productId: Number(item.productId),
      name: item.name,
      image: item.image,
      colorName: item.colorName,
      sizeName: item.sizeName,
      variantInfo: item.variantInfo,
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = (productId: number) => {
    setReviewedProductIds((prev) => new Set([...prev, productId]));
  };

  useEffect(() => {
    apiFetch<OrderResponseDto[]>("/orders/my-orders")
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));

    apiFetch("/notifications/mark-read", { method: "PUT" }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const counts: Record<string, number> = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
    SHIPPING: orders.filter((o) => o.status === "SHIPPING").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const selectedOption =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter) || STATUS_OPTIONS[0];

  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <i className="fas fa-clock mr-[4px] text-[#ffc107]"></i>;
      case "PROCESSING":
        return <i className="fas fa-box mr-[4px] text-[#007bff]"></i>;
      case "SHIPPING":
        return <i className="fas fa-truck mr-[4px] text-[#17a2b8]"></i>;
      case "COMPLETED":
        return <i className="fas fa-check-circle mr-[4px] text-[#28a745]"></i>;
      case "CANCELLED":
        return (
          <i className="fas fa-sync mr-[4px] text-[#6c757d] text-[12px]"></i>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PROCESSING":
        return "Đang chuẩn bị";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Đã giao thành công";
      case "CANCELLED":
        return "Đã hủy đơn hàng";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-[24px]">
        <h5 className="font-bold mb-[16px] md:mb-0 uppercase text-[18px] text-[#222]">
          QUẢN LÝ ĐƠN HÀNG
        </h5>

        <div className="flex items-center self-end md:self-auto">
          <label className="text-[#6c6d70] text-[14px] mr-[10px] mb-0 whitespace-nowrap">
            Trạng thái đơn hàng:
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className={`flex items-center justify-between gap-3 min-w-[195px] h-[40px] px-3.5 py-2 bg-white border rounded-[10px] text-[13.5px] text-[#222] font-medium transition-all duration-200 outline-none shadow-xs hover:border-[#222] ${
                isDropdownOpen
                  ? "border-[#222] ring-2 ring-black/5"
                  : "border-[#e5e7eb]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <i className={`${selectedOption.icon} ${selectedOption.color} text-[13px] shrink-0`} />
                <span className="truncate">{selectedOption.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#f1f2f4] text-[#6c6d70] font-semibold">
                  {counts[statusFilter] ?? 0}
                </span>
                <i
                  className={`fas fa-chevron-down text-[11px] text-[#888] transition-transform duration-300 ease-out ${
                    isDropdownOpen ? "rotate-180 text-[#222]" : ""
                  }`}
                />
              </div>
            </button>

            {/* Floating Dropdown Menu with rounded corners and smooth animation */}
            <div
              className={`absolute right-0 top-[calc(100%+6px)] z-50 w-[220px] p-1.5 bg-white border border-[#eaeaea] rounded-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-200 origin-top-right transform ${
                isDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = statusFilter === opt.value;
                  const count = counts[opt.value] ?? 0;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`group flex items-center justify-between w-full px-3 py-2 rounded-[8px] text-[13.5px] transition-all duration-150 text-left cursor-pointer outline-none ${
                        isSelected
                          ? "bg-[#f4f4f5] text-[#111] font-semibold"
                          : "text-[#4b5563] hover:bg-[#f8f9fa] hover:text-[#111]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <i className={`${opt.icon} ${opt.color} text-[13px] w-[16px] text-center shrink-0`} />
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                            isSelected
                              ? "bg-[#222] text-white"
                              : "bg-[#f3f4f6] text-[#6b7280] group-hover:bg-[#e5e7eb]"
                          }`}
                        >
                          {count}
                        </span>
                        {isSelected && (
                          <i className="fas fa-check text-[11px] text-[#222]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px] border-b border-[#dee2e6]">
          <thead className="bg-white border-y border-[#dee2e6] hidden xl:table-header-group">
            <tr className="text-[#6c6d70] uppercase font-bold text-[12px]">
              <th className="py-[16px] px-[8px] font-bold">Mã đơn hàng</th>
              <th className="py-[16px] px-[8px] font-bold">Ngày</th>
              <th className="py-[16px] px-[8px] font-bold w-[35%]">Sản phẩm</th>
              <th className="py-[16px] px-[8px] font-bold text-right">
                Tổng tiền
              </th>
              <th className="py-[16px] px-[8px] font-bold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-[48px] text-[#6c6d70]">
                  Đang tải danh sách đơn hàng...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-[48px] text-[#6c6d70]">
                  Bạn chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.orderCode}
                  className="flex flex-wrap xl:table-row border-b border-[#e1e1e1] py-[16px] xl:py-0"
                >
                  <td className="align-middle px-[8px] py-[4px] xl:py-[16px] w-auto font-bold xl:font-normal text-left order-1 xl:order-none shrink-0">
                    <Link
                      href={`/account/orders/${encodeURIComponent(
                        order.orderCode
                      )}`}
                      className="text-[#222] font-bold underline underline-offset-4 hover:text-[#555]"
                    >
                      {order.orderCode}
                    </Link>
                  </td>

                  <td className="align-middle px-[8px] py-[4px] xl:py-[16px] text-[#6c6d70] text-[12px] xl:text-[14px] text-right xl:text-left flex-1 xl:flex-none order-2 xl:order-none">
                    {order.createdAt}
                  </td>

                  <td className="align-middle px-[8px] py-[8px] xl:py-[16px] w-full xl:w-auto order-3 xl:order-none">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center justify-between gap-2 text-[12px] xl:text-[14px] mb-[6px] last:mb-0 text-[#222] pb-1.5 last:pb-0 border-b border-dashed border-[#f0f0f0] last:border-none"
                      >
                        <div className="flex-1 min-w-[180px]">
                          <span>{item.quantity}x</span>{" "}
                          <span className="font-medium">{item.name}</span>
                          <span className="text-[#6c6d70]">
                            , {item.colorName} ({item.sizeName})
                          </span>
                        </div>
                        {order.status === "COMPLETED" && item.productId && (
                          <div className="shrink-0 my-0.5">
                            {(item.isReviewed || (item.productId && reviewedProductIds.has(item.productId))) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                <i className="fas fa-check text-[10px]"></i> Đã đánh giá
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#111] text-[#222] hover:text-white border border-[#222] text-[11.5px] font-semibold rounded-[6px] shadow-2xs transition-all cursor-pointer"
                              >
                                <i className="fas fa-star text-amber-500 text-[10px]"></i>
                                <span>Đánh giá</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </td>

                  <td className="align-middle px-[8px] py-[8px] xl:py-[16px] font-bold text-[#222] w-auto text-left xl:text-right order-4 xl:order-none shrink-0">
                    {formatPrice(order.totalAmount)}
                  </td>

                  <td className="align-middle px-[8px] py-[8px] xl:py-[16px] text-[12px] xl:text-[14px] w-auto text-right xl:text-left flex-1 xl:flex-none order-5 xl:order-none text-[#222]">
                    <span className="whitespace-nowrap">
                      {getStatusIcon(order.status)}{" "}
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProductToReview(null);
        }}
        product={selectedProductToReview}
        onReviewSuccess={handleReviewSuccess}
      />
    </>
  );
}

