"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { DollarSign, ShoppingBag, Users, CreditCard } from "lucide-react";
import { OverviewChart } from "./OverviewChart";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useRouter } from "next/navigation";

export function DashboardOverview() {
  const router = useRouter();
  const { stats, recentOrders, chartData, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
            Chờ xử lý
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] px-2 py-0 h-5 text-white">
            Đã giao
          </Badge>
        );
      case "shipping":
        return (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0 h-5 border-primary text-primary"
          >
            Đang giao
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5">
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.totalRevenue || 0).toLocaleString("vi-VN")} đ
            </div>
            <p className="text-xs text-muted-foreground">
              Lợi nhuận gộp:{" "}
              {Number(stats.totalProfit || 0).toLocaleString("vi-VN")} đ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Hàng Mới</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{Number(stats.newCustomers || 0).toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.customerChange > 0 ? "+" : ""}
              {stats.customerChange}% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn Hàng</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{Number(stats.totalOrders || 0).toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.orderChange > 0 ? "+" : ""}
              {stats.orderChange}% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Số Online</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{Number(stats.onlineSales || 0).toLocaleString("vi-VN")} SP
            </div>
            <p className="text-xs text-muted-foreground">
              Vốn nhập kho:{" "}
              {Number(stats.totalImportCost || 0).toLocaleString("vi-VN")} đ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Biểu đồ doanh thu */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 min-w-0">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>
              Thống kê doanh thu trong {chartData.length || 6} tháng gần nhất.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>
              Bạn có {stats.pendingOrders} đơn hàng đang chờ xác nhận.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Chưa có đơn hàng nào.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {order.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.id} &bull; {order.date}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <span className="text-sm font-bold leading-none">
                        {Number(order.amount || 0).toLocaleString("vi-VN")} đ
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

