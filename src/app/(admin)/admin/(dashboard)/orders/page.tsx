"use client";

import { Suspense } from "react";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import { OrderTable, useOrders } from "@/features/orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentTab = searchParams.get("tab") || "ALL";
  const { orders, isLoading, updateOrderStatus } = useOrders();

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    shipping: orders.filter((o) => o.status === "SHIPPING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExport = () => {
    const rows = [
      ["Ma don", "Khach hang", "Email", "Ngay dat", "Trang thai", "Tong tien"],
      ...orders.map((o) => [
        o.id,
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.customerEmail || "",
        o.date,
        o.status,
        `"${o.total}"`,
      ]),
    ];
    const csv =
      "data:text/csv;charset=utf-8,\uFEFF" +
      rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "danh-sach-don-hang.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất danh sách đơn hàng ra file CSV!");
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Đơn hàng</h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý và theo dõi trạng thái đơn hàng của khách.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" /> Xuất dữ liệu
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => handleTabChange(String(v))}
        className="w-full"
      >
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="ALL">Tất cả ({counts.all})</TabsTrigger>
          <TabsTrigger value="PENDING">
            Chờ xác nhận ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="PROCESSING">
            Đang chuẩn bị ({counts.processing})
          </TabsTrigger>
          <TabsTrigger value="SHIPPING">
            Đang giao ({counts.shipping})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Hoàn thành ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            Đã hủy ({counts.cancelled})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ALL" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
          />
        </TabsContent>
        <TabsContent value="PENDING" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
            viewStatus="PENDING"
          />
        </TabsContent>
        <TabsContent value="PROCESSING" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
            viewStatus="PROCESSING"
          />
        </TabsContent>
        <TabsContent value="SHIPPING" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
            viewStatus="SHIPPING"
          />
        </TabsContent>
        <TabsContent value="COMPLETED" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
            viewStatus="COMPLETED"
          />
        </TabsContent>
        <TabsContent value="CANCELLED" className="m-0">
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={updateOrderStatus}
            viewStatus="CANCELLED"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Đang tải danh sách đơn hàng...
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}

