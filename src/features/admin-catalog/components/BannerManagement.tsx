"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
import {
  BannerItem,
  BannerPosition,
  CreateBannerPayload,
} from "../types/banner.admin";
import {
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  toggleBannerStatus,
  deleteAdminBanner,
} from "../api/banner.api";

export function BannerManagement() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState<"ALL" | BannerPosition>("ALL");
  const [isPending, startTransition] = useTransition();

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState<CreateBannerPayload>({
    title: "",
    subtitle: "",
    imageUrl: "",
    targetUrl: "",
    position: "HERO",
    sortOrder: 1,
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal delete confirm
  const [deletingBanner, setDeletingBanner] = useState<BannerItem | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAdminBanners();
      setBanners(data);
    } catch {
      toast.error("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      targetUrl: "",
      position: filterPosition === "ALL" ? "HERO" : filterPosition,
      sortOrder: (banners.length + 1),
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl || "",
      position: banner.position,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const uploadBody = new FormData();
    uploadBody.append("file", file);

    try {
      setUploadingImage(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tải ảnh lên thất bại");
      }
      if (data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Tải ảnh lên thành công");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải ảnh";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề banner");
      return;
    }
    if (!formData.imageUrl.trim()) {
      toast.error("Vui lòng tải lên hoặc nhập đường dẫn ảnh");
      return;
    }

    startTransition(async () => {
      try {
        if (editingBanner) {
          const updated = await updateAdminBanner(editingBanner.id, formData);
          setBanners((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
          toast.success("Cập nhật banner thành công");
        } else {
          const created = await createAdminBanner(formData);
          setBanners((prev) => [...prev, created]);
          toast.success("Tạo banner mới thành công");
        }
        setIsModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
        toast.error(msg);
      }
    });
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    try {
      const updated = await toggleBannerStatus(banner.id);
      setBanners((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success(
        `Đã ${updated.isActive ? "bật" : "tắt"} hiển thị banner "${banner.title}"`
      );
    } catch {
      toast.error("Không thể thay đổi trạng thái banner");
    }
  };

  const handleDelete = () => {
    if (!deletingBanner) return;

    startTransition(async () => {
      try {
        await deleteAdminBanner(deletingBanner.id);
        setBanners((prev) => prev.filter((b) => b.id !== deletingBanner.id));
        toast.success("Xóa banner thành công");
        setDeletingBanner(null);
      } catch {
        toast.error("Không thể xóa banner");
      }
    });
  };

  const filteredBanners = banners.filter((b) => {
    if (filterPosition === "ALL") return true;
    return b.position === filterPosition;
  });

  const heroCount = banners.filter((b) => b.position === "HERO").length;
  const featuredCount = banners.filter((b) => b.position === "FEATURED").length;
  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            Quản lý Banner & Trang chủ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tùy biến các slide banner đầu trang (HERO) và 3 thẻ danh mục nổi bật (FEATURED) hiển thị trên storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBanners}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm Banner mới
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banner đầu trang (HERO)</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heroCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hiển thị dạng slider chạy tự động trên đỉnh trang chủ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục nổi bật (FEATURED)</CardTitle>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hiển thị tối đa 4 thẻ danh mục trọng tâm trên trang chủ (khuyên dùng 4 thẻ)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang kích hoạt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCount} / {banners.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Các banner đang bật sẽ xuất hiện cho khách mua hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Danh sách Banner</CardTitle>
              <CardDescription>
                Kéo thả hoặc chỉnh số thứ tự để đổi vị trí hiển thị trên website
              </CardDescription>
            </div>
            <Tabs
              value={filterPosition}
              onValueChange={(val) =>
                setFilterPosition(val as "ALL" | BannerPosition)
              }
            >
              <TabsList>
                <TabsTrigger value="ALL">Tất cả ({banners.length})</TabsTrigger>
                <TabsTrigger value="HERO">Banner Đầu Trang ({heroCount})</TabsTrigger>
                <TabsTrigger value="FEATURED">
                  Danh Mục Nổi Bật ({featuredCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Thứ tự</TableHead>
                <TableHead className="w-[120px]">Hình ảnh</TableHead>
                <TableHead>Tiêu đề & Mô tả</TableHead>
                <TableHead className="w-[140px]">Vị trí</TableHead>
                <TableHead>Liên kết đích</TableHead>
                <TableHead className="w-[110px] text-center">Hiển thị</TableHead>
                <TableHead className="w-[120px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Đang tải dữ liệu banner...
                  </TableCell>
                </TableRow>
              ) : filteredBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Chưa có banner nào ở mục này. Hãy bấm &quot;Thêm Banner mới&quot; để tạo.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-semibold text-center">
                      <span className="inline-block px-2 py-1 rounded bg-muted text-xs font-mono">
                        #{banner.sortOrder}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="relative w-24 h-14 bg-muted rounded overflow-hidden border">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized={banner.imageUrl.startsWith("http")}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-sm text-foreground">
                        {banner.title}
                      </div>
                      {banner.subtitle && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {banner.subtitle}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {banner.position === "HERO" ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Đầu trang (HERO)
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Danh mục (FEATURED)
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {banner.targetUrl ? (
                        <a
                          href={banner.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                        >
                          {banner.targetUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Không có liên kết
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => handleToggleStatus(banner)}
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(banner)}
                          title="Sửa banner"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingBanner(banner)}
                          title="Xóa banner"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
            </DialogTitle>
            <DialogDescription>
              Điền các thông tin của banner để hiển thị trên giao diện người dùng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Vị trí */}
            <div className="space-y-2">
              <Label>Vị trí hiển thị *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, position: "HERO" }))
                  }
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.position === "HERO"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="font-semibold text-sm">Banner Đầu Trang (HERO)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Slider lớn đầu trang chủ (~ 2.5:1, vd: 1920x768px)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, position: "FEATURED" }))
                  }
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.position === "FEATURED"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="font-semibold text-sm">Danh Mục Nổi Bật (FEATURED)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tối đa 4 thẻ danh mục trang chủ (~ 3:4, vd: 600x800px)
                  </div>
                </button>
              </div>
            </div>

            {/* Tiêu đề & Phụ đề */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="banner-title">Tiêu đề Banner *</Label>
                <Input
                  id="banner-title"
                  placeholder="Ví dụ: BỘ SƯU TẬP THỜI TRANG NỮ"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banner-subtitle">Phụ đề / Thông điệp (Không bắt buộc)</Label>
                <Input
                  id="banner-subtitle"
                  placeholder="Ví dụ: Ưu đãi đặc biệt giảm đến 50%"
                  value={formData.subtitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Upload ảnh & URL */}
            <div className="space-y-2">
              <Label>Hình ảnh Banner *</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập đường dẫn ảnh hoặc tải file bên phải..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                  />
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="pointer-events-none"
                      disabled={uploadingImage}
                    >
                      <UploadCloud className="w-4 h-4 mr-2" />
                      {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
                    </Button>
                  </label>
                </div>

                {formData.imageUrl && (
                  <div className="relative w-full h-36 bg-muted rounded-lg overflow-hidden border mt-1">
                    <Image
                      src={formData.imageUrl}
                      alt="Xem trước banner"
                      fill
                      className="object-cover"
                      sizes="100%"
                      unoptimized={formData.imageUrl.startsWith("http")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Link đích & Thứ tự */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="banner-target">Liên kết khi click (Target URL)</Label>
                <Input
                  id="banner-target"
                  placeholder="Ví dụ: /danh-muc/nu hoặc /danh-muc/sale"
                  value={formData.targetUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, targetUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banner-order">Thứ tự ưu tiên (Sort Order)</Label>
                <Input
                  id="banner-order"
                  type="number"
                  min={1}
                  value={formData.sortOrder ?? 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                />
              </div>
            </div>

            {/* Trạng thái kích hoạt */}
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium text-sm">Kích hoạt hiển thị</div>
                <div className="text-xs text-muted-foreground">
                  Bật để banner này xuất hiện ngay trên trang người dùng
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Đang lưu..." : editingBanner ? "Cập nhật" : "Tạo Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingBanner}
        onOpenChange={(open) => !open && setDeletingBanner(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa Banner</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa banner &quot;{deletingBanner?.title}&quot;?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingBanner(null)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

