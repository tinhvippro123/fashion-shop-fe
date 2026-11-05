"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Palette,
  Ruler,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { AdminColor, AdminSize } from "../types/attributes.admin";
import {
  getAdminColors,
  createAdminColor,
  updateAdminColor,
  deleteAdminColor,
  getAdminSizes,
  createAdminSize,
  updateAdminSize,
  deleteAdminSize,
} from "../api/attributes.api";

export function AttributesManagement() {
  const [activeTab, setActiveTab] = useState<"colors" | "sizes">("colors");
  const [colors, setColors] = useState<AdminColor[]>([]);
  const [sizes, setSizes] = useState<AdminSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Color Dialog state
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<AdminColor | null>(null);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#111111");

  // Size Dialog state
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<AdminSize | null>(null);
  const [sizeName, setSizeName] = useState("");
  const [sizeOrder, setSizeOrder] = useState(1);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "color" | "size";
    id: number;
    name: string;
  } | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [colData, sizeData] = await Promise.all([
        getAdminColors(),
        getAdminSizes(),
      ]);
      setColors(colData);
      setSizes(sizeData);
    } catch {
      toast.error("Không thể tải danh sách thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAdminColors(), getAdminSizes()])
      .then(([colData, sizeData]) => {
        if (active) {
          setColors(colData);
          setSizes(sizeData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error("Không thể tải danh sách thuộc tính");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Open add color
  const handleOpenAddColor = () => {
    setEditingColor(null);
    setColorName("");
    setColorHex("#111111");
    setColorDialogOpen(true);
  };

  // Open edit color
  const handleOpenEditColor = (col: AdminColor) => {
    setEditingColor(col);
    setColorName(col.name);
    setColorHex(col.hexCode || "#111111");
    setColorDialogOpen(true);
  };

  // Submit Color
  const handleSaveColor = async () => {
    const trimmed = colorName.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập tên màu sắc");
      return;
    }

    startTransition(async () => {
      try {
        if (editingColor) {
          const updated = await updateAdminColor(editingColor.id, {
            name: trimmed,
            hexCode: colorHex,
          });
          setColors((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
          toast.success(`Đã cập nhật màu "${trimmed}"`);
        } else {
          const created = await createAdminColor({
            name: trimmed,
            hexCode: colorHex,
          });
          setColors((prev) => [...prev, created]);
          toast.success(`Đã thêm màu "${trimmed}"`);
        }
        setColorDialogOpen(false);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu màu sắc";
        toast.error(msg);
      }
    });
  };

  // Open add size
  const handleOpenAddSize = () => {
    setEditingSize(null);
    setSizeName("");
    const nextOrder = sizes.length > 0 ? Math.max(...sizes.map((s) => s.sortOrder)) + 1 : 1;
    setSizeOrder(nextOrder);
    setSizeDialogOpen(true);
  };

  // Open edit size
  const handleOpenEditSize = (s: AdminSize) => {
    setEditingSize(s);
    setSizeName(s.name);
    setSizeOrder(s.sortOrder);
    setSizeDialogOpen(true);
  };

  // Submit Size
  const handleSaveSize = async () => {
    const trimmed = sizeName.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Vui lòng nhập tên kích thước");
      return;
    }

    startTransition(async () => {
      try {
        if (editingSize) {
          const updated = await updateAdminSize(editingSize.id, {
            name: trimmed,
            sortOrder: sizeOrder,
          });
          setSizes((prev) =>
            prev
              .map((s) => (s.id === updated.id ? updated : s))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          );
          toast.success(`Đã cập nhật kích thước "${trimmed}"`);
        } else {
          const created = await createAdminSize({
            name: trimmed,
            sortOrder: sizeOrder,
          });
          setSizes((prev) =>
            [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder)
          );
          toast.success(`Đã thêm kích thước "${trimmed}"`);
        }
        setSizeDialogOpen(false);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi lưu kích thước";
        toast.error(msg);
      }
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        if (deleteTarget.type === "color") {
          await deleteAdminColor(deleteTarget.id);
          setColors((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          toast.success(`Đã xóa màu "${deleteTarget.name}"`);
        } else {
          await deleteAdminSize(deleteTarget.id);
          setSizes((prev) => prev.filter((s) => s.id !== deleteTarget.id));
          toast.success(`Đã xóa kích thước "${deleteTarget.name}"`);
        }
        setDeleteDialogOpen(false);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Không thể xóa thuộc tính này";
        toast.error(msg);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý Màu sắc & Kích thước
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý bảng mã màu sắc và danh mục kích cỡ chuẩn dùng chung cho toàn bộ sản phẩm và bộ lọc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Tải lại
          </Button>

          {activeTab === "colors" ? (
            <Button size="sm" onClick={handleOpenAddColor}>
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm màu mới
            </Button>
          ) : (
            <Button size="sm" onClick={handleOpenAddSize}>
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm kích thước
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "colors" | "sizes")}
        className="space-y-4"
      >
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Bảng Màu sắc ({colors.length})
          </TabsTrigger>
          <TabsTrigger value="sizes" className="gap-2">
            <Ruler className="h-4 w-4" />
            Bảng Kích thước ({sizes.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Màu sắc */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Màu sắc</CardTitle>
              <CardDescription>
                Các màu này sẽ tự động xuất hiện làm nút gợi ý chọn nhanh khi thêm sản phẩm và xuất hiện trong bộ lọc tìm kiếm ngoài trang chủ.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Đang tải bảng màu...
                </div>
              ) : colors.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Chưa có màu sắc nào trong hệ thống. Bấm &quot;Thêm màu mới&quot; để tạo.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Màu</TableHead>
                        <TableHead>Tên màu sắc</TableHead>
                        <TableHead>Mã màu Hex</TableHead>
                        <TableHead className="text-right w-28">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colors.map((col) => (
                        <TableRow key={col.id}>
                          <TableCell>
                            <div
                              className="w-7 h-7 rounded-full border border-black/20 shadow-sm shrink-0"
                              style={{ backgroundColor: col.hexCode || "#111" }}
                              title={`${col.name} (${col.hexCode})`}
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {col.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs font-normal"
                            >
                              {col.hexCode || "#111111"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditColor(col)}
                                title="Chỉnh sửa màu"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: "color",
                                    id: col.id,
                                    name: col.name,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                                title="Xóa màu này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Kích thước */}
        <TabsContent value="sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Kích thước</CardTitle>
              <CardDescription>
                Danh mục kích cỡ trang phục chuẩn của thương hiệu. Thứ tự sắp xếp sẽ quyết định vị trí hiển thị ngoài bảng chọn và bộ lọc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Đang tải danh sách kích thước...
                </div>
              ) : sizes.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Chưa có kích thước nào trong hệ thống. Bấm &quot;Thêm kích thước&quot; để tạo.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Thứ tự</TableHead>
                        <TableHead>Tên kích thước</TableHead>
                        <TableHead className="text-right w-28">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizes.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            #{s.sortOrder}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-bold text-sm px-3 py-1"
                            >
                              {s.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditSize(s)}
                                title="Chỉnh sửa kích thước"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: "size",
                                    id: s.id,
                                    name: s.name,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                                title="Xóa kích thước này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Thêm/Sửa Màu sắc */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingColor ? "Chỉnh sửa Màu sắc" : "Thêm Màu sắc mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập tên màu sắc và chọn mã màu Hex tương ứng để hiển thị trong bộ lọc và bảng chọn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="color-name">Tên màu sắc *</Label>
              <Input
                id="color-name"
                placeholder="VD: Xanh Navy, Đỏ Ruby, Be..."
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="color-hex">Mã màu Hex</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-12 h-10 p-1 rounded-md border cursor-pointer bg-card shrink-0"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  title="Bấm để chọn màu"
                />
                <Input
                  id="color-hex"
                  placeholder="#111111"
                  className="font-mono"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setColorDialogOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveColor}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-1.5" />
              {editingColor ? "Lưu thay đổi" : "Tạo màu mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Thêm/Sửa Kích thước */}
      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSize ? "Chỉnh sửa Kích thước" : "Thêm Kích thước mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập tên kích thước (VD: XS, S, M, L, XL, XXL) và thứ tự sắp xếp hiển thị.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="size-name">Tên kích thước *</Label>
              <Input
                id="size-name"
                placeholder="VD: XXL, 3XL, 28, 29..."
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="size-order">Thứ tự sắp xếp</Label>
              <Input
                id="size-order"
                type="number"
                min={1}
                value={sizeOrder}
                onChange={(e) => setSizeOrder(Number(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Số nhỏ hơn sẽ được ưu tiên hiển thị trước (VD: S = 1, M = 2, L = 3).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setSizeDialogOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveSize}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-1.5" />
              {editingSize ? "Lưu thay đổi" : "Tạo kích thước"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Xác nhận xóa {deleteTarget?.type === "color" ? "màu sắc" : "kích thước"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa {deleteTarget?.type === "color" ? "màu" : "size"}{" "}
              <b className="text-foreground">&quot;{deleteTarget?.name}&quot;</b> khỏi danh mục hệ thống không?
              Thao tác này sẽ xóa vĩnh viễn khỏi danh sách gợi ý và bộ lọc.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
