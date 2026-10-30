"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Customer } from "../types/customer.admin";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Customer[]>("/admin/customers");
      setCustomers(data || []);
    } catch {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<Customer[]>("/admin/customers")
      .then((data) => {
        if (active) setCustomers(data || []);
      })
      .catch(() => {
        if (active) setCustomers([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateCustomerStatus = useCallback(
    async (customerId: string, status: "ACTIVE" | "BANNED") => {
      const updated = await apiFetch<Customer>(
        `/admin/customers/${customerId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? updated : c))
      );
      return updated;
    },
    []
  );

  return { customers, setCustomers, isLoading, reload, updateCustomerStatus };
}

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const isLoading =
    manualLoading || (Boolean(customerId) && loadedId !== customerId);

  const reload = useCallback(async () => {
    if (!customerId) return;
    setManualLoading(true);
    try {
      const data = await apiFetch<Customer>(`/admin/customers/${customerId}`);
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoadedId(customerId);
      setManualLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    let active = true;
    apiFetch<Customer>(`/admin/customers/${customerId}`)
      .then((data) => {
        if (active) setCustomer(data);
      })
      .catch(() => {
        if (active) setCustomer(null);
      })
      .finally(() => {
        if (active) setLoadedId(customerId);
      });
    return () => {
      active = false;
    };
  }, [customerId]);

  return { customer, isLoading, reload };
}

