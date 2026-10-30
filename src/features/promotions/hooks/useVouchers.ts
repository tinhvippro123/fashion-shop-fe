"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Voucher } from "../types/promotion.admin";

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Voucher[]>("/admin/vouchers");
      setVouchers(data || []);
    } catch {
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<Voucher[]>("/admin/vouchers")
      .then((data) => {
        if (active) setVouchers(data || []);
      })
      .catch(() => {
        if (active) setVouchers([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const triggerAction = useCallback(
    async (
      voucherId: string,
      action: "START_NOW" | "END_EARLY" | "CANCEL"
    ) => {
      const updated = await apiFetch<Voucher>(
        `/admin/vouchers/${voucherId}/action`,
        {
          method: "PUT",
          body: JSON.stringify({ action }),
        }
      );
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? updated : v))
      );
      return updated;
    },
    []
  );

  return { vouchers, setVouchers, isLoading, reload, triggerAction };
}

