"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  PackagePlus,
} from "lucide-react";
import { OverviewChart } from "./OverviewChart";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useRouter } from "next/navigation";

export function DashboardOverview() {
  const router = useRouter();
  const {
    stats,
    recentOrders,
    chartData,
    bestSellers,
    lowStockVariants,
    isLoading,
  } = useDashboardStats();

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
      case "processing":
        return (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0 h-5 border-blue-500 text-blue-600"
          >
            Đang chuẩn bị
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
            <CardTitle className="text-sm font-medium">Khách Hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.newCustomers || 0).toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground">
              Tài khoản khách hàng đang hoạt động
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
              {Number(stats.totalOrders || 0).toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground">
              Đang chờ xử lý: {stats.pendingOrders} đơn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Phẩm Đã Bán</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.onlineSales || 0).toLocaleString("vi-VN")} SP
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

      {/* Top Best Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top Sản phẩm Bán chạy nhất
          </CardTitle>
          <CardDescription>
            Danh sách 5 sản phẩm có số lượng bán ra cao nhất tại cửa hàng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Chưa có dữ liệu sản phẩm bán ra.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Đã bán</TableHead>
                  <TableHead className="text-right">Doanh thu ước tính</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.map((item, index) => (
                  <TableRow
                    key={item.numericId}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      router.push(`/admin/products/${item.numericId}/edit`)
                    }
                  >
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground font-semibold shrink-0">
                          #{index + 1}
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.sold.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {item.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Warning Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cảnh báo Sắp hết hàng ({lowStockVariants.length})
          </CardTitle>
          <CardDescription>
            Các biến thể có tồn kho từ 5 sản phẩm trở xuống cần lập phiếu nhập
            kho bổ sung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockVariants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Tất cả biến thể sản phẩm đều đang đủ tồn kho an toàn.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SKU</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockVariants.slice(0, 8).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                    <TableCell className="font-medium">
                      {v.productName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {v.colorName} / {v.size?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={v.stock === 0 ? "destructive" : "outline"}
                        className={
                          v.stock > 0
                            ? "text-amber-700 border-amber-300 bg-amber-50"
                            : ""
                        }
                      >
                        {v.stock === 0 ? "Hết hàng (0)" : `Còn ${v.stock}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/stock-imports?productId=${v.productId}`
                          )
                        }
                      >
                        <PackagePlus className="mr-1.5 h-3.5 w-3.5" />
                        Nhập kho
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
