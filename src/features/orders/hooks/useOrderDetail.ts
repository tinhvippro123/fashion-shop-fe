"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Order, OrderStatus } from "../types/order.admin";

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const data = await apiFetch<Order>(
        `/admin/orders/${encodeURIComponent(orderId)}`
      );
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateStatus = useCallback(
    async (status: OrderStatus, reason?: string) => {
      const updated = await apiFetch<Order>(
        `/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, reason }),
        }
      );
      setOrder(updated);
      return updated;
    },
    [orderId]
  );

  return { order, isLoading, reload, updateStatus };
}

