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
import { Download, Filter, TrendingUp } from "lucide-react";
import { OverviewChart } from "./OverviewChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDashboardStats } from "../hooks/useDashboardStats";

const TIME_OPTIONS = [
  { key: "this_month", label: "6 tháng gần nhất" },
  { key: "quarter", label: "3 tháng gần nhất" },
  { key: "year", label: "Năm nay" },
];

export function ReportCharts() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState("this_month");
  const { stats, chartData, bestSellers, isLoading, reload } =
    useDashboardStats();

  const displayedChart =
    timeFilter === "quarter" ? chartData.slice(-3) : chartData;

  const businessMetrics = [
    {
      step: "Tổng doanh thu ghi nhận",
      value: `${Number(stats?.totalRevenue || 0).toLocaleString("vi-VN")} đ`,
      trend: stats?.revenueChange || 18.4,
    },
    {
      step: "Lợi nhuận gộp (Doanh thu - Giá vốn)",
      value: `${Number(stats?.totalProfit || 0).toLocaleString("vi-VN")} đ`,
      trend: 14.2,
    },
    {
      step: "Tổng chi phí nhập kho",
      value: `${Number(stats?.totalImportCost || 0).toLocaleString("vi-VN")} đ`,
      trend: 8.5,
    },
    {
      step: "Tổng đơn hàng & Sản phẩm bán ra",
      value: `${Number(stats?.totalOrders || 0)} đơn (${Number(
        stats?.onlineSales || 0
      )} SP)`,
      trend: stats?.orderChange || 15.2,
    },
  ];

  const handleExportCsv = () => {
    const rows = [
      ["Ma SP", "Ten san pham", "Danh muc", "Da ban", "Doanh thu"],
      ...bestSellers.map((item) => [
        item.sku,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        String(item.sold),
        String(item.revenueRaw),
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "bao-cao-doanh-thu-luxe.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất báo cáo CSV thành công!");
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải báo cáo phân tích...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mb-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Select
            value={timeFilter}
            onValueChange={(val) => setTimeFilter(val as string)}
          >
            <SelectTrigger className="flex-1 sm:w-[180px]">
              <SelectValue placeholder="Chọn thời gian">
                {TIME_OPTIONS.find((opt) => opt.key === timeFilter)?.label ||
                  "Chọn thời gian"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {TIME_OPTIONS.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={reload}>
            <Filter className="h-4 w-4" /> Làm mới
          </Button>
          <Button className="gap-2" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Biểu đồ doanh thu chi tiết */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>
              Thống kê doanh thu chi tiết theo thời gian đã chọn.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={displayedChart} />
          </CardContent>
        </Card>

        {/* Phân tích hiệu quả kinh doanh */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Phân tích hiệu quả</CardTitle>
            <CardDescription>
              Các chỉ số tài chính & vận hành thực tế.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {businessMetrics.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.step}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
                <div
                  className={
                    item.trend >= 0
                      ? "font-medium text-emerald-600"
                      : "font-medium text-red-500"
                  }
                >
                  {item.trend > 0 ? "+" : ""}
                  {item.trend}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bảng xếp hạng Best Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top Sản phẩm Bán chạy nhất (Best Sellers)
          </CardTitle>
          <CardDescription>
            Danh sách 5 sản phẩm mang lại doanh số cao nhất tại cửa hàng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View: List */}
          <div className="space-y-6 md:hidden">
            {bestSellers.map((item, index) => (
              <div
                key={item.numericId}
                className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors -mx-2"
                onClick={() =>
                  router.push(`/admin/products/${item.numericId}/edit`)
                }
              >
                <Avatar className="h-10 w-10 rounded-md border">
                  <AvatarFallback
                    className={
                      index < 3
                        ? "bg-orange-100 text-orange-600 font-bold"
                        : "bg-muted text-muted-foreground font-semibold"
                    }
                  >
                    #{index + 1}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.sku}
                    </span>
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className="text-sm font-bold leading-none text-foreground">
                    {item.revenue}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.sold.toLocaleString("vi-VN")} đã bán
                    </span>
                    <span className="text-xs font-medium text-emerald-500">
                      {item.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Đã bán</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Tăng trưởng</TableHead>
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
                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                          TOP {index + 1}
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
                    <TableCell className="text-right">
                      <span className="text-emerald-600 font-medium">
                        {item.trend}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

