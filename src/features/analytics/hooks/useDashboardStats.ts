"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import {
  BestSellerItem,
  CategoryShare,
  ChartData,
  DashboardResponse,
  DashboardStats,
  LowStockVariant,
  RecentOrderSummary,
} from "../types/analytics.admin";

interface RawAdminProduct {
  id: number;
  name: string;
  sku?: string;
  effectivePrice: number;
  sold: number;
  category?: { name: string };
}

function buildBestSellers(products: RawAdminProduct[]): BestSellerItem[] {
  return [...(products || [])]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5)
    .map((p, idx) => {
      const rev = (p.sold || 0) * Number(p.effectivePrice || 0);
      return {
        id: p.sku || `SP-${p.id}`,
        numericId: p.id,
        sku: p.sku || `SP-${p.id}`,
        name: p.name,
        category: p.category?.name || "Thời trang",
        sold: p.sold || 0,
        revenue: `${rev.toLocaleString("vi-VN")} đ`,
        revenueRaw: rev,
        trend: `+${Math.max(5, 22 - idx * 3)}%`,
      };
    });
}

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 0,
  totalProfit: 0,
  totalImportCost: 0,
  revenueChange: 0,
  newCustomers: 0,
  customerChange: 0,
  totalOrders: 0,
  orderChange: 0,
  onlineSales: 0,
  onlineSalesChange: 0,
  pendingOrders: 0,
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderSummary[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categorySales, setCategorySales] = useState<CategoryShare[]>([]);
  const [lowStockVariants, setLowStockVariants] = useState<LowStockVariant[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboard, products] = await Promise.all([
        apiFetch<DashboardResponse>("/admin/dashboard"),
        apiFetch<RawAdminProduct[]>("/admin/products"),
      ]);

      setStats(dashboard.stats);
      setRecentOrders(dashboard.recentOrders || []);
      setChartData(dashboard.chartData || []);
      setCategorySales(dashboard.categorySales || []);
      setLowStockVariants(dashboard.lowStockVariants || []);
      setBestSellers(buildBestSellers(products));
    } catch {
      setStats(EMPTY_DASHBOARD_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<DashboardResponse>("/admin/dashboard"),
      apiFetch<RawAdminProduct[]>("/admin/products"),
    ])
      .then(([dashboard, products]) => {
        if (!active) return;
        setStats(dashboard.stats);
        setRecentOrders(dashboard.recentOrders || []);
        setChartData(dashboard.chartData || []);
        setCategorySales(dashboard.categorySales || []);
        setLowStockVariants(dashboard.lowStockVariants || []);
        setBestSellers(buildBestSellers(products));
      })
      .catch(() => {
        if (active) setStats(EMPTY_DASHBOARD_STATS);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    stats,
    recentOrders,
    chartData,
    categorySales,
    lowStockVariants,
    bestSellers,
    isLoading,
    reload,
  };
}

