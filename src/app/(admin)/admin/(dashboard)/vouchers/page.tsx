"use client";

import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  VoucherTable,
  VoucherModal,
  useVouchers,
} from "@/features/promotions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export default function VouchersPage() {
  const { vouchers, isLoading, reload, triggerAction } = useVouchers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "view" | "edit" | "duplicate"
  >("create");
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null
  );

  const handleAction = (
    mode: "create" | "view" | "edit" | "duplicate",
    id: string | null = null
  ) => {
    setModalMode(mode);
    setSelectedVoucherId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mã giảm giá (Voucher)
          </h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý các chương trình khuyến mãi bằng mã code.
          </p>
        </div>
        <Button onClick={() => handleAction("create")}>
          <Plus className="mr-2 h-4 w-4" /> Tạo mã giảm giá
        </Button>
      </div>

      <VoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={reload}
        mode={modalMode}
        voucherId={selectedVoucherId}
        vouchers={vouchers}
      />

      <Tabs defaultValue="ALL" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          <TabsTrigger value="ACTIVE">Đang diễn ra</TabsTrigger>
          <TabsTrigger value="UPCOMING">Sắp diễn ra</TabsTrigger>
          <TabsTrigger value="ENDED">Đã kết thúc</TabsTrigger>
          <TabsTrigger value="CANCELED">Đã hủy</TabsTrigger>
        </TabsList>
        <TabsContent value="ALL" className="m-0">
          <VoucherTable
            vouchers={vouchers}
            isLoading={isLoading}
            onTriggerAction={triggerAction}
            viewStatus="Tất cả"
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="ACTIVE" className="m-0">
          <VoucherTable
            vouchers={vouchers}
            isLoading={isLoading}
            onTriggerAction={triggerAction}
            viewStatus="Đang diễn ra"
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="UPCOMING" className="m-0">
          <VoucherTable
            vouchers={vouchers}
            isLoading={isLoading}
            onTriggerAction={triggerAction}
            viewStatus="Sắp diễn ra"
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="ENDED" className="m-0">
          <VoucherTable
            vouchers={vouchers}
            isLoading={isLoading}
            onTriggerAction={triggerAction}
            viewStatus="Đã kết thúc"
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="CANCELED" className="m-0">
          <VoucherTable
            vouchers={vouchers}
            isLoading={isLoading}
            onTriggerAction={triggerAction}
            viewStatus="Đã hủy"
            onAction={handleAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

