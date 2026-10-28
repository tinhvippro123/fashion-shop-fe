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
    reload();
  }, [reload]);

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
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const data = await apiFetch<Customer>(`/admin/customers/${customerId}`);
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { customer, isLoading, reload };
}

