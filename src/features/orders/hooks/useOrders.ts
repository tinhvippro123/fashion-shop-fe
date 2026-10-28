"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Order, OrderStatus } from "../types/order.admin";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Order[]>("/admin/orders");
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateOrderStatus = useCallback(
    async (idOrCode: string, status: OrderStatus, reason?: string) => {
      const updated = await apiFetch<Order>(
        `/admin/orders/${encodeURIComponent(idOrCode)}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, reason }),
        }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === idOrCode || o.orderCode === idOrCode ? updated : o
        )
      );
      return updated;
    },
    []
  );

  return { orders, setOrders, isLoading, reload, updateOrderStatus };
}

