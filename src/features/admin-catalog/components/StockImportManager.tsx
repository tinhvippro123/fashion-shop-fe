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
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [selectedVariantToAdd, setSelectedVariantToAdd] = useState("");
  const [draftItems, setDraftItems] = useState<DraftImportItem[]>([]);
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
    let active = true;
    Promise.all([
      apiFetch<StockImportResponseDto[]>("/admin/stock-imports"),
      apiFetch<ImportVariantOption[]>("/admin/variants"),
    ])
      .then(([receiptsRes, variantsRes]) => {
        if (!active) return;
        const nextVariants = variantsRes || [];
        setImports(receiptsRes || []);
        setVariants(nextVariants);

        if (preselectedProductId && nextVariants.length > 0) {
          const matched = nextVariants.filter(
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
      })
      .catch(() => {
        if (!active) return;
        setImports([]);
        setVariants([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [preselectedProductId]);

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

  const suggestedSuppliers = useMemo(() => {
    const fromReceipts = imports.map((i) => i.supplierName).filter(Boolean);
    const defaults = [
      "Xưởng May Thời Trang LUXE Việt Nam",
      "Xưởng May Thời Trang Cao Cấp Đông Á",
      "Công ty Dệt May Sài Gòn LUXE",
      "Xưởng May Veston & Dạ Hà Nội",
      "Xưởng May LUXE Prime",
      "Công ty TNHH Phụ Liệu Thời Trang Á Châu",
      "Xưởng Sản Xuất Đồ Da & Phụ Kiện Hưng Phát",
    ];
    return Array.from(new Set([...fromReceipts, ...defaults]));
  }, [imports]);

  const uniqueProducts = useMemo(() => {
    const map = new Map<
      number,
      { id: number; name: string; variantCount: number }
    >();
    for (const v of variants) {
      const existing = map.get(v.productId);
      if (!existing) {
        map.set(v.productId, {
          id: v.productId,
          name: v.productName,
          variantCount: 1,
        });
      } else {
        existing.variantCount += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi")
    );
  }, [variants]);

  const handleAddProductVariants = (prodId?: string | null) => {
    if (!prodId) return;
    const pId = Number(prodId);
    const matched = variants.filter((v) => v.productId === pId);
    if (matched.length === 0) return;

    setDraftItems((prev) => {
      const cleanPrev = prev.filter((r) => r.variantId !== "");
      const existingIds = new Set(cleanPrev.map((r) => r.variantId));
      const newItems = matched
        .filter((m) => !existingIds.has(String(m.id)))
        .map((m) => ({
          variantId: String(m.id),
          quantity: 20,
          unitCost: Number(
            m.costPrice || Math.round((m.price || 0) * 0.55) || 150000
          ),
        }));

      if (newItems.length === 0) {
        toast.info(
          "Tất cả các biến thể của sản phẩm này đã có trong danh sách nhập!"
        );
        return prev;
      }
      toast.success(
        `Đã thêm ${newItems.length} biến thể của "${matched[0].productName}" vào phiếu!`
      );
      return [...cleanPrev, ...newItems];
    });
    setSelectedProductToAdd("");
  };

  const handleAddSingleVariant = (varId?: string | null) => {
    if (!varId) return;
    const v = variants.find((item) => String(item.id) === varId);
    if (!v) return;

    setDraftItems((prev) => {
      const cleanPrev = prev.filter((r) => r.variantId !== "");
      if (cleanPrev.some((r) => r.variantId === varId)) {
        toast.info(`Biến thể SKU "${v.sku}" đã có trong danh sách nhập!`);
        return prev;
      }
      toast.success(
        `Đã thêm "${v.sku} - ${v.productName} (${v.colorName}/${v.size?.name || "FS"})" vào phiếu!`
      );
      return [
        ...cleanPrev,
        {
          variantId: String(v.id),
          quantity: 20,
          unitCost: Number(
            v.costPrice || Math.round((v.price || 0) * 0.55) || 150000
          ),
        },
      ];
    });
    setSelectedVariantToAdd("");
  };

  const handleOpenCreate = () => {
    setSupplierName("Xưởng May Thời Trang LUXE Việt Nam");
    setNote("");
    setDraftItems([]);
    setSelectedProductToAdd("");
    setSelectedVariantToAdd("");
    setCreateOpen(true);
  };

  const handleClearAllRows = () => {
    setDraftItems([]);
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <div className="relative">
                  <Input
                    list="supplier-options"
                    placeholder="Gõ hoặc chọn nhà cung cấp..."
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                  <datalist id="supplier-options">
                    {suggestedSuppliers.map((sup) => (
                      <option key={sup} value={sup} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  💡 Gợi ý đối tác quen thuộc hoặc gõ trực tiếp tên xưởng may mới.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú chứng từ</Label>
                <Textarea
                  rows={2}
                  placeholder="VD: Nhập bổ sung lô hàng Thu Đông đợt 1..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Công cụ thêm mặt hàng (2 cách: Thêm theo sản phẩm & Thêm biến thể SKU lẻ) */}
            <div className="grid gap-3 sm:grid-cols-2 p-3.5 border rounded-lg bg-primary/5 border-primary/20">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                  <PackagePlus className="h-4 w-4" />
                  Cách 1: Nhập theo sản phẩm (Toàn bộ màu & size)
                </Label>
                <Select
                  value={selectedProductToAdd}
                  onValueChange={handleAddProductVariants}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="👉 Chọn sản phẩm để bung tất cả size/màu..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 w-[540px] max-w-[92vw]">
                    {uniqueProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <div className="flex items-center justify-between w-full gap-3 text-xs">
                          <span className="font-medium truncate max-w-[380px]">
                            {p.name}
                          </span>
                          <Badge variant="secondary" className="text-[10px] shrink-0 py-0 font-normal">
                            {p.variantCount} biến thể
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Plus className="h-4 w-4 text-primary" />
                  Cách 2: Thêm 1 biến thể SKU lẻ
                </Label>
                <Select
                  value={selectedVariantToAdd}
                  onValueChange={handleAddSingleVariant}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="👉 Chọn 1 biến thể SKU cụ thể..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 w-[580px] max-w-[92vw]">
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        <div className="flex items-center gap-2 py-0.5 text-xs w-full">
                          <span className="font-mono font-semibold text-primary shrink-0">
                            {v.sku}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span
                            className="font-medium truncate max-w-[200px]"
                            title={v.productName}
                          >
                            {v.productName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1 shrink-0 font-normal"
                          >
                            {v.colorName} / {v.size?.name || "FS"}
                          </Badge>
                          <span className="ml-auto text-muted-foreground shrink-0 font-medium bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                            Tồn: {v.stock}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BẢNG DANH SÁCH MẶT HÀNG NHẬP (Table compact ERP standard) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <span>Danh sách mặt hàng nhập ({draftItems.length})</span>
                  {draftItems.length > 0 && (
                    <Badge variant="outline" className="text-[11px] font-normal">
                      Tổng {draftItems.reduce((s, i) => s + Number(i.quantity || 0), 0)} sản phẩm
                    </Badge>
                  )}
                </Label>
                {draftItems.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllRows}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa tất cả
                  </Button>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/70">
                    <TableRow className="text-xs">
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead className="min-w-[280px]">Sản phẩm & Biến thể</TableHead>
                      <TableHead className="w-20 text-center">Tồn kho</TableHead>
                      <TableHead className="w-24 text-center">SL nhập</TableHead>
                      <TableHead className="w-32 text-right">Giá vốn ĐV (đ)</TableHead>
                      <TableHead className="w-32 text-right">Thành tiền (đ)</TableHead>
                      <TableHead className="w-10 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                          Chưa có mặt hàng nào trong phiếu.
                          <br />
                          Vui lòng chọn <strong>Nhập theo sản phẩm</strong> hoặc <strong>Thêm biến thể SKU lẻ</strong> ở phía trên.
                        </TableCell>
                      </TableRow>
                    ) : (
                      draftItems.map((row, idx) => {
                        const chosenVariant = variants.find(
                          (v) => String(v.id) === row.variantId
                        );
                        const subtotal =
                          (Number(row.quantity) || 0) * (Number(row.unitCost) || 0);
                        return (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="text-center text-xs text-muted-foreground font-mono">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="py-2">
                              {chosenVariant ? (
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-xs text-foreground">
                                    {chosenVariant.productName}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
                                    <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded text-[10px]">
                                      {chosenVariant.sku}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Màu:{" "}
                                      <strong className="text-foreground font-medium">
                                        {chosenVariant.colorName}
                                      </strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Size:{" "}
                                      <strong className="text-foreground font-medium">
                                        {chosenVariant.size?.name || "FS"}
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <Select
                                  value={row.variantId}
                                  onValueChange={(val) =>
                                    handleVariantChange(idx, String(val))
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Chọn biến thể SKU..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-80 w-[560px] max-w-[92vw]">
                                    {variants.map((v) => (
                                      <SelectItem key={v.id} value={String(v.id)}>
                                        <div className="flex items-center gap-2 py-0.5 text-xs w-full">
                                          <span className="font-mono font-semibold text-primary shrink-0">
                                            {v.sku}
                                          </span>
                                          <span className="text-muted-foreground">•</span>
                                          <span
                                            className="font-medium truncate max-w-[200px]"
                                            title={v.productName}
                                          >
                                            {v.productName}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] py-0 px-1 shrink-0 font-normal"
                                          >
                                            {v.colorName} / {v.size?.name || "FS"}
                                          </Badge>
                                          <span className="ml-auto text-muted-foreground shrink-0 font-medium bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                                            Tồn: {v.stock}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium text-xs">
                              <Badge variant="secondary" className="font-mono text-[11px]">
                                {chosenVariant ? chosenVariant.stock : 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min={1}
                                className="h-8 w-20 text-center font-bold text-xs mx-auto"
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
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                step={1000}
                                className="h-8 w-28 text-right font-medium text-xs ml-auto"
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
                            </TableCell>
                            <TableCell className="text-right font-bold text-xs text-foreground whitespace-nowrap">
                              {subtotal.toLocaleString("vi-VN")} đ
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRow(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Xóa dòng này"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Phần chân trang tổng kết: Thiết kế liền mạch, cân đối và thanh lịch */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-2">
              <div className="flex items-center gap-2.5 text-sm">
                <span className="text-muted-foreground font-medium">Tổng tiền dự kiến:</span>
                <span className="text-xl font-bold text-primary">
                  {draftTotalCost.toLocaleString("vi-VN")} đ
                </span>
                {draftItems.length > 0 && (
                  <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-0.5 rounded-full border">
                    {draftItems.length} mặt hàng • {draftItems.reduce((s, i) => s + Number(i.quantity || 0), 0)} SP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 text-xs font-medium"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleSubmitReceipt}
                  disabled={submitting || draftItems.length === 0}
                  className="px-5 text-xs font-semibold shadow-xs"
                >
                  {submitting ? "Đang lưu phiếu..." : "Xác nhận nhập kho"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

