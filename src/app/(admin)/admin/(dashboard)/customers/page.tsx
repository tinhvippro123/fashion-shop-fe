"use client";

import { Suspense } from "react";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import { CustomerTable, useCustomers } from "@/features/customers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

function CustomersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { customers, isLoading, updateCustomerStatus } = useCustomers();

  const currentTab = searchParams.get("tab") || "active";

  const activeCount = customers.filter(
    (c) => c.accountStatus === "ACTIVE"
  ).length;
  const bannedCount = customers.filter(
    (c) => c.accountStatus === "BANNED"
  ).length;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExport = () => {
    const rows = [
      ["ID", "Ho ten", "Email", "SDT", "So don", "Tong chi tieu", "Trang thai"],
      ...customers.map((c) => [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        c.email,
        c.phone,
        String(c.orders),
        `"${c.totalSpent}"`,
        c.accountStatus,
      ]),
    ];
    const csv =
      "data:text/csv;charset=utf-8,\uFEFF" +
      rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "danh-sach-khach-hang.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất danh sách khách hàng ra file CSV!");
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Khách hàng</h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý thông tin và lịch sử mua hàng của khách hàng.
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
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Đang hoạt động ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="banned">Bị khóa ({bannedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="m-0">
          <CustomerTable
            customers={customers}
            isLoading={isLoading}
            onUpdateStatus={updateCustomerStatus}
          />
        </TabsContent>
        <TabsContent value="banned" className="m-0">
          <CustomerTable
            customers={customers}
            isLoading={isLoading}
            onUpdateStatus={updateCustomerStatus}
            isBannedView
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Đang tải danh sách khách hàng...
        </div>
      }
    >
      <CustomersPageContent />
    </Suspense>
  );
}

