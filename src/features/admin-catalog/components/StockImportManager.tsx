"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import {
  ImportVariantOption,
  StockImportResponseDto,
} from "../types/catalog.admin";
import {
  Card,
  CardContent,
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
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  Boxes,
  DollarSign,
  Eye,
  FileSpreadsheet,
  PackagePlus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

interface DraftImportItem {
  variantId: string;
  quantity: number;
  unitCost: number;
}

export function StockImportManager() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get("productId");

  const [imports, setImports] = useState<StockImportResponseDto[]>([]);
  const [variants, setVariants] = useState<ImportVariantOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Detail modal state
  const [selectedReceipt, setSelectedReceipt] =
    useState<StockImportResponseDto | null>(null);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [note, setNote] = useState("");
  const [draftItems, setDraftItems] = useState<DraftImportItem[]>([
    { variantId: "", quantity: 20, unitCost: 150000 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [receiptsRes, variantsRes] = await Promise.all([
        apiFetch<StockImportResponseDto[]>("/admin/stock-imports"),
        apiFetch<ImportVariantOption[]>("/admin/variants"),
      ]);
      setImports(receiptsRes || []);
      setVariants(variantsRes || []);
    } catch {
      setImports([]);
      setVariants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (preselectedProductId && variants.length > 0) {
      const matched = variants.filter(
        (v) => String(v.productId) === preselectedProductId
      );
      if (matched.length > 0) {
        setDraftItems(
          matched.map((m) => ({
            variantId: String(m.id),
            quantity: 20,
            unitCost: Number(m.costPrice || Math.round(m.price * 0.55)),
          }))
        );
        setCreateOpen(true);
      }
    }
  }, [preselectedProductId, variants]);

  const filteredImports = useMemo(() => {
    if (!searchQuery.trim()) return imports;
    const q = searchQuery.trim().toLowerCase();
    return imports.filter(
      (imp) =>
        imp.importCode.toLowerCase().includes(q) ||
        imp.supplierName.toLowerCase().includes(q) ||
        (imp.createdByEmail || "").toLowerCase().includes(q)
    );
  }, [imports, searchQuery]);

  const totalReceipts = imports.length;
  const totalImportedUnits = imports.reduce(
    (sum, r) => sum + (r.totalQuantity || 0),
    0
  );
  const totalImportedCost = imports.reduce(
    (sum, r) => sum + Number(r.totalCost || 0),
    0
  );

  const draftTotalCost = draftItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
    0
  );

  const handleOpenCreate = () => {
    const first = variants[0];
    setSupplierName("Xưởng May Thời Trang LUXE Việt Nam");
    setNote("");
    setDraftItems([
      {
        variantId: first ? String(first.id) : "",
        quantity: 20,
        unitCost: first
          ? Number(first.costPrice || Math.round(first.price * 0.55))
          : 150000,
      },
    ]);
    setCreateOpen(true);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const chosen = variants.find((v) => String(v.id) === variantId);
    setDraftItems((prev) =>
      prev.map((row, idx) =>
        idx === index
          ? {
              ...row,
              variantId,
              unitCost: chosen
                ? Number(
                    chosen.costPrice || Math.round((chosen.price || 0) * 0.55)
                  )
                : row.unitCost,
            }
          : row
      )
    );
  };

  const handleAddRow = () => {
    const first = variants[0];
    setDraftItems((prev) => [
      ...prev,
      {
        variantId: first ? String(first.id) : "",
        quantity: 10,
        unitCost: first ? Number(first.costPrice || 150000) : 150000,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (draftItems.length <= 1) return;
    setDraftItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReceipt = async () => {
    if (!supplierName.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp!");
      return;
    }
    const validItems = draftItems.filter(
      (i) => i.variantId && i.quantity > 0 && i.unitCost >= 0
    );
    if (validItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 biến thể sản phẩm hợp lệ!");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch<StockImportResponseDto>("/admin/stock-imports", {
        method: "POST",
        body: JSON.stringify({
          supplierName: supplierName.trim(),
          note: note.trim(),
          items: validItems.map((i) => ({
            variantId: Number(i.variantId),
            quantity: Number(i.quantity),
            unitCost: Number(i.unitCost),
          })),
        }),
      });
      toast.success(
        "Đã tạo phiếu nhập kho và cộng dồn tồn kho + cập nhật giá vốn bình quân gia quyền!"
      );
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo phiếu nhập kho"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Nhập kho (Stock Import)
          </h2>
          <p className="text-muted-foreground">
            Quản lý phiếu nhập hàng từ nhà cung cấp, tự động cộng tồn kho và tính
            giá vốn bình quân.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <PackagePlus className="mr-2 h-4 w-4" /> Tạo phiếu nhập kho
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số phiếu nhập
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceipts} phiếu</div>
            <p className="text-xs text-muted-foreground">
              Lưu vết đầy đủ lịch sử chứng từ nhập kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng sản lượng đã nhập
            </CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalImportedUnits.toLocaleString("vi-VN")} sản phẩm
            </div>
            <p className="text-xs text-muted-foreground">
              Đã cộng trực tiếp vào tồn kho các biến thể SKU
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giá trị nhập kho
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalImportedCost.toLocaleString("vi-VN")} đ
            </div>
            <p className="text-xs text-muted-foreground">
              Cơ sở đối chiếu lợi nhuận gộp trên Báo cáo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm mã phiếu, nhà cung cấp..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!isLoading && filteredImports.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Chưa có phiếu nhập kho nào"
            description="Nhấn nút Tạo phiếu nhập kho để nhập thêm hàng vào kho."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Người lập phiếu</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead className="text-right">Tổng SL</TableHead>
                <TableHead className="text-right">Tổng tiền vốn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} />
              ) : (
                filteredImports.map((imp) => (
                  <TableRow
                    key={imp.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedReceipt(imp)}
                  >
                    <TableCell className="font-semibold text-primary">
                      {imp.importCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{imp.supplierName}</span>
                        {imp.note && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {imp.note}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {imp.createdByEmail}
                    </TableCell>
                    <TableCell>{imp.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        +{imp.totalQuantity} SP ({imp.itemCount} SKU)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {imp.formattedTotalCost ||
                        `${Number(imp.totalCost || 0).toLocaleString("vi-VN")}đ`}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(imp)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Receipt Detail Dialog */}
      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => !open && setSelectedReceipt(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết phiếu nhập #{selectedReceipt?.importCode}
            </DialogTitle>
            <DialogDescription>
              Nhà cung cấp:{" "}
              <strong className="text-foreground">
                {selectedReceipt?.supplierName}
              </strong>{" "}
              &bull; Ngày nhập: {selectedReceipt?.createdAt} &bull; Người lập:{" "}
              {selectedReceipt?.createdByEmail}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt?.note && (
            <div className="p-3 rounded-md bg-muted/50 border text-sm">
              <span className="font-medium">Ghi chú: </span>
              <span className="text-muted-foreground">
                {selectedReceipt.note}
              </span>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead className="text-right">SL nhập</TableHead>
                  <TableHead className="text-right">Giá vốn ĐV</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReceipt?.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.colorName} / {item.sizeName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      +{item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.unitCost || 0).toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {Number(item.subtotal || 0).toLocaleString("vi-VN")}đ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Tổng số lượng nhập:{" "}
              <strong className="text-foreground">
                {selectedReceipt?.totalQuantity} sản phẩm
              </strong>
            </span>
            <span className="text-base font-bold">
              Tổng cộng:{" "}
              {selectedReceipt?.formattedTotalCost ||
                `${Number(selectedReceipt?.totalCost || 0).toLocaleString(
                  "vi-VN"
                )}đ`}
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Stock Import Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiếu nhập kho mới</DialogTitle>
            <DialogDescription>
              Chọn các biến thể SKU cần nhập hàng. Hệ thống sẽ tự động tăng tồn
              kho và tính lại giá vốn bình quân.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Nhà cung cấp <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: Xưởng May LUXE Việt Nam"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú chứng từ</Label>
                <Textarea
                  rows={1}
                  placeholder="VD: Nhập bổ sung lô hàng Thu Đông..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-base font-semibold">
                Danh sách mặt hàng nhập ({draftItems.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng SKU
              </Button>
            </div>

            <div className="space-y-3">
              {draftItems.map((row, idx) => {
                const chosenVariant = variants.find(
                  (v) => String(v.id) === row.variantId
                );
                return (
                  <div
                    key={idx}
                    className="grid gap-3 sm:grid-cols-[1fr_110px_140px_40px] items-end p-3 rounded-lg border bg-muted/20"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs">Biến thể sản phẩm (SKU)</Label>
                      <Select
                        value={row.variantId}
                        onValueChange={(val) =>
                          handleVariantChange(idx, String(val))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn biến thể SKU...">
                            {chosenVariant
                              ? `${chosenVariant.sku} - ${chosenVariant.productName} (${chosenVariant.colorName}/${chosenVariant.size?.name || "FS"}) [Tồn: ${chosenVariant.stock}]`
                              : "Chọn biến thể SKU..."}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {variants.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {v.sku} — {v.productName} ({v.colorName} /{" "}
                              {v.size?.name || "FS"}) • Tồn: {v.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">SL nhập</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          setDraftItems((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? {
                                    ...r,
                                    quantity: Math.max(
                                      1,
                                      Number(e.target.value)
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Giá vốn ĐV (đ)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={row.unitCost}
                        onChange={(e) =>
                          setDraftItems((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? {
                                    ...r,
                                    unitCost: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={draftItems.length <= 1}
                      onClick={() => handleRemoveRow(idx)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border">
              <span className="text-sm font-medium text-muted-foreground">
                Tổng tiền phiếu nhập kho dự kiến:
              </span>
              <span className="text-lg font-bold text-primary">
                {draftTotalCost.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSubmitReceipt} disabled={submitting}>
              {submitting ? "Đang lưu phiếu..." : "Xác nhận nhập kho"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

