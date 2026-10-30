"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { VoucherForm } from "./VoucherForm";
import { Voucher } from "../types/promotion.admin";
import { useMemo } from "react";
import { TVoucherPayload } from "../schemas/voucher.schema";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: "create" | "view" | "edit" | "duplicate";
  voucherId: string | null;
  vouchers: Voucher[];
}

export function VoucherModal({
  isOpen,
  onClose,
  onSaved,
  mode,
  voucherId,
  vouchers,
}: VoucherModalProps) {
  const { defaultValues, status } = useMemo(() => {
    if (
      isOpen &&
      (mode === "edit" || mode === "view" || mode === "duplicate") &&
      voucherId
    ) {
      const voucher = vouchers.find((v) => v.id === voucherId);
      if (voucher) {
        const isPercent = voucher.discountType === "PERCENTAGE";
        const startStr = voucher.startDate
          ? voucher.startDate.slice(0, 16)
          : "2026-01-01T00:00";
        const endStr = voucher.endDate
          ? voucher.endDate.slice(0, 16)
          : "2026-12-31T23:59";

        const vals: Partial<TVoucherPayload> = {
          code: mode === "duplicate" ? `${voucher.code}_COPY` : voucher.code,
          discountType: isPercent ? "percent" : "vnd",
          discount: Number(voucher.discountValue || 0),
          maxDiscount: voucher.maxDiscountAmount
            ? Number(voucher.maxDiscountAmount)
            : 100000,
          minOrder: Number(voucher.minOrderValueRaw || 0),
          quantity: Number(voucher.usageLimit || 100),
          isActive: voucher.status !== "Đã kết thúc",
          isPublic: true,
          startDate: startStr,
          endDate: endStr,
        };

        return {
          defaultValues: vals,
          status: voucher.status as
            | "Đang diễn ra"
            | "Sắp diễn ra"
            | "Đã kết thúc"
            | undefined,
        };
      }
    }
    return { defaultValues: undefined, status: undefined };
  }, [isOpen, mode, voucherId, vouchers]);

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Tạo Mã giảm giá mới";
      case "edit":
        return "Chỉnh sửa Mã giảm giá";
      case "view":
        return "Chi tiết Mã giảm giá";
      case "duplicate":
        return "Sao chép Mã giảm giá";
      default:
        return "";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Điền thông tin bên dưới để tạo mã giảm giá mới.";
      case "edit":
        return status === "Đang diễn ra"
          ? "Mã đang chạy, một số trường được bảo vệ."
          : "Chỉnh sửa cấu hình mã giảm giá.";
      case "view":
        return "Xem cấu hình chi tiết của mã giảm giá (Chỉ đọc).";
      case "duplicate":
        return "Sao chép từ mã cũ. Hãy đổi mã Code để tránh trùng lặp.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {isOpen && (
          <div className="mt-4">
            {mode === "view" && (
              <div className="grid grid-cols-4 items-center gap-4 mb-4">
                <Label className="text-right">Khung thời gian</Label>
                <Input
                  value={
                    vouchers.find((v) => v.id === voucherId)?.duration || ""
                  }
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
            )}
            <VoucherForm
              key={mode + (voucherId || "new")}
              mode={mode}
              voucherId={voucherId}
              onSuccess={() => {
                onSaved();
                onClose();
              }}
              defaultValues={defaultValues}
              readOnly={mode === "view"}
              status={mode === "edit" ? status : undefined}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

