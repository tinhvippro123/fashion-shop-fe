"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Plus } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { CategorySchema, TCategoryPayload } from "../schemas/category.schema";
import { AdminCategory } from "../types/catalog.admin";
import { apiFetch } from "@/shared/lib/api";

export interface CategoryFormModalProps {
  initialData?: Partial<TCategoryPayload> & { id?: string | number };
  mode?: "create" | "edit";
  trigger?: React.ReactElement;
  allCategories?: AdminCategory[];
  onSaved?: () => void;
}

function toVietnameseSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function CategoryFormModal({
  initialData,
  mode = "create",
  trigger,
  allCategories = [],
  onSaved,
}: CategoryFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TCategoryPayload>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      parentId: initialData?.parentId || "",
      active: initialData?.active ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        parentId: initialData?.parentId || "",
        active: initialData?.active ?? true,
      });
    }
  }, [open, initialData, form]);

  function onSubmit(values: TCategoryPayload) {
    startTransition(async () => {
      try {
        const parsedParentId =
          values.parentId && values.parentId !== "none"
            ? Number(values.parentId)
            : null;

        const body = {
          name: values.name,
          slug: values.slug,
          parentId: Number.isNaN(parsedParentId) ? null : parsedParentId,
          isActive: values.active,
        };

        if (mode === "create") {
          await apiFetch("/admin/categories", {
            method: "POST",
            body: JSON.stringify(body),
          });
          toast.success("Thêm danh mục thành công!");
          setOpen(false);
          form.reset();
          onSaved?.();
        } else {
          await apiFetch(`/admin/categories/${initialData?.id}`, {
            method: "PUT",
            body: JSON.stringify(body),
          });
          toast.success("Cập nhật danh mục thành công!");
          setOpen(false);
          onSaved?.();
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Lỗi kết nối đến máy chủ!"
        );
      }
    });
  }

  const parentChoices = allCategories.filter(
    (c) => String(c.id) !== String(initialData?.id || "") && !c.parentId
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={!trigger}
        render={
          trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên danh mục <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Áo khoác mùa đông"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (mode === "create") {
                          form.setValue("slug", toVietnameseSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Đường dẫn (Slug) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: ao-khoac-mua-dong" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục cha (Tùy chọn)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha...">
                          {field.value && field.value !== "none"
                            ? parentChoices.find(
                                (p) => String(p.id) === String(field.value)
                              )?.name || "Danh mục gốc"
                            : "Không có (Danh mục gốc)"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        Không có (Danh mục gốc)
                      </SelectItem>
                      {parentChoices.map((parent) => (
                        <SelectItem key={parent.id} value={String(parent.id)}>
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between mt-2 rounded-lg border p-3 shadow-sm">
                  <FormLabel className="cursor-pointer text-muted-foreground">
                    Trạng thái hoạt động
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending
                  ? "Đang lưu..."
                  : mode === "create"
                  ? "Lưu danh mục"
                  : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

