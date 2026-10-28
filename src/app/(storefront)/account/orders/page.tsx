"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";
import { formatPrice } from "@/shared/utils/format";
import { OrderResponseDto } from "@/features/cart-and-order/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    apiFetch<OrderResponseDto[]>("/orders/my-orders")
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

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
          <label className="text-[#6c6d70] text-[14px] mr-[8px] mb-0 whitespace-nowrap">
            Trạng thái đơn hàng:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#e7e8e9] rounded-[4px] p-[6px_12px] text-[14px] text-[#495057] outline-none focus:border-[#222] w-[170px] bg-white"
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang chuẩn bị</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
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
                        className="text-[12px] xl:text-[14px] mb-[4px] text-[#222]"
                      >
                        <span>{item.quantity}x</span>{" "}
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[#6c6d70]">
                          , {item.colorName} ({item.sizeName})
                        </span>
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
    </>
  );
}

