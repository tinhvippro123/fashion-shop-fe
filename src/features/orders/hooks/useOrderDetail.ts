"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Order, OrderStatus } from "../types/order.admin";

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const isLoading =
    manualLoading || (Boolean(orderId) && loadedId !== orderId);

  const reload = useCallback(async () => {
    if (!orderId) return;
    setManualLoading(true);
    try {
      const data = await apiFetch<Order>(
        `/admin/orders/${encodeURIComponent(orderId)}`
      );
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoadedId(orderId);
      setManualLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    apiFetch<Order>(`/admin/orders/${encodeURIComponent(orderId)}`)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setLoadedId(orderId);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

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

