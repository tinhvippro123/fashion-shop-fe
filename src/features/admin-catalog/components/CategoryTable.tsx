"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Search, Filter, MoreHorizontal, X, EyeOff, Eye, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { AdminCategory } from "../types/catalog.admin";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { CategoryFormModal } from "./CategoryFormModal";
import { cn } from "@/shared/utils/utils";
import { apiFetch } from "@/shared/lib/api";

interface CategoryTableActionsProps {
  category: AdminCategory;
  allCategories: AdminCategory[];
  onToggleActive: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onSaved: () => void;
}

function CategoryTableActions({
  category,
  allCategories,
  onToggleActive,
  onDelete,
  onSaved,
}: CategoryTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CategoryFormModal
          mode="edit"
          allCategories={allCategories}
          onSaved={onSaved}
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            parentId: category.parentId ? String(category.parentId) : "none",
            active: category.isActive,
          }}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer flex items-center">
              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem
          className={
            category.isActive ? "text-amber-600" : "text-emerald-600"
          }
          onClick={() => onToggleActive(category)}
        >
          {category.isActive ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" /> Ẩn danh mục
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" /> Hiển thị lại
            </>
          )}
        </DropdownMenuItem>
        {category.productCount === 0 && (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa danh mục
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CategoryTableProps {
  categories: AdminCategory[];
  isLoading?: boolean;
  viewStatus?: "Tất cả" | "Đã ẩn";
  onReload: () => void;
}

export function CategoryTable({
  categories,
  isLoading,
  viewStatus = "Tất cả",
  onReload,
}: CategoryTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((c) => {
    if (viewStatus === "Đã ẩn" && c.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredCategories.length &&
      filteredCategories.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleActive = async (category: AdminCategory) => {
    try {
      await apiFetch(`/admin/categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          parentId: category.parentId || null,
          isActive: !category.isActive,
        }),
      });
      toast.success(
        `Đã ${!category.isActive ? "hiển thị" : "ẩn"} danh mục "${
          category.name
        }"`
      );
      onReload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật danh mục"
      );
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) return;
    try {
      await apiFetch(`/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      toast.success(`Đã xóa danh mục "${category.name}"`);
      onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa danh mục");
    }
  };

  const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));
  const hasActive = selectedCategories.some((c) => c.isActive);
  const hasInactive = selectedCategories.some((c) => !c.isActive);

  const handleBulkActivate = async () => {
    try {
      const selected = categories.filter(
        (c) => selectedIds.includes(c.id) && !c.isActive
      );
      await Promise.all(
        selected.map((cat) =>
          apiFetch(`/admin/categories/${cat.id}`, {
            method: "PUT",
            body: JSON.stringify({
              name: cat.name,
              slug: cat.slug,
              parentId: cat.parentId || null,
              isActive: true,
            }),
          })
        )
      );
      toast.success(`Đã hiển thị lại ${selected.length} danh mục!`);
      setSelectedIds([]);
      onReload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật hàng loạt thất bại"
      );
    }
  };

  const handleBulkHide = async () => {
    try {
      const selected = categories.filter(
        (c) => selectedIds.includes(c.id) && c.isActive
      );
      await Promise.all(
        selected.map((cat) =>
          apiFetch(`/admin/categories/${cat.id}`, {
            method: "PUT",
            body: JSON.stringify({
              name: cat.name,
              slug: cat.slug,
              parentId: cat.parentId || null,
              isActive: false,
            }),
          })
        )
      );
      toast.success(`Đã ẩn ${selected.length} danh mục!`);
      setSelectedIds([]);
      onReload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật hàng loạt thất bại"
      );
    }
  };

  return (
    <>
      <div
        className={cn(
          "rounded-md border bg-card overflow-hidden transition-all duration-300",
          selectedIds.length > 0 ? "mb-24" : ""
        )}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm danh mục..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setSearchQuery("")}
              >
                <Filter className="mr-2 h-4 w-4" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      filteredCategories.length > 0 &&
                      selectedIds.length === filteredCategories.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead>Đường dẫn (Slug)</TableHead>
                <TableHead>Số sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={8} />
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Không tìm thấy danh mục nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className={cn(
                      selectedIds.includes(cat.id) && "bg-muted/50",
                      !cat.isActive && "opacity-50"
                    )}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onCheckedChange={() => toggleSelect(cat.id)}
                        aria-label={`Select ${cat.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">#{cat.id}</TableCell>
                    <TableCell className="font-bold">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.parentName || "Danh mục gốc"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell>{cat.productCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={cat.isActive ? "default" : "secondary"}
                        className={
                          cat.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200 border-none"
                            : ""
                        }
                      >
                        {cat.isActive ? "Hoạt động" : "Đã ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryTableActions
                        category={cat}
                        allCategories={categories}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                        onSaved={onReload}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden flex flex-col">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Không tìm thấy danh mục nào.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={cn(
                  "flex flex-col gap-2 p-4 border-b last:border-0 relative",
                  !cat.isActive && "opacity-50"
                )}
              >
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedIds.includes(cat.id)}
                    onCheckedChange={() => toggleSelect(cat.id)}
                  />
                </div>
                <div className="flex items-center justify-between pr-8 pl-8">
                  <span className="font-bold text-foreground text-lg">
                    {cat.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground pl-8">
                  <span>Slug: {cat.slug}</span>
                  <span>
                    Số sản phẩm:{" "}
                    <strong className="text-foreground">
                      {cat.productCount}
                    </strong>
                  </span>
                </div>
                <div className="mt-2 pl-8">
                  <Badge
                    variant={cat.isActive ? "default" : "secondary"}
                    className={
                      cat.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border-none text-[10px] px-2 py-0"
                        : "text-[10px] px-2 py-0"
                    }
                  >
                    {cat.isActive ? "Hoạt động" : "Đã ẩn"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-2">
                  <CategoryTableActions
                    category={cat}
                    allCategories={categories}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    onSaved={onReload}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{ bottom: "24px" }}
          className="fixed left-1/2 -translate-x-1/2 lg:ml-32 z-50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-foreground text-background px-4 py-3 rounded-full shadow-lg border border-border">
            <span className="text-sm font-medium px-2 border-r border-background/20">
              Đã chọn{" "}
              <strong className="text-blue-400">{selectedIds.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              {hasInactive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkActivate}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-background/10"
                >
                  <Eye className="h-4 w-4 mr-2" /> Hiển thị lại
                </Button>
              )}
              {hasActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkHide}
                  className="text-amber-400 hover:text-amber-300 hover:bg-background/10"
                >
                  <EyeOff className="h-4 w-4 mr-2" /> Ẩn danh mục
                </Button>
              )}
            </div>
            <div className="pl-2 border-l border-background/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedIds([])}
                className="h-8 w-8 rounded-full hover:bg-background/10 text-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

