"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
import {
  MoreHorizontal,
  Search,
  Filter,
  X,
  Star,
  EyeOff,
  Eye,
  PackagePlus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/utils/utils";
import { AdminProduct } from "../types/catalog.admin";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { resolveImageUrl } from "@/shared/utils/format";

interface ProductTableActionsProps {
  product: AdminProduct;
  onToggleActive: (product: AdminProduct) => void;
  onRestock: (product: AdminProduct) => void;
}

function ProductTableActions({
  product,
  onToggleActive,
  onRestock,
}: ProductTableActionsProps) {
  return (
    <>
      <DropdownMenuItem
        render={
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="w-full h-full cursor-pointer"
          />
        }
      >
        Chỉnh sửa
      </DropdownMenuItem>

      <DropdownMenuItem
        render={
          <a
            href={`/product/${product.slug || product.id}`}
            target="_blank"
            rel="noreferrer"
            className="w-full h-full cursor-pointer flex items-center"
          />
        }
      >
        <ExternalLink className="mr-2 h-4 w-4" /> Xem ngoài website
      </DropdownMenuItem>

      {product.isActive ? (
        <DropdownMenuItem
          onClick={() => onToggleActive(product)}
          className="text-amber-600 cursor-pointer"
        >
          <EyeOff className="mr-2 h-4 w-4" /> Ngừng kinh doanh
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onClick={() => onToggleActive(product)}
          className="text-emerald-600 cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" /> Bán lại
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={() => onRestock(product)}
        className="text-blue-600 cursor-pointer"
      >
        <PackagePlus className="mr-2 h-4 w-4" /> Nhập thêm kho
      </DropdownMenuItem>
    </>
  );
}

interface ProductTableProps {
  products: AdminProduct[];
  isLoading?: boolean;
  onToggleProductActive: (
    product: AdminProduct,
    nextActive: boolean
  ) => Promise<AdminProduct>;
  viewStatus?: "Tất cả" | "Đã ẩn";
}

export function ProductTable({
  products,
  isLoading,
  onToggleProductActive,
  viewStatus = "Tất cả",
}: ProductTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p) => {
    if (viewStatus === "Đã ẩn" && p.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusDisplay = (product: AdminProduct) => {
    if (!product.isActive) {
      return { text: "Ngừng KD", color: "bg-muted text-muted-foreground" };
    }
    if (product.stock === 0) {
      return {
        text: "Hết hàng",
        color: "bg-amber-500 hover:bg-amber-600 text-white",
      };
    }
    return {
      text: "Đang bán",
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
    };
  };

  const handleBulkHide = async () => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn ngừng kinh doanh ${selectedIds.length} sản phẩm đã chọn?`
      )
    )
      return;
    try {
      const targetProducts = products.filter((p) => selectedIds.includes(p.id));
      await Promise.all(
        targetProducts.map((p) => onToggleProductActive(p, false))
      );
      toast.success(
        `Đã ngừng kinh doanh ${selectedIds.length} sản phẩm thành công!`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thao tác hàng loạt thất bại"
      );
    }
  };

  const handleBulkActivate = async () => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn mở bán lại ${selectedIds.length} sản phẩm đã chọn?`
      )
    )
      return;
    try {
      const targetProducts = products.filter((p) => selectedIds.includes(p.id));
      await Promise.all(
        targetProducts.map((p) => onToggleProductActive(p, true))
      );
      toast.success(`Đã mở bán ${selectedIds.length} sản phẩm thành công!`);
      setSelectedIds([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thao tác hàng loạt thất bại"
      );
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    const isActivating = !product.isActive;
    try {
      await onToggleProductActive(product, isActivating);
      if (isActivating && product.stock === 0) {
        toast.warning(
          `Sản phẩm "${product.name}" đã được mở bán lại nhưng đang hết hàng. Vui lòng tạo phiếu nhập kho!`
        );
      } else {
        toast.success(
          `Đã ${isActivating ? "mở bán lại" : "ngừng kinh doanh"} sản phẩm "${
            product.name
          }"!`
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật sản phẩm"
      );
    }
  };

  const handleRestock = (product: AdminProduct) => {
    router.push(`/admin/stock-imports?productId=${product.id}`);
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  const hasActive = selectedProducts.some((p) => p.isActive);
  const hasInactive = selectedProducts.some((p) => !p.isActive);

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
                placeholder="Tìm kiếm tên sản phẩm, mã SKU..."
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

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Kho</TableHead>
                <TableHead>Đã bán</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={10} />
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-10 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-10 w-10 mb-2 text-muted-foreground/50" />
                      Không tìm thấy sản phẩm nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStatusDisplay(product);
                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        selectedIds.includes(product.id) ? "bg-muted/50" : "",
                        "cursor-pointer hover:bg-muted/50 transition-colors",
                        !product.isActive && "opacity-60"
                      )}
                      onClick={() =>
                        router.push(`/admin/products/${product.id}/edit`)
                      }
                    >
                      <TableCell
                        className="text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(product.id);
                        }}
                      >
                        <div
                          className="flex items-center justify-center p-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.includes(product.id)}
                            onCheckedChange={() => toggleSelect(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-12 aspect-2/3 rounded-md bg-muted overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveImageUrl(product.image, "/login-bg.jpg")}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span
                            className={
                              !product.isActive ? "text-muted-foreground" : ""
                            }
                          >
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {product.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-semibold">
                        {product.price}
                      </TableCell>
                      <TableCell>
                        {product.stock > 0 && product.stock <= 5 ? (
                          <div
                            className="flex items-center gap-1.5 text-orange-500 font-medium"
                            title="Sắp hết hàng"
                          >
                            <span>{product.stock}</span>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        ) : product.stock === 0 ? (
                          <div
                            className="flex items-center gap-1.5 text-red-500 font-bold"
                            title="Hết hàng"
                          >
                            <span>0</span>
                          </div>
                        ) : (
                          product.stock
                        )}
                      </TableCell>
                      <TableCell>
                        {product.sold ? product.sold.toLocaleString("vi-VN") : "0"}
                      </TableCell>
                      <TableCell>
                        {product.rating ? (
                          <div className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star className="h-4 w-4 fill-amber-500" />
                            <span>{product.rating}</span>
                            <span className="text-muted-foreground text-xs font-normal">
                              ({product.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ProductTableActions
                              product={product}
                              onToggleActive={handleToggleActive}
                              onRestock={handleRestock}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List/Card View */}
        <div className="md:hidden flex flex-col">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            filteredProducts.map((product) => {
              const status = getStatusDisplay(product);
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex gap-4 p-4 border-b last:border-0 relative transition-colors",
                    selectedIds.includes(product.id) ? "bg-muted/50" : "",
                    !product.isActive && "opacity-60"
                  )}
                >
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                      className="bg-card shadow-sm border-muted-foreground/30 data-[state=checked]:border-primary"
                    />
                  </div>
                  <div className="w-20 aspect-2/3 rounded-md bg-muted overflow-hidden relative shrink-0 ml-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(product.image, "/login-bg.jpg")}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 py-1">
                    <h4
                      className={cn(
                        "font-semibold text-foreground line-clamp-2 leading-tight mb-1 pr-6",
                        !product.isActive && "text-muted-foreground"
                      )}
                    >
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {product.category}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {product.price}
                      </span>
                      <Badge className={cn("text-[10px] px-1.5 py-0", status.color)}>
                        {status.text}
                      </Badge>
                    </div>
                  </div>
                  <div className="absolute top-3 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ProductTableActions
                          product={product}
                          onToggleActive={handleToggleActive}
                          onRestock={handleRestock}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
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
                  <Eye className="h-4 w-4 mr-2" /> Bán lại
                </Button>
              )}
              {hasActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkHide}
                  className="text-amber-400 hover:text-amber-300 hover:bg-background/10"
                >
                  <EyeOff className="h-4 w-4 mr-2" /> Ngừng KD
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

