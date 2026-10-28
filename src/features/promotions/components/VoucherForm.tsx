"use client";

import { useState } from "react";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  VoucherSchema,
  TVoucherPayload,
} from "@/features/promotions/schemas/voucher.schema";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";

interface VoucherFormProps {
  mode: "create" | "view" | "edit" | "duplicate";
  voucherId?: string | null;
  onSuccess?: () => void;
  defaultValues?: Partial<TVoucherPayload>;
  readOnly?: boolean;
  status?: "Sắp diễn ra" | "Đang diễn ra" | "Đã kết thúc";
}

function normalizeLocalDateTime(val: string): string {
  if (!val) return new Date().toISOString().slice(0, 19);
  if (val.length === 16) return `${val}:00`;
  return val.slice(0, 19);
}

export function VoucherForm({
  mode,
  voucherId,
  onSuccess,
  defaultValues,
  readOnly = false,
  status,
}: VoucherFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 16);

  const form = useForm<TVoucherPayload>({
    resolver: zodResolver(VoucherSchema) as unknown as Resolver<TVoucherPayload>,
    defaultValues: {
      code: "",
      discountType: "vnd",
      discount: 50000,
      maxDiscount: 100000,
      minOrder: 200000,
      quantity: 100,
      isPublic: true,
      isActive: true,
      startDate: fmt(now),
      endDate: fmt(nextMonth),
      ...defaultValues,
    },
  });

  const discountType = form.watch("discountType");

  const onSubmit = async (values: TVoucherPayload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        code: values.code.trim().toUpperCase(),
        name: `Ưu đãi mã ${values.code.trim().toUpperCase()}`,
        discountType:
          values.discountType === "percent" ? "PERCENTAGE" : "FIXED_AMOUNT",
        discountValue: Number(values.discount),
        minOrderValue: Number(values.minOrder || 0),
        maxDiscountAmount:
          values.discountType === "percent"
            ? Number(values.maxDiscount || 0)
            : null,
        startDate: normalizeLocalDateTime(values.startDate),
        endDate: normalizeLocalDateTime(values.endDate),
        usageLimit: Number(values.quantity),
      };

      if (mode === "edit" && voucherId) {
        await apiFetch(`/admin/vouchers/${voucherId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Đã cập nhật mã giảm giá thành công!");
      } else {
        await apiFetch("/admin/vouchers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Đã tạo mã giảm giá mới thành công!");
      }

      form.reset();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể lưu mã giảm giá"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mã Code (Chữ in hoa) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: SUMMER2026"
                  className="uppercase"
                  disabled={readOnly || status === "Đang diễn ra"}
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại giảm giá</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={readOnly || status === "Đang diễn ra"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giảm giá">
                      {field.value === "percent"
                        ? "Giảm theo phần trăm (%)"
                        : "Giảm theo số tiền (VND)"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vnd">Giảm theo số tiền (VND)</SelectItem>
                  <SelectItem value="percent">
                    Giảm theo phần trăm (%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {discountType === "vnd" ? "Mức giảm (VND)" : "Mức giảm (%)"}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={
                    discountType === "vnd" ? "VD: 50000" : "VD: 10"
                  }
                  disabled={readOnly || status === "Đang diễn ra"}
                  {...field}
                  value={field.value as string | number}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {discountType === "percent" && (
          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Giảm tối đa (VND) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="VD: 100000"
                    disabled={readOnly || status === "Đang diễn ra"}
                    {...field}
                    value={(field.value ?? "") as string | number}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="minOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá trị đơn tối thiểu (VND)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="VD: 500000"
                  disabled={readOnly}
                  {...field}
                  value={field.value as string | number}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Số lượng giới hạn <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="VD: 100"
                  disabled={readOnly}
                  {...field}
                  value={field.value as string | number}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    disabled={readOnly || status === "Đang diễn ra"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ngày kết thúc <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" disabled={readOnly} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between mt-2 space-y-0">
              <div className="flex flex-col gap-1">
                <FormLabel className="cursor-pointer text-foreground">
                  Hiển thị công khai
                </FormLabel>
                <span className="text-xs text-muted-foreground">
                  Khách hàng có thể thấy mã giảm giá tại trang thanh toán.
                </span>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!readOnly && (
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto mt-4"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        )}
      </form>
    </Form>
  );
}

